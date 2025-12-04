"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Product, Category, supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import { AnimatedTitle } from "@/components/animations/animated-title";
import { ScrollAnimation } from "@/components/animations/scroll-animation";
import { PulseButton } from "@/components/animations/pulse-button";
import { StaggerGrid } from "@/components/animations/stagger-grid";
import { StaggerItem } from "@/components/animations/stagger-item";
import { ProductCard } from "@/components/products/product-card";

export default function Home() {
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
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("order");

      if (categoriesError) {
        console.error("Erro ao carregar categorias:", categoriesError);
        toast.error("Erro ao carregar categorias");
        return;
      }

      if (!categoriesData || categoriesData.length === 0) {
        toast.error("Nenhuma categoria encontrada");
        return;
      }

      setCategories(categoriesData);

      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, description, price, image, category_id, available, created_at, updated_at")
        .eq("available", true)
        .order("name");

      if (productsError) {
        console.error("Erro ao carregar produtos:", productsError);
        toast.error("Erro ao carregar produtos");
        return;
      }

      if (!productsData || productsData.length === 0) {
        return;
      }

      // Verificar produtos e suas categorias
      const categoryIds = new Set(categoriesData.map(c => c.id));
      const validProducts = productsData.filter(p => {
        return p.category_id && categoryIds.has(p.category_id);
      });
      
      setProducts(validProducts);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar cardápio");
    } finally {
      setLoading(false);
    }
  };

  // Memoizar produtos filtrados para melhor performance
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    
    const filtered = products.filter((p) => {
      if (!p.category_id) {
        return false;
      }
      
      // Comparação direta de UUIDs
      return p.category_id === selectedCategory;
    });
    
    return filtered;
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product, selectedOptions?: any[], totalPrice?: number) => {
    addItem(product, 1, undefined, selectedOptions, totalPrice);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 sm:py-0 sm:h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/banners/banner.jpg')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <AnimatedTitle 
            text="Versiory Delivery"
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 text-white"
          />
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-4 sm:mb-6 md:mb-8 text-white font-bold drop-shadow-2xl px-2"
          >
            O sistema que sua empresa merece
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 text-white font-semibold max-w-3xl mx-auto px-2 drop-shadow-lg leading-relaxed"
          >
            Conquistando empreendedores pela facilidade, eficiência e resultados. Cada detalhe do sistema foi pensado para dar mais agilidade ao seu negócio e melhorar a experiência dos seus clientes.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 text-white font-semibold max-w-3xl mx-auto px-2 drop-shadow-lg leading-relaxed"
          >
            A Versiory traz evolução que seu negócio precisa para vender mais, atender melhor e crescer com tecnologia simples e acessível.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <PulseButton href="#cardapio">
              <span className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center">
                Ver Cardápio
              </span>
            </PulseButton>
            <PulseButton href="https://wa.me/5511959917953">
              <span className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center">
                Pedir pelo WhatsApp
              </span>
            </PulseButton>
          </motion.div>
        </div>
      </section>

      {/* Cardápio Section */}
      <section id="cardapio" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <motion.h2
                initial={{ backgroundPosition: "0% 50%" }}
                whileInView={{ backgroundPosition: "100% 50%" }}
                viewport={{ once: true }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent bg-[length:200%_200%]"
              >
                Nosso Cardápio
              </motion.h2>
              <p className="text-lg md:text-xl text-gray-600 px-4">
                Explore nossos pratos deliciosos e faça seu pedido
              </p>
            </div>
          </ScrollAnimation>

          {/* Categorias */}
          <ScrollAnimation delay={0.2}>
            <div className="flex flex-wrap gap-4 mb-12 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  selectedCategory === null
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    // Scroll suave para a seção de produtos
                    setTimeout(() => {
                      const produtosSection = document.getElementById('produtos-section');
                      if (produtosSection) {
                        produtosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    selectedCategory === category.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </ScrollAnimation>

          {/* Produtos */}
          <div id="produtos-section">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Carregando cardápio...</p>
              </div>
            ) : (
              <>
                {selectedCategory && (
                  <div className="mb-6 text-center">
                    <p className="text-lg text-gray-600">
                      Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'} em &quot;{categories.find(c => c.id === selectedCategory)?.name || 'Categoria'}&quot;
                    </p>
                  </div>
                )}
                {filteredProducts.length > 0 ? (
                  <StaggerGrid key={`grid-${selectedCategory || 'all'}`} className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <StaggerItem key={product.id}>
                        <ProductCard 
                          product={product} 
                          onAddToCart={handleAddToCart}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-4">Nenhum produto encontrado nesta categoria.</p>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Ver todos os produtos
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/banners/banner.jpg')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <ScrollAnimation>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ rotateX: -90, opacity: 0 }}
              whileInView={{ rotateX: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", stiffness: 80 }}
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white px-4"
            >
              Pronto para pedir?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 px-4"
            >
              Finalize seu pedido e aproveite nossos deliciosos hambúrguers artesanais
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <PulseButton href="/carrinho">
                <span className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 md:px-10 md:py-5 rounded-lg text-lg md:text-xl font-bold inline-block shadow-2xl w-full sm:w-auto">
                  Ver Carrinho
                </span>
              </PulseButton>
            </motion.div>
          </div>
        </ScrollAnimation>
      </section>
    </div>
  );
}
