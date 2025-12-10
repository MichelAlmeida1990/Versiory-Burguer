"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [deliveryFee] = useState(5.0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    complement: "",
    neighborhood: "",
    city: "",
    zipCode: "",
    paymentMethod: "pix" as "card" | "pix" | "cash",
    deliveryType: "delivery" as "delivery" | "pickup",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = mounted ? getTotal() : 0;
  const total = subtotal + (formData.deliveryType === "delivery" ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }

    // Validar campos obrigatórios
    if (!formData.name || !formData.phone) {
      toast.error("Preencha nome e telefone");
      return;
    }

    // Email é obrigatório para identificar pedidos do cliente
    if (!formData.email || !formData.email.trim()) {
      toast.error("O email é obrigatório para acompanhar seus pedidos");
      return;
    }

    if (formData.deliveryType === "delivery" && !formData.address) {
      toast.error("Preencha o endereço de entrega");
      return;
    }

    // Desabilitar o botão de submit para evitar múltiplos envios
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processando...";
    }

    try {
      // Identificar restaurante pelos produtos do carrinho
      // VALIDAÇÃO: Garantir que todos os produtos pertencem ao mesmo restaurante
      const produtosComRestaurante = items.filter(item => item.product.restaurant_id);
      const produtosSemRestaurante = items.filter(item => !item.product.restaurant_id);
      
      let restaurantId: string | null = null;
      
      if (produtosComRestaurante.length > 0) {
        // Se tem produtos com restaurante, usar o restaurante deles
        restaurantId = produtosComRestaurante[0].product.restaurant_id || null;
        
        // Verificar se TODOS os produtos com restaurante pertencem ao MESMO restaurante
        const todosMesmoRestaurante = produtosComRestaurante.every(
          item => item.product.restaurant_id === restaurantId
        );
        
        if (!todosMesmoRestaurante) {
          toast.error("Os produtos selecionados são de restaurantes diferentes. Por favor, adicione apenas produtos do mesmo restaurante.");
          return;
        }
        
        // Não permitir misturar produtos com e sem restaurante
        if (produtosSemRestaurante.length > 0) {
          toast.error("Não é possível misturar produtos antigos com produtos novos. Por favor, faça pedidos separados.");
          return;
        }
        
        console.log("✅ Restaurante identificado pelos produtos:", restaurantId);
      } else if (produtosSemRestaurante.length > 0) {
        // Se todos os produtos são antigos, a API vai buscar automaticamente o UUID do demo@versiory.com.br
        // (que é o dono dos produtos antigos)
        restaurantId = null; // Deixar a API identificar automaticamente
        console.log("⚠️ Pedido com produtos antigos, API vai identificar o restaurante automaticamente");
      }

      // Criar pedido no Supabase
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: (item as any).calculatedPrice || item.product.price,
            observations: item.observations,
            selectedOptions: item.selectedOptions || [],
          })),
          total: formData.paymentMethod === "pix" ? total * 0.95 : total,
          delivery_fee: formData.deliveryType === "delivery" ? deliveryFee : 0,
          restaurant_id: restaurantId, // Enviar restaurant_id se identificado
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Erro ao criar pedido");
      }

      if (!result || !result.id) {
        throw new Error("Resposta inválida do servidor");
      }

      // Salvar informações do cliente no localStorage para filtrar pedidos depois
      // Usar uma chave única baseada em nome+telefone+email para evitar conflitos
      if (typeof window !== 'undefined' && formData.email) {
        const clientKey = `${formData.name}_${formData.phone}_${formData.email}`.toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem('lastOrderEmail', formData.email);
        localStorage.setItem('lastOrderClientKey', clientKey);
        localStorage.setItem('lastOrderName', formData.name);
        localStorage.setItem('lastOrderPhone', formData.phone);
      }

      // Limpar carrinho antes de redirecionar
      clearCart();
      
      // Mostrar mensagem de sucesso
      toast.success("Pedido realizado com sucesso!");
      
      // Aguardar um pouco antes de redirecionar para garantir que o toast apareça
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirecionar usando window.location para garantir que funcione
      window.location.href = `/pedidos/${result.id}`;
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      toast.error(error.message || "Erro ao finalizar pedido. Tente novamente.");
      
      // Reabilitar o botão em caso de erro
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Confirmar Pedido";
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tipo de Entrega */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Tipo de Entrega</h2>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <label className="flex-1">
                  <input
                    type="radio"
                    value="delivery"
                    checked={formData.deliveryType === "delivery"}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryType: e.target.value as "delivery" | "pickup" })
                    }
                    className="mr-2"
                  />
                  Entrega
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    value="pickup"
                    checked={formData.deliveryType === "pickup"}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryType: e.target.value as "delivery" | "pickup" })
                    }
                    className="mr-2"
                  />
                  Retirada no Balcão
                </label>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obrigatório para acompanhar seus pedidos
                  </p>
                </div>
              </div>
            </div>

            {/* Endereço (se delivery) */}
            {formData.deliveryType === "delivery" && (
              <div className="bg-gray-900 rounded-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Endereço de Entrega</h2>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      placeholder="00000-000"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Rua, Avenida, etc"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={formData.complement}
                        onChange={(e) =>
                          setFormData({ ...formData, complement: e.target.value })
                        }
                        placeholder="Apto, Bloco, etc"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.neighborhood}
                        onChange={(e) =>
                          setFormData({ ...formData, neighborhood: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Método de Pagamento */}
            <div className="bg-gray-900 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Método de Pagamento</h2>
              <div className="space-y-2 md:space-y-3">
                <label className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input
                    type="radio"
                    value="pix"
                    checked={formData.paymentMethod === "pix"}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as "pix" })
                    }
                    className="mr-3"
                  />
                  <span className="font-medium">PIX (5% de desconto)</span>
                </label>
                <label className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input
                    type="radio"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as "card" })
                    }
                    className="mr-3"
                  />
                  <span className="font-medium">Cartão de Crédito/Débito</span>
                </label>
                <label className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input
                    type="radio"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as "cash" })
                    }
                    className="mr-3"
                  />
                  <span className="font-medium">Dinheiro na Entrega</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-4 md:p-6 lg:sticky lg:top-20 lg:top-24">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Resumo</h2>
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {mounted ? (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {formData.deliveryType === "delivery" && (
                      <div className="flex justify-between text-gray-400">
                        <span>Taxa de Entrega</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                    )}
                    {formData.paymentMethod === "pix" && (
                      <div className="flex justify-between text-green-400">
                        <span>Desconto PIX</span>
                        <span>-{formatCurrency(total * 0.05)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary-yellow">
                        {formatCurrency(
                          formData.paymentMethod === "pix" ? total * 0.95 : total
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-400">
                    <span>Carregando...</span>
                    <span>R$ 0,00</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-lg font-bold transition"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

