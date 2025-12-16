import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// QRCode será importado dinamicamente se necessário
let QRCode: any = null;
try {
  QRCode = require("qrcode");
} catch (e) {
  console.warn("QRCode library not available");
}

/**
 * API Route para gerar link de pagamento e QR Code PIX
 * 
 * Quando tiver as credenciais/configurações do gateway:
 * 1. Buscar payment_configurations do restaurante
 * 2. Chamar API do gateway (MercadoPago, Pagarme, etc)
 * 3. Gerar link de pagamento e QR Code
 * 4. Salvar em payment_transactions
 * 
 * Por enquanto, gera QR Code PIX estático com valor e informações básicas
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, paymentMethod, restaurantId } = body;

    if (!orderId || !amount || !paymentMethod || !restaurantId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Buscar configuração de pagamento do restaurante
    const { data: paymentConfig, error: configError } = await supabase
      .from("payment_configurations")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("enabled", true)
      .single();

    // Se não tiver configuração ou não estiver habilitado, retornar erro silenciosamente
    // (não é um erro crítico, apenas significa que o pagamento online não está configurado)
    if (configError || !paymentConfig || !paymentConfig.enabled) {
      // Não logar como erro, pois é uma situação esperada quando pagamento não está configurado
      return NextResponse.json(
        { 
          error: "Pagamento online não configurado para este restaurante",
          requiresConfig: true 
        },
        { status: 400 }
      );
    }

    let paymentLink: string | null = null;
    let qrCode: string | null = null;
    let qrCodePix: string | null = null;
    let gatewayTransactionId: string | null = null;

    // ============================================
    // AQUI SERÁ INTEGRADO COM O GATEWAY DE PAGAMENTO
    // ============================================
    // Exemplo de estrutura (quando tiver credenciais):
    /*
    if (paymentConfig.gateway === 'mercadopago') {
      // Chamar API do MercadoPago
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paymentConfig.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_amount: amount,
          payment_method_id: paymentMethod === 'pix' ? 'pix' : 'credit_card',
          // ... outros campos
        })
      });
      
      const mpData = await mpResponse.json();
      paymentLink = mpData.point_of_interaction?.transaction_data?.ticket_url;
      qrCode = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
      gatewayTransactionId = mpData.id.toString();
    }
    */

    // Por enquanto, gerar QR Code PIX estático de exemplo
    // Quando tiver integração real, substituir esta parte
    if (paymentMethod === 'pix') {
      // Gerar código PIX EMV (estrutura básica - substituir pela geração real do gateway)
      const pixKey = paymentConfig.pix_key || '00000000000'; // Chave PIX do restaurante
      const amountStr = amount.toFixed(2).replace('.', '');
      
      // Estrutura simplificada do PIX (em produção, usar biblioteca adequada)
      // Formato: 00020126... (EMV QR Code)
      qrCodePix = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amountStr.length}${amountStr}5802BR5925${paymentConfig.restaurant_id}6009SAO PAULO62070503***6304XXXX`;
      
      // Gerar QR Code em base64
      if (QRCode) {
        try {
          qrCode = await QRCode.toDataURL(qrCodePix, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2
          });
        } catch (qrError) {
          console.error("Erro ao gerar QR Code:", qrError);
        }
      }

      // Link de pagamento (quando tiver gateway configurado)
      paymentLink = paymentConfig.webhook_url 
        ? `${paymentConfig.webhook_url}/pay/${orderId}` 
        : null;
    } else if (paymentMethod === 'card') {
      // Para cartão, gerar link de pagamento
      // Quando tiver gateway, usar API real
      paymentLink = paymentConfig.webhook_url 
        ? `${paymentConfig.webhook_url}/pay/${orderId}?method=card&amount=${amount}` 
        : null;
    }

    // Criar registro da transação
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        amount,
        payment_method: paymentMethod,
        payment_type: paymentMethod === 'pix' ? 'qrcode' : 'link',
        gateway: paymentConfig.gateway,
        gateway_transaction_id: gatewayTransactionId,
        payment_link: paymentLink,
        qr_code: qrCode,
        qr_code_pix: qrCodePix,
        qr_code_expires_at: paymentMethod === 'pix' 
          ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // Expira em 30 minutos
          : null,
        status: 'pending',
        metadata: {
          generated_at: new Date().toISOString(),
          gateway: paymentConfig.gateway,
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Erro ao criar transação:", transactionError);
      throw transactionError;
    }

    // Atualizar pedido com payment_transaction_id
    await supabase
      .from("orders")
      .update({ 
        payment_transaction_id: transaction.id,
        payment_status: 'pending'
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        payment_link: paymentLink,
        qr_code: qrCode,
        qr_code_pix: qrCodePix,
        expires_at: transaction.qr_code_expires_at,
        status: transaction.status
      }
    });

  } catch (error: any) {
    console.error("Erro ao gerar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao gerar pagamento" },
      { status: 500 }
    );
  }
}

