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
    // Verificar sessão inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

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
            restaurantSlug = localStorage.getItem('lastRestaurantContext');
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

      // Se fizer logout, redirecionar para login
      if (event === "SIGNED_OUT") {
        if (pathname?.startsWith("/pedidos")) {
          router.push("/cliente/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/cliente/login");
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

