"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Trash2, Edit2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { ProductOption, ProductOptionValue, supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface ProductOptionsManagerProps {
  productId: string;
  onOptionsChange?: (hasOptions: boolean) => void;
}

interface OptionForm {
  id?: string; // Se tiver ID, é uma opção existente
  name: string;
  type: "single" | "multiple";
  required: boolean;
  display_order: number;
  values: OptionValueForm[];
}

interface OptionValueForm {
  id?: string; // Se tiver ID, é um valor existente
  name: string;
  price_modifier: number;
  display_order: number;
  available: boolean;
}

export function ProductOptionsManager({ productId, onOptionsChange }: ProductOptionsManagerProps) {
  const [options, setOptions] = useState<OptionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const loadOptionsMemo = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar opções do produto
      const { data: optionsData, error: optionsError } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");

      if (optionsError) {
        // Se as tabelas não existirem, apenas não mostrar opções
        if (optionsError.code === '42P01' || optionsError.message?.includes('does not exist')) {
          console.warn("Tabelas de opções não existem. Execute o SQL primeiro.");
          setOptions([]);
          setLoading(false);
          return;
        }
        throw optionsError;
      }

      if (!optionsData || optionsData.length === 0) {
        setOptions([]);
        setLoading(false);
        return;
      }

      // Buscar valores de cada opção
      const optionIds = optionsData.map((opt: ProductOption) => opt.id);
      const { data: valuesData, error: valuesError } = await supabase
        .from("product_option_values")
        .select("*")
        .in("option_id", optionIds)
        .order("display_order");

      if (valuesError) {
        console.error("Erro ao buscar valores:", valuesError);
        setOptions([]);
        setLoading(false);
        return;
      }

      // Associar valores às opções
      const optionsWithValues: OptionForm[] = optionsData.map((option: ProductOption) => ({
        id: option.id,
        name: option.name,
        type: option.type as "single" | "multiple",
        required: option.required,
        display_order: option.display_order,
        values: (valuesData || [])
          .filter((val: ProductOptionValue) => val.option_id === option.id)
          .map((val: ProductOptionValue) => ({
            id: val.id,
            name: val.name,
            price_modifier: val.price_modifier,
            display_order: val.display_order,
            available: val.available,
          })),
      }));

      setOptions(optionsWithValues);
      
      // Expandir todas as opções por padrão
      setExpandedOptions(new Set(optionsWithValues.map(opt => opt.id || `new-${Math.random()}`)));
    } catch (error: any) {
      console.error("Erro ao carregar opções:", error);
      toast.error("Erro ao carregar opções do produto");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadOptionsMemo();
  }, [loadOptionsMemo]);

  useEffect(() => {
    if (onOptionsChange) {
      onOptionsChange(options.length > 0);
    }
  }, [options, onOptionsChange]);


  const addOption = () => {
    const newOption: OptionForm = {
      name: "",
      type: "single",
      required: false,
      display_order: options.length,
      values: [],
    };
    setOptions([...options, newOption]);
    setExpandedOptions(new Set([...expandedOptions, `new-${options.length}`]));
  };

  const removeOption = (index: number) => {
    const option = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    
    // Ajustar display_order
    newOptions.forEach((opt, i) => {
      opt.display_order = i;
    });
    
    setOptions(newOptions);
    
    // Se tiver ID, deletar do banco
    if (option.id) {
      deleteOptionFromDB(option.id);
    }
  };

  const deleteOptionFromDB = async (optionId: string) => {
    try {
      // Deletar valores primeiro (cascade)
      await supabase
        .from("product_option_values")
        .delete()
        .eq("option_id", optionId);

      // Deletar opção
      const { error } = await supabase
        .from("product_options")
        .delete()
        .eq("id", optionId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Erro ao deletar opção:", error);
      toast.error("Erro ao deletar opção");
    }
  };

  const updateOption = (index: number, field: keyof OptionForm, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addValueToOption = (optionIndex: number) => {
    const newOptions = [...options];
    const option = newOptions[optionIndex];
    const newValue: OptionValueForm = {
      name: "",
      price_modifier: 0,
      display_order: option.values.length,
      available: true,
    };
    option.values = [...option.values, newValue];
    setOptions(newOptions);
  };

  const removeValueFromOption = async (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options];
    const option = newOptions[optionIndex];
    const value = option.values[valueIndex];
    
    option.values = option.values.filter((_, i) => i !== valueIndex);
    
    // Ajustar display_order
    option.values.forEach((val, i) => {
      val.display_order = i;
    });
    
    setOptions(newOptions);
    
    // Se tiver ID, deletar do banco
    if (value.id) {
      try {
        const { error } = await supabase
          .from("product_option_values")
          .delete()
          .eq("id", value.id);

        if (error) throw error;
      } catch (error: any) {
        console.error("Erro ao deletar valor:", error);
        toast.error("Erro ao deletar valor da opção");
      }
    }
  };

  const updateValue = (optionIndex: number, valueIndex: number, field: keyof OptionValueForm, value: any) => {
    const newOptions = [...options];
    newOptions[optionIndex].values[valueIndex] = {
      ...newOptions[optionIndex].values[valueIndex],
      [field]: value,
    };
    setOptions(newOptions);
  };

  const toggleExpandOption = (optionId: string | undefined) => {
    const id = optionId || `new-${options.findIndex(opt => !opt.id)}`;
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOptions(newExpanded);
  };

  const saveOptions = async () => {
    if (!productId) {
      toast.error("Produto não encontrado");
      return;
    }

    setSaving(true);
    try {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        
        // Validar opção
        if (!option.name.trim()) {
          toast.error(`Opção ${i + 1}: Nome é obrigatório`);
          setSaving(false);
          return;
        }

        if (option.values.length === 0) {
          toast.error(`Opção "${option.name}": Adicione pelo menos um valor`);
          setSaving(false);
          return;
        }

        // Validar valores
        for (let j = 0; j < option.values.length; j++) {
          const value = option.values[j];
          if (!value.name.trim()) {
            toast.error(`Opção "${option.name}", Valor ${j + 1}: Nome é obrigatório`);
            setSaving(false);
            return;
          }
        }

        let optionId: string;

        if (option.id) {
          // Atualizar opção existente
          const { data, error } = await supabase
            .from("product_options")
            .update({
              name: option.name.trim(),
              type: option.type,
              required: option.required,
              display_order: i,
            })
            .eq("id", option.id)
            .select()
            .single();

          if (error) throw error;
          optionId = option.id;
        } else {
          // Criar nova opção
          const { data, error } = await supabase
            .from("product_options")
            .insert({
              product_id: productId,
              name: option.name.trim(),
              type: option.type,
              required: option.required,
              display_order: i,
            })
            .select()
            .single();

          if (error) throw error;
          optionId = data.id;
        }

        // Gerenciar valores
        const existingValueIds = option.values.filter((v: OptionValueForm) => v.id).map((v: OptionValueForm) => v.id!);
        
        // Deletar valores removidos
        if (option.id) {
          const { data: allValues } = await supabase
            .from("product_option_values")
            .select("id")
            .eq("option_id", optionId);

          if (allValues) {
            const toDelete = allValues
              .filter((v: { id: string }) => !existingValueIds.includes(v.id))
              .map((v: { id: string }) => v.id);

            if (toDelete.length > 0) {
              await supabase
                .from("product_option_values")
                .delete()
                .in("id", toDelete);
            }
          }
        }

        // Salvar/atualizar valores
        for (let j = 0; j < option.values.length; j++) {
          const value = option.values[j];

          if (value.id) {
            // Atualizar valor existente
            await supabase
              .from("product_option_values")
              .update({
                name: value.name.trim(),
                price_modifier: value.price_modifier,
                display_order: j,
                available: value.available,
              })
              .eq("id", value.id);
          } else {
            // Criar novo valor
            await supabase
              .from("product_option_values")
              .insert({
                option_id: optionId,
                name: value.name.trim(),
                price_modifier: value.price_modifier,
                display_order: j,
                available: value.available,
              });
          }
        }
      }

      // Remover opções deletadas (já foram removidas da lista)
      // Isso é feito automaticamente quando deletamos acima

      toast.success("Opções salvas com sucesso!");
      await loadOptionsMemo(); // Recarregar para obter IDs atualizados
    } catch (error: any) {
      console.error("Erro ao salvar opções:", error);
      toast.error(error.message || "Erro ao salvar opções");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 md:p-6">
        <p className="text-gray-400">Carregando opções...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Opções e Adicionais</h3>
          <p className="text-sm text-gray-400 mb-2">
            Configure tamanhos, adicionais e outras opções para este produto
          </p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-600"></div>
              <span className="text-gray-400"><span className="font-bold text-red-400">Obrigatório:</span> Cliente deve escolher</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-600"></div>
              <span className="text-gray-400"><span className="font-medium">Opcional:</span> Cliente pode pular</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 bg-primary-yellow text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar Opção
        </button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Nenhuma opção cadastrada</p>
          <p className="text-sm mt-2">Clique em &quot;Adicionar Opção&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {options.map((option, optionIndex) => {
            const optionId = option.id || `new-${optionIndex}`;
            const isExpanded = expandedOptions.has(optionId);

            return (
              <div 
                key={optionId} 
                className={`rounded-lg border-2 ${
                  option.required 
                    ? 'bg-red-950/20 border-red-500/50' 
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {/* Header da Opção */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Nome da Opção</label>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e: any) => updateOption(optionIndex, "name", (e.target as HTMLInputElement).value)}
                          placeholder="Ex: Tamanho, Adicionais, Bebida..."
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                          <select
                            value={option.type}
                            onChange={(e: any) => updateOption(optionIndex, "type", (e.target as HTMLSelectElement).value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                          >
                            <option value="single">Única Escolha</option>
                            <option value="multiple">Múltipla Escolha</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                            option.required ? 'bg-red-900/30' : 'bg-gray-700/50'
                          }`}>
                            <input
                              type="checkbox"
                              checked={option.required}
                              onChange={(e: any) => updateOption(optionIndex, "required", (e.target as HTMLInputElement).checked)}
                              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500 focus:ring-2"
                            />
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${
                                option.required ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {option.required ? 'OBRIGATÓRIO' : 'OPCIONAL'}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {option.required 
                                  ? 'Cliente deve escolher' 
                                  : 'Cliente pode pular'}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpandOption(optionId)}
                        className="p-2 hover:bg-gray-700 rounded transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        className="p-2 hover:bg-red-900 rounded transition text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Valores da Opção */}
                {isExpanded && (
                  <div className={`border-t ${option.required ? 'border-red-500/30' : 'border-gray-700'} p-4 space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-300">Valores desta Opção</h4>
                        {option.required && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                            OBRIGATÓRIO
                          </span>
                        )}
                        {!option.required && (
                          <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded font-medium">
                            OPCIONAL
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addValueToOption(optionIndex)}
                        className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar Valor
                      </button>
                    </div>

                    {option.values.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum valor cadastrado. Adicione valores para esta opção.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {option.values.map((value, valueIndex) => (
                          <div
                            key={valueIndex}
                            className="bg-gray-700 rounded p-3 grid grid-cols-1 md:grid-cols-12 gap-3"
                          >
                            <div className="md:col-span-5">
                              <label className="block text-xs text-gray-400 mb-1">Nome</label>
                              <input
                                type="text"
                                value={value.name}
                                onChange={(e: any) => updateValue(optionIndex, valueIndex, "name", (e.target as HTMLInputElement).value)}
                                placeholder="Ex: Pequeno, Bacon, Refrigerante..."
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-xs text-gray-400 mb-1">Modificador de Preço</label>
                              <input
                                type="number"
                                step="0.01"
                                value={value.price_modifier}
                                onChange={(e: any) => updateValue(optionIndex, valueIndex, "price_modifier", parseFloat((e.target as HTMLInputElement).value) || 0)}
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                              />
                            </div>
                            <div className="md:col-span-2 flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value.available}
                                  onChange={(e: any) => updateValue(optionIndex, valueIndex, "available", (e.target as HTMLInputElement).checked)}
                                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-primary-yellow"
                                />
                                <span className="text-xs text-gray-400">Disponível</span>
                              </label>
                            </div>
                            <div className="md:col-span-2 flex items-end justify-end">
                              <button
                                type="button"
                                onClick={() => removeValueFromOption(optionIndex, valueIndex)}
                                className="p-2 hover:bg-red-900 rounded transition text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {value.price_modifier !== 0 && (
                              <div className="md:col-span-12">
                                <p className="text-xs text-gray-500">
                                  {value.price_modifier > 0 ? "+" : ""}
                                  {formatCurrency(value.price_modifier)} no preço final
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {options.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={saveOptions}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-yellow text-black px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              "Salvando..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Opções
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

