"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Product } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Mobile Layout - Horizontal (como nas imagens) */}
      <div className="md:hidden flex gap-3 p-3">
        {/* Imagem quadrada/arredondada */}
        <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Sem imagem
            </div>
          )}
          {/* Botão de adicionar no canto da imagem (amarelo) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddToCart(product)}
            className="absolute bottom-1 right-1 bg-yellow-400 hover:bg-yellow-500 w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-10"
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-5 h-5 text-black font-bold" strokeWidth={3} />
          </motion.button>
        </div>

        {/* Informações */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
          
          {/* Preço em verde */}
          <div className="mt-2">
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Vertical */}
      <div className="hidden md:flex flex-col h-full">
        {/* Imagem */}
        <div className="relative w-full h-48 bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
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
            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg"
          >
            {formatCurrency(product.price)}
          </motion.div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          
          {/* Botão */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product)}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
