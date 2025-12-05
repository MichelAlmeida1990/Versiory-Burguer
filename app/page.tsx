"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, LogIn, ArrowRight, ChefHat, Users } from "lucide-react";
import Link from "next/link";
import { VideoLoading } from "@/components/loading/video-loading";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial da página
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 segundos de loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <VideoLoading message="Carregando Versiory Delivery..." />;
  }

  return (
    <div 
      className="min-h-screen text-gray-900 dark:text-white flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/images/banners/banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Conteúdo */}
      <div className="relative z-10 w-full">
        <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 relative inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Efeito de brilho pulsante ao fundo */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 blur-2xl -z-10"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Texto principal com animação letra por letra */}
            <span className="relative inline-block">
              {"Versiory Delivery".split("").map((letter, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.3,
                    y: -8,
                    textShadow: "0 0 25px rgba(220, 38, 38, 0.9), 0 0 50px rgba(220, 38, 38, 0.5)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.span
                    className="bg-gradient-to-r from-red-500 via-red-600 to-red-800 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.1,
                    }}
                    style={{
                      backgroundSize: "200% 100%",
                      filter: "drop-shadow(0 0 10px rgba(220, 38, 38, 0.6))",
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                </motion.span>
              ))}
            </span>
          </motion.h1>
          
          <p className="text-lg md:text-xl text-black mb-8 font-semibold drop-shadow-lg bg-white/50 dark:bg-black/50 px-4 py-2 rounded-lg inline-block">
            Escolha como deseja acessar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Opção Cliente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/cardapio"
              className="block group relative bg-red-600/20 dark:bg-red-600/30 backdrop-blur-md border-2 border-red-400/50 dark:border-red-500/50 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(185, 28, 28, 0.15) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-lg">
                  Sou Cliente
                </h2>
                <p className="text-white/90 mb-6 font-medium drop-shadow">
                  Quero ver o cardápio e fazer pedidos
                </p>
                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all drop-shadow">
                  <span>Ver Cardápio</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-600/5 rounded-2xl transition-all duration-300"></div>
            </Link>
          </motion.div>

          {/* Opção Admin */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/admin/login"
              className="block group relative bg-red-600/20 dark:bg-red-600/30 backdrop-blur-md border-2 border-red-400/50 dark:border-red-500/50 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(185, 28, 28, 0.15) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-700 dark:bg-gray-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-lg">
                  Sou Admin
                </h2>
                <p className="text-white/90 mb-6 font-medium drop-shadow">
                  Acesso ao painel administrativo
                </p>
                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all drop-shadow">
                  <span>Fazer Login</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/0 to-gray-600/0 group-hover:from-gray-600/10 group-hover:to-gray-600/5 rounded-2xl transition-all duration-300"></div>
            </Link>
          </motion.div>
        </div>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-black mb-4 font-semibold drop-shadow-lg bg-white/50 dark:bg-black/50 px-4 py-2 rounded-lg inline-block">
            Não sabe por onde começar?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <Users className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Cliente: Veja o cardápio e faça pedidos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <ChefHat className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Admin: Gerencie produtos e pedidos</span>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
