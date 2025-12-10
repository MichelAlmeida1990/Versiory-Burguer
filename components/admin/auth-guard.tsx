"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        // Aguardar um pouco para garantir que o Supabase inicializou
        await new Promise(resolve => setTimeout(resolve, 200));

        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("🔐 AuthGuard - Verificando sessão:", { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message,
          pathname
        });
        
        if (!mounted) return;

        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          setLoading(false);
          // Só redirecionar se não estiver na página de login
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
          return;
        }

        if (session?.user) {
          console.log("✅ Sessão encontrada, usuário autenticado:", session.user.email);
          setUser(session.user);
          setLoading(false);
        } else {
          console.log("⚠️ Nenhuma sessão encontrada");
          setLoading(false);
          // Só redirecionar se não estiver na página de login
          if (pathname !== '/admin/login') {
            console.log("🔄 Redirecionando para login...");
            router.replace("/admin/login");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error);
        if (mounted) {
          setLoading(false);
          // Só redirecionar se não estiver na página de login
          if (pathname !== '/admin/login') {
            router.replace("/admin/login");
          }
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    subscription = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 AuthGuard - Mudança de autenticação:", event, session?.user?.email);
      
      if (!mounted) return;

      if (session?.user) {
        console.log("✅ Usuário autenticado:", session.user.email);
        setUser(session.user);
        setLoading(false);
      } else {
        console.log("⚠️ Usuário não autenticado");
        // Só redirecionar se não estiver na página de login e se o evento não for INITIAL_SESSION
        if (event !== 'INITIAL_SESSION' && pathname !== '/admin/login') {
          console.log("🔄 Redirecionando para login...");
          router.replace("/admin/login");
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (subscription?.data?.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [router, pathname]);

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

