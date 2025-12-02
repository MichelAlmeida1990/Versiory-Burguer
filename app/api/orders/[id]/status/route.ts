import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const { id: orderId } = await params;

    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) throw updateError;

    // Registrar no histórico
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status,
      });

    if (historyError) throw historyError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

