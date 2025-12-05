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

    const normalizedPhone = phone.replace(/\D/g, '');
    const finalTotal = paymentMethod === "pix" ? total * 0.95 : total;

    let customerId: string | null = null;

    if (normalizedPhone.length >= 10) {
      const customerPayload = {
        phone: normalizedPhone,
        name: name || null,
        email: email || null,
        default_address: address || null,
        default_complement: complement || null,
        default_neighborhood: neighborhood || null,
        default_city: city || null,
        default_zip_code: zipCode || null,
        updated_at: new Date().toISOString()
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(customerPayload, {
          onConflict: 'phone',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (customerError) {
        console.error('Erro ao salvar cliente:', customerError);
      } else if (customer) {
        customerId = customer.id;
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: `guest_${Date.now()}`,
        status: "pending",
        total: finalTotal,
        delivery_address:
          deliveryType === "delivery"
            ? `${address}, ${complement ? complement + ", " : ""}${neighborhood}, ${city} - ${zipCode}`
            : null,
        delivery_fee: deliveryType === "delivery" ? delivery_fee : 0,
        payment_method: paymentMethod,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_id: customerId,
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




