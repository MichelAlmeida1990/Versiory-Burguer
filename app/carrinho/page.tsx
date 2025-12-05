"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { supabase, SelectedOption, ProductOptionValue } from "@/lib/supabase";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();
  const [deliveryFee] = useState(5.0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [optionNames, setOptionNames] = useState<Record<string, string>>({});

  const loadOptionNames = useCallback(async () => {
    const allOptionValueIds = new Set<string>();
    items.forEach((item) => {
      item.selectedOptions?.forEach((opt) => {
        allOptionValueIds.add(opt.option_value_id);
      });
    });

    if (allOptionValueIds.size === 0) return;

    try {
      const { data, error } = await supabase
        .from("product_option_values")
        .select("id, name")
        .in("id", Array.from(allOptionValueIds));

      if (error) throw error;

      const names: Record<string, string> = {};
      data?.forEach((val) => {
        names[val.id] = val.name;
      });
      setOptionNames(names);
    } catch (error) {
      console.error("Erro ao carregar nomes das opções:", error);
    }
  }, [items]);

  useEffect(() => {
    loadOptionNames();
  }, [loadOptionNames]);

  const subtotal = getTotal();
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }
    // Redirecionar para checkout
    window.location.href = "/checkout";
  };

  const applyCoupon = () => {
    // Lógica de cupom (simplificada)
    if (coupon.toUpperCase() === "DEMO10") {
      setDiscount(subtotal * 0.1);
      toast.success("Cupom aplicado! 10% de desconto");
    } else if (coupon) {
      toast.error("Cupom inválido");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-600" />
          <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-400 mb-8">
            Adicione produtos do cardápio para continuar
          </p>
          <Link
            href="/#cardapio"
            className="inline-block bg-primary-yellow text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-opacity-90 transition"
          >
            Ver Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden w-full">
      <Header />
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Carrinho</h1>

          <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Itens do Carrinho */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 min-w-0">
            {items.map((item, index) => {
              const itemKey = item.selectedOptions && item.selectedOptions.length > 0
                ? `${item.product.id}-${JSON.stringify(item.selectedOptions)}-${index}`
                : `${item.product.id}-${index}`;
              return (
              <div
                key={itemKey}
                className="bg-gray-900 rounded-lg p-2.5 sm:p-3 md:p-4 w-full max-w-full overflow-hidden"
              >
                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden gap-2.5 w-full">
                  <div className="flex gap-2 items-start w-full min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-lg flex-shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-lg"
                          unoptimized={item.product.image.includes('supabase.co')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                          Sem imagem
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden w-full">
                      <h3 className="text-sm sm:text-base font-bold break-words leading-tight mb-1">{item.product.name}</h3>
                      <p className="text-base sm:text-lg font-bold text-primary-yellow break-all mb-1">
                        {formatCurrency(((item as any).calculatedPrice || item.product.price) * item.quantity)}
                      </p>
                      <p className="text-gray-400 text-xs mb-1.5">
                        {formatCurrency((item as any).calculatedPrice || item.product.price)} cada
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-xs text-gray-400 space-y-0.5 mb-1.5 w-full">
                          {item.selectedOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-start gap-1 flex-wrap w-full min-w-0">
                              <span className="mt-0.5 flex-shrink-0">•</span>
                              <span className="break-words flex-1 min-w-0">{optionNames[opt.option_value_id] || 'Opção'}</span>
                              {opt.price_modifier !== 0 && (
                                <span className="text-green-400 break-words whitespace-normal text-xs">
                                  ({opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.observations && (
                        <p className="text-gray-500 text-xs italic break-words mb-2">
                          Obs: {item.observations}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-800 w-full min-w-0">
                    <div className="flex items-center gap-0 bg-gray-800 rounded-lg flex-shrink-0">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.selectedOptions)
                        }
                        className="p-2 hover:bg-gray-700 rounded-l-lg active:bg-gray-600 transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-1.5 text-xs font-semibold min-w-[1.75rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)
                        }
                        className="p-2 hover:bg-gray-700 rounded-r-lg active:bg-gray-600 transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedOptions)}
                      className="text-red-400 hover:text-red-300 p-2 active:opacity-70 transition-colors flex-shrink-0"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop/Tablet Layout */}
                <div className="hidden sm:flex gap-3 md:gap-4">
                  <div className="relative w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized={item.product.image.includes('supabase.co')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold mb-1 break-words">{item.product.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">
                      {formatCurrency((item as any).calculatedPrice || item.product.price)} cada
                    </p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-xs text-gray-400 mb-2 space-y-1">
                        {item.selectedOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span>•</span>
                            <span>{optionNames[opt.option_value_id] || 'Opção'}</span>
                            {opt.price_modifier !== 0 && (
                              <span className="text-green-400">
                                ({opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.observations && (
                      <p className="text-gray-500 text-xs italic mb-2 break-words">
                        Obs: {item.observations}
                      </p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.selectedOptions)
                          }
                          className="p-2 hover:bg-gray-700 rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 sm:px-4 py-2 text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)
                          }
                          className="p-2 hover:bg-gray-700 rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedOptions)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right sm:text-left sm:flex sm:items-center">
                    <p className="text-lg sm:text-xl font-bold text-primary-yellow">
                      {formatCurrency(((item as any).calculatedPrice || item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="bg-gray-900 rounded-lg p-3 sm:p-4 md:p-6 lg:sticky lg:top-24 mb-4 sm:mb-6 lg:mb-0 w-full max-w-full overflow-hidden">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">Resumo do Pedido</h2>

              {/* Cupom */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Cupom de Desconto
                </label>
                <div className="flex gap-1.5 sm:gap-2 w-full">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Código do cupom"
                    className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm focus:outline-none focus:border-primary-yellow"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-primary-azure text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-opacity-90 transition text-xs sm:text-sm flex-shrink-0"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Totais */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 w-full">
                <div className="flex justify-between items-center text-gray-400 text-sm sm:text-base w-full min-w-0">
                  <span className="flex-shrink-0">Subtotal</span>
                  <span className="text-right break-all ml-2">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 text-sm sm:text-base w-full min-w-0">
                  <span className="flex-shrink-0">Taxa de Entrega</span>
                  <span className="text-right break-all ml-2">{formatCurrency(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-400 text-sm sm:text-base w-full min-w-0">
                    <span className="flex-shrink-0">Desconto</span>
                    <span className="text-right break-all ml-2">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-2 sm:pt-3 flex justify-between items-center text-lg sm:text-xl font-bold w-full min-w-0">
                  <span className="flex-shrink-0">Total</span>
                  <span className="text-primary-yellow text-right break-all ml-2">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary-yellow text-black py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-opacity-90 transition"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

