"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Product, Category, supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Package, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "categories">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === "products" || activeTab === "dashboard") {
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .order("name");
        if (productsData) setProducts(productsData);
      }

      if (activeTab === "categories" || activeTab === "dashboard") {
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("order");
        if (categoriesData) setCategories(categoriesData);
      }

      if (activeTab === "orders" || activeTab === "dashboard") {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (ordersData) {
          setOrders(ordersData);
          // Filtrar pedidos cancelados para o cálculo de faturamento
          const activeOrders = ordersData.filter((o) => o.status !== "cancelled");
          setStats({
            totalOrders: ordersData.length,
            totalRevenue: activeOrders.reduce((sum, o) => sum + Number(o.total), 0),
            pendingOrders: ordersData.filter((o) => o.status === "pending").length,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Produto excluído!");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir produto");
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ available: !product.available })
        .eq("id", product.id);
      if (error) throw error;
      toast.success(`Produto ${!product.available ? "ativado" : "desativado"}!`);
      loadData();
    } catch (error) {
      toast.error("Erro ao atualizar produto");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      if (error) throw error;
      toast.success("Status atualizado!");
      loadData();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Painel Administrativo</h1>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-8 border-b border-gray-800 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "products", label: "Produtos" },
            { id: "orders", label: "Pedidos" },
            { id: "categories", label: "Categorias" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-6 py-2 md:py-3 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary-yellow text-primary-yellow"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-primary-yellow" />
                <span className="text-2xl md:text-3xl font-bold">{stats.totalOrders}</span>
              </div>
              <p className="text-sm md:text-base text-gray-400">Total de Pedidos</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary-azure" />
                <span className="text-xl md:text-3xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <p className="text-sm md:text-base text-gray-400">Faturamento Total</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-primary-pink" />
                <span className="text-2xl md:text-3xl font-bold">{stats.pendingOrders}</span>
              </div>
              <p className="text-sm md:text-base text-gray-400">Pedidos Pendentes</p>
            </div>
          </div>
        )}

        {/* Produtos */}
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Produtos</h2>
              <Link
                href="/admin/products/new"
                className="bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Novo Produto
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-lg p-3 md:p-4">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-primary-yellow font-bold mb-3 md:mb-4 text-base md:text-lg">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleProductAvailability(product)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        product.available
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {product.available ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Pedidos</h2>
            <div className="space-y-3 md:space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-900 rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3 md:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm">
                        {formatDate(order.created_at)}
                      </p>
                      {order.delivery_address && (
                        <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2">
                          {order.delivery_address}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-auto text-left sm:text-right">
                      <p className="text-xl md:text-2xl font-bold text-primary-yellow mb-2 sm:mb-0">
                        {formatCurrency(order.total)}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm"
                      >
                        <option value="pending">Aguardando</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="preparing">Preparando</option>
                        <option value="ready">Pronto</option>
                        <option value="delivering">Saiu para Entrega</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorias */}
        {activeTab === "categories" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Categorias</h2>
              <button className="bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2 text-sm md:text-base">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nova Categoria
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-900 rounded-lg p-3 md:p-4">
                  <h3 className="text-base md:text-xl font-bold">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

