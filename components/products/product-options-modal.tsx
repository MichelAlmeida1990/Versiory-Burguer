"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Image from "next/image";
import { Product, ProductOption, ProductOptionValue, supabase, SelectedOption } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductOptionsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: SelectedOption[], totalPrice: number) => void;
}

export function ProductOptionsModal({ product, isOpen, onClose, onConfirm }: ProductOptionsModalProps) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [totalPrice, setTotalPrice] = useState(product.price);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setOptions([]); // Resetar opções
      
      // Buscar opções do produto
      const { data: optionsData, error: optionsError } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", product.id)
        .order("display_order");

      if (optionsError) {
        console.error("Erro ao buscar opções:", optionsError);
        // Se a tabela não existir, apenas não mostrar opções
        if (optionsError.code === '42P01' || optionsError.message?.includes('does not exist')) {
          console.warn("Tabela product_options não existe. Execute o SQL primeiro.");
          setOptions([]);
          setLoading(false);
          return;
        }
        throw optionsError;
      }

      if (optionsData && optionsData.length > 0) {
        // Buscar valores de cada opção
        const optionIds = optionsData.map((opt) => opt.id);
        const { data: valuesData, error: valuesError } = await supabase
          .from("product_option_values")
          .select("*")
          .in("option_id", optionIds)
          .eq("available", true)
          .order("display_order");

        if (valuesError) {
          console.error("Erro ao buscar valores:", valuesError);
          // Se a tabela não existir, apenas não mostrar opções
          if (valuesError.code === '42P01' || valuesError.message?.includes('does not exist')) {
            console.warn("Tabela product_option_values não existe. Execute o SQL primeiro.");
            setOptions([]);
            setLoading(false);
            return;
          }
          throw valuesError;
        }

        // Associar valores às opções
        const optionsWithValues = optionsData.map((option) => ({
          ...option,
          values: (valuesData || []).filter((val) => val.option_id === option.id),
        })).filter((opt) => opt.values && opt.values.length > 0); // Filtrar opções sem valores

        setOptions(optionsWithValues);

        // Inicializar seleções vazias
        const initialSelections: Record<string, string | string[]> = {};
        optionsWithValues.forEach((opt) => {
          if (opt.type === "multiple") {
            initialSelections[opt.id] = [];
          }
        });
        setSelectedOptions(initialSelections);
      } else {
        // Se não houver opções, pode adicionar direto
        setOptions([]);
      }
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
      setOptions([]); // Garantir que não fique em loading infinito
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (isOpen && product.id) {
      loadOptions();
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll do body quando modal fecha
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      // Cleanup: restaurar scroll quando componente desmonta
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product.id, loadOptions]);

  const calculateTotal = useCallback(() => {
    let total = product.price;

    Object.entries(selectedOptions).forEach(([optionId, valueIds]) => {
      const option = options.find((opt) => opt.id === optionId);
      if (!option) return;

      if (option.type === "single" && typeof valueIds === "string") {
        const value = option.values?.find((val) => val.id === valueIds);
        if (value) total += value.price_modifier;
      } else if (option.type === "multiple" && Array.isArray(valueIds)) {
        valueIds.forEach((valueId) => {
          const value = option.values?.find((val) => val.id === valueId);
          if (value) total += value.price_modifier;
        });
      }
    });

    setTotalPrice(total);
  }, [product.price, selectedOptions, options]);

  useEffect(() => {
    if (options.length > 0) {
      calculateTotal();
    }
  }, [calculateTotal, options.length]);

  const handleOptionChange = (optionId: string, valueId: string, type: "single" | "multiple") => {
    if (type === "single") {
      setSelectedOptions({ ...selectedOptions, [optionId]: valueId });
    } else {
      const current = (selectedOptions[optionId] as string[]) || [];
      const newValue = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      setSelectedOptions({ ...selectedOptions, [optionId]: newValue });
    }
  };

  const handleConfirm = () => {
    // Validar opções obrigatórias
    const requiredOptions = options.filter((opt) => opt.required);
    const missingRequired = requiredOptions.some((opt) => {
      const selection = selectedOptions[opt.id];
      if (opt.type === "single") {
        return !selection || selection === "";
      } else {
        return !selection || (Array.isArray(selection) && selection.length === 0);
      }
    });

    if (missingRequired) {
      alert("Por favor, selecione todas as opções obrigatórias.");
      return;
    }

    // Converter seleções para formato SelectedOption[]
    const selected: SelectedOption[] = [];
    Object.entries(selectedOptions).forEach(([optionId, valueIds]) => {
      const option = options.find((opt) => opt.id === optionId);
      if (!option) return;

      if (option.type === "single" && typeof valueIds === "string") {
        const value = option.values?.find((val) => val.id === valueIds);
        if (value) {
          selected.push({
            option_id: optionId,
            option_value_id: valueIds,
            price_modifier: value.price_modifier,
          });
        }
      } else if (option.type === "multiple" && Array.isArray(valueIds)) {
        valueIds.forEach((valueId) => {
          const value = option.values?.find((val) => val.id === valueId);
          if (value) {
            selected.push({
              option_id: optionId,
              option_value_id: valueId,
              price_modifier: value.price_modifier,
            });
          }
        });
      }
    });

    onConfirm(selected, totalPrice);
    onClose();
  };

  if (!isOpen) return null;

  if (!mounted) {
    // Renderizar sem portal enquanto não montou (SSR safety)
    return null;
  }

  // Garantir que document.body existe antes de criar portal
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          tabIndex={-1}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            className="bg-white rounded-t-3xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header com imagem do produto */}
          <div className="relative bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
            {/* Mobile Layout - Vertical */}
            <div className="md:hidden flex flex-col">
              {/* Botão de fechar no topo direito */}
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              {/* Imagem centralizada */}
              <div className="flex justify-center px-4 mb-3">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized={product.image.includes('supabase.co')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.image-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100';
                          fallback.textContent = 'Sem imagem';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
                      Sem imagem
                    </div>
                  )}
                </div>
              </div>
              
              {/* Informações do produto */}
              <div className="px-4 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">{product.name}</h2>
                {product.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 text-center mb-3">{product.description}</p>
                )}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Preço base:</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(product.price)}</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout - Horizontal */}
            <div className="hidden md:flex items-start gap-4 p-6">
              {/* Imagem do produto - maior e destacada */}
              <div className="relative w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-gray-200">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                    unoptimized={product.image.includes('supabase.co')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.image-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'image-fallback w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100';
                        fallback.textContent = 'Sem imagem';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
                    Sem imagem
                  </div>
                )}
              </div>
              
              {/* Informações do produto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h2>
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                    aria-label="Fechar"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-lg font-semibold text-gray-700">Preço base:</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(product.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 overflow-y-auto flex-1 scrollbar-hide">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando opções...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-6 md:py-8 space-y-4">
                <p className="text-sm md:text-base text-gray-600">
                  Este produto não possui opções disponíveis.
                </p>
                <p className="text-xs md:text-sm text-gray-500 px-4">
                  Você pode adicionar ao carrinho diretamente ou configurar opções no painel admin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onConfirm([], product.price);
                      onClose();
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 md:space-y-6">
                {options.map((option) => (
                  <div key={option.id} className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">{option.name}</h3>
                      {option.required && (
                        <span className="text-xs text-red-500 font-medium">* Obrigatório</span>
                      )}
                    </div>

                    {option.type === "single" ? (
                      <div className="space-y-2">
                        {option.values?.map((value) => (
                          <label
                            key={value.id}
                            className={`flex items-center justify-between p-3 md:p-3 min-h-[56px] border-2 rounded-lg cursor-pointer transition ${
                              selectedOptions[option.id] === value.id
                                ? "border-red-600 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="radio"
                                name={`option-${option.id}`}
                                value={value.id}
                                checked={selectedOptions[option.id] === value.id}
                                onChange={() => handleOptionChange(option.id, value.id, "single")}
                                className="w-5 h-5 md:w-4 md:h-4 text-red-600 flex-shrink-0"
                              />
                              <span className="font-medium text-sm md:text-base text-gray-900 truncate">{value.name}</span>
                            </div>
                            {value.price_modifier !== 0 && (
                              <span
                                className={`font-semibold text-sm md:text-base flex-shrink-0 ml-2 ${
                                  value.price_modifier > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {value.price_modifier > 0 ? "+" : ""}
                                {formatCurrency(value.price_modifier)}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {option.values?.map((value) => {
                          const isSelected = (selectedOptions[option.id] as string[])?.includes(
                            value.id
                          );
                          return (
                            <label
                              key={value.id}
                              className={`flex items-center justify-between p-3 md:p-3 min-h-[56px] border-2 rounded-lg cursor-pointer transition ${
                                isSelected
                                  ? "border-red-600 bg-red-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleOptionChange(option.id, value.id, "multiple")}
                                  className="w-5 h-5 md:w-4 md:h-4 text-red-600 rounded flex-shrink-0"
                                />
                                <span className="font-medium text-sm md:text-base text-gray-900 truncate">{value.name}</span>
                              </div>
                              {value.price_modifier !== 0 && (
                                <span
                                  className={`font-semibold text-sm md:text-base flex-shrink-0 ml-2 ${
                                    value.price_modifier > 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {value.price_modifier > 0 ? "+" : ""}
                                  {formatCurrency(value.price_modifier)}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && options.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-base md:text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-xl md:text-2xl font-bold text-red-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 md:py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl text-base md:text-lg"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

