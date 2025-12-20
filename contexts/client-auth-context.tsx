"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface ClientAuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let mounted = true;

    // Timeout de segurança para evitar loading infinito em mobile
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("⚠️ Timeout ao verificar sessão - forçando loading = false");
        setLoading(false);
      }
    }, 5000); // 5 segundos

    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        if (mounted) {
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      setLoading(false);
      if (timeoutId) clearTimeout(timeoutId);

      // Se fizer login, sempre redirecionar para a página do restaurante
      if (event === "SIGNED_IN") {
        // Verificar se está na página de login (pode ser /cliente/login ou /restaurante/[slug]/cliente/login)
        const isOnLoginPage = pathname?.includes('/cliente/login');
        
        if (isOnLoginPage) {
          // Tentar extrair o slug do restaurante do pathname primeiro
          const restaurantMatch = pathname?.match(/^\/restaurante\/([^/]+)/);
          let restaurantSlug = restaurantMatch?.[1];
          
          // Se não encontrou no pathname, buscar no localStorage
          if (!restaurantSlug && typeof window !== 'undefined') {
            restaurantSlug = localStorage.getItem('lastRestaurantContext') || undefined;
          }
          
          // Sempre redirecionar para a página do restaurante se houver slug
          if (restaurantSlug) {
            router.push(`/restaurante/${restaurantSlug}`);
          } else {
            // Se não houver contexto, redirecionar para página inicial
            router.push("/");
          }
        }
      }

      // Se fizer logout, redirecionar para página do restaurante (se houver contexto)
      // IMPORTANTE: Versiory não tem login de cliente, então não redirecionar para /cliente/login genérico
      if (event === "SIGNED_OUT") {
        if (pathname?.startsWith("/pedidos")) {
          // Verificar se há contexto de restaurante
          const restaurantSlug = typeof window !== 'undefined' 
            ? localStorage.getItem('lastRestaurantContext')
            : null;
          
          if (restaurantSlug) {
            router.push(`/restaurante/${restaurantSlug}/cliente/login`);
          } else {
            // Versiory: apenas redirecionar para home
            router.push("/");
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    
    // IMPORTANTE: Versiory não tem login de cliente
    // Redirecionar para página do restaurante se houver contexto, senão para home
    const restaurantSlug = typeof window !== 'undefined' 
      ? localStorage.getItem('lastRestaurantContext')
      : null;
    
    if (restaurantSlug) {
      router.push(`/restaurante/${restaurantSlug}/cliente/login`);
    } else {
      router.push("/");
    }
  };

  return (
    <ClientAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  return useContext(ClientAuthContext);
}

