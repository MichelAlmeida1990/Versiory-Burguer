"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/layout/admin-header";

interface OrderItemOption {
  id: string;
  option_id: string;
  option_value_id: string;
  price_modifier: number;
  product_options?: {
    name: string;
  };
  product_option_values?: {
    name: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  observations?: string;
  products: {
    name: string;
  };
  order_item_options?: OrderItemOption[];
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  payment_method?: string;
  order_items: OrderItem[];
}

export default function CozinhaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadOrders();
    // Atualizar a cada 3 segundos
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*),
            order_item_options (
              *,
              product_options (
                name
              ),
              product_option_values (
                name
              )
            )
          )
        `)
        .in("status", ["pending", "confirmed", "preparing"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Tocar som se houver novo pedido
      if (data && data.length > orders.length && soundEnabled) {
        playNotificationSound();
      }

      if (data) setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch(() => {
      // Ignorar erro se não houver arquivo de som
    });
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar status");
      }

      toast.success("Status atualizado!");
      loadOrders();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors">
      <AdminHeader />
      <div className="p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">Cozinha - Pedidos</h1>
          <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <span>Som de Notificação</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border-2 ${
                order.status === "pending"
                  ? "border-orange-500 animate-pulse"
                  : order.status === "confirmed"
                  ? "border-yellow-500 animate-pulse"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold">
                    Pedido #{order.id.slice(0, 8)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                    {formatDate(order.created_at)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">{order.customer_name}</p>
                </div>
                {(order.status === "pending" || order.status === "confirmed") && (
                  <Clock className={`w-6 h-6 md:w-8 md:h-8 animate-spin flex-shrink-0 ml-2 ${
                    order.status === "pending" ? "text-orange-500" : "text-yellow-500"
                  }`} />
                )}
              </div>

              <div className="space-y-2 mb-4 md:mb-6">
                {order.order_items.map((item) => (
                  <div key={item.id} className="bg-gray-100 dark:bg-gray-800 rounded p-2 md:p-3">
                    <p className="font-bold text-sm md:text-base">
                      {item.quantity}x {item.products.name}
                    </p>
                    
                    {/* Exibir opções selecionadas */}
                    {item.order_item_options && item.order_item_options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.order_item_options.map((option) => (
                          <div key={option.id} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <span className="text-primary-yellow">•</span>
                            <span>
                              {option.product_options?.name || 'Opção'}:{" "}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {option.product_option_values?.name || 'Valor'}
                              </span>
                              {option.price_modifier !== 0 && (
                                <span className="text-green-400 ml-1">
                                  ({option.price_modifier > 0 ? '+' : ''}R$ {Math.abs(option.price_modifier).toFixed(2)})
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {item.observations && (
                      <p className="text-xs md:text-sm text-yellow-400 italic mt-2">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Informações adicionais do pedido */}
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800/50 rounded text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {order.delivery_address && (
                  <p><span className="font-semibold">Endereço:</span> {order.delivery_address}</p>
                )}
                {order.customer_phone && (
                  <p><span className="font-semibold">Telefone:</span> {order.customer_phone}</p>
                )}
                {order.payment_method && (
                  <p><span className="font-semibold">Pagamento:</span> {
                    order.payment_method === 'pix' ? 'PIX' :
                    order.payment_method === 'card' ? 'Cartão' :
                    order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method
                  }</p>
                )}
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "confirmed")}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-3 md:px-4 py-2 rounded-lg font-bold transition text-sm md:text-base"
                  >
                    Confirmar Pedido
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 md:px-4 py-2 rounded-lg font-bold transition text-sm md:text-base"
                  >
                    Iniciar Preparo
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-3 md:px-4 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                    Pronto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-600 dark:text-gray-400">
            <p className="text-2xl">Nenhum pedido no momento</p>
            <p className="mt-2">Aguardando novos pedidos...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

