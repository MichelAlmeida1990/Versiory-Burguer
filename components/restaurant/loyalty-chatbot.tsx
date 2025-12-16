"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Gift, Trophy, ShoppingBag, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoyaltyChatbotProps {
  primaryColor?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

const LOYALTY_INFO = {
  title: "Programa de Fidelidade",
  description: "Ganhe selos a cada pedido e troque por produtos!",
  rules: [
    {
      question: "Como ganho selos?",
      answer: "Em cada pedido acima de R$ 50,00 em produtos, você ganha um selo especial!",
    },
    {
      question: "Quantos selos preciso juntar?",
      answer: "Junte 10 selos e troque por um de nossos produtos do menu Troca Fidelidade.",
    },
    {
      question: "A taxa de entrega conta?",
      answer: "Não! As taxas de entrega do delivery não são consideradas para o cálculo do valor mínimo.",
    },
    {
      question: "Onde vejo meus selos?",
      answer: "Seus selos aparecem automaticamente no seu perfil após cada pedido qualificado.",
    },
    {
      question: "Como faço a troca?",
      answer: "Quando você tiver 10 selos, escolha um produto do menu Troca Fidelidade no carrinho!",
    },
  ],
};

export function LoyaltyChatbot({ primaryColor = "#dc2626" }: LoyaltyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! 👋 Sou o assistente do Programa de Fidelidade. Posso te ajudar a entender como funciona?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const findAnswer = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    // Buscar resposta específica para a pergunta exata
    for (const rule of LOYALTY_INFO.rules) {
      const questionLower = rule.question.toLowerCase();
      // Se a pergunta do usuário contém palavras-chave da pergunta da regra
      const questionKeywords = questionLower.split(" ").filter(k => k.length > 3);
      if (questionKeywords.some(keyword => lowerText.includes(keyword))) {
        return rule.answer;
      }
    }
    
    // Busca genérica por palavras-chave
    if (lowerText.includes("ganho") && (lowerText.includes("selo") || lowerText.includes("selos"))) {
      return LOYALTY_INFO.rules.find(r => r.question.includes("ganho"))?.answer || null;
    }
    if (lowerText.includes("quantos") && lowerText.includes("selo")) {
      return LOYALTY_INFO.rules.find(r => r.question.includes("Quantos"))?.answer || null;
    }
    if (lowerText.includes("taxa") || lowerText.includes("entrega")) {
      return LOYALTY_INFO.rules.find(r => r.question.includes("taxa"))?.answer || null;
    }
    if (lowerText.includes("vejo") || lowerText.includes("meus selos")) {
      return LOYALTY_INFO.rules.find(r => r.question.includes("vejo"))?.answer || null;
    }
    if (lowerText.includes("troca") || lowerText.includes("trocar")) {
      return LOYALTY_INFO.rules.find(r => r.question.includes("troca"))?.answer || null;
    }
    
    return null;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Responder após um delay
    setTimeout(() => {
      const answer = findAnswer(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answer || 
          "Para mais informações sobre o Programa de Fidelidade:\n\n" +
          "• Ganhe 1 selo em pedidos acima de R$ 50,00\n" +
          "• Junte 10 selos para trocar\n" +
          "• Taxa de entrega não conta\n\n" +
          "Digite uma palavra-chave como 'selo', 'troca' ou 'fidelidade' para mais detalhes! 😊",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    sendMessage(text);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Botão Flutuante com Avatar do Jerry */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
        {/* Texto indicativo de fidelidade */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-200 mr-2"
          >
            <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">
              💎 Programa de Fidelidade
            </p>
            <p className="text-xs text-gray-500">Clique para saber mais!</p>
          </motion.div>
        )}
        
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-20 h-20 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white transition-all relative group"
          style={{ backgroundColor: primaryColor }}
          aria-label="Abrir chat de fidelidade"
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
                className="relative w-full h-full"
              >
                <Image
                  src="/images/banners/jerry2.jpg"
                  alt="Jerry - Assistente de Fidelidade"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {/* Badge de notificação */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <Gift className="w-3 h-3 text-yellow-900" />
                </motion.div>
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
            className="fixed bottom-24 right-6 z-[100] w-96 h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2"
            style={{ borderColor: primaryColor }}
          >
            {/* Header com Avatar do Jerry */}
            <div
              className="p-4 text-white flex items-center justify-between relative overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0"
                >
                  <Image
                    src="/images/banners/jerry2.jpg"
                    alt="Jerry"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">Jerry - Programa de Fidelidade</h3>
                  <p className="text-xs opacity-90 flex items-center gap-1">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                      <Image
                        src="/images/banners/jerry2.jpg"
                        alt="Jerry"
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
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
                    <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: message.sender === "user" ? "white" : "#1f2937" }}>
                      {message.text}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-xs font-bold">VC</span>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="p-3 bg-gray-100 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2 px-2">
                Perguntas rápidas:
              </p>
              <div className="flex flex-wrap gap-2">
                {LOYALTY_INFO.rules.slice(0, 3).map((rule, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(rule.question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:border-gray-400 transition-colors text-gray-700"
                  >
                    {rule.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm"
                  style={{ focusRingColor: primaryColor }}
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
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

