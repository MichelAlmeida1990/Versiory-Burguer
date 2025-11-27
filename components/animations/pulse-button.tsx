"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

interface PulseButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function PulseButton({ 
  children, 
  className = "",
  onClick,
  href 
}: PulseButtonProps) {
  const buttonContent = (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      
      {/* Efeito de brilho pulsante */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-white/20 rounded-lg blur-xl pointer-events-none"
      />
    </motion.div>
  );

  if (href) {
    if (href.startsWith("#") || href.startsWith("/")) {
      return (
        <Link href={href} className="block">
          {buttonContent}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="block w-full">
      {buttonContent}
    </button>
  );
}
