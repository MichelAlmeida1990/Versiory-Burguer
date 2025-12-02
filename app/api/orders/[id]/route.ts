import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      total,
      delivery_fee,
      payment_method,
      status,
    } = body;

    // Buscar pedido atual para verificar mudança de status
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    // Atualizar pedido
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        total,
        delivery_fee,
        payment_method,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Se o status mudou, registrar no histórico
    if (status && currentOrder && currentOrder.status !== status) {
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status,
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID do pedido é obrigatório" },
        { status: 400 }
      );
    }

    console.log("Tentando deletar pedido:", orderId);

    // Primeiro, verificar se o pedido existe
    const { data: existingOrder, error: checkError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Deletar pedido (os order_items serão deletados automaticamente por CASCADE)
    const { data, error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .select();

    if (deleteError) {
      console.error("Erro do Supabase ao deletar:", deleteError);
      throw deleteError;
    }

    console.log("Pedido deletado com sucesso:", data);
    return NextResponse.json({ success: true, deleted: data });
  } catch (error: any) {
    console.error("Erro ao deletar pedido:", error);
    return NextResponse.json(
      { 
        error: error.message || "Erro ao deletar pedido",
        details: error.details || error.hint || null
      },
      { status: 500 }
    );
  }
}

