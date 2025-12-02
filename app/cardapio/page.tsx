"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Product, Category, supabase } from "@/lib/supabase";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CardapioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("order");

      // Carregar produtos
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("name");

      if (categoriesData) setCategories(categoriesData);
      if (productsData) setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar cardápio");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Nosso Cardápio
        </h1>

        {/* Categorias */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              selectedCategory === null
                ? "bg-primary-yellow text-black"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedCategory === category.id
                  ? "bg-primary-yellow text-black"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Produtos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="relative w-full h-48 bg-gray-800">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-yellow">
                    {formatCurrency(product.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum produto encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}




