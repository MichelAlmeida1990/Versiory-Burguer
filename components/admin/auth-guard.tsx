"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão atual (apenas uma vez)
    const checkSession = async () => {
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
          return;
        }

        if (session?.user) {
          console.log("✅ Usuário autenticado:", session.user.email);
          setUser(session.user);
          setLoading(false);
        } else {
          console.log("⚠️ Nenhuma sessão encontrada");
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error);
        if (mounted) {
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
        }
      }
    };

    // Verificar sessão imediatamente
    checkSession();

    // Escutar mudanças de autenticação (apenas uma vez)
    if (!subscriptionRef.current) {
      subscriptionRef.current = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        // Tratar evento inicial
        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(session.user);
            setLoading(false);
          } else {
            setUser(null);
            setLoading(false);
            if (pathname !== '/admin/login') {
              router.replace("/admin/login");
            }
          }
          return;
        }

        // Tratar outros eventos (SIGNED_IN, SIGNED_OUT, etc)
        if (session?.user) {
          console.log("✅ Usuário autenticado:", session.user.email);
          setUser(session.user);
          setLoading(false);
        } else {
          console.log("⚠️ Usuário não autenticado");
          setUser(null);
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  // Limpar subscription quando componente desmontar
  useEffect(() => {
    return () => {
      if (subscriptionRef.current?.data?.subscription) {
        subscriptionRef.current.data.subscription.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecionamento já foi feito
  }

  return <>{children}</>;
}
