"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { supabase } from "@/lib/supabase";
import { useClientAuth } from "@/contexts/client-auth-context";

interface RestaurantSettings {
  restaurant_name: string;
  logo_url: string | null;
  primary_color: string;
  slug?: string | null;
}

// Função auxiliar para converter hex para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: clientUser, loading: clientAuthLoading, signOut } = useClientAuth();
  
  // Verificar se está no admin
  const isAdmin = pathname?.startsWith('/admin');
  
  useEffect(() => {
    loadSettings();
  }, [pathname, searchParams]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // IMPORTANTE: Só carregar configurações específicas do restaurante quando estiver na rota /restaurante/[slug]
      // Nas outras rotas (/cardapio, /, etc), SEMPRE usar os valores padrão da Versiory
      const slugMatch = pathname?.match(/^\/restaurante\/([^/]+)/);
      if (slugMatch && slugMatch[1]) {
        const slug = slugMatch[1];
        
        try {
          const response = await fetch(`/api/restaurante/${slug}`);
          if (response.ok) {
            const restaurantData = await response.json();
            setSettings({
              restaurant_name: restaurantData.restaurant_name,
              logo_url: restaurantData.logo_url,
              primary_color: restaurantData.primary_color,
              slug: restaurantData.slug || slug,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Erro ao buscar configurações do restaurante:", error);
        }
      }
      
      // Se estiver no admin, carregar configurações do restaurante logado
      if (pathname?.startsWith('/admin')) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Buscar configurações do restaurante logado (incluindo slug) apenas no admin
          const { data: restaurantSettings } = await supabase
            .from("restaurant_settings")
            .select("restaurant_name, logo_url, primary_color, slug")
            .eq("restaurant_id", user.id)
            .single();

          if (restaurantSettings) {
            setSettings(restaurantSettings);
            setLoading(false);
            return;
          }
        }
      }
      
      // Para todas as outras rotas (/, /cardapio, etc), usar valores padrão (Versiory Delivery)
      // Não definir settings, deixar null para usar os valores padrão
      setSettings(null);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      // Em caso de erro, também usar valores padrão
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  // Detectar se está na rota de restaurante específico
  // Para o logo e navegação, usar apenas pathname (não query string)
  const slugMatch = pathname?.match(/^\/restaurante\/([^/]+)/);
  const restaurantSlugFromPath = slugMatch?.[1] || null;
  const isRestaurantRoute = !!restaurantSlugFromPath;
  
  // Para outras funcionalidades (como links), pode usar query string também
  const restaurantFromQuery = searchParams?.get('restaurant');
  const restaurantFromSettings = settings?.slug || null;
  
  // Usar slug do pathname primeiro, depois query, depois settings
  const restaurantSlug = restaurantSlugFromPath || restaurantFromQuery || restaurantFromSettings || null;
  const restaurantBasePath = restaurantSlug ? `/restaurante/${restaurantSlug}` : null;
  
  // Se estiver na rota de restaurante e ainda estiver carregando, não mostrar nada
  // Se não estiver na rota de restaurante, usar valores padrão da Versiory
  const restaurantName = isRestaurantRoute && loading 
    ? "" 
    : (settings?.restaurant_name || "Versiory Delivery");
  const logoUrl = isRestaurantRoute && loading 
    ? "" 
    : (settings?.logo_url || "/images/produtos/logo.jpg");
  const primaryColor = settings?.primary_color || "#dc2626"; // red-600 padrão
  
  // Link do logo: 
  // - Se estiver na rota /restaurante/[slug], apontar para a página inicial do restaurante
  // - Caso contrário, sempre apontar para a página inicial geral (/)
  // (mesmo no admin, o logo deve levar para a página pública inicial)
  let logoHref = "/";
  if (isRestaurantRoute && restaurantSlugFromPath) {
    logoHref = `/restaurante/${restaurantSlugFromPath}`;
  }
  
  // Se estiver na rota de restaurante e ainda carregando, não renderizar o header completamente
  if (isRestaurantRoute && loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
          {/* Placeholder vazio enquanto carrega */}
          <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] bg-gray-200 animate-pulse rounded"></div>
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-shrink-0 min-w-0">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt={restaurantName}
              width={32}
              height={32}
              className="object-contain sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] flex-shrink-0"
              unoptimized={logoUrl.startsWith('http')}
            />
          )}
          <span 
            className="text-sm sm:text-lg md:text-2xl font-bold truncate"
            style={{ color: primaryColor }}
          >
            {restaurantName}
          </span>
        </Link>

        {/* Navigation Desktop */}
        {!isAdmin ? (
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={restaurantBasePath || "/"}
              className="text-gray-700 font-medium transition"
              style={{ '--hover-color': primaryColor } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Início
            </Link>
            <Link
              href={restaurantBasePath ? `${restaurantBasePath}#cardapio` : "/#cardapio"}
              className="text-gray-700 font-medium transition"
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Cardápio
            </Link>
            <Link
              href={restaurantBasePath ? `${restaurantBasePath}#cardapio` : "/#cardapio"}
              className="text-gray-700 font-medium transition"
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Combos
            </Link>
            {/* Versiory: sempre mostrar "Meus Pedidos", restaurante específico: mostrar apenas se logado ou Login/Cadastro */}
            {!isRestaurantRoute ? (
              // Versiory: sempre mostrar "Meus Pedidos"
              <Link
                href="/pedidos"
                className="text-gray-700 font-medium transition"
                onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                Meus Pedidos
              </Link>
            ) : (
              // Restaurante específico: mostrar "Meus Pedidos" se logado, senão "Login/Cadastro"
              <>
                {!clientAuthLoading && clientUser ? (
                  <Link
                    href={`/pedidos?restaurant=${restaurantSlug}`}
                    className="text-gray-700 font-medium transition"
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                  >
                    Meus Pedidos
                  </Link>
                ) : !clientAuthLoading ? (
                  <Link
                    href={`/restaurante/${restaurantSlug}/cliente/login`}
                    className="text-gray-700 font-medium transition"
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                  >
                    Login/Cadastro
                  </Link>
                ) : null}
              </>
            )}
            <Link
              href="/admin/login"
              className="text-gray-700 font-medium transition"
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Admin
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/admin"
              className="text-gray-700 font-medium transition"
              style={{ '--hover-color': primaryColor } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              Dashboard
            </Link>
            {settings?.slug && (
              <Link
                href={`/restaurante/${settings.slug}`}
                className="text-gray-700 font-medium transition"
                style={{ '--hover-color': primaryColor } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                Ver Site
              </Link>
            )}
          </nav>
        )}

        {/* Right Side - User Profile, Cart and Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          {/* IMPORTANTE: Só mostrar perfil do cliente se estiver em restaurante específico OU no admin */}
          {/* Na Versiory (páginas públicas), NÃO mostrar perfil do cliente logado */}
          {!isAdmin && isRestaurantRoute && !clientAuthLoading && clientUser && (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition"
                style={{ 
                  color: primaryColor,
                }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {(clientUser.user_metadata?.name?.split(' ')[0]?.[0] || clientUser.email?.[0] || 'C').toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {clientUser.user_metadata?.name?.split(' ')[0] || clientUser.email?.split('@')[0] || 'Cliente'}
                </span>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </button>
              
              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {clientUser.user_metadata?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {clientUser.email}
                      </p>
                    </div>
                    <Link
                      href={restaurantSlug ? `/pedidos?restaurant=${restaurantSlug}` : "/pedidos"}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Package className="w-4 h-4" />
                      <span>Meus Pedidos</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!isAdmin && (
            <>
              <CartButton />
              <Link
                href="/carrinho"
                className="text-white px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-2 rounded-lg font-bold transition flex items-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base"
                style={{ 
                  backgroundColor: primaryColor,
                }}
                onMouseEnter={(e) => {
                  // Escurecer cor ao passar mouse (reduzir brilho em 10%)
                  const rgb = hexToRgb(primaryColor);
                  if (rgb) {
                    e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 25)}, ${Math.max(0, rgb.g - 25)}, ${Math.max(0, rgb.b - 25)})`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Fazer Pedido</span>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 flex-shrink-0 transition"
            style={{ '--hover-color': primaryColor } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
            onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {!isAdmin ? (
              <>
                <Link
                  href={restaurantBasePath || "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium transition py-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  Início
                </Link>
                <Link
                  href={restaurantBasePath ? `${restaurantBasePath}#cardapio` : "/#cardapio"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium transition py-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  Cardápio
                </Link>
                <Link
                  href={restaurantBasePath ? `${restaurantBasePath}#cardapio` : "/#cardapio"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium transition py-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  Combos
                </Link>
                {/* IMPORTANTE: Só mostrar perfil do cliente no mobile se estiver em restaurante específico */}
                {/* Na Versiory, NÃO mostrar perfil do cliente logado */}
                {isRestaurantRoute && !clientAuthLoading && clientUser && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3 px-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {(clientUser.user_metadata?.name?.split(' ')[0]?.[0] || clientUser.email?.[0] || 'C').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {clientUser.user_metadata?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {clientUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Versiory: sempre mostrar "Meus Pedidos", restaurante específico: mostrar apenas se logado ou Login/Cadastro */}
                {!isRestaurantRoute ? (
                  // Versiory: sempre mostrar "Meus Pedidos"
                  <Link
                    href="/pedidos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-700 font-medium transition py-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Meus Pedidos</span>
                  </Link>
                ) : (
                  // Restaurante específico: mostrar "Meus Pedidos" se logado, senão "Login/Cadastro"
                  <>
                    {!clientAuthLoading && clientUser ? (
                      <>
                        <Link
                          href={`/pedidos?restaurant=${restaurantSlug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 text-gray-700 font-medium transition py-2"
                        >
                          <Package className="w-4 h-4" />
                          <span>Meus Pedidos</span>
                        </Link>
                        <button
                          onClick={async () => {
                            setMobileMenuOpen(false);
                            await signOut();
                          }}
                          className="w-full flex items-center space-x-3 text-gray-700 font-medium transition py-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair</span>
                        </button>
                      </>
                    ) : !clientAuthLoading ? (
                      <Link
                        href={`/restaurante/${restaurantSlug}/cliente/login`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-gray-700 font-medium transition py-2"
                        onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                      >
                        Login/Cadastro
                      </Link>
                    ) : null}
                  </>
                )}
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium transition py-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium transition py-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  Dashboard
                </Link>
                {settings?.slug && (
                  <Link
                    href={`/restaurante/${settings.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 font-medium transition py-2"
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                  >
                    Ver Site
                  </Link>
                )}
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
