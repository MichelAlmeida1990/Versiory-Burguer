"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    order: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Nome da categoria é obrigatório");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("categories").insert({
        name: formData.name.trim(),
        image: formData.image.trim() || null,
        order: parseInt(formData.order) || 0,
      });

      if (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
      }

      toast.success("Categoria cadastrada com sucesso!");
      router.push("/admin?tab=categories");
    } catch (error: any) {
      console.error("Erro ao cadastrar categoria:", error);
      toast.error(error.message || "Erro ao cadastrar categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin?tab=categories"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Categorias
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold">Nova Categoria</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-4 md:p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome da Categoria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              placeholder="Ex: Entradas"
              required
            />
          </div>

          {/* Ordem e Imagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="order" className="block text-sm font-medium mb-2">
                Ordem de Exibição
              </label>
              <input
                type="number"
                id="order"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Categorias com menor número aparecem primeiro
              </p>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                placeholder="https://exemplo.com/imagem.jpg ou /images/categorias/imagem.jpg"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-yellow text-black px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Categoria
                </>
              )}
            </button>
            <Link
              href="/admin?tab=categories"
              className="px-6 py-3 rounded-lg font-bold border border-gray-700 hover:bg-gray-800 transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


