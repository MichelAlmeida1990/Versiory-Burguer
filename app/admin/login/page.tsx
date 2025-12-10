"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔐 Tentando fazer login com:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Erro no login:", error);
        toast.error(error.message || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("✅ Login realizado com sucesso:", data.user.email);
        
        // Verificar se a sessão foi salva
        const { data: { session } } = await supabase.auth.getSession();
        console.log("📦 Sessão após login:", !!session);
        
        toast.success("Login realizado com sucesso!");
        
        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Usar window.location para garantir que a navegação aconteça
        window.location.href = "/admin";
      }
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      toast.error(error.message || "Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-primary-yellow">
              Versiory Delivery
            </h1>
            <p className="text-gray-400">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-yellow text-black py-3 rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

