"use client";

import { motion } from "framer-motion";

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  // Usar Array.from para lidar corretamente com caracteres especiais e acentos
  const letters = Array.from(text || "");

  if (!text || letters.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.h1
      className={`${className} flex flex-nowrap justify-center items-center gap-0.5 md:gap-1 whitespace-nowrap`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ overflow: "visible" }}
    >
      {letters.map((letter, index) => {
        const isSpace = letter === " " || letter === "\u00A0" || letter === "\u2000" || letter === "\u2001" || letter === "\u2002" || letter === "\u2003" || letter === "\u2004" || letter === "\u2005" || letter === "\u2006" || letter === "\u2007" || letter === "\u2008" || letter === "\u2009" || letter === "\u200A";
        const isAmpersand = letter === "&" || letter === "＆";
        const isVowel = /[aeiouàáâãéêíóôõúAEIOUÀÁÂÃÉÊÍÓÔÕÚ]/.test(letter);
        
        if (isSpace) {
          return (
            <span key={`space-${index}`} className="inline-block w-1 md:w-2">
              {" "}
            </span>
          );
        }
        
        if (isAmpersand) {
          return (
            <motion.span
              key={`ampersand-${index}`}
              variants={letterVariants}
              className="inline-block text-red-600 font-bold"
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                scale: 1.2,
                transition: { 
                  duration: 0.5,
                  ease: "easeInOut"
                },
              }}
            >
              {letter}
            </motion.span>
          );
        }
        
        return (
          <motion.span
            key={`${letter}-${index}`}
            variants={letterVariants}
            className={`inline-block ${isVowel ? "text-yellow-300" : "text-white"}`}
            whileHover={{
              scale: 1.15,
              transition: { duration: 0.2 },
            }}
          >
            {letter}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}
