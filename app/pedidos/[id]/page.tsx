"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { useParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";

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
}

const statusConfig = {
  pending: { label: "Aguardando Confirmação", color: "text-yellow-400", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-blue-400", icon: CheckCircle },
  preparing: { label: "Preparando", color: "text-orange-400", icon: Package },
  ready: { label: "Pronto", color: "text-green-400", icon: CheckCircle },
  delivering: { label: "Saiu para Entrega", color: "text-purple-400", icon: Package },
  delivered: { label: "Entregue", color: "text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-red-400", icon: XCircle },
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Acompanhamento do Pedido</h1>

          {/* Status */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <StatusIcon className={`w-8 h-8 ${status.color}`} />
              <div>
                <h2 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h2>
                <p className={`text-lg ${status.color}`}>{status.label}</p>
              </div>
            </div>
            <p className="text-gray-400">
              Realizado em {formatDate(order.created_at)}
            </p>
          </div>

          {/* Itens */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Itens do Pedido</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {item.quantity}x {item.products.name}
                    </p>
                    {item.observations && (
                      <p className="text-sm text-gray-400 italic">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                  <p className="text-primary-yellow font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Informações</h2>
            <div className="space-y-3">
              {order.delivery_address && (
                <div>
                  <p className="text-gray-400 text-sm">Endereço de Entrega</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Forma de Pagamento</p>
                <p className="font-medium capitalize">
                  {order.payment_method === "pix"
                    ? "PIX"
                    : order.payment_method === "card"
                    ? "Cartão"
                    : "Dinheiro"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-primary-yellow">
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

