"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  paymentMethod: "pix" | "card";
  restaurantId: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  paymentMethod,
  restaurantId,
}: PaymentModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodePix, setQrCodePix] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Só gerar pagamento se o modal estiver aberto, tiver orderId e restaurantId válidos
    if (isOpen && orderId && restaurantId) {
      generatePayment();
    } else if (isOpen && (!orderId || !restaurantId)) {
      // Se o modal abriu mas faltam dados essenciais, fechar e mostrar erro
      console.warn("PaymentModal: Dados incompletos", { orderId, restaurantId });
      toast.error("Erro: Dados do pedido incompletos");
      onClose();
    }
  }, [isOpen, orderId, restaurantId]);

  const generatePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
          paymentMethod,
          restaurantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se for erro de configuração (requiresConfig), tratar como pagamento na entrega
        if (data.requiresConfig) {
          toast.success("Pedido realizado com sucesso! O pagamento será feito na entrega.");
          // Fechar modal - o onClose vai redirecionar para /pedidos
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        } else {
          toast.error(data.error || "Erro ao gerar pagamento");
        }
        // Não fechar automaticamente em caso de outros erros, deixar o usuário decidir
        setLoading(false);
        return;
      }

      if (data.success && data.transaction) {
        setQrCode(data.transaction.qr_code);
        setQrCodePix(data.transaction.qr_code_pix);
        setPaymentLink(data.transaction.payment_link);
        setTransactionId(data.transaction.id);
        
        if (paymentMethod === "pix" && data.transaction.qr_code) {
          toast.success("QR Code gerado! Escaneie ou copie o código PIX");
        } else if (paymentMethod === "card" && data.transaction.payment_link) {
          toast.success("Link de pagamento gerado!");
        }
      }
    } catch (error: any) {
      console.error("Erro ao gerar pagamento:", error);
      toast.error("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (qrCodePix) {
      try {
        await navigator.clipboard.writeText(qrCodePix);
        setCopied(true);
        toast.success("Código PIX copiado!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Erro ao copiar código");
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {paymentMethod === "pix" ? "Pague com PIX" : "Pague com Cartão"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Gerando pagamento...</p>
            </div>
          ) : (
            <>
              {/* Valor */}
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Valor a pagar</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(amount)}
                </p>
              </div>

              {/* PIX QR Code */}
              {paymentMethod === "pix" && qrCode && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Escaneie o QR Code com o app do seu banco
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                      <Image
                        src={qrCode}
                        alt="QR Code PIX"
                        width={256}
                        height={256}
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Código PIX Copia e Cola */}
                  {qrCodePix && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Ou copie o código PIX:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qrCodePix}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                        />
                        <button
                          onClick={copyPixCode}
                          className={`px-4 py-3 rounded-lg font-medium transition ${
                            copied
                              ? "bg-green-600 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {copied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 O pagamento é processado automaticamente. Você será
                      notificado quando confirmado.
                    </p>
                  </div>
                </div>
              )}

              {/* Link de Pagamento (Cartão) */}
              {paymentMethod === "card" && paymentLink && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600 mb-4">
                      Clique no botão abaixo para pagar com cartão de crédito ou débito
                    </p>
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Pagar com Cartão
                    </a>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 Você será redirecionado para uma página segura de pagamento.
                    </p>
                  </div>
                </div>
              )}

              {/* Sem pagamento gerado */}
              {!qrCode && !paymentLink && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Não foi possível gerar o pagamento.
                  </p>
                  <button
                    onClick={generatePayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

