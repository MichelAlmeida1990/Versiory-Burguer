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

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: `guest_${Date.now()}`, // Em produção, usar autenticação real
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

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

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
      // Buscar pedido específico
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
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



