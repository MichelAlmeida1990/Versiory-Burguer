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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-4">Nenhum pedido encontrado</p>
            <Link
              href="/cardapio"
              className="inline-block bg-primary-yellow text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-opacity-90 transition"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                className="block bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      Pedido #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {formatDate(order.created_at)}
                    </p>
                    <p className={`mt-2 font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-yellow">
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

