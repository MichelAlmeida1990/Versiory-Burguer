import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      address,
      complement,
      neighborhood,
      city,
      zipCode,
      paymentMethod,
      deliveryType,
      items,
      total,
      delivery_fee,
    } = body;

    // Identificar o restaurante através dos produtos do pedido
    let restaurantId: string | null = null;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item no pedido" },
        { status: 400 }
      );
    }

    // Buscar todos os produtos do pedido de uma vez
    const productIds = items.map((item: any) => item.product_id).filter(Boolean);
    
    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "IDs de produtos inválidos" },
        { status: 400 }
      );
    }

    console.log("Buscando restaurant_id para produtos:", productIds);

    // Buscar produtos com restaurant_id
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, restaurant_id")
      .in("id", productIds)
      .not("restaurant_id", "is", null);

    if (productsError) {
      console.error("Erro ao buscar produtos:", productsError);
      return NextResponse.json(
        { error: "Erro ao buscar informações dos produtos" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      console.error("Nenhum produto encontrado com restaurant_id. ProductIds:", productIds);
      return NextResponse.json(
        { error: "Os produtos selecionados não estão associados a nenhum restaurante. Por favor, adicione produtos válidos ao carrinho." },
        { status: 400 }
      );
    }

    // Pegar o restaurant_id do primeiro produto encontrado
    // Todos os produtos do pedido devem ser do mesmo restaurante
    restaurantId = products[0].restaurant_id;

    // Verificar se todos os produtos são do mesmo restaurante
    const allSameRestaurant = products.every(p => p.restaurant_id === restaurantId);
    if (!allSameRestaurant) {
      console.warn("Atenção: Produtos de restaurantes diferentes no mesmo pedido");
    }

    if (!restaurantId) {
      console.error("Não foi possível identificar o restaurante. Products:", products);
      return NextResponse.json(
        { error: "Não foi possível identificar o restaurante dos produtos" },
        { status: 400 }
      );
    }

    console.log("Restaurante identificado:", restaurantId);

    // Criar pedido associado ao restaurante
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: restaurantId, // user_id em orders é o ID do restaurante
        status: "pending",
        total: paymentMethod === "pix" ? total * 0.95 : total,
        delivery_address:
          deliveryType === "delivery"
            ? `${address}, ${complement ? complement + ", " : ""}${neighborhood}, ${city} - ${zipCode}`
            : null,
        delivery_fee: deliveryType === "delivery" ? delivery_fee : 0,
        payment_method: paymentMethod,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Criar itens do pedido
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      observations: item.observations,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    // Criar opções dos itens do pedido
    if (insertedItems && insertedItems.length > 0) {
      const orderItemOptions: any[] = [];
      
      items.forEach((item: any, index: number) => {
        if (item.selectedOptions && item.selectedOptions.length > 0 && insertedItems[index]) {
          item.selectedOptions.forEach((selectedOption: any) => {
            orderItemOptions.push({
              order_item_id: insertedItems[index].id,
              option_id: selectedOption.option_id,
              option_value_id: selectedOption.option_value_id,
              price_modifier: selectedOption.price_modifier,
            });
          });
        }
      });

      if (orderItemOptions.length > 0) {
        const { error: optionsError } = await supabase
          .from("order_item_options")
          .insert(orderItemOptions);

        if (optionsError) {
          console.error("Erro ao salvar opções:", optionsError);
          // Não falhar o pedido se houver erro nas opções, apenas logar
        }
      }
    }

    // Registrar status inicial no histórico
    await supabase
      .from("order_status_history")
      .insert({
        order_id: order.id,
        status: "pending",
      });

    return NextResponse.json({ id: order.id, ...order });
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (orderId) {
      // Buscar pedido específico com histórico
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          order_status_history (
            id,
            status,
            created_at
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;

      // Ordenar histórico por data
      if (order.order_status_history) {
        order.order_status_history.sort(
          (a: any, b: any) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      return NextResponse.json(order);
    }

    // Buscar todos os pedidos
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}




