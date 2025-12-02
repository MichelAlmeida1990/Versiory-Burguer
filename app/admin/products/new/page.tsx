"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { supabase, Category } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category_id: "",
    available: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order");

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.name.trim()) {
        toast.error("Nome do produto é obrigatório");
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error("Preço deve ser maior que zero");
        setLoading(false);
        return;
      }

      if (!formData.category_id) {
        toast.error("Selecione uma categoria");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("products").insert({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        image: formData.image.trim() || null,
        category_id: formData.category_id,
        available: formData.available,
      });

      if (error) {
        console.error("Erro ao criar produto:", error);
        throw error;
      }

      toast.success("Produto cadastrado com sucesso!");
      router.push("/admin?tab=products");
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error(error.message || "Erro ao cadastrar produto");
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
            href="/admin?tab=products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Produtos
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-4 md:p-6 space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              placeholder="Ex: Hambúrguer Artesanal"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow min-h-[100px]"
              placeholder="Descreva o produto..."
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Imagem */}
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
              placeholder="https://exemplo.com/imagem.jpg ou /images/produtos/imagem.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use uma URL externa ou caminho local (ex: /images/produtos/nome.jpg)
            </p>
          </div>

          {/* Disponibilidade */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-yellow focus:ring-primary-yellow"
            />
            <label htmlFor="available" className="text-sm font-medium">
              Produto disponível
            </label>
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
                  Salvar Produto
                </>
              )}
            </button>
            <Link
              href="/admin?tab=products"
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

