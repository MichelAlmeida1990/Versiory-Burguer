"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Product, Category, supabase } from "@/lib/supabase";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { DEMO_RESTAURANT_UUID } from "@/lib/restaurant-constants";

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
      // A página de cardápio SEMPRE mostra o conteúdo do demo (Versiory Delivery)
      // Independente de estar logado ou não - ISOLAMENTO TOTAL
      const DEMO_UUID = DEMO_RESTAURANT_UUID;
      
      // SEMPRE carregar categorias do demo
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", DEMO_UUID)
        .order("order");

      // SEMPRE carregar produtos do demo
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("available", true) // Apenas produtos ativos
        .eq("restaurant_id", DEMO_UUID) // Sempre do demo
        .order("name");

      console.log("🔍 Carregando produtos do demo (Versiory Delivery)");
      console.log("📦 Produtos no cardápio:", productsData?.length || 0);
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

  const handleAddToCart = (product: Product, selectedOptions?: any[], totalPrice?: number) => {
    addItem(product, 1, undefined, selectedOptions, totalPrice);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-xl">Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-gray-900">
          Nosso Cardápio
        </h1>

        {/* Categorias - Scroll horizontal no mobile */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          {/* Mobile: Scroll horizontal */}
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-primary-yellow text-black shadow-md"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm rounded-lg font-medium transition whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-primary-yellow text-black shadow-md"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {/* Desktop: Grid centralizado */}
          <div className="hidden sm:flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 md:px-6 py-2 text-base rounded-lg font-medium transition ${
                selectedCategory === null
                  ? "bg-primary-yellow text-black shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 md:px-6 py-2 text-base rounded-lg font-medium transition ${
                  selectedCategory === category.id
                    ? "bg-primary-yellow text-black shadow-md"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Produtos */}
        {products.length === 0 ? (
          // Não há produtos cadastrados
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Nenhum produto cadastrado
                </h2>
                <p className="text-gray-600 text-base sm:text-lg mb-6">
                  Ainda não há produtos disponíveis no cardápio.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <p className="text-sm sm:text-base text-blue-800 mb-2">
                  <strong>Para adicionar produtos:</strong>
                </p>
                <ol className="text-left text-sm sm:text-base text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Acesse o painel administrativo</li>
                  <li>Vá em &quot;Categorias&quot; para criar categorias</li>
                  <li>Vá em &quot;Produtos&quot; para adicionar produtos ao cardápio</li>
                </ol>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          // Há produtos, mas não na categoria selecionada
          <div className="text-center py-12 px-4">
            <p className="text-xl text-gray-600 mb-4">
              Nenhum produto encontrado nesta categoria.
            </p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-primary-yellow hover:text-yellow-600 font-medium underline text-lg"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          // Mostrar produtos
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
              >
                <div className="relative w-full h-40 sm:h-48 bg-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary-yellow">
                      {formatCurrency(product.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full sm:w-auto bg-primary-yellow text-black px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-bold hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}







