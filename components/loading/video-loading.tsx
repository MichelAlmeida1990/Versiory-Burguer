"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface VideoLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function VideoLoading({ message = "Carregando...", fullScreen = true }: VideoLoadingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // Velocidade um pouco mais lenta
      videoRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir vídeo:", error);
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${
        fullScreen ? "fixed inset-0 z-50" : "relative w-full h-full"
      } flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm`}
    >
      {/* Vídeo de loading */}
      <div className="relative w-full max-w-md md:max-w-lg aspect-square flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          loop
          muted
          playsInline
          autoPlay
        >
          <source src="/videos/junk-food-loading.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
        
        {/* Overlay com gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Mensagem de loading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <motion.p
          className="text-white text-lg md:text-xl font-semibold mb-2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
        
        {/* Indicador de loading */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-red-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

