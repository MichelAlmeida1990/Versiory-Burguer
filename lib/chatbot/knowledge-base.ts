/**
 * Base de Conhecimento do Chatbot
 * Acessa dados do banco para responder perguntas
 */

import { supabase, Product, Category, DeliveryArea } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export interface RestaurantInfo {
  name: string;
  address: string;
  phone_1?: string;
  phone_2?: string;
  phone_3?: string;
  instagram?: string;
  facebook?: string;
}

/**
 * Busca categorias do restaurante
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('order');
  
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Busca produtos do restaurante
 */
export async function getProducts(restaurantId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Busca produtos por categoria
 */
export async function getProductsByCategory(
  categoryId: string,
  restaurantId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Busca produto por nome
 */
export async function searchProducts(
  query: string,
  restaurantId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Busca produto específico
 */
export async function getProductByName(
  productName: string,
  restaurantId: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .ilike('name', `%${productName}%`)
    .single();
  
  if (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
  
  return data;
}

/**
 * Busca informações de frete
 */
export async function getDeliveryInfo(
  neighborhood: string,
  city: string,
  restaurantId: string
): Promise<{ found: boolean; fee: number; area?: DeliveryArea }> {
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('city', city)
    .ilike('neighborhood', `%${neighborhood}%`)
    .eq('active', true)
    .single();
  
  if (error || !data) {
    return {
      found: false,
      fee: 5.00 // Frete padrão
    };
  }
  
  return {
    found: true,
    fee: Number(data.delivery_fee),
    area: data
  };
}

/**
 * Busca todas as áreas de entrega
 */
export async function getDeliveryAreas(restaurantId: string): Promise<DeliveryArea[]> {
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('active', true)
    .order('city')
    .order('neighborhood');
  
  if (error) {
    console.error('Erro ao buscar áreas de entrega:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Busca informações do restaurante
 */
export async function getRestaurantInfo(restaurantId: string): Promise<RestaurantInfo | null> {
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .single();
  
  if (error) {
    console.error('Erro ao buscar informações do restaurante:', error);
    return null;
  }
  
  return {
    name: data.name || 'Pizzaria',
    address: data.address || '',
    phone_1: data.phone_1,
    phone_2: data.phone_2,
    phone_3: data.phone_3,
    instagram: data.instagram,
    facebook: data.facebook
  };
}

/**
 * Formata lista de categorias
 */
export function formatCategoriesMessage(categories: Category[]): string {
  if (categories.length === 0) {
    return 'Desculpe, não há categorias disponíveis no momento. 😔';
  }
  
  const list = categories.map((cat, index) => 
    `${index + 1}. ${cat.name}`
  ).join('\n');
  
  return `🍕 *NOSSO CARDÁPIO*\n\n${list}\n\nDigite o número ou nome da categoria para ver os produtos!`;
}

/**
 * Formata lista de produtos
 */
export function formatProductsList(products: Product[]): string {
  if (products.length === 0) {
    return 'Não encontrei produtos. 😔\n\nTente buscar de outra forma ou digite "menu" para ver todas as categorias.';
  }
  
  if (products.length === 1) {
    const product = products[0];
    return formatProductDetails(product);
  }
  
  const list = products.slice(0, 10).map((product, index) => 
    `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`
  ).join('\n');
  
  const more = products.length > 10 ? `\n\n... e mais ${products.length - 10} produtos!` : '';
  
  return `📦 *PRODUTOS ENCONTRADOS*\n\n${list}${more}\n\nDigite o número ou nome do produto para ver detalhes!`;
}

/**
 * Formata detalhes de um produto
 */
export function formatProductDetails(product: Product): string {
  return `🍕 *${product.name.toUpperCase()}*\n\n` +
         `*Descrição:*\n${product.description || 'Sem descrição'}\n\n` +
         `*Preço:* ${formatCurrency(product.price)}\n\n` +
         `O que você gostaria de fazer?\n` +
         `• ➕ Adicionar ao carrinho\n` +
         `• 🔙 Voltar ao cardápio`;
}

/**
 * Formata informações de frete
 */
export function formatDeliveryMessage(
  delivery: { found: boolean; fee: number; area?: DeliveryArea },
  neighborhood?: string,
  city?: string
): string {
  if (delivery.found && delivery.area) {
    return `🚚 *FRETE CALCULADO*\n\n` +
           `📍 *${delivery.area.neighborhood}, ${delivery.area.city}*\n` +
           `💰 Frete: ${formatCurrency(delivery.fee)}\n\n` +
           `*Tempo estimado:* 30-45 minutos\n\n` +
           `Deseja fazer um pedido?`;
  }
  
  const location = neighborhood && city 
    ? `${neighborhood}, ${city}`
    : neighborhood || 'seu bairro';
  
  return `🚚 *FRETE*\n\n` +
         `📍 *${location}*\n` +
         `💰 Frete padrão: ${formatCurrency(delivery.fee)}\n\n` +
         `*Tempo estimado:* 30-45 minutos\n\n` +
         `Deseja fazer um pedido?`;
}

/**
 * Formata áreas de entrega
 */
export function formatDeliveryAreasMessage(areas: DeliveryArea[]): string {
  if (areas.length === 0) {
    return `🚚 *FRETE E ENTREGA*\n\n` +
           `Entregamos em toda a região!\n\n` +
           `*Frete padrão:* R$ 5,00\n` +
           `*Tempo estimado:* 30-45 minutos\n\n` +
           `Qual seu bairro? Posso calcular o frete exato para você!`;
  }
  
  // Agrupar por cidade
  const byCity = areas.reduce((acc, area) => {
    if (!acc[area.city]) {
      acc[area.city] = [];
    }
    acc[area.city].push(area);
    return acc;
  }, {} as Record<string, DeliveryArea[]>);
  
  let message = `🚚 *FRETE E ENTREGA*\n\n`;
  message += `Entregamos em ${Object.keys(byCity).join(' e ')}!\n\n`;
  
  Object.entries(byCity).forEach(([city, cityAreas]) => {
    message += `📍 *${city}:*\n`;
    cityAreas.forEach(area => {
      message += `• ${area.neighborhood} - ${formatCurrency(Number(area.delivery_fee))}\n`;
    });
    message += '\n';
  });
  
  message += `*Outros bairros:* ${formatCurrency(5.00)} (frete padrão)\n\n`;
  message += `*Tempo estimado:* 30-45 minutos\n\n`;
  message += `Qual seu bairro? Posso calcular o frete exato para você!`;
  
  return message;
}

/**
 * Formata informações de pagamento
 */
export function formatPaymentMethodsMessage(): string {
  return `💳 *FORMAS DE PAGAMENTO*\n\n` +
         `Aceitamos as seguintes formas de pagamento:\n\n` +
         `• 💰 PIX - 5% de desconto\n` +
         `• 💳 Cartão de Crédito/Débito\n` +
         `• 💵 Dinheiro na Entrega\n\n` +
         `*Desconto PIX:*\n` +
         `Ganhe 5% de desconto pagando com PIX!\n\n` +
         `Exemplo: Pedido de R$ 100,00\n` +
         `• Com PIX: R$ 95,00\n` +
         `• Outras formas: R$ 100,00\n\n` +
         `Qual forma de pagamento você prefere?`;
}

/**
 * Formata informações de fidelidade
 */
export function formatLoyaltyProgramMessage(): string {
  return `💎 *PROGRAMA DE FIDELIDADE*\n\n` +
         `Ganhe selos a cada pedido e troque por produtos!\n\n` +
         `*Como funciona:*\n` +
         `• Em cada pedido acima de R$ 50,00 em produtos, você ganha 1 selo\n` +
         `• Junte 10 selos e troque por um produto do menu Troca Fidelidade\n` +
         `• Taxa de entrega NÃO conta para o valor mínimo\n\n` +
         `*Onde vejo meus selos?*\n` +
         `Seus selos aparecem automaticamente no seu perfil após cada pedido qualificado.\n\n` +
         `*Como faço a troca?*\n` +
         `Quando você tiver 10 selos, escolha um produto do menu Troca Fidelidade no carrinho!\n\n` +
         `Tem mais alguma dúvida sobre o programa?`;
}

/**
 * Formata informações de contato
 */
export function formatContactMessage(info: RestaurantInfo): string {
  let message = `📞 *CONTATO*\n\n`;
  
  if (info.address) {
    message += `*Endereço:*\n${info.address}\n\n`;
  }
  
  if (info.phone_1 || info.phone_2 || info.phone_3) {
    message += `*Telefones:*\n`;
    if (info.phone_1) message += `• ${info.phone_1}\n`;
    if (info.phone_2) message += `• ${info.phone_2}\n`;
    if (info.phone_3) message += `• ${info.phone_3}\n`;
    message += '\n';
  }
  
  if (info.instagram || info.facebook) {
    message += `*Redes Sociais:*\n`;
    if (info.instagram) message += `• Instagram: ${info.instagram}\n`;
    if (info.facebook) message += `• Facebook: ${info.facebook}\n`;
    message += '\n';
  }
  
  message += `Precisa de mais alguma informação?`;
  
  return message;
}

/**
 * Mensagem de boas-vindas
 */
export function getWelcomeMessage(restaurantName: string = 'Tom & Jerry Pizzaria'): string {
  return `Olá! 👋 Sou o Jerry, assistente da ${restaurantName}!\n\n` +
         `Como posso te ajudar hoje? 🍕\n\n` +
         `Você pode:\n` +
         `• Ver nosso cardápio completo\n` +
         `• Buscar um produto específico\n` +
         `• Saber mais sobre frete e entrega\n` +
         `• Conhecer nosso programa de fidelidade\n` +
         `• Fazer um pedido\n` +
         `• Falar com atendimento\n\n` +
         `O que você gostaria de fazer?`;
}

/**
 * Mensagem de ajuda
 */
export function getHelpMessage(): string {
  return `❓ *COMO POSSO TE AJUDAR?*\n\n` +
         `Eu sou o Jerry, seu assistente especialista! Posso te ajudar com:\n\n` +
         `• 🍕 Ver cardápio e produtos\n` +
         `• 🔍 Buscar produtos específicos\n` +
         `• 💰 Consultar preços\n` +
         `• 🚚 Calcular frete\n` +
         `• 💳 Informações de pagamento\n` +
         `• 💎 Programa de fidelidade\n` +
         `• 📞 Contato e endereço\n` +
         `• 🛒 Fazer pedidos\n\n` +
         `Basta me perguntar! Por exemplo:\n` +
         `• "Quero ver o cardápio"\n` +
         `• "Tem pizza de calabresa?"\n` +
         `• "Qual o frete para o centro?"\n` +
         `• "Como funciona o programa de fidelidade?"`;
}

/**
 * Mensagem padrão quando não entende
 */
export function getDefaultResponse(): string {
  return `Desculpe, não entendi muito bem. 😔\n\n` +
         `Posso te ajudar com:\n` +
         `• Ver cardápio (digite "menu")\n` +
         `• Buscar produtos (digite "tem pizza de...?")\n` +
         `• Calcular frete (digite "frete para [bairro]")\n` +
         `• Informações de pagamento (digite "formas de pagamento")\n` +
         `• Programa de fidelidade (digite "fidelidade")\n` +
         `• Fazer pedido (digite "quero fazer um pedido")\n\n` +
         `Ou digite "ajuda" para ver todas as opções!`;
}

