/**
 * Detecção de Intenções do Chatbot
 * Identifica o que o usuário quer fazer baseado na mensagem
 */

export type Intent =
  | 'greeting'           // Saudação
  | 'menu_request'       // Pedir cardápio
  | 'product_search'     // Buscar produto
  | 'product_details'   // Detalhes de produto
  | 'price_inquiry'      // Consultar preço
  | 'delivery_info'      // Informações de entrega
  | 'payment_info'       // Informações de pagamento
  | 'loyalty_info'       // Programa de fidelidade
  | 'place_order'        // Fazer pedido
  | 'contact_info'       // Informações de contato
  | 'help'               // Ajuda
  | 'promotions'         // Promoções
  | 'add_to_cart'        // Adicionar ao carrinho
  | 'view_cart'          // Ver carrinho
  | 'checkout'           // Finalizar pedido
  | 'unknown';           // Não reconhecido

export interface DetectedIntent {
  intent: Intent;
  confidence: number;
  entities?: {
    product?: string;
    category?: string;
    neighborhood?: string;
    city?: string;
    quantity?: number;
    price?: number;
  };
}

export function detectIntent(message: string): DetectedIntent {
  const lower = message.toLowerCase().trim();
  
  // Greeting
  if (lower.match(/\b(oi|olá|ola|hey|e aí|eai|bom dia|boa tarde|boa noite|hello|hi)\b/)) {
    return { intent: 'greeting', confidence: 0.9 };
  }
  
  // Menu request
  if (lower.match(/\b(cardápio|cardapio|menu|produtos|o que tem|o que vocês têm|o que voces tem|ver produtos|listar produtos)\b/)) {
    return { intent: 'menu_request', confidence: 0.95 };
  }
  
  // Product search
  if (lower.match(/\b(tem|vocês têm|voces tem|buscar|procurar|quero|gostaria|preciso|preciso de|tem alguma)\b/)) {
    const productMatch = lower.match(/(?:tem|buscar|procurar|quero|gostaria|preciso)\s+(.+)/);
    if (productMatch) {
      return {
        intent: 'product_search',
        confidence: 0.85,
        entities: { product: productMatch[1].trim() }
      };
    }
    return { intent: 'product_search', confidence: 0.7 };
  }
  
  // Price inquiry
  if (lower.match(/\b(preço|preco|quanto custa|valor|quanto é|quanto sai|quanto vale|preço de|valor de)\b/)) {
    const priceMatch = lower.match(/(?:preço|preco|quanto custa|valor|quanto é|quanto sai)\s+(?:a|o|de|da|do)?\s*(.+)/);
    if (priceMatch) {
      return {
        intent: 'price_inquiry',
        confidence: 0.9,
        entities: { product: priceMatch[1].trim() }
      };
    }
    return { intent: 'price_inquiry', confidence: 0.7 };
  }
  
  // Delivery info
  if (lower.match(/\b(frete|entrega|entregam|bairro|delivery|quanto é o frete|valor do frete|frete para|entregam em)\b/)) {
    const deliveryMatch = lower.match(/(?:frete|entrega|entregam)\s+(?:para|em|no|na)?\s*(.+)/);
    if (deliveryMatch) {
      const location = deliveryMatch[1].trim();
      // Tentar extrair bairro e cidade
      const parts = location.split(',').map(p => p.trim());
      return {
        intent: 'delivery_info',
        confidence: 0.85,
        entities: {
          neighborhood: parts[0],
          city: parts[1] || 'Rio Grande da Serra'
        }
      };
    }
    return { intent: 'delivery_info', confidence: 0.8 };
  }
  
  // Payment info
  if (lower.match(/\b(pagamento|pix|cartão|cartao|dinheiro|aceita|formas de pagamento|como pagar|meio de pagamento)\b/)) {
    return { intent: 'payment_info', confidence: 0.9 };
  }
  
  // Loyalty info
  if (lower.match(/\b(fidelidade|selo|selos|pontos|troca|programa de fidelidade|como ganho selos|quantos selos)\b/)) {
    return { intent: 'loyalty_info', confidence: 0.95 };
  }
  
  // Place order
  if (lower.match(/\b(pedido|pedir|quero pedir|fazer pedido|comprar|quero comprar|vou pedir|fazer um pedido)\b/)) {
    return { intent: 'place_order', confidence: 0.9 };
  }
  
  // Contact info
  if (lower.match(/\b(contato|telefone|endereço|endereco|onde|localização|localizacao|endereço da loja|telefone da loja|como chegar)\b/)) {
    return { intent: 'contact_info', confidence: 0.9 };
  }
  
  // Help
  if (lower.match(/\b(ajuda|help|não entendi|não entendo|como funciona|o que você faz|o que voce faz|pode me ajudar)\b/)) {
    return { intent: 'help', confidence: 0.9 };
  }
  
  // Promotions
  if (lower.match(/\b(promoção|promocao|promo|desconto|oferta|especial|combo)\b/)) {
    return { intent: 'promotions', confidence: 0.85 };
  }
  
  // Add to cart
  if (lower.match(/\b(adicionar|adiciona|colocar|coloca|quero|vou querer|vou levar)\b/)) {
    const addMatch = lower.match(/(?:adicionar|adiciona|colocar|coloca|quero|vou querer|vou levar)\s+(.+)/);
    if (addMatch) {
      return {
        intent: 'add_to_cart',
        confidence: 0.8,
        entities: { product: addMatch[1].trim() }
      };
    }
    return { intent: 'add_to_cart', confidence: 0.7 };
  }
  
  // View cart
  if (lower.match(/\b(carrinho|meu pedido|pedido atual|o que tenho|itens|ver carrinho)\b/)) {
    return { intent: 'view_cart', confidence: 0.9 };
  }
  
  // Checkout
  if (lower.match(/\b(finalizar|finalizar pedido|concluir|concluir pedido|fechar pedido|confirmar pedido)\b/)) {
    return { intent: 'checkout', confidence: 0.95 };
  }
  
  // Product details (quando menciona nome específico de produto)
  const productKeywords = ['pizza', 'bebida', 'refrigerante', 'suco', 'sobremesa', 'doce'];
  if (productKeywords.some(keyword => lower.includes(keyword))) {
    return {
      intent: 'product_details',
      confidence: 0.7,
      entities: { product: lower }
    };
  }
  
  return { intent: 'unknown', confidence: 0.1 };
}

