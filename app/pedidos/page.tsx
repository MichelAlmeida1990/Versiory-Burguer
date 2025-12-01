"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-400",
      confirmed: "text-blue-400",
      preparing: "text-orange-400",
      ready: "text-green-400",
      delivering: "text-purple-400",
      delivered: "text-green-400",
      cancelled: "text-red-400",
    };
    return colors[status] || "text-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Aguardando",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      delivering: "Saiu para Entrega",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-xl md:text-2xl text-gray-400 mb-4">Nenhum pedido encontrado</p>
            <Link
              href="/#cardapio"
              className="inline-block bg-primary-yellow text-black px-6 md:px-8 py-3 md:py-4 rounded-lg text-lg md:text-xl font-bold hover:bg-opacity-90 transition"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                className="block bg-gray-900 rounded-lg p-4 md:p-6 hover:bg-gray-800 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">
                      Pedido #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {formatDate(order.created_at)}
                    </p>
                    <p className={`mt-1 md:mt-2 font-medium text-sm md:text-base ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right">
                    <p className="text-xl md:text-2xl font-bold text-primary-yellow">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


