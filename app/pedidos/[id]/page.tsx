"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { useParams } from "next/navigation";
import { formatCurrency, formatDate, formatTime, getTimeAgo } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";

interface OrderStatusHistory {
  id: string;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_address?: string;
  payment_method: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    observations?: string;
    products: {
      name: string;
      image?: string;
    };
  }>;
  order_status_history?: OrderStatusHistory[];
}

const statusConfig = {
  pending: { label: "Aguardando Confirmação", color: "text-yellow-400", bgColor: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-blue-400", bgColor: "bg-blue-500", icon: CheckCircle },
  preparing: { label: "Preparando", color: "text-orange-400", bgColor: "bg-orange-500", icon: Package },
  ready: { label: "Pronto", color: "text-green-400", bgColor: "bg-green-500", icon: CheckCircle },
  delivering: { label: "Saiu para Entrega", color: "text-purple-400", bgColor: "bg-purple-500", icon: Package },
  delivered: { label: "Entregue", color: "text-green-400", bgColor: "bg-green-600", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-red-400", bgColor: "bg-red-500", icon: XCircle },
};

export default function PedidoPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders?id=${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando pedido...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Pedido não encontrado</div>
      </div>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Acompanhamento do Pedido</h1>

          {/* Status */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <StatusIcon className={`w-6 h-6 md:w-8 md:h-8 ${status.color} flex-shrink-0`} />
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h2>
                <p className={`text-base md:text-lg ${status.color}`}>{status.label}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              Realizado em {formatDate(order.created_at)}
            </p>
          </div>

          {/* Timeline de Status */}
          {order.order_status_history && order.order_status_history.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Acompanhamento</h2>
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                
                <div className="space-y-4 md:space-y-6">
                  {order.order_status_history.map((historyItem, index) => {
                    const historyStatus = statusConfig[historyItem.status as keyof typeof statusConfig] || statusConfig.pending;
                    const HistoryIcon = historyStatus.icon;
                    const isLast = index === order.order_status_history!.length - 1;
                    
                    return (
                      <div key={historyItem.id} className="relative pl-12 md:pl-16">
                        {/* Ponto na timeline */}
                        <div className={`absolute left-2 md:left-4 top-2 w-4 h-4 md:w-6 md:h-6 rounded-full ${historyStatus.bgColor} border-4 border-black z-10 ${isLast ? 'ring-2 ring-white' : ''}`}></div>
                        
                        {/* Card do status */}
                        <div className="bg-gray-800 rounded-lg p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <HistoryIcon className={`w-5 h-5 md:w-6 md:h-6 ${historyStatus.color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1">
                              <p className={`font-semibold text-sm md:text-base ${historyStatus.color}`}>
                                {historyStatus.label}
                              </p>
                              <p className="text-gray-400 text-xs md:text-sm mt-1">
                                {formatDate(historyItem.created_at)} às {formatTime(historyItem.created_at)}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {getTimeAgo(historyItem.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Itens */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Itens do Pedido</h2>
            <div className="space-y-3 md:space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">
                      {item.quantity}x {item.products.name}
                    </p>
                    {item.observations && (
                      <p className="text-xs md:text-sm text-gray-400 italic mt-1">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                  <p className="text-primary-yellow font-bold text-sm md:text-base whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Informações</h2>
            <div className="space-y-3">
              {order.delivery_address && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Endereço de Entrega</p>
                  <p className="font-medium text-sm md:text-base break-words">{order.delivery_address}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Forma de Pagamento</p>
                <p className="font-medium capitalize text-sm md:text-base">
                  {order.payment_method === "pix"
                    ? "PIX"
                    : order.payment_method === "card"
                    ? "Cartão"
                    : "Dinheiro"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Total</p>
                <p className="text-xl md:text-2xl font-bold text-primary-yellow">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

