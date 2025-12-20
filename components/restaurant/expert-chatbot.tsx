"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Gift, ShoppingBag, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { detectIntent, DetectedIntent } from "@/lib/chatbot/intent-detector";
import {
  getCategories,
  getProducts,
  getProductsByCategory,
  searchProducts,
  getProductByName,
  getDeliveryInfo,
  getDeliveryAreas,
  getRestaurantInfo,
  formatCategoriesMessage,
  formatProductsList,
  formatProductDetails,
  formatDeliveryMessage,
  formatDeliveryAreasMessage,
  formatPaymentMethodsMessage,
  formatLoyaltyProgramMessage,
  formatContactMessage,
  getWelcomeMessage,
  getHelpMessage,
  getDefaultResponse,
} from "@/lib/chatbot/knowledge-base";
import { useCartStore } from "@/store/cart-store";
import { Product, Category } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

interface ExpertChatbotProps {
  primaryColor?: string;
  restaurantId?: string;
  restaurantName?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

type ChatState =
  | 'welcome'
  | 'menu'
  | 'product_details'
  | 'cart'
  | 'checkout'
  | 'delivery_info'
  | 'payment_info'
  | 'loyalty_info'
  | 'help'
  | 'search';

interface ChatContext {
  state: ChatState;
  currentProduct?: Product;
  currentCategory?: Category;
  searchQuery?: string;
}

export function ExpertChatbot({
  primaryColor = "#dc2626",
  restaurantId,
  restaurantName = "Tom & Jerry Pizzaria"
}: ExpertChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: getWelcomeMessage(restaurantName),
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({ state: 'welcome' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, addItem, getTotal } = useCartStore();

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // Detectar intenção
      const detected: DetectedIntent = detectIntent(text);
      
      // Processar baseado na intenção
      await handleIntent(detected, text);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      addBotMessage("Desculpe, ocorreu um erro. Tente novamente! 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleIntent = async (detected: DetectedIntent, originalText: string) => {
    if (!restaurantId) {
      addBotMessage("Desculpe, não consegui identificar o restaurante. Por favor, recarregue a página.");
      return;
    }

    switch (detected.intent) {
      case 'greeting':
        addBotMessage(getWelcomeMessage(restaurantName));
        setContext({ state: 'welcome' });
        break;

      case 'menu_request':
        await handleMenuRequest(restaurantId);
        break;

      case 'product_search':
        await handleProductSearch(detected.entities?.product || originalText, restaurantId);
        break;

      case 'product_details':
      case 'price_inquiry':
        await handleProductDetails(detected.entities?.product || originalText, restaurantId);
        break;

      case 'delivery_info':
        await handleDeliveryInfo(
          detected.entities?.neighborhood || originalText,
          detected.entities?.city || 'Rio Grande da Serra',
          restaurantId
        );
        break;

      case 'payment_info':
        addBotMessage(formatPaymentMethodsMessage());
        setContext({ state: 'payment_info' });
        break;

      case 'loyalty_info':
        addBotMessage(formatLoyaltyProgramMessage());
        setContext({ state: 'loyalty_info' });
        break;

      case 'contact_info':
        await handleContactInfo(restaurantId);
        break;

      case 'help':
        addBotMessage(getHelpMessage());
        setContext({ state: 'help' });
        break;

      case 'add_to_cart':
        await handleAddToCart(detected.entities?.product || originalText, restaurantId);
        break;

      case 'view_cart':
        await handleViewCart();
        break;

      case 'place_order':
        addBotMessage("Para fazer um pedido, adicione produtos ao carrinho e depois vá para o checkout! 🛒\n\nDigite 'menu' para ver nosso cardápio.");
        break;

      default:
        addBotMessage(getDefaultResponse());
    }
  };

  const handleMenuRequest = async (restaurantId: string) => {
    const categories = await getCategories(restaurantId);
    if (categories.length === 0) {
      addBotMessage("Desculpe, não há categorias disponíveis no momento. 😔");
      return;
    }
    
    addBotMessage(formatCategoriesMessage(categories));
    setContext({ state: 'menu' });
  };

  const handleProductSearch = async (query: string, restaurantId: string) => {
    if (!query || query.trim().length < 2) {
      addBotMessage("Por favor, me diga qual produto você está procurando. Por exemplo: 'tem pizza de calabresa?'");
      return;
    }

    const products = await searchProducts(query, restaurantId);
    if (products.length === 0) {
      addBotMessage(`Não encontrei produtos com "${query}". 😔\n\nTente buscar de outra forma ou digite "menu" para ver todas as categorias.`);
      return;
    }

    addBotMessage(formatProductsList(products));
    setContext({ state: 'search', searchQuery: query });
  };

  const handleProductDetails = async (productName: string, restaurantId: string) => {
    if (!productName || productName.trim().length < 2) {
      addBotMessage("Qual produto você gostaria de ver?");
      return;
    }

    const product = await getProductByName(productName, restaurantId);
    if (!product) {
      // Tentar busca mais ampla
      const products = await searchProducts(productName, restaurantId);
      if (products.length > 0) {
        addBotMessage(formatProductsList(products));
        return;
      }
      addBotMessage(`Não encontrei o produto "${productName}". 😔\n\nDigite "menu" para ver nosso cardápio completo.`);
      return;
    }

    addBotMessage(formatProductDetails(product));
    setContext({ state: 'product_details', currentProduct: product });
  };

  const handleDeliveryInfo = async (
    neighborhood: string,
    city: string,
    restaurantId: string
  ) => {
    // Se não tem bairro específico, mostrar todas as áreas
    if (!neighborhood || neighborhood.length < 2) {
      const areas = await getDeliveryAreas(restaurantId);
      addBotMessage(formatDeliveryAreasMessage(areas));
      setContext({ state: 'delivery_info' });
      return;
    }

    // Buscar frete específico
    const delivery = await getDeliveryInfo(neighborhood, city, restaurantId);
    addBotMessage(formatDeliveryMessage(delivery, neighborhood, city));
    setContext({ state: 'delivery_info' });
  };

  const handleContactInfo = async (restaurantId: string) => {
    const info = await getRestaurantInfo(restaurantId);
    if (!info) {
      addBotMessage("Desculpe, não consegui buscar as informações de contato. 😔");
      return;
    }
    addBotMessage(formatContactMessage(info));
    setContext({ state: 'help' });
  };

  const handleAddToCart = async (productName: string, restaurantId: string) => {
    const product = await getProductByName(productName, restaurantId);
    if (!product) {
      addBotMessage(`Não encontrei o produto "${productName}". 😔\n\nDigite "menu" para ver nosso cardápio.`);
      return;
    }

    addItem(product, 1);
    addBotMessage(`✅ ${product.name} adicionado ao carrinho!\n\n💰 Preço: ${formatCurrency(product.price)}\n\nDeseja adicionar mais algo ou ver o carrinho?`);
    setContext({ state: 'cart', currentProduct: product });
  };

  const handleViewCart = async () => {
    if (items.length === 0) {
      addBotMessage("🛒 Seu carrinho está vazio.\n\nDigite 'menu' para ver o cardápio e adicionar produtos!");
      return;
    }

    const itemsText = items.map((item, index) => {
      const price = (item as any).calculatedPrice || item.product.price;
      return `${index + 1}. ${item.quantity}x ${item.product.name} - ${formatCurrency(price * item.quantity)}`;
    }).join('\n');

    const total = getTotal();

    addBotMessage(`🛒 *SEU CARRINHO*\n\n${itemsText}\n\n💰 *TOTAL:* ${formatCurrency(total)}\n\nPara finalizar seu pedido, vá para o checkout!`);
    setContext({ state: 'cart' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || loading) return;
    const text = inputValue;
    setInputValue("");
    processMessage(text);
  };

  const handleQuickAction = (action: string) => {
    processMessage(action);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[99] flex flex-col items-end gap-2 max-w-[calc(100vw-1rem)] sm:max-w-none">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg border border-gray-200 mr-0 sm:mr-2 hidden sm:block"
          >
            <p className="text-[10px] sm:text-xs font-semibold text-gray-700 whitespace-nowrap">
              🤖 Assistente Expert
            </p>
            <p className="text-[9px] sm:text-xs text-gray-500">Clique para conversar!</p>
          </motion.div>
        )}

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white transition-all relative group"
          style={{ backgroundColor: primaryColor }}
          aria-label="Abrir chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-2 left-2 sm:left-auto sm:right-6 sm:w-96 z-[100] h-[calc(100vh-5rem)] sm:h-[600px] sm:max-h-[calc(100vh-8rem)] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2"
            style={{ borderColor: primaryColor }}
          >
            {/* Header */}
            <div
              className="p-4 text-white flex items-center justify-between relative overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0 bg-white flex items-center justify-center"
                >
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-sm sm:text-lg">Jerry - Assistente Expert</h3>
                  <p className="text-[10px] sm:text-xs opacity-90 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online agora
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-1.5 sm:gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] sm:max-w-[75%] rounded-lg sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-3 ${
                      message.sender === "user"
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm bg-white shadow-sm"
                    }`}
                    style={
                      message.sender === "user"
                        ? {
                            backgroundColor: primaryColor,
                          }
                        : {}
                    }
                  >
                    <p
                      className="text-xs sm:text-sm whitespace-pre-line leading-relaxed"
                      style={{ color: message.sender === "user" ? "white" : "#1f2937" }}
                    >
                      {message.text}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-[9px] sm:text-xs font-bold">VC</span>
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-2 sm:p-3 bg-gray-100 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2 px-1 sm:px-2">
                Ações rápidas:
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleQuickAction('menu')}
                  className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 whitespace-nowrap"
                >
                  🍕 Ver Cardápio
                </button>
                <button
                  onClick={() => handleQuickAction('carrinho')}
                  className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 whitespace-nowrap"
                >
                  🛒 Ver Carrinho
                </button>
                <button
                  onClick={() => handleQuickAction('frete')}
                  className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 whitespace-nowrap"
                >
                  🚚 Frete
                </button>
                <button
                  onClick={() => handleQuickAction('ajuda')}
                  className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 whitespace-nowrap"
                >
                  ❓ Ajuda
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="p-2 sm:p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-1.5 sm:gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !loading && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  disabled={loading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-0 text-xs sm:text-sm disabled:opacity-50"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

