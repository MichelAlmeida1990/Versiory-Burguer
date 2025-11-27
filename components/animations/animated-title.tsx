"use client";

import { motion } from "framer-motion";

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  const letters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.h1
      className={`${className} flex flex-wrap justify-center items-center gap-1 md:gap-2`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => {
        const isSpace = letter === " ";
        const isVowel = /[aeiouAEIOU]/.test(letter);
        
        return (
          <motion.span
            key={index}
            variants={letterVariants}
            className={`inline-block ${
              isSpace ? "w-2 md:w-4" : ""
            } ${isVowel ? "text-yellow-300" : ""}`}
            whileHover={{
              scale: 1.3,
              color: "#fbbf24",
              textShadow: "0 0 20px rgba(251, 191, 36, 0.8)",
              transition: { duration: 0.2 },
            }}
            animate={
              isVowel
                ? {
                    y: [0, -10, 0],
                  }
                : {}
            }
            transition={
              isVowel
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }
                : {}
            }
          >
            {isSpace ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}
