"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Product, SelectedOption } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { ProductOptionsModal } from "./product-options-modal";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedOptions?: SelectedOption[], totalPrice?: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsModalOpen(true);
  };

  const handleConfirmOptions = (selectedOptions: SelectedOption[], totalPrice: number) => {
    onAddToCart(product, selectedOptions, totalPrice);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 hover:border-red-500/50 group"
    >
      {/* Mobile Layout - Horizontal (como nas imagens) */}
      <div className="md:hidden flex gap-3 p-3">
        {/* Imagem quadrada/arredondada */}
        <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized={product.image.includes('supabase.co')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.image-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400 text-xs';
                  fallback.textContent = 'Sem imagem';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              Sem imagem
            </div>
          )}
          {/* Botão de adicionar no canto da imagem (amarelo) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddClick}
            className="absolute bottom-1 right-1 bg-gradient-to-r from-primary-yellow to-yellow-400 hover:from-yellow-400 hover:to-primary-yellow w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 z-10 transition-all"
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-5 h-5 text-black font-bold" strokeWidth={3} />
          </motion.button>
        </div>

        {/* Informações */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary-yellow dark:group-hover:text-primary-yellow transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {product.description}
            </p>
          </div>
          
          {/* Preço em neon verde */}
          <div className="mt-2">
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Vertical */}
      <div className="hidden md:flex flex-col h-full">
        {/* Imagem */}
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized={product.image.includes('supabase.co')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.image-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400';
                  fallback.textContent = 'Sem imagem';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
          {/* Badge de preço */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg shadow-red-500/50"
          >
            {formatCurrency(product.price)}
          </motion.div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-yellow dark:group-hover:text-primary-yellow transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {product.description}
          </p>
          
          {/* Botão */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </motion.button>
        </div>
      </div>

      {/* Modal de Opções - renderizado via portal */}
      {isModalOpen && (
        <ProductOptionsModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmOptions}
        />
      )}
    </motion.div>
  );
}
