"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    setMounted(true);
    // Obter tema do localStorage ou usar padrão CLARO
    if (typeof window !== "undefined") {
      // Garantir que o tema claro seja o padrão inicial
      const root = document.documentElement;
      root.classList.remove("dark");
      
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      // Se não houver tema salvo ou se for diferente de "dark", usar CLARO como padrão
      const initialTheme = savedTheme === "dark" ? "dark" : "light";
      setTheme(initialTheme);
      
      // Aplicar tema no documento
      if (initialTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  // Durante SSR, renderizar um botão placeholder
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
        aria-label="Alternar tema"
        disabled
      >
        <Sun className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      title={theme === "light" ? "Alternar para tema escuro" : "Alternar para tema claro"}
      aria-label="Alternar tema"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
