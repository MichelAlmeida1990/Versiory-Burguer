"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VideoLoading } from "@/components/loading/video-loading";
import { getCurrentUser, signInWithEmail } from "@/lib/auth";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace("/admin");
        }
      } catch (error) {
        // Não autenticado, continuar na página de login
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signInWithEmail(email, password);
      
      if (error) {
        toast.error(error.message || "Erro ao fazer login");
        setIsLoading(false);
        return;
      }

      if (user) {
        toast.success("Login realizado com sucesso!");
        router.push("/admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return <VideoLoading message="Verificando autenticação..." />;
  }

  return (
    <>
      {isLoading && <VideoLoading message="Entrando..." />}
      
      <div 
        className="min-h-screen flex items-center justify-center px-4 relative"
        style={{
          backgroundImage: "url('/images/banners/banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de Serviços Versiory */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-8 shadow-2xl border-2 border-red-400/50"
            style={{
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.3) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(220, 38, 38, 0.3)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white drop-shadow-lg">
              Tecnologia que Transforma
            </h2>
            <p className="mb-6 leading-relaxed !text-black drop-shadow-lg font-semibold" style={{ color: '#000000' }}>
              Descubra como a <span className="text-yellow-500 font-bold drop-shadow-lg">Versiory</span> está revolucionando o mercado de food service com soluções inteligentes e inovadoras.
            </p>
            
            {/* Tags de Serviços */}
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center gap-2">
                <span className="text-yellow-300">✨</span>
                <span className="text-white font-medium">Inovação</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center gap-2">
                <span className="text-yellow-300">🚀</span>
                <span className="text-white font-medium">Performance</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-yellow-300/50 rounded-lg flex items-center gap-2">
                <span className="text-yellow-300">💡</span>
                <span className="text-white font-medium">Inteligência</span>
              </div>
            </div>
          </motion.div>

          {/* Formulário de Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
              >
                Versiory Delivery
              </motion.h1>
              <p className="text-black dark:text-white">Acesso Administrativo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-black dark:text-white">
                É cliente?{" "}
                <a
                  href="/cardapio"
                  className="text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Ver Cardápio
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

