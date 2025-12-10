"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/admin/auth-guard";
import { Product, Category, supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, formatTime, formatDateTime, getTimeAgo } from "@/lib/utils";
import { Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Calendar, ShoppingBag, Clock, CheckCircle, AlertTriangle, LogOut } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";

// Componente para evitar erro de hidratação com getTimeAgo
function TimeAgo({ date }: { date: Date | string }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    setTimeAgo(getTimeAgo(date));
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date));
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [date]);

  return <span>{timeAgo || "carregando..."}</span>;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "categories">(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["dashboard", "products", "orders", "categories"].includes(tabParam)) {
      return tabParam as "dashboard" | "products" | "orders" | "categories";
    }
    return "dashboard";
  });
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    todayOrders: 0,
    weekRevenue: 0,
    weekOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled" | "active">("active");
  const [showDelivered, setShowDelivered] = useState(false);
  const [timerUpdate, setTimerUpdate] = useState(0);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["dashboard", "products", "orders", "categories"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Atualizar timer e recarregar dados automaticamente
  useEffect(() => {
    // Recarregar a cada 30 segundos (mais frequente para pegar pedidos novos)
    const interval = setInterval(() => {
      setTimerUpdate(prev => prev + 1);
      // Recarregar dados automaticamente
      if (activeTab === "orders" || activeTab === "dashboard") {
        loadData();
      }
    }, 30000); // Atualizar a cada 30 segundos
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Recarregar quando mudar de aba

  // Carregar informações do usuário
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const loadData = async () => {
    try {
      // Obter usuário logado para filtrar dados
      const { data: { user } } = await supabase.auth.getUser();
      const restaurantId = user?.id;

      if (!restaurantId) {
        console.warn("⚠️ Usuário não autenticado, não é possível carregar dados");
        return;
      }

      console.log("🔍 Admin - Filtrando dados para restaurante:", restaurantId, "Email:", user?.email);

      if (activeTab === "products" || activeTab === "dashboard") {
        // Filtrar produtos do restaurante logado
        // Demo tem produtos antigos associados, então busca apenas produtos do demo
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("name");
        
        if (productsError) {
          console.error("❌ Erro ao buscar produtos:", productsError);
        } else {
          console.log("📦 Produtos no admin:", productsData?.length || 0, "Restaurante:", restaurantId);
          setProducts(productsData || []);
        }
      }

      if (activeTab === "categories" || activeTab === "dashboard") {
        // Filtrar categorias do restaurante logado
        // Demo tem categorias antigas associadas, então busca apenas categorias do demo
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("order");
        
        if (categoriesError) {
          console.error("❌ Erro ao buscar categorias:", categoriesError);
        } else {
          console.log("📁 Categorias no admin:", categoriesData?.length || 0, "Restaurante:", restaurantId);
          setCategories(categoriesData || []);
        }
      }

      if (activeTab === "orders" || activeTab === "dashboard") {
        // Carregar pedidos com itens e histórico de status - apenas do restaurante logado
        // user_id em orders é o ID do restaurante (pode ser UUID ou legacy_timestamp)
        console.log("🔍 Admin - Buscando pedidos para restaurante:", restaurantId, "Tipo:", typeof restaurantId, "Email:", user?.email);
        
        // Buscar pedidos - user_id é VARCHAR, então converter para string
        // Tentar buscar com o UUID como string
        const restaurantIdString = String(restaurantId);
        console.log("🔍 Buscando pedidos com user_id (string):", restaurantIdString);
        console.log("🔍 UUID original:", restaurantId);
        
        // Tentar buscar pedidos - user_id é VARCHAR no banco
        let query = supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              products (*)
            ),
            order_status_history (*)
          `);
        
        // Comparar user_id como string (VARCHAR no banco)
        // Garantir que ambos sejam strings para comparação exata
        const cleanRestaurantId = String(restaurantId).trim();
        query = query.eq("user_id", cleanRestaurantId);
        
        let { data: ordersData, error: ordersError } = await query
          .order("created_at", { ascending: false })
          .limit(500);
        
        console.log("🔍 Query executada - Pedidos encontrados:", ordersData?.length || 0);
        console.log("🔍 Buscando com user_id:", cleanRestaurantId);
        if (ordersData && ordersData.length > 0) {
          console.log("📋 Primeiro pedido encontrado - user_id:", ordersData[0].user_id, "Tipo:", typeof ordersData[0].user_id);
          console.log("📋 RestaurantId esperado:", cleanRestaurantId, "Tipo:", typeof cleanRestaurantId);
          console.log("📋 Comparação direta:", ordersData[0].user_id === cleanRestaurantId);
          console.log("📋 Comparação com String():", String(ordersData[0].user_id) === String(cleanRestaurantId));
        } else {
          console.log("⚠️ Nenhum pedido encontrado com user_id =", cleanRestaurantId);
          // Buscar todos os pedidos recentes para debug
          const { data: allRecentOrders } = await supabase
            .from("orders")
            .select("id, user_id, customer_name, customer_email, created_at")
            .order("created_at", { ascending: false })
            .limit(10);
          console.log("🔍 Últimos 10 pedidos no banco:", allRecentOrders?.map(o => ({
            id: o.id,
            user_id: o.user_id,
            user_id_type: typeof o.user_id,
            customer_name: o.customer_name,
            customer_email: o.customer_email,
            created_at: o.created_at,
            user_id_matches: String(o.user_id) === cleanRestaurantId,
            user_id_trimmed_matches: String(o.user_id).trim() === cleanRestaurantId
          })));
        }

        // Se não encontrou pedidos pelo user_id, tentar buscar por produtos do restaurante
        // (fallback para pedidos criados com ID legado mas que têm produtos do restaurante)
        if (!ordersError && (!ordersData || ordersData.length === 0)) {
          console.log("⚠️ Nenhum pedido encontrado pelo user_id, tentando buscar por produtos do restaurante...");
          console.log("🔍 RestaurantId para comparação:", restaurantId, "Tipo:", typeof restaurantId);
          console.log("🔍 RestaurantIdString para comparação:", restaurantIdString, "Tipo:", typeof restaurantIdString);
          
          // UUID do demo (dono dos produtos antigos)
          const DEMO_UUID = "f5f457d9-821e-4a21-9029-e181b1bee792";
          const isDemoRestaurant = String(restaurantId) === DEMO_UUID;
          
          // Se for demo, buscar pedidos mais antigos também (30 dias) para pegar pedidos com produtos antigos
          const daysToSearch = isDemoRestaurant ? 30 : 7;
          
          // Buscar TODOS os pedidos recentes para análise
          const { data: ordersByProducts, error: errorByProducts } = await supabase
            .from("orders")
            .select(`
              *,
              order_items (
                *,
                products (*)
              ),
              order_status_history (*)
            `)
            .gte("created_at", new Date(Date.now() - daysToSearch * 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: false })
            .limit(500);
          
          console.log("🔍 Total de pedidos encontrados para análise:", ordersByProducts?.length || 0);
          console.log("🔍 Buscando pedidos dos últimos", daysToSearch, "dias (é demo?", isDemoRestaurant, ")");
          
          if (!errorByProducts && ordersByProducts) {
            // Filtrar apenas pedidos que têm produtos do restaurante
            const filteredOrders = ordersByProducts.filter((order: any) => {
              if (!order.order_items || order.order_items.length === 0) {
                console.log("⚠️ Pedido", order.id, "sem itens");
                return false;
              }
              
              // Log detalhado dos produtos do pedido
              const productDetails = order.order_items.map((item: any) => ({
                product_id: item.product_id,
                product_name: item.products?.name,
                product_restaurant_id: item.products?.restaurant_id,
                product_restaurant_id_type: typeof item.products?.restaurant_id,
                restaurant_id_match: item.products?.restaurant_id === restaurantId,
                restaurant_id_string_match: String(item.products?.restaurant_id) === restaurantIdString,
              }));
              
              console.log("📦 Pedido", order.id, "- Produtos:", productDetails);
              console.log("📦 Pedido", order.id, "- user_id atual:", order.user_id, "| user_id esperado:", restaurantIdString);
              
              // Verificar se todos os produtos pertencem ao restaurante OU são produtos antigos
              const allProductsFromRestaurant = order.order_items.every((item: any) => {
                const product = item.products;
                if (!product) return false;
                
                // Converter ambos para string para comparação segura
                const productRestaurantId = product.restaurant_id ? String(product.restaurant_id) : null;
                const expectedRestaurantId = String(restaurantId);
                
                // Produto pertence ao restaurante OU é produto antigo (sem restaurant_id)
                return productRestaurantId === expectedRestaurantId || productRestaurantId === null;
              });
              
              // Verificar se pelo menos um produto pertence ao restaurante
              const hasProductFromRestaurant = order.order_items.some((item: any) => {
                const product = item.products;
                if (!product) return false;
                
                // Converter ambos para string para comparação segura
                const productRestaurantId = product.restaurant_id ? String(product.restaurant_id) : null;
                const expectedRestaurantId = String(restaurantId);
                
                return productRestaurantId === expectedRestaurantId;
              });
              
              // Verificar se todos os produtos são antigos (sem restaurant_id)
              const allProductsAreOld = order.order_items.every((item: any) => {
                const product = item.products;
                if (!product) return false;
                return !product.restaurant_id;
              });
              
              // Incluir o pedido se:
              // 1. Todos os produtos pertencem ao restaurante OU são antigos
              // 2. E (pelo menos um produto pertence ao restaurante OU (é demo E todos são antigos))
              const shouldInclude = allProductsFromRestaurant && (
                hasProductFromRestaurant || (isDemoRestaurant && allProductsAreOld)
              );
              
              console.log("🔍 Pedido", order.id, "- Incluir?", shouldInclude, "| Tem produto do restaurante?", hasProductFromRestaurant, "| Todos produtos válidos?", allProductsFromRestaurant, "| Todos antigos?", allProductsAreOld, "| É demo?", isDemoRestaurant);
              
              return shouldInclude;
            });
            
            if (filteredOrders.length > 0) {
              console.log("✅ Encontrados", filteredOrders.length, "pedidos por produtos do restaurante");
              
              // Atualizar o user_id desses pedidos para o restaurante correto ANTES de usar
              // (correção automática)
              for (const order of filteredOrders) {
                if (String(order.user_id) !== restaurantIdString) {
                  console.log("🔧 Corrigindo user_id do pedido", order.id, "de", order.user_id, "para", restaurantIdString);
                  const { error: updateError } = await supabase
                    .from("orders")
                    .update({ user_id: restaurantIdString })
                    .eq("id", order.id);
                  
                  if (updateError) {
                    console.error("❌ Erro ao corrigir user_id do pedido", order.id, ":", updateError);
                  } else {
                    console.log("✅ user_id corrigido com sucesso para o pedido", order.id);
                    // Atualizar o user_id no objeto local também
                    order.user_id = restaurantIdString;
                  }
                }
              }
              
              ordersData = filteredOrders;
            } else {
              console.log("⚠️ Nenhum pedido encontrado mesmo após busca por produtos");
            }
          } else if (errorByProducts) {
            console.error("❌ Erro ao buscar pedidos por produtos:", errorByProducts);
          }
        }

        if (ordersError) {
          console.error("❌ Erro ao buscar pedidos:", ordersError);
          console.error("❌ Detalhes do erro:", JSON.stringify(ordersError, null, 2));
        } else {
          console.log("✅ Pedidos encontrados:", ordersData?.length || 0);
          if (ordersData && ordersData.length > 0) {
            console.log("📋 Primeiro pedido user_id:", ordersData[0].user_id, "Tipo:", typeof ordersData[0].user_id);
            console.log("📋 RestaurantId esperado:", restaurantIdString, "Tipo:", typeof restaurantIdString);
            console.log("📋 Comparação:", ordersData[0].user_id === restaurantIdString);
          } else {
            // Se não encontrou pedidos, buscar todos para debug
            const { data: allOrders } = await supabase
              .from("orders")
              .select("id, user_id, customer_name, created_at")
              .order("created_at", { ascending: false })
              .limit(10);
            console.log("🔍 Últimos 10 pedidos no banco (para debug):", allOrders?.map(o => ({
              id: o.id,
              user_id: o.user_id,
              customer_name: o.customer_name,
              created_at: o.created_at
            })));
          }
        }
        
        // Ordenar order_status_history por created_at
        if (ordersData) {
          ordersData.forEach((order: any) => {
            if (order.order_status_history) {
              order.order_status_history.sort((a: any, b: any) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            }
          });
        }
        
        // Sempre atualizar pedidos e estatísticas (mesmo que seja array vazio)
        const finalOrdersData = ordersData || [];
        setOrders(finalOrdersData);
        
        const activeOrders = finalOrdersData.filter((o) => o.status !== "cancelled");
        
        // Calcular métricas (sempre, mesmo que não tenha pedidos)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const todayOrders = activeOrders.filter(o => new Date(o.created_at) >= today);
        const weekOrders = activeOrders.filter(o => new Date(o.created_at) >= weekAgo);
        const monthOrders = activeOrders.filter(o => new Date(o.created_at) >= monthAgo);
        
        const newStats = {
          totalOrders: finalOrdersData.length,
          totalRevenue: activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          pendingOrders: finalOrdersData.filter((o) => o.status === "pending").length,
          todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          todayOrders: todayOrders.length,
          weekRevenue: weekOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          weekOrders: weekOrders.length,
          monthRevenue: monthOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          monthOrders: monthOrders.length,
        };
        
        console.log("📊 Estatísticas calculadas:", newStats);
        setStats(newStats);

        // Processar dados para gráficos (sempre, mesmo que seja array vazio)
        processChartData(activeOrders);
        processTopProducts(finalOrdersData);
        processPaymentMethods(activeOrders);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;

    try {
      console.log("Iniciando exclusão do produto:", id);
      
      // Buscar o produto para obter a URL da imagem
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("image")
        .eq("id", id)
        .single();

      if (productError) {
        console.error("Erro ao buscar produto:", productError);
        toast.error("Erro ao buscar produto: " + productError.message);
        return;
      }

      if (!product) {
        toast.error("Produto não encontrado");
        return;
      }

      // Verificar se há pedidos com este produto
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select("id")
        .eq("product_id", id)
        .limit(1);

      if (orderItemsError) {
        console.error("Erro ao verificar pedidos:", orderItemsError);
        toast.error("Erro ao verificar pedidos: " + orderItemsError.message);
        return;
      }

      if (orderItems && orderItems.length > 0) {
        // Se houver pedidos, apenas desativar o produto
        console.log("Produto tem pedidos, desativando...");
        const { error, data } = await supabase
          .from("products")
          .update({ available: false })
          .eq("id", id)
          .select();
        
        if (error) {
          console.error("Erro ao desativar produto:", error);
          console.error("Detalhes:", error.message, error.details, error.hint);
          toast.error("Erro ao desativar: " + error.message);
          return;
        }
        
        console.log("Produto desativado com sucesso:", data);
        // Atualizar estado local
        setProducts((prevProducts) => 
          prevProducts.map((p) => p.id === id ? { ...p, available: false } : p)
        );
        toast.success("Produto desativado (existe em pedidos anteriores)!");
      } else {
        // Se não houver pedidos, pode deletar completamente
        console.log("Produto não tem pedidos, deletando permanentemente...");
        
        // Deletar imagem do storage se existir e for do Supabase Storage
        if (product?.image) {
          const imageUrl = product.image;
          // Verificar se é uma URL do Supabase Storage
          if (imageUrl.includes('/storage/v1/object/public/images/')) {
            // Extrair o caminho do arquivo da URL
            const urlParts = imageUrl.split('/storage/v1/object/public/images/');
            if (urlParts.length > 1) {
              const filePath = urlParts[1];
              console.log("Deletando imagem do storage:", filePath);
              // Deletar do storage (ignorar erros se o arquivo não existir)
              try {
                const { error: storageError } = await supabase.storage
                  .from('images')
                  .remove([filePath]);
                if (storageError) {
                  console.warn("Erro ao deletar imagem do storage:", storageError);
                } else {
                  console.log("Imagem deletada do storage com sucesso");
                }
              } catch (storageError) {
                console.warn("Erro ao deletar imagem do storage (pode não existir):", storageError);
                // Continuar mesmo se falhar ao deletar a imagem
              }
            }
          }
        }

        // Deletar o produto
        console.log("Deletando produto do banco de dados...");
        const { error: deleteError, data: deletedData } = await supabase
          .from("products")
          .delete()
          .eq("id", id)
          .select();
        
        if (deleteError) {
          console.error("Erro ao deletar produto:", deleteError);
          console.error("Detalhes:", deleteError.message, deleteError.details, deleteError.hint);
          console.error("Código do erro:", deleteError.code);
          
          // Verificar se é erro de política RLS
          if (deleteError.message?.includes('policy') || deleteError.message?.includes('RLS') || deleteError.code === '42501') {
            toast.error("Erro de permissão. Execute a política RLS de DELETE no Supabase (arquivo: supabase/POLITICAS_PRODUTOS_DELETE.sql)");
          } else {
            toast.error("Erro ao deletar: " + deleteError.message);
          }
          return;
        }
        
        if (!deletedData || deletedData.length === 0) {
          console.warn("Produto não foi deletado (nenhum registro retornado)");
          toast.error("Produto não foi deletado. Verifique as políticas RLS.");
          return;
        }
        
        console.log("Produto deletado com sucesso:", deletedData);
        // Remover do estado local
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
        toast.success("Produto excluído permanentemente!");
      }
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      const errorMessage = error.message || error.details || "Erro ao excluir produto";
      toast.error(errorMessage);
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Produtos associados terão sua categoria removida.")) return;

    try {
      console.log("Iniciando exclusão da categoria:", id);
      
      // Verificar se há produtos com esta categoria
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id)
        .limit(1);

      if (productsError) {
        console.error("Erro ao verificar produtos:", productsError);
        toast.error("Erro ao verificar produtos: " + productsError.message);
        return;
      }

      if (products && products.length > 0) {
        // Se houver produtos, remover a categoria deles primeiro (será SET NULL automaticamente)
        const { error: updateError } = await supabase
          .from("products")
          .update({ category_id: null })
          .eq("category_id", id);
        
        if (updateError) {
          console.error("Erro ao remover categoria dos produtos:", updateError);
          toast.error("Erro ao remover categoria dos produtos: " + updateError.message);
          return;
        }
        
        console.log("Categoria removida dos produtos associados");
      }

      // Deletar a categoria
      console.log("Deletando categoria do banco de dados...");
      const { error: deleteError, data: deletedData } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .select();
      
      if (deleteError) {
        console.error("Erro ao deletar categoria:", deleteError);
        console.error("Detalhes:", deleteError.message, deleteError.details, deleteError.hint);
        console.error("Código do erro:", deleteError.code);
        
        // Verificar se é erro de política RLS
        if (deleteError.message?.includes('policy') || deleteError.message?.includes('RLS') || deleteError.code === '42501') {
          toast.error("Erro de permissão. Execute a política RLS de DELETE no Supabase (arquivo: supabase/POLITICAS_CATEGORIAS_DELETE.sql)");
        } else {
          toast.error("Erro ao deletar: " + deleteError.message);
        }
        return;
      }
      
      if (!deletedData || deletedData.length === 0) {
        console.warn("Categoria não foi deletada (nenhum registro retornado)");
        toast.error("Categoria não foi deletada. Verifique as políticas RLS.");
        return;
      }
      
      console.log("Categoria deletada com sucesso:", deletedData);
      // Remover do estado local
      setCategories((prevCategories) => prevCategories.filter((c) => c.id !== id));
      toast.success("Categoria excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      const errorMessage = error.message || error.details || "Erro ao excluir categoria";
      toast.error(errorMessage);
    }
  };

  const processChartData = (orders: any[]) => {
    // Agrupar por dia (últimos 30 dias)
    const daysMap = new Map<string, { date: string; sales: number; revenue: number }>();
    const now = new Date();
    
    // Inicializar últimos 30 dias
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dateFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
      daysMap.set(dateStr, { date: dateFormatted, sales: 0, revenue: 0 });
    }
    
    // Processar pedidos
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (daysMap.has(orderDate)) {
        const dayData = daysMap.get(orderDate)!;
        dayData.sales += 1;
        dayData.revenue += Number(order.total);
      }
    });
    
    setSalesData(Array.from(daysMap.values()));
    setRevenueData(Array.from(daysMap.values()));
  };

  const processTopProducts = (orders: any[]) => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      if (order.order_items && order.status !== 'cancelled') {
        order.order_items.forEach((item: any) => {
          if (item.products) {
            const productId = item.product_id;
            const productName = item.products.name;
            const quantity = item.quantity;
            const revenue = Number(item.price) * quantity;
            
            if (productMap.has(productId)) {
              const existing = productMap.get(productId)!;
              existing.quantity += quantity;
              existing.revenue += revenue;
            } else {
              productMap.set(productId, { name: productName, quantity, revenue });
            }
          }
        });
      }
    });
    
    const topProductsArray = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setTopProducts(topProductsArray);
  };

  const processPaymentMethods = (orders: any[]) => {
    const methodMap = new Map<string, number>();
    
    orders.forEach(order => {
      const method = order.payment_method || 'cash';
      const current = methodMap.get(method) || 0;
      methodMap.set(method, current + Number(order.total));
    });
    
    const methods = Array.from(methodMap.entries()).map(([name, value]) => ({
      name: name === 'pix' ? 'PIX' : name === 'card' ? 'Cartão' : 'Dinheiro',
      value: Number(value),
    }));
    
    setPaymentMethods(methods);
  };

  // Função para formatar minutos em horas/minutos/dias
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}min`;
      }
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  };

  // Função para calcular tempo no status atual e verificar se está dentro dos limites
  const getTimeStatus = (order: any) => {
    if (!order || order.status === "delivered" || order.status === "cancelled") {
      return null;
    }

    const maxTimes: Record<string, number> = {
      pending: 5,      // 5 minutos para aceitar
      confirmed: 30,   // 30 minutos para preparar
      preparing: 30,   // 30 minutos para preparar
      ready: 25,       // 25 minutos para entregar
      delivering: 25,  // 25 minutos para entregar
    };

    const maxTime = maxTimes[order.status];
    if (!maxTime) return null;

    let statusStartTime: Date;
    if (order.order_status_history && order.order_status_history.length > 0) {
      const currentStatusHistory = order.order_status_history
        .filter((h: any) => h.status === order.status)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      if (currentStatusHistory) {
        statusStartTime = new Date(currentStatusHistory.created_at);
      } else {
        statusStartTime = new Date(order.created_at);
      }
    } else {
      statusStartTime = new Date(order.created_at);
    }

    const now = new Date();
    const timeInStatus = Math.floor((now.getTime() - statusStartTime.getTime()) / 1000 / 60); // minutos

    const percentage = Math.min((timeInStatus / maxTime) * 100, 100);

    let status: "ok" | "warning" | "danger";
    let message: string;
    let color: string;
    let icon: any;

    if (timeInStatus <= maxTime * 0.7) {
      status = "ok";
      message = formatMinutes(timeInStatus);
      color = "text-green-400";
      icon = CheckCircle;
    } else if (timeInStatus <= maxTime) {
      status = "warning";
      const remaining = maxTime - timeInStatus;
      message = `${formatMinutes(timeInStatus)} (${formatMinutes(remaining)} restantes)`;
      color = "text-yellow-400";
      icon = Clock;
    } else {
      status = "danger";
      const exceeded = timeInStatus - maxTime;
      message = `${formatMinutes(timeInStatus)} (${formatMinutes(exceeded)} de atraso)`;
      color = "text-red-400";
      icon = AlertTriangle;
    }

    return {
      timeInStatus,
      maxTime,
      percentage,
      status,
      message,
      color,
      icon,
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
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
      loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.")) return;

    try {
      // Remover do estado local imediatamente para feedback visual
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        // Se falhar, recarregar os dados para restaurar o estado
        console.error("Erro na resposta:", result);
        loadData();
        throw new Error(result.error || "Erro ao excluir pedido");
      }

      toast.success("Pedido excluído com sucesso!");
      // Aguardar um pouco antes de recarregar para garantir que a exclusão foi processada
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao excluir pedido:", error);
      toast.error(error.message || "Erro ao excluir pedido. Verifique o console para mais detalhes.");
      // Recarregar dados em caso de erro
      loadData();
    }
  };

  const handleEditOrder = (order: any) => {
    // Abrir modal ou redirecionar para página de edição
    const newCustomerName = prompt("Nome do cliente:", order.customer_name || "");
    if (newCustomerName === null) return;

    const newCustomerPhone = prompt("Telefone:", order.customer_phone || "");
    if (newCustomerPhone === null) return;

    const newCustomerEmail = prompt("Email:", order.customer_email || "");
    if (newCustomerEmail === null) return;

    const newAddress = prompt("Endereço de entrega:", order.delivery_address || "");
    if (newAddress === null) return;

    const newTotal = prompt("Total (R$):", String(order.total));
    if (newTotal === null) return;

    updateOrder(order.id, {
      customer_name: newCustomerName,
      customer_phone: newCustomerPhone,
      customer_email: newCustomerEmail,
      delivery_address: newAddress,
      total: parseFloat(newTotal) || order.total,
    });
  };

  const updateOrder = async (orderId: string, data: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar pedido");
      }

      toast.success("Pedido atualizado com sucesso!");
      loadData();
    } catch (error: any) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error(error.message || "Erro ao atualizar pedido");
    }
  };

  // Calcular filtros de pedidos
  // Definir todos os status do fluxo de pedidos
  const activeStatuses = ["pending", "confirmed", "preparing", "ready", "delivering"];
  const deliveredStatus = "delivered";
  const cancelledStatus = "cancelled";
  
  // Filtrar pedidos seguindo o fluxo exato de cada fase
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === deliveredStatus);
  const cancelledOrders = orders.filter(o => o.status === cancelledStatus);
  
  // Filtrar pedidos baseado no status selecionado
  const ordersToShow = filterStatus === "active" ? activeOrders :
                       filterStatus === "delivered" ? deliveredOrders :
                       filterStatus === "cancelled" ? cancelledOrders :
                       filterStatus === "all" ? orders :
                       orders.filter(o => o.status === filterStatus);

  // Função para obter nome do usuário
  const getUserName = () => {
    if (!user) return null;
    
    // Tentar pegar do metadata primeiro
    const metadata = user.user_metadata;
    if (metadata?.name) return metadata.name;
    if (metadata?.full_name) return metadata.full_name;
    
    // Se não tiver, extrair do email
    if (user.email) {
      const emailParts = user.email.split('@')[0];
      // Capitalizar primeira letra e remover pontos/traços
      return emailParts
        .split(/[._-]/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    return null;
  };

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      router.push("/admin/login");
    } catch (error: any) {
      toast.error("Erro ao fazer logout");
      console.error(error);
    }
  };

  const userName = getUserName();
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-3 md:py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Painel Administrativo</h1>
            {userName && (
              <p className="text-sm md:text-base text-gray-400 mt-1">
                {greeting}, <span className="text-primary-yellow font-semibold">{userName}</span>! 👋
              </p>
            )}
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-medium transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-3 mb-3 md:mb-4 border-b border-gray-800 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "products", label: "Produtos" },
            { id: "orders", label: "Pedidos" },
            { id: "categories", label: "Categorias" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                router.push(`/admin?tab=${tab.id}`);
              }}
              className={`px-3 md:px-4 py-2 md:py-2 font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
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
          <div className="space-y-4 md:space-y-5">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg p-3 md:p-4 border border-yellow-500/30 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400">Hoje</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-yellow-300 drop-shadow-lg break-words">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-sm text-gray-400">{stats.todayOrders} pedido{stats.todayOrders !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-3 md:p-4 border border-blue-500/30 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400">7 dias</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-blue-300 drop-shadow-lg break-words">{formatCurrency(stats.weekRevenue)}</p>
                <p className="text-sm text-gray-400">{stats.weekOrders} pedido{stats.weekOrders !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-3 md:p-4 border border-green-500/30 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400">30 dias</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-green-300 drop-shadow-lg break-words">{formatCurrency(stats.monthRevenue)}</p>
                <p className="text-sm text-gray-400">{stats.monthOrders} pedido{stats.monthOrders !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-3 md:p-4 border border-purple-500/30 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-purple-300 drop-shadow-lg break-words">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-400">{stats.totalOrders} pedido{stats.totalOrders !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Gráfico de Vendas por Dia */}
              <div className="bg-gray-900 rounded-lg p-3 md:p-4 overflow-hidden">
                <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">Vendas por Dia (últimos 30 dias)</h3>
                {salesData.length > 0 ? (
                  <div className="w-full" style={{ minHeight: '250px', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        name="Pedidos"
                        stroke="#FCD34D" 
                        strokeWidth={2}
                        dot={{ fill: '#FCD34D', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
                )}
              </div>

              {/* Gráfico de Faturamento por Dia */}
              <div className="bg-gray-900 rounded-lg p-3 md:p-4 overflow-hidden">
                <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">Faturamento por Dia (últimos 30 dias)</h3>
                {revenueData.length > 0 ? (
                  <div className="w-full" style={{ minHeight: '250px', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar 
                        dataKey="revenue" 
                        name="Faturamento"
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                      />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
                )}
              </div>
            </div>

            {/* Gráficos Inferiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Top Produtos */}
              <div className="bg-gray-900 rounded-lg p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Top 5 Produtos Mais Vendidos</h3>
                <div className="space-y-3">
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-yellow/20 flex items-center justify-center text-primary-yellow font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm md:text-base">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.quantity} unidade{product.quantity !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <p className="text-primary-yellow font-bold">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Nenhum produto vendido ainda</p>
                  )}
                </div>
              </div>

              {/* Métodos de Pagamento */}
              <div className="bg-gray-900 rounded-lg p-3 md:p-4 overflow-hidden">
                <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">Faturamento por Método de Pagamento</h3>
                {paymentMethods.length > 0 ? (
                  <div className="w-full" style={{ minHeight: '250px', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethods.map((entry, index) => {
                            const colors = ['#FCD34D', '#3B82F6', '#10B981'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                          labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                          itemStyle={{ color: '#065F46', fontWeight: 'bold' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
                )}
              </div>
            </div>

            {/* Status de Pedidos */}
            <div className="bg-gray-900 rounded-lg p-3 md:p-4">
              <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">Status dos Pedidos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { status: 'pending', label: 'Aguardando', color: 'bg-yellow-500', count: orders.filter(o => o.status === 'pending').length },
                  { status: 'confirmed', label: 'Confirmado', color: 'bg-blue-500', count: orders.filter(o => o.status === 'confirmed').length },
                  { status: 'preparing', label: 'Preparando', color: 'bg-orange-500', count: orders.filter(o => o.status === 'preparing').length },
                  { status: 'ready', label: 'Pronto', color: 'bg-green-500', count: orders.filter(o => o.status === 'ready').length },
                  { status: 'delivering', label: 'Entregando', color: 'bg-purple-500', count: orders.filter(o => o.status === 'delivering').length },
                  { status: 'delivered', label: 'Entregue', color: 'bg-green-600', count: orders.filter(o => o.status === 'delivered').length },
                  { status: 'cancelled', label: 'Cancelado', color: 'bg-red-500', count: orders.filter(o => o.status === 'cancelled').length },
                ].map((item) => (
                  <div key={item.status} className="text-center">
                    <div className={`${item.color} w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base`}>
                      {item.count}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 break-words">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Produtos */}
        {(activeTab === "products" || searchParams.get("tab") === "products") && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold">Produtos</h2>
              <Link
                href="/admin/products/new"
                className="bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
                style={{ display: 'flex', backgroundColor: '#ccff00' }}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Novo Produto
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-lg p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-primary-yellow font-bold mb-2 md:mb-3 text-sm md:text-base">
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
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg flex items-center justify-center transition"
                      title="Editar produto"
                    >
                      <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline ml-1 text-xs md:text-sm">Editar</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center justify-center transition"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline ml-1 text-xs md:text-sm">Excluir</span>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold">Pedidos</h2>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("active");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "active"
                          ? "bg-[#ccff00] text-black font-bold shadow-lg shadow-[#ccff00]/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Ativos ({activeOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("pending");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "pending"
                          ? "bg-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Aguardando ({orders.filter(o => o.status === "pending").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("confirmed");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "confirmed"
                          ? "bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Confirmado ({orders.filter(o => o.status === "confirmed").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("preparing");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "preparing"
                          ? "bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Preparando ({orders.filter(o => o.status === "preparing").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("ready");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "ready"
                          ? "bg-green-500 text-white font-bold shadow-lg shadow-green-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Pronto ({orders.filter(o => o.status === "ready").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("delivering");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "delivering"
                          ? "bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Saiu para Entrega ({orders.filter(o => o.status === "delivering").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("delivered");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "delivered"
                          ? "bg-green-600 text-white font-bold shadow-lg shadow-green-600/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Entregue ({deliveredOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterStatus("cancelled");
                      }}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                        filterStatus === "cancelled"
                          ? "bg-red-600 text-white font-bold shadow-lg shadow-red-600/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Cancelado ({cancelledOrders.length})
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Total: {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Timeline View */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-3 sm:left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>

                <div className="space-y-3 md:space-y-4" key={`orders-section-${filterStatus}`}>
                  {ordersToShow.map((order, index) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-500",
                    confirmed: "bg-blue-500",
                    preparing: "bg-orange-500",
                    ready: "bg-green-500",
                    delivering: "bg-purple-500",
                    delivered: "bg-green-600",
                    cancelled: "bg-red-500",
                  };

                  const statusLabels: Record<string, string> = {
                    pending: "Aguardando",
                    confirmed: "Confirmado",
                    preparing: "Preparando",
                    ready: "Pronto",
                    delivering: "Saiu para Entrega",
                    delivered: "Entregue",
                    cancelled: "Cancelado",
                  };

                  return (
                    <div key={order.id} className="relative pl-10 sm:pl-12 md:pl-16">
                      {/* Timeline Dot */}
                      <div className={`absolute left-1.5 sm:left-2 md:left-3 top-2 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full ${statusColors[order.status] || "bg-gray-500"} border-2 sm:border-3 border-black z-10`}></div>

                      {/* Order Card */}
                      <div className="bg-gray-900 rounded-lg p-3 sm:p-4 md:p-5 hover:bg-gray-800 transition">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-sm sm:text-base md:text-lg font-bold break-words">
                                Pedido #{order.id.slice(0, 8)}
                              </h3>
                              <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${statusColors[order.status] || "bg-gray-500"}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                              {(() => {
                                const timeStatus = getTimeStatus(order);
                                if (timeStatus) {
                                  const TimeIcon = timeStatus.icon;
                                  return (
                                    <div className={`flex items-center gap-1 ${timeStatus.color} text-xs sm:text-sm font-medium`}>
                                      <TimeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>{timeStatus.message}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            {/* Time Information */}
                            <div className="space-y-1 mb-2">
                              <p className="text-gray-300 text-xs sm:text-sm md:text-base font-medium">
                                {formatDateTime(order.created_at)}
                              </p>
                              <p className="text-gray-400 text-xs">
                                <TimeAgo date={order.created_at} />
                              </p>
                            </div>

                            {order.delivery_address && (
                              <p className="text-gray-400 text-xs sm:text-sm mt-2 line-clamp-2 break-words">
                                📍 {order.delivery_address}
                              </p>
                            )}

                            {order.customer_name && (
                              <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
                                👤 {order.customer_name}
                              </p>
                            )}

                            {/* Detalhes do Pedido - Mostrar para entregues */}
                            {order.status === "delivered" && order.order_items && order.order_items.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">Itens do Pedido:</h4>
                                <div className="space-y-1.5">
                                  {order.order_items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start gap-2 text-xs sm:text-sm">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-gray-300 font-medium">
                                          {item.quantity}x {item.products?.name || 'Produto'}
                                        </span>
                                        {item.observations && (
                                          <p className="text-gray-500 text-xs italic mt-0.5">
                                            Obs: {item.observations}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-primary-yellow font-semibold whitespace-nowrap">
                                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center">
                                  <span className="text-xs sm:text-sm text-gray-400">Subtotal:</span>
                                  <span className="text-sm sm:text-base font-semibold text-gray-300">
                                    {formatCurrency(order.order_items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0))}
                                  </span>
                                </div>
                                {order.delivery_fee && order.delivery_fee > 0 && (
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs sm:text-sm text-gray-400">Taxa de Entrega:</span>
                                    <span className="text-sm sm:text-base font-semibold text-gray-300">
                                      {formatCurrency(order.delivery_fee)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                                  <span className="text-sm sm:text-base font-bold text-gray-200">Total:</span>
                                  <span className="text-sm sm:text-base md:text-lg font-bold text-primary-yellow">
                                    {formatCurrency(order.total)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-auto text-left md:text-right space-y-2 md:space-y-3">
                            <p className="text-base sm:text-lg md:text-xl font-bold text-primary-yellow mb-2 md:mb-0">
                              {formatCurrency(order.total)}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                              >
                                <option value="pending">Aguardando</option>
                                <option value="confirmed">Confirmado</option>
                                <option value="preparing">Preparando</option>
                                <option value="ready">Pronto</option>
                                <option value="delivering">Saiu para Entrega</option>
                                <option value="delivered">Entregue</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                              <button
                                onClick={() => handleEditOrder(order)}
                                className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Editar pedido"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Excluir pedido"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Excluir</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {ordersToShow.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-base sm:text-lg">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categorias */}
        {(activeTab === "categories" || searchParams.get("tab") === "categories") && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold">Categorias</h2>
              <Link
                href="/admin/categories/new"
                className="bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
                style={{ display: 'flex', backgroundColor: '#ccff00' }}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nova Categoria
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-900 rounded-lg p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-bold mb-2">{category.name}</h3>
                  {category.order !== null && (
                    <p className="text-xs text-gray-400 mb-3">Ordem: {category.order}</p>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs md:text-sm transition"
                      title="Editar categoria"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs md:text-sm transition"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões Flutuantes */}
        {(() => {
          const currentTab = activeTab || searchParams.get("tab");
          if (currentTab === "products") {
            return (
              <Link
                href="/admin/products/new"
                className="fixed bottom-6 right-6 bg-[#ccff00] text-black px-6 py-4 rounded-full font-bold hover:bg-opacity-90 transition shadow-lg shadow-[#ccff00]/30 flex items-center gap-2 z-50"
                style={{ display: 'flex', backgroundColor: '#ccff00', position: 'fixed' }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Produto</span>
              </Link>
            );
          }
          if (currentTab === "categories") {
            return (
              <Link
                href="/admin/categories/new"
                className="fixed bottom-6 right-6 bg-[#ccff00] text-black px-6 py-4 rounded-full font-bold hover:bg-opacity-90 transition shadow-lg shadow-[#ccff00]/30 flex items-center gap-2 z-50"
                style={{ display: 'flex', backgroundColor: '#ccff00', position: 'fixed' }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nova Categoria</span>
              </Link>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Carregando...</div>
          </div>
        </div>
      }>
        <AdminContent />
      </Suspense>
    </AuthGuard>
  );
}

// Exportar AdminContent como named export

