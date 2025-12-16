import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEMO_RESTAURANT_UUID, validateRestaurantIsolation } from "@/lib/restaurant-constants";

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
      restaurant_id, // ID do restaurante (opcional, usado quando produtos são antigos)
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

    // Buscar produtos (com ou sem restaurant_id)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, restaurant_id, name")
      .in("id", productIds);

    if (productsError) {
      console.error("❌ Erro ao buscar produtos:", productsError);
      return NextResponse.json(
        { error: "Erro ao buscar informações dos produtos" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "Produtos não encontrados" },
        { status: 400 }
      );
    }

    console.log("📦 Produtos encontrados:", products.map(p => ({ 
      id: p.id, 
      name: p.name, 
      restaurant_id: p.restaurant_id,
      restaurant_id_string: p.restaurant_id ? String(p.restaurant_id) : null,
      restaurant_id_tipo: typeof p.restaurant_id 
    })));

    // Identificar o restaurante:
    // 1. Primeiro tenta pelos produtos (se algum produto tiver restaurant_id) - PRIORIDADE MÁXIMA
    // 2. Se todos os produtos forem antigos (sem restaurant_id), usa o restaurant_id do body
    // 3. Se não conseguir identificar, REJEITA o pedido
    const produtosComRestaurante = products.filter(p => p.restaurant_id);
    const produtosSemRestaurante = products.filter(p => !p.restaurant_id);
    
    console.log("🔍 Análise de produtos:");
    console.log("   - Produtos com restaurante:", produtosComRestaurante.length);
    console.log("   - Produtos sem restaurante:", produtosSemRestaurante.length);
    console.log("   - restaurant_id do body:", restaurant_id);

    if (produtosComRestaurante.length > 0) {
      // PRIORIDADE 1: Se tem produtos com restaurant_id, usar o restaurant_id deles
      const primeiroProdutoComRestaurante = produtosComRestaurante[0];
      restaurantId = primeiroProdutoComRestaurante.restaurant_id;
      
      console.log("✅ Restaurante identificado pelos produtos:", restaurantId);
      
      // Verificar se TODOS os produtos (com restaurant_id) pertencem ao MESMO restaurante
      const todosMesmoRestaurante = produtosComRestaurante.every(p => p.restaurant_id === restaurantId);
      if (!todosMesmoRestaurante) {
        console.error("❌ Produtos de restaurantes diferentes no pedido!");
        const restaurantesNoPedido = [...new Set(produtosComRestaurante.map(p => p.restaurant_id).filter(Boolean))];
        console.error("   Restaurantes encontrados:", restaurantesNoPedido);
        return NextResponse.json(
          { 
            error: `Os produtos selecionados são de restaurantes diferentes. Por favor, adicione apenas produtos do mesmo restaurante.` 
          },
          { status: 400 }
        );
      }
      
      // VALIDAÇÃO DE ISOLAMENTO: Se tem produtos sem restaurante E produtos com restaurante, rejeitar
      // Isso garante que produtos do Tom & Jerry não sejam misturados com produtos do Versiory
      if (produtosSemRestaurante.length > 0) {
        console.error("❌ ERRO DE ISOLAMENTO: Mistura de produtos antigos (Versiory) e novos (outro restaurante) no pedido!");
        return NextResponse.json(
          { 
            error: "Não é possível misturar produtos de restaurantes diferentes. Por favor, faça pedidos separados." 
          },
          { status: 400 }
        );
      }
      
      // VALIDAÇÃO ADICIONAL usando função centralizada
      const validation = validateRestaurantIsolation(products, restaurantId);
      if (!validation.valid) {
        console.error("❌ ERRO DE ISOLAMENTO:", validation.error);
        return NextResponse.json(
          { error: validation.error || "Produtos de restaurantes diferentes detectados" },
          { status: 400 }
        );
      }
    } else if (produtosSemRestaurante.length > 0) {
      // PRIORIDADE 2: Se TODOS os produtos são antigos (sem restaurant_id)
      // Tentar usar o restaurant_id do body primeiro
      if (restaurant_id) {
        restaurantId = restaurant_id;
        console.log("⚠️ Pedido com produtos antigos, usando restaurant_id do body:", restaurantId);
      } else {
        // Se não tem restaurant_id no body, usar automaticamente o UUID do demo@versiory.com.br
        // (que é o dono dos produtos antigos) - ISOLAMENTO: sempre Versiory para produtos antigos
        restaurantId = DEMO_RESTAURANT_UUID;
        console.log("✅ Pedido com produtos antigos, associando automaticamente ao Versiory (demo)");
        console.log("   UUID do demo:", restaurantId);
      }
    } else {
      // Caso impossível, mas por segurança
      console.error("❌ Nenhum produto encontrado no pedido (caso impossível)");
      return NextResponse.json(
        { error: "Erro interno: nenhum produto encontrado" },
        { status: 500 }
      );
    }
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: "Não foi possível identificar o restaurante" },
        { status: 400 }
      );
    }

    // VALIDAÇÃO FINAL: Garantir que restaurantId foi identificado
    if (!restaurantId) {
      console.error("❌ ERRO CRÍTICO: restaurantId não foi identificado após todas as tentativas!");
      console.error("   Produtos com restaurante:", produtosComRestaurante.length);
      console.error("   Produtos sem restaurante:", produtosSemRestaurante.length);
      console.error("   restaurant_id do body:", restaurant_id);
      return NextResponse.json(
        { 
          error: "Erro interno: não foi possível identificar o restaurante. Por favor, tente novamente ou entre em contato com o suporte." 
        },
        { status: 500 }
      );
    }

    const restaurantIdString = String(restaurantId);
    console.log("✅ Restaurante identificado com SUCESSO:", restaurantIdString);
    console.log("✅ Total de produtos no pedido:", products.length);
    console.log("✅ Produtos com restaurante:", produtosComRestaurante.length);
    console.log("✅ Produtos antigos:", produtosSemRestaurante.length);
    console.log("📦 Criando pedido com user_id (restaurant_id):", restaurantIdString);
    console.log("📦 Tipo do restaurantIdString:", typeof restaurantIdString);
    console.log("📦 Valor exato que será salvo:", restaurantIdString);

    // Criar pedido associado ao restaurante
    // user_id em orders é VARCHAR, então garantir que seja string
    // IMPORTANTE: Garantir que o user_id seja exatamente o UUID do restaurante como string
    const finalUserId = String(restaurantId).trim();
    console.log("💾 Salvando pedido com user_id final:", finalUserId, "Tipo:", typeof finalUserId);
    
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: finalUserId, // user_id em orders é o ID do restaurante (garantir string)
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
        customer_email: email ? email.toLowerCase().trim() : null, // Normalizar email para comparação consistente
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Erro ao criar pedido:", orderError);
      console.error("❌ Detalhes do erro:", JSON.stringify(orderError, null, 2));
      throw orderError;
    }
    
    console.log("✅ Pedido criado com sucesso!");
    console.log("   - ID do pedido:", order.id);
    console.log("   - user_id salvo no banco:", order.user_id);
    console.log("   - user_id que enviamos:", finalUserId);
    console.log("   - Comparação:", String(order.user_id) === String(finalUserId));
    console.log("   - Restaurante identificado:", restaurantIdString);

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




