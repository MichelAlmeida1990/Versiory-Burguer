"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Product, Category, supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import { AnimatedTitle } from "@/components/animations/animated-title";
import { ScrollAnimation } from "@/components/animations/scroll-animation";
import { PulseButton } from "@/components/animations/pulse-button";
import { StaggerGrid } from "@/components/animations/stagger-grid";
import { StaggerItem } from "@/components/animations/stagger-item";
import { ProductCard } from "@/components/products/product-card";
import { Plus } from "lucide-react";
import { ContactSection } from "@/components/restaurant/contact-section";
import { FeaturesSection } from "@/components/restaurant/features-section";
import { LoyaltyChatbot } from "@/components/restaurant/loyalty-chatbot";
import { useClientAuth } from "@/contexts/client-auth-context";

interface RestaurantSettings {
  restaurant_id: string;
  home_title: string | null;
  home_subtitle: string | null;
  home_description: string | null;
  home_banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  address?: string | null;
  phone_1?: string | null;
  phone_2?: string | null;
  phone_3?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

export default function RestaurantePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user: clientUser, loading: clientAuthLoading } = useClientAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Função para formatar telefone para link do WhatsApp
  const formatPhoneForLink = (phone: string) => {
    // Remover caracteres não numéricos
    const numbers = phone.replace(/\D/g, "");
    // Se começar com 0, remover
    const cleaned = numbers.startsWith("0") ? numbers.slice(1) : numbers;
    return `55${cleaned}`;
  };

  useEffect(() => {
    if (slug) {
      // Salvar contexto do restaurante no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastRestaurantContext', slug);
      }
      loadData();
    }
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      // Buscar restaurante através da API route (que trata melhor os erros)
      const response = await fetch(`/api/restaurante/${slug}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Restaurante não encontrado:", errorData);
        setNotFound(true);
        setLoading(false);
        return;
      }

      const restaurantSettings = await response.json();

      setSettings(restaurantSettings);
      const restaurantIdValue = restaurantSettings.restaurant_id;
      setRestaurantId(restaurantIdValue);

      // Carregar categorias do restaurante
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurantIdValue)
        .order("order");

      if (categoriesError) {
        console.error("Erro ao carregar categorias:", categoriesError);
        toast.error("Erro ao carregar categorias");
        setLoading(false);
        return;
      }

      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
      } else {
        setCategories(categoriesData);
      }

      // Carregar produtos do restaurante
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, description, price, image, category_id, available, restaurant_id, created_at, updated_at")
        .eq("available", true)
        .eq("restaurant_id", restaurantIdValue)
        .order("name");

      if (productsError) {
        console.error("Erro ao carregar produtos:", productsError);
        toast.error("Erro ao carregar produtos");
        setLoading(false);
        return;
      }

      if (!productsData || productsData.length === 0) {
        setProducts([]);
      } else {
        // Filtrar produtos que têm categorias válidas
        const categoryIds = new Set(categoriesData?.map(c => c.id) || []);
        const validProducts = productsData.filter(p => {
          return p.category_id && categoryIds.has(p.category_id);
        });
        setProducts(validProducts);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar cardápio");
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Memoizar produtos filtrados
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    
    return products.filter((p) => {
      return p.category_id === selectedCategory;
    });
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product, selectedOptions?: any[], totalPrice?: number) => {
    // Verificar se o cliente está logado antes de adicionar ao carrinho
    // Mas só verificar após o loading de autenticação terminar
    if (!clientAuthLoading && !clientUser) {
      toast.error("Faça login para adicionar produtos ao carrinho");
      router.push(`/restaurante/${slug}/cliente/login`);
      return;
    }
    
    addItem(product, 1, undefined, selectedOptions, totalPrice);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurante não encontrado</h1>
          <p className="text-gray-600 mb-4">O restaurante &quot;{slug}&quot; não foi encontrado.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  // Não mostrar conteúdo enquanto está carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando restaurante...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      <Header />
      <LoyaltyChatbot primaryColor={settings?.primary_color || "#dc2626"} />

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-[70vh] sm:min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20 md:py-0 sm:h-screen max-w-full">
        <div 
          className="absolute inset-0 bg-image-cover max-w-full"
          style={{
            backgroundImage: `url('${settings?.home_banner_url || "/images/banners/banner.jpg"}')`,
            maxWidth: '100%',
            width: '100%'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${settings?.primary_color || '#dc2626'}00 0%, ${settings?.primary_color || '#dc2626'}40 50%, ${settings?.primary_color || '#dc2626'}00 100%)`
          }}
        ></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto w-full">
          <AnimatedTitle 
            text={settings?.home_title || "Bem-vindo"}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 text-white px-2"
          />
          
          {settings?.home_subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-white font-bold drop-shadow-2xl px-2"
            >
              {settings.home_subtitle}
            </motion.p>
          )}
          
          {settings?.home_description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 text-white font-semibold max-w-3xl mx-auto px-2 drop-shadow-lg leading-relaxed"
            >
              {settings.home_description}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2"
          >
            <PulseButton href="#cardapio">
              <span 
                className="text-white px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center transition"
                style={{ 
                  backgroundColor: settings?.primary_color || '#dc2626',
                }}
                onMouseEnter={(e) => {
                  const color = settings?.primary_color || '#dc2626';
                  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                  if (rgb) {
                    const r = parseInt(rgb[1], 16);
                    const g = parseInt(rgb[2], 16);
                    const b = parseInt(rgb[3], 16);
                    e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)})`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = settings?.primary_color || '#dc2626';
                }}
              >
                Ver Cardápio
              </span>
            </PulseButton>
            {settings?.phone_1 && (
              <PulseButton href={`https://wa.me/${formatPhoneForLink(settings.phone_1)}`}>
                <span 
                  className="text-black px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center transition relative backdrop-blur-md bg-yellow-400/80 border border-yellow-300/50 shadow-lg shadow-yellow-500/30 hover:bg-yellow-400/90 hover:shadow-yellow-500/40"
                >
                  Pedir pelo WhatsApp
                </span>
              </PulseButton>
            )}
          </motion.div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <FeaturesSection primaryColor={settings?.primary_color || "#dc2626"} />

      {/* Seção de Contato */}
      <ContactSection
        address={settings?.address}
        phone1={settings?.phone_1}
        phone2={settings?.phone_2}
        phone3={settings?.phone_3}
        instagram={settings?.instagram}
        facebook={settings?.facebook}
        primaryColor={settings?.primary_color || "#dc2626"}
      />

      {/* Cardápio Section */}
      <section id="cardapio" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 bg-white w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <motion.h2
                initial={{ backgroundPosition: "0% 50%" }}
                whileInView={{ backgroundPosition: "100% 50%" }}
                viewport={{ once: true }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent bg-[length:200%_200%]"
              >
                Nosso Cardápio
              </motion.h2>
              <p className="text-lg md:text-xl text-gray-600 px-4">
                Explore nossos pratos deliciosos e faça seu pedido
              </p>
            </div>
          </ScrollAnimation>

          {/* Categorias */}
          <ScrollAnimation delay={0.2}>
            <div className="mb-12">
              {/* Mobile: Scroll horizontal */}
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm rounded-lg font-medium transition whitespace-nowrap ${
                    selectedCategory === null
                      ? "text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  style={selectedCategory === null ? {
                    backgroundColor: settings?.primary_color || '#dc2626'
                  } : {}}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setTimeout(() => {
                        const produtosSection = document.getElementById('produtos-section');
                        if (produtosSection) {
                          produtosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 text-sm rounded-lg font-medium transition whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    style={selectedCategory === category.id ? {
                      backgroundColor: settings?.primary_color || '#dc2626'
                    } : {}}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {/* Desktop: Grid centralizado */}
              <div className="hidden sm:flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    selectedCategory === null
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={selectedCategory === null ? {
                    backgroundColor: settings?.primary_color || '#dc2626'
                  } : {}}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setTimeout(() => {
                        const produtosSection = document.getElementById('produtos-section');
                        if (produtosSection) {
                          produtosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    style={selectedCategory === category.id ? {
                      backgroundColor: settings?.primary_color || '#dc2626'
                    } : {}}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          {/* Produtos */}
          <div id="produtos-section">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Carregando cardápio...</p>
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                          Nenhum produto cadastrado
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg mb-6">
                          Ainda não há produtos disponíveis no cardápio.
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-blue-800 mb-2">
                          <strong>Para adicionar produtos:</strong>
                        </p>
                        <ol className="text-left text-sm sm:text-base text-blue-700 space-y-2 list-decimal list-inside">
                          <li>Acesse o painel administrativo</li>
                          <li>Vá em &quot;Categorias&quot; para criar categorias</li>
                          <li>Vá em &quot;Produtos&quot; para adicionar produtos ao cardápio</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <StaggerGrid key={`grid-${selectedCategory || 'all'}`} className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <StaggerItem key={product.id}>
                        <ProductCard 
                          product={product} 
                          onAddToCart={handleAddToCart}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-4">Nenhum produto encontrado nesta categoria.</p>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Ver todos os produtos
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-32 px-4 overflow-hidden max-w-full">
        <div 
          className="absolute inset-0 bg-image-cover max-w-full"
          style={{
            backgroundImage: `url('${settings?.home_banner_url || "/images/banners/banner.jpg"}')`,
            maxWidth: '100%',
            width: '100%'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <ScrollAnimation>
          <div className="relative z-10 max-w-4xl mx-auto text-center w-full px-3 sm:px-4">
            <motion.h2
              initial={{ rotateX: -90, opacity: 0 }}
              whileInView={{ rotateX: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", stiffness: 80 }}
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white"
            >
              Pronto para pedir?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl text-white/90 mb-8 md:mb-10"
            >
              Finalize seu pedido e aproveite nossos deliciosos pratos
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <PulseButton href={`/restaurante/${slug}#cardapio`}>
                <span 
                  className="text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-lg text-base sm:text-lg md:text-xl font-bold inline-block shadow-2xl w-full sm:w-auto transition"
                  style={{
                    backgroundColor: settings?.primary_color || '#dc2626'
                  }}
                >
                  Ver Cardápio
                </span>
              </PulseButton>
            </motion.div>
          </div>
        </ScrollAnimation>
      </section>
    </div>
  );
}

