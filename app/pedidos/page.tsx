"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useClientAuth } from "@/contexts/client-auth-context";
import { LogOut } from "lucide-react";
import { DEMO_RESTAURANT_UUID } from "@/lib/restaurant-constants";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_email: string;
  user_id?: string; // ID do restaurante
}

function PedidosContent() {
  const { user, loading: authLoading, signOut } = useClientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Detectar contexto de restaurante: pode vir do query param ou do localStorage
  const restaurantSlugFromQuery = searchParams?.get('restaurant');
  const restaurantSlug = restaurantSlugFromQuery || (typeof window !== 'undefined' ? localStorage.getItem('lastRestaurantContext') : null);
  const isRestaurantContext = !!restaurantSlug;

  const loadOrders = useCallback(async () => {
    // IMPORTANTE: Multi-tenancy - filtrar pedidos por restaurante quando em contexto específico
    // Na Versiory (sem contexto), mostrar pedidos do DEMO_RESTAURANT_UUID
    // Em restaurante específico, mostrar pedidos apenas daquele restaurante
    
    let emailToSearch: string | null = null;
    let restaurantIdToFilter: string | null = null;
    
    // Detectar se está em contexto de restaurante específico
    // Usar valores atualizados de restaurantSlug e isRestaurantContext
    const currentRestaurantSlug = searchParams?.get('restaurant') || (typeof window !== 'undefined' ? localStorage.getItem('lastRestaurantContext') : null);
    const currentIsRestaurantContext = !!currentRestaurantSlug;
    
    if (currentIsRestaurantContext && currentRestaurantSlug) {
      // Buscar o UUID do restaurante através do slug
      try {
        const response = await fetch(`/api/restaurante/${currentRestaurantSlug}`);
        if (response.ok) {
          const restaurantData = await response.json();
          restaurantIdToFilter = restaurantData.restaurant_id;
          console.log("🏪 Contexto de restaurante detectado:", currentRestaurantSlug, "UUID:", restaurantIdToFilter);
        } else {
          console.error("⚠️ Erro ao buscar dados do restaurante pelo slug:", currentRestaurantSlug);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar restaurante:", error);
      }
    } else {
      // Versiory: usar DEMO_RESTAURANT_UUID
      restaurantIdToFilter = DEMO_RESTAURANT_UUID;
      console.log("🏪 Contexto Versiory (demo), usando UUID:", restaurantIdToFilter);
    }
    
    if (user) {
      // IMPORTANTE: Na Versiory, permitir buscar pedidos mesmo se não for cliente
      // Apenas em restaurantes específicos, exigir que seja cliente
      if (currentIsRestaurantContext) {
        // Verificar se é cliente (user_type === 'client')
        const isClient = user?.user_metadata?.user_type === 'client';
        
        if (!isClient) {
          // Se não for cliente em restaurante específico, não mostrar pedidos aqui
          console.log("⚠️ Usuário não é cliente, redirecionando...");
          setOrders([]);
          setLoading(false);
          return;
        }
      }
      
      // Usar email da conta para buscar pedidos
      emailToSearch = user.email?.toLowerCase().trim() || null;
      
      if (!emailToSearch) {
        console.log("⚠️ Email do cliente não encontrado");
        setLoading(false);
        return;
      }

      console.log("🔍 Usuário logado, buscando pedidos para:", emailToSearch);
    } else {
      // Versiory: sem login, tentar usar email do localStorage
      const lastOrderEmail = typeof window !== 'undefined' 
        ? localStorage.getItem('lastOrderEmail') 
        : null;
      
      if (lastOrderEmail) {
        emailToSearch = lastOrderEmail.toLowerCase().trim();
        console.log("🔍 Versiory (sem login), buscando pedidos para:", emailToSearch);
      } else {
        console.log("⚠️ Nenhum email disponível (nem login nem localStorage)");
        setOrders([]);
        setLoading(false);
        return;
      }
    }

    if (!emailToSearch) {
      console.log("⚠️ Nenhum email disponível para buscar pedidos");
      setLoading(false);
      return;
    }

    try {
      // IMPORTANTE: Normalizar email para comparação consistente (lowercase + trim)
      const normalizedEmail = emailToSearch.toLowerCase().trim();
      
      // Construir query baseada no contexto
      let query = supabase
        .from("orders")
        .select("*")
        .eq("customer_email", normalizedEmail); // Sempre filtrar por email normalizado
      
      // IMPORTANTE: Filtrar por restaurante quando em contexto específico
      if (restaurantIdToFilter) {
        // Garantir que o user_id seja comparado como string (já que é VARCHAR no banco)
        query = query.eq("user_id", String(restaurantIdToFilter).trim());
        console.log("🔒 Filtrando pedidos do restaurante:", restaurantIdToFilter);
      }
      
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("❌ Erro ao buscar pedidos:", error);
        throw error;
      }
      
      console.log("✅ Pedidos encontrados:", data?.length || 0);
      console.log("🔍 Email usado na busca (normalizado):", normalizedEmail);
      console.log("🔍 Restaurante filtrado:", restaurantIdToFilter);
      
      if (data && data.length > 0) {
        console.log("📦 Primeiro pedido:", {
          id: data[0].id,
          email: data[0].customer_email,
          email_no_pedido: data[0].customer_email,
          user_id: data[0].user_id,
          user_id_esperado: restaurantIdToFilter,
          total: data[0].total
        });
      } else {
        console.log("⚠️ Nenhum pedido encontrado com os filtros:");
        console.log("   - Email:", normalizedEmail);
        console.log("   - Restaurante:", restaurantIdToFilter);
      }
      
      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      console.error("Email usado na busca:", emailToSearch);
      console.error("Restaurante filtrado:", restaurantIdToFilter);
    } finally {
      setLoading(false);
    }
  }, [user, searchParams]);

  useEffect(() => {
    // IMPORTANTE: Na Versiory (sem contexto de restaurante), permitir acesso sem login
    // Apenas restaurantes específicos exigem login obrigatório
    if (!authLoading && !user) {
      // Se tem contexto de restaurante específico, exigir login
      if (isRestaurantContext && restaurantSlug) {
        router.push(`/restaurante/${restaurantSlug}/cliente/login`);
        return;
      }
      
      // Versiory: não redirecionar, permitir acesso sem login
      // Vai usar o email do localStorage para buscar pedidos
    }

    // Verificar se é o primeiro acesso (primeira vez logando)
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome_${user.id}`);
      if (!hasSeenWelcome && user.user_metadata?.name) {
        setShowWelcome(true);
        // Marcar que já viu a mensagem de boas-vindas
        localStorage.setItem(`welcome_${user.id}`, 'true');
        // Esconder após 5 segundos
        setTimeout(() => setShowWelcome(false), 5000);
      }
    }

    // Carregar pedidos quando autenticação ou contexto mudar
    if (!authLoading) {
      loadOrders();
    }
  }, [user, authLoading, loadOrders, isRestaurantContext, restaurantSlug, router]);

  // Recarregar pedidos quando o email do último pedido mudar no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = () => {
      // Recarregar pedidos quando houver mudança no email do último pedido
      loadOrders();
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Recarregar quando voltar para a página (caso tenha feito um pedido em outra aba)
    const handleFocus = () => {
      loadOrders();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadOrders]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando pedidos...</div>
      </div>
    );
  }

  // Na Versiory, permitir acesso sem login, então não bloqueamos a renderização aqui

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Função para extrair o primeiro nome
  const getFirstName = () => {
    if (!user?.user_metadata?.name) return null;
    return user.user_metadata.name.split(" ")[0];
  };

  const firstName = getFirstName();
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">Meus Pedidos</h1>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
          )}
        </div>

        {/* Mensagem de Boas-vindas */}
        {showWelcome && firstName && (
          <div className="mb-6 bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/10 border border-primary-yellow/30 rounded-lg p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">👋</span>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-primary-yellow">
                  {greeting}, {firstName}!
                </h2>
                <p className="text-gray-300 text-sm md:text-base mt-1">
                  Bem-vindo(a) ao nosso sistema! Agora você pode acompanhar seus pedidos e participar do programa de fidelidade.
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="ml-auto text-gray-400 hover:text-white transition text-xl font-bold"
                aria-label="Fechar mensagem"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-xl md:text-2xl text-gray-400 mb-6">
              Nenhum pedido encontrado
            </p>
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

export default function PedidosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    }>
      <PedidosContent />
    </Suspense>
  );
}


