"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginAdmin, getCurrentUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { 
  LogIn, Lock, Mail, 
  ShoppingCart, 
  Smartphone, 
  CreditCard, 
  Users, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Verificar se já está autenticado (apenas uma vez)
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkIfAuthenticated = async () => {
      try {
        const user = await getCurrentUser();
        // Se já estiver autenticado como admin/kitchen, redirecionar para admin
        if (mounted && user && (user.role === 'admin' || user.role === 'kitchen')) {
          router.replace('/admin');
          return;
        }
        // Se for cliente, não redirecionar - deixar na página de login
      } catch (error) {
        // Não autenticado, continuar na página de login
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };
    
    // Timeout de segurança para evitar loop infinito
    timeoutId = setTimeout(() => {
      if (mounted) {
        setCheckingAuth(false);
      }
    }, 3000);
    
    checkIfAuthenticated();
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Definir velocidade inicial do vídeo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("Preencha email e senha");
        setLoading(false);
        return;
      }

      await loginAdmin(formData.email, formData.password);
      toast.success("Login realizado com sucesso!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error(error.message || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      icon: ShoppingCart,
      title: "Cardápio Digital",
      description: "Venda online com sua marca - sem taxas de comissão",
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/50"
    },
    {
      icon: Smartphone,
      title: "Gestão de Pedidos",
      description: "Controle completo de pedidos em tempo real",
      color: "from-pink-500 to-rose-500",
      glow: "shadow-pink-500/50"
    },
    {
      icon: CreditCard,
      title: "Pagamento Online",
      description: "Pix e cartão de crédito com comprovação automática",
      color: "from-purple-500 to-indigo-500",
      glow: "shadow-purple-500/50"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Identificação por telefone e histórico completo",
      color: "from-green-400 to-emerald-500",
      glow: "shadow-green-500/50"
    },
    {
      icon: BarChart3,
      title: "Relatórios e Analytics",
      description: "Acompanhe vendas, produtos mais vendidos e muito mais",
      color: "from-yellow-400 to-orange-500",
      glow: "shadow-yellow-500/50"
    },
    {
      icon: Shield,
      title: "Painel Administrativo",
      description: "Controle total sobre produtos, categorias e entregas",
      color: "from-red-500 to-pink-500",
      glow: "shadow-red-500/50"
    }
  ];

  const benefits = [
    "Aumente suas vendas com estratégias inteligentes",
    "Reduza custos operacionais",
    "Agilize o atendimento",
    "Melhore a experiência do cliente"
  ];

  // Mostrar loading enquanto verifica autenticação (apenas uma vez)
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: "url('/images/banners/banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Conteúdo */}
      <div className="relative z-10">
      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/images/produtos/logo.jpg"
              alt="Versiory Logo"
              width={120}
              height={120}
              className="object-contain rounded-lg w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 px-2">
            <span className="text-red-600">Sistema Completo</span>{" "}
            <span className="text-primary-yellow">para Food Service</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Cardápio digital, gestão de pedidos, pagamento online e muito mais - tudo integrado em uma plataforma poderosa.
          </p>
        </div>

        {/* Video Card - Interactive */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group rounded-2xl p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl border-2 border-red-400/50 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.3) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(220, 38, 38, 0.3)",
            }}
          >
            {/* Neon Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                {/* Video */}
                <div className="flex-shrink-0 w-full md:w-1/2">
                  <div className="relative rounded-xl overflow-hidden border-2 border-red-600/50 shadow-lg shadow-red-500/30">
                    <video
                      ref={videoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-none object-cover"
                      onMouseEnter={(e) => {
                        const video = e.currentTarget;
                        video.playbackRate = 0.8;
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget;
                        video.playbackRate = 0.6;
                      }}
                    >
                      <source src="/videos/food-animation.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Message Card */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-white drop-shadow-lg">
                    Tecnologia que Transforma
                  </h3>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base md:text-lg leading-relaxed !text-black font-semibold px-2 sm:px-0" style={{ color: '#000000' }}>
                    Descubra como a <span className="text-yellow-500 font-bold drop-shadow-lg">Versiory</span> está revolucionando o mercado de food service com soluções inteligentes e inovadoras.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-xs sm:text-sm font-medium">
                      ✨ Inovação
                    </span>
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-600/20 border border-pink-600/50 rounded-lg text-pink-400 text-xs sm:text-sm font-medium">
                      🚀 Performance
                    </span>
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-yellow/20 border border-primary-yellow/50 rounded-lg text-primary-yellow text-xs sm:text-sm font-medium">
                      💡 Inteligência
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-2 sm:px-0">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/95 dark:bg-black/80 backdrop-blur-sm border-2 border-transparent rounded-xl p-4 sm:p-6 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)`,
                }}
              >
                {/* Neon Border Effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}></div>
                <div className={`absolute inset-[2px] rounded-xl bg-black`}></div>
                
                {/* Content */}
                <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                  <div className={`bg-gradient-to-br ${service.color} p-3 sm:p-4 rounded-xl shadow-lg ${service.glow} shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300 break-words">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 break-words">
                      {service.description}
                    </p>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${service.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-red-600 px-2">
            Aqui você vende mais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-yellow flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto px-2 sm:px-0">
          <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-red-600 dark:text-red-500">Acesso Administrativo</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Faça login para gerenciar seu restaurante</p>
            </div>
            
            {/* Mensagem para Clientes */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 text-center">
                <strong>É cliente?</strong> Clique em &quot;Ver Cardápio&quot; abaixo para fazer pedidos sem login.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-red-600 transition text-gray-900 dark:text-white"
                    placeholder="admin@restaurante.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-red-600 transition text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar no Painel
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-3 sm:mb-4">
                Não é administrador?
              </p>
              <Link
                href="/cardapio"
                className="block w-full bg-red-600 hover:bg-red-700 text-white py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition text-center mb-2"
              >
                Ver Cardápio como Cliente
              </Link>
              <Link
                href="/"
                className="block w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition text-center"
              >
                ← Voltar para página inicial
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
            Acesso restrito a administradores e equipe autorizada
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8 sm:mt-12 px-2 sm:px-0">
          <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Quer conhecer mais sobre a Versiory?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition"
          >
            Ver Cardápio Digital
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
