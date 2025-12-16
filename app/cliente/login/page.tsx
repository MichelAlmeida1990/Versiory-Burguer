"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";

export default function ClienteLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Detectar se estamos em uma página de restaurante específico
  useEffect(() => {
    // Verificar se estamos na rota /restaurante/[slug]/cliente/login
    const restaurantMatch = pathname?.match(/^\/restaurante\/([^/]+)/);
    if (restaurantMatch && restaurantMatch[1]) {
      setRestaurantSlug(restaurantMatch[1]);
    } else {
      // Verificar se foi passado como parâmetro
      const slugFromParam = searchParams?.get('restaurant');
      if (slugFromParam) {
        setRestaurantSlug(slugFromParam);
      }
    }

    // Verificar se há email pendente de confirmação no localStorage
    if (typeof window !== 'undefined') {
      const pendingEmailFromStorage = localStorage.getItem('pendingConfirmationEmail');
      if (pendingEmailFromStorage) {
        setPendingEmail(pendingEmailFromStorage);
        setEmail(pendingEmailFromStorage); // Preencher o campo de email também
      }
    }
  }, [pathname, searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construir URL de redirecionamento após confirmação
      const redirectUrl = restaurantSlug 
        ? `${window.location.origin}/auth/callback?restaurant=${restaurantSlug}`
        : `${window.location.origin}/auth/callback`;

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
            user_type: 'client', // Marcar como cliente
            restaurant_slug: restaurantSlug, // Salvar slug do restaurante
          },
        },
      });

      if (authError) {
        toast.error(authError.message || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Se o email não precisa ser confirmado, redirecionar imediatamente
        if (authData.session) {
          toast.success("Conta criada com sucesso! Você já está logado.");
          setTimeout(() => {
            if (restaurantSlug) {
              router.push(`/restaurante/${restaurantSlug}`);
            } else {
              router.push("/pedidos");
            }
          }, 1000);
        } else {
          // Email precisa ser confirmado
          setPendingEmail(email);
          // Salvar no localStorage para mostrar botão de reenvio quando voltar
          if (typeof window !== 'undefined') {
            localStorage.setItem('pendingConfirmationEmail', email);
          }
          
          toast.success(
            "Conta criada com sucesso! " +
            "Um email de confirmação foi enviado para " + email + ". " +
            "Verifique também a pasta de spam caso não encontre na caixa de entrada."
          );
          
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast.error(error.message || "Erro ao criar conta");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Limpar email pendente se fizer login com sucesso
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingConfirmationEmail');
          setPendingEmail(null);
        }
        
        toast.success("Login realizado com sucesso!");
        
        // Buscar o slug do restaurante (pode vir do state ou do localStorage)
        let finalRestaurantSlug = restaurantSlug;
        
        if (!finalRestaurantSlug && typeof window !== 'undefined') {
          finalRestaurantSlug = localStorage.getItem('lastRestaurantContext');
        }
        
        // Sempre redirecionar para a página do restaurante
        if (finalRestaurantSlug) {
          // Garantir que está salvo no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastRestaurantContext', finalRestaurantSlug);
          }
          router.push(`/restaurante/${finalRestaurantSlug}`);
        } else {
          // Se não houver contexto, redirecionar para página inicial
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8">
          {isSignUp && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Criar Conta
              </h1>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={isSignUp}
                      className="w-full pl-4 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail("");
                  setPassword("");
                  setName("");
                  setPhone("");
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm transition"
              >
                criar conta
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processando..." : "Entrar"}
              </button>
            </div>
          </form>

          {/* Mostrar botão de reenvio se houver email pendente */}
          {pendingEmail && !isSignUp && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                Email de confirmação não chegou? Verifique a pasta de spam ou clique para reenviar.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmationEmail}
                disabled={resendingEmail}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingEmail ? "Reenviando..." : "Reenviar Email de Confirmação"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

