"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { PaymentModal } from "@/components/payment/payment-modal";
import { useClientAuth } from "@/contexts/client-auth-context";
import { DEMO_RESTAURANT_UUID, validateRestaurantIsolation } from "@/lib/restaurant-constants";

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useClientAuth();
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Verificar se é um restaurante específico (não é o demo/versiory)
    // Se todos os produtos forem do DEMO ou não tiverem restaurant_id, não exigir login
    const produtosComRestaurante = items.filter(item => item.product.restaurant_id);
    const isDemoRestaurant = produtosComRestaurante.length === 0 || 
      produtosComRestaurante.every(item => 
        item.product.restaurant_id === DEMO_RESTAURANT_UUID
      );
    
    // Se for restaurante específico (como Tom & Jerry), exigir login do cliente
    // Mas NÃO exigir se for o Versiory (demo)
    if (!isDemoRestaurant && produtosComRestaurante.length > 0 && !authLoading && !user) {
      // Detectar slug do restaurante pelos produtos
      const restaurantId = produtosComRestaurante[0].product.restaurant_id;
      
      // Buscar slug do restaurante ou usar do localStorage
      const restaurantSlug = typeof window !== 'undefined' 
        ? localStorage.getItem('lastRestaurantContext')
        : null;
      
      if (restaurantSlug) {
        toast.error("Faça login para finalizar o pedido");
        router.push(`/restaurante/${restaurantSlug}/cliente/login`);
        return;
      } else {
        toast.error("Faça login para finalizar o pedido");
        router.push("/cliente/login");
        return;
      }
    }
    
    // Se o cliente estiver logado, preencher email automaticamente
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [user, authLoading, items, router]);

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
        
        // VALIDAÇÃO DE ISOLAMENTO: Não permitir misturar produtos com e sem restaurante
        // Isso garante que produtos do Tom & Jerry não sejam misturados com produtos do Versiory
        if (produtosSemRestaurante.length > 0) {
          toast.error("Não é possível misturar produtos de restaurantes diferentes. Por favor, faça pedidos separados.");
          return;
        }
        
        // VALIDAÇÃO ADICIONAL usando função centralizada
        const validation = validateRestaurantIsolation(
          items.map(item => ({ restaurant_id: item.product.restaurant_id })),
          restaurantId
        );
        if (!validation.valid) {
          toast.error(validation.error || "Produtos de restaurantes diferentes detectados");
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

      const orderId = result.id;
      setCurrentOrderId(orderId);
      setCurrentRestaurantId(restaurantId);

      // Salvar informações do cliente no localStorage (normalizar email para busca consistente)
      if (typeof window !== 'undefined' && formData.email) {
        const normalizedEmail = formData.email.toLowerCase().trim();
        const clientKey = `${formData.name}_${formData.phone}_${normalizedEmail}`.toLowerCase().replace(/\s+/g, '_');
        localStorage.setItem('lastOrderEmail', normalizedEmail); // Salvar email normalizado
        localStorage.setItem('lastOrderClientKey', clientKey);
        localStorage.setItem('lastOrderName', formData.name);
        localStorage.setItem('lastOrderPhone', formData.phone);
        console.log("💾 Email salvo no localStorage:", normalizedEmail);
      }

      // Se for pagamento online (pix ou card), tentar mostrar modal de pagamento
      // Se não houver configuração, será tratado como dinheiro automaticamente
      if (formData.paymentMethod === "pix" || formData.paymentMethod === "card") {
        // ISOLAMENTO: Definir restaurantId final (usar o identificado ou o demo como fallback)
        // Produtos sem restaurante sempre vão para Versiory (demo)
        const finalRestaurantId = restaurantId || DEMO_RESTAURANT_UUID;
        setCurrentRestaurantId(finalRestaurantId);
        setShowPaymentModal(true);
        // O PaymentModal vai tentar gerar o pagamento e, se não houver configuração,
        // mostrará erro e permitirá que o usuário feche o modal
      } else {
        // Se for dinheiro, limpar carrinho e redirecionar
        toast.success("Pedido realizado com sucesso!");
        clearCart();
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(`/pedidos?order=${orderId}`);
      }
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

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    // Após fechar o modal, limpar carrinho e redirecionar
    clearCart();
    
    // Verificar se é Versiory (demo) - se for, não usar contexto de restaurante
    const isDemoRestaurant = currentRestaurantId === DEMO_RESTAURANT_UUID || !currentRestaurantId;
    
    // Se for demo/versiory, limpar o contexto de restaurante do localStorage
    if (isDemoRestaurant) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lastRestaurantContext');
      }
    }
    
    // Redirecionar para página de pedidos (Versiory não precisa de contexto no URL)
    if (currentOrderId) {
      router.push(`/pedidos?order=${currentOrderId}`);
    } else {
      router.push("/pedidos");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Modal de Pagamento */}
      {showPaymentModal && currentOrderId && currentRestaurantId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          orderId={currentOrderId}
          amount={total}
          paymentMethod={formData.paymentMethod as "pix" | "card"}
          restaurantId={currentRestaurantId}
        />
      )}
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
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{mounted ? formatCurrency(subtotal) : formatCurrency(0)}</span>
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
              </div>
              <button
                type="button"
                onClick={() => router.push("/cardapio")}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-3 border border-gray-700"
              >
                <ShoppingBag className="w-5 h-5" />
                Continuar Comprando
              </button>
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

