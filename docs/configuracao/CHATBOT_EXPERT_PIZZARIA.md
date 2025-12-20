# 🤖 Chatbot Expert da Pizzaria - Fluxo Completo

## 📋 Objetivo

Transformar o chatbot em um **assistente especialista** que conhece:
- ✅ Todos os produtos do cardápio (nomes, descrições, preços)
- ✅ Categorias e organização do menu
- ✅ Valores de frete por bairro
- ✅ Formas de pagamento
- ✅ Programa de fidelidade
- ✅ Informações do restaurante
- ✅ Como fazer pedidos
- ✅ Tempo de entrega
- ✅ Promoções e ofertas

## 🎯 Personalidade do Chatbot

**Nome:** Jerry (ou personalizável por restaurante)
**Tom:** Amigável, prestativo, conhecedor
**Linguagem:** Informal mas profissional, com emojis quando apropriado
**Conhecimento:** Especialista completo do cardápio e serviços

## 🏗️ Estrutura de Conhecimento

### 1. Base de Dados do Cardápio

O chatbot precisa acessar dinamicamente:
- **Produtos** (`products` table)
- **Categorias** (`categories` table)
- **Áreas de Entrega** (`delivery_areas` table)
- **Configurações do Restaurante** (`restaurant_settings` table)

### 2. Estados da Conversa

```typescript
type ChatState = 
  | 'welcome'           // Boas-vindas inicial
  | 'menu'              // Navegando cardápio
  | 'product_details'   // Detalhes de um produto
  | 'cart'              // Visualizando carrinho
  | 'checkout'          // Finalizando pedido
  | 'delivery_info'     // Informações de entrega
  | 'payment_info'      // Informações de pagamento
  | 'loyalty_info'      // Programa de fidelidade
  | 'help'              // Ajuda geral
  | 'search'            // Buscando produtos
  | 'promotions'        // Promoções
  | 'contact'           // Contato
```

## 📐 Fluxo de Conversação Completo

### Fase 1: Boas-Vindas e Menu Principal

**Mensagem Inicial:**
```
Olá! 👋 Sou o Jerry, assistente da Tom & Jerry Pizzaria! 

Como posso te ajudar hoje? 🍕

Você pode:
• Ver nosso cardápio completo
• Buscar um produto específico
• Saber mais sobre frete e entrega
• Conhecer nosso programa de fidelidade
• Fazer um pedido
• Falar com atendimento

O que você gostaria de fazer?
```

**Botões Rápidos:**
- 🍕 Ver Cardápio
- 🔍 Buscar Produto
- 🚚 Frete e Entrega
- 💎 Programa de Fidelidade
- 📞 Contato
- ❓ Ajuda

### Fase 2: Navegação do Cardápio

#### 2.1. Listar Categorias

**Quando:** Cliente pede "cardápio", "menu", "ver produtos"

**Resposta:**
```
🍕 *NOSSO CARDÁPIO*

Escolha uma categoria:

• 🍕 Pizzas
• 🥤 Bebidas
• 🍟 Acompanhamentos
• 🍰 Sobremesas
• 🎁 Promoções

Digite o nome da categoria ou clique em uma opção acima!
```

**Lógica:**
```typescript
async function getCategories(restaurantId: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('order');
  
  return data || [];
}
```

#### 2.2. Listar Produtos de uma Categoria

**Quando:** Cliente escolhe uma categoria

**Resposta:**
```
🍕 *PIZZAS*

Aqui estão nossas pizzas disponíveis:

1. Pizza Margherita - R$ 45,00
   Molho de tomate, mussarela, manjericão

2. Pizza Calabresa - R$ 48,00
   Molho, mussarela, calabresa, cebola

3. Pizza Portuguesa - R$ 52,00
   Molho, mussarela, presunto, ovos, cebola, azeitona

[... mais produtos ...]

Digite o número ou nome do produto para ver mais detalhes!
```

**Lógica:**
```typescript
async function getProductsByCategory(categoryId: string, restaurantId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('name');
  
  return data || [];
}
```

#### 2.3. Detalhes de um Produto

**Quando:** Cliente pergunta sobre um produto específico

**Resposta:**
```
🍕 *PIZZA MARGHERITA*

*Descrição:*
Molho de tomate artesanal, mussarela de primeira qualidade e manjericão fresco.

*Preço:* R$ 45,00

*Ingredientes:*
• Molho de tomate
• Mussarela
• Manjericão

*Tamanho:* Grande (8 fatias)

O que você gostaria de fazer?
• ➕ Adicionar ao carrinho
• 🔙 Voltar ao cardápio
• ❓ Fazer uma pergunta
```

**Lógica:**
```typescript
async function getProductDetails(productName: string, restaurantId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .ilike('name', `%${productName}%`)
    .single();
  
  return data;
}
```

### Fase 3: Busca de Produtos

**Quando:** Cliente busca um produto específico

**Comandos:**
- "buscar pizza"
- "tem calabresa?"
- "quero uma pizza doce"
- "produtos com frango"

**Resposta:**
```
🔍 *BUSCA: "calabresa"*

Encontrei os seguintes produtos:

1. Pizza Calabresa - R$ 48,00
2. Pizza Calabresa com Catupiry - R$ 52,00

Qual você gostaria de ver?
```

**Lógica:**
```typescript
async function searchProducts(query: string, restaurantId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name');
  
  return data || [];
}
```

### Fase 4: Informações de Frete

**Quando:** Cliente pergunta sobre frete, entrega, bairros

**Perguntas Comuns:**
- "qual o frete?"
- "entregam no centro?"
- "quanto custa a entrega em [bairro]?"
- "quais bairros vocês entregam?"

**Resposta:**
```
🚚 *FRETE E ENTREGA*

Entregamos em Rio Grande da Serra e região!

*Valores por Bairro:*

📍 *Rio Grande da Serra:*
• Centro - R$ 3,00
• Vila Conde - R$ 8,00
• Pedreira - R$ 9,00
• Lavínia - R$ 4,00

📍 *Ribeirão Pires:*
• Ribeirão Pires - R$ 14,00

*Outros bairros:* R$ 5,00 (frete padrão)

*Tempo de Entrega:* 30-45 minutos

Qual seu bairro? Posso calcular o frete exato para você!
```

**Lógica:**
```typescript
async function getDeliveryInfo(neighborhood: string, city: string, restaurantId: string) {
  const { data } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('city', city)
    .ilike('neighborhood', `%${neighborhood}%`)
    .eq('active', true)
    .single();
  
  if (data) {
    return {
      found: true,
      fee: data.delivery_fee,
      area: data
    };
  }
  
  return {
    found: false,
    fee: 5.00, // Frete padrão
    area: null
  };
}
```

### Fase 5: Formas de Pagamento

**Quando:** Cliente pergunta sobre pagamento

**Perguntas:**
- "quais formas de pagamento?"
- "aceita pix?"
- "tem desconto no pix?"
- "aceita cartão?"

**Resposta:**
```
💳 *FORMAS DE PAGAMENTO*

Aceitamos as seguintes formas de pagamento:

• 💰 PIX - 5% de desconto
• 💳 Cartão de Crédito/Débito
• 💵 Dinheiro na Entrega

*Desconto PIX:*
Ganhe 5% de desconto pagando com PIX!

Exemplo: Pedido de R$ 100,00
• Com PIX: R$ 95,00
• Outras formas: R$ 100,00

Qual forma de pagamento você prefere?
```

### Fase 6: Programa de Fidelidade

**Quando:** Cliente pergunta sobre fidelidade, selos

**Resposta:**
```
💎 *PROGRAMA DE FIDELIDADE*

Ganhe selos a cada pedido e troque por produtos!

*Como funciona:*
• Em cada pedido acima de R$ 50,00 em produtos, você ganha 1 selo
• Junte 10 selos e troque por um produto do menu Troca Fidelidade
• Taxa de entrega NÃO conta para o valor mínimo

*Onde vejo meus selos?*
Seus selos aparecem automaticamente no seu perfil após cada pedido qualificado.

*Como faço a troca?*
Quando você tiver 10 selos, escolha um produto do menu Troca Fidelidade no carrinho!

Tem mais alguma dúvida sobre o programa?
```

### Fase 7: Informações do Restaurante

**Quando:** Cliente pergunta sobre contato, endereço, horário

**Resposta:**
```
📞 *CONTATO - TOM & JERRY PIZZARIA*

*Endereço:*
Rua Valdir Gil Da Silva, 285
Parque Indaia, Rio Grande da Serra - SP

*Telefones:*
• (11) 4820-3123
• (11) 4821-7128
• (11) 96905-4541

*Redes Sociais:*
• Instagram: @pizzariatomejerry
• Facebook: Curta nossa página!

*Horário de Funcionamento:*
Segunda a Domingo: 18h às 23h

Precisa de mais alguma informação?
```

**Lógica:**
```typescript
async function getRestaurantInfo(restaurantId: string) {
  const { data } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .single();
  
  return data;
}
```

### Fase 8: Fazer Pedido

**Quando:** Cliente quer fazer um pedido

**Fluxo:**
1. Cliente: "quero fazer um pedido"
2. Bot: Lista produtos ou pergunta o que deseja
3. Cliente: Escolhe produtos
4. Bot: Adiciona ao carrinho e mostra resumo
5. Bot: Solicita endereço
6. Bot: Calcula frete
7. Bot: Solicita forma de pagamento
8. Bot: Confirma pedido
9. Bot: Cria pedido no sistema

**Exemplo de Conversa:**
```
Cliente: Quero fazer um pedido

Bot: 🍕 Ótimo! Vamos começar seu pedido!

O que você gostaria de pedir hoje?
• Ver cardápio completo
• Buscar um produto específico
• Já sei o que quero (me diga)

Cliente: Quero uma pizza margherita

Bot: ✅ Pizza Margherita adicionada ao carrinho!

*Seu pedido até agora:*
• 1x Pizza Margherita - R$ 45,00

*Total:* R$ 45,00

Deseja adicionar mais algo?
• ➕ Adicionar mais itens
• ✅ Finalizar pedido

Cliente: Finalizar

Bot: 📍 Para calcular o frete, preciso do seu endereço:

*Por favor, me informe:*
• Bairro:
• Cidade:

Cliente: Centro, Rio Grande da Serra

Bot: ✅ Frete calculado!

*Resumo do Pedido:*
• 1x Pizza Margherita - R$ 45,00
• Frete (Centro) - R$ 3,00
• *Total: R$ 48,00*

*Forma de pagamento:*
• 💰 PIX (5% desconto = R$ 45,60)
• 💳 Cartão
• 💵 Dinheiro

Qual forma de pagamento?

Cliente: PIX

Bot: ✅ *PEDIDO CONFIRMADO!*

*Pedido #123*
• 1x Pizza Margherita - R$ 45,00
• Frete - R$ 3,00
• Desconto PIX (5%) - R$ 2,40
• *Total: R$ 45,60*

*Tempo estimado:* 30-45 minutos

Obrigado pelo pedido! 🍕
```

## 🧠 Sistema de Inteligência do Chatbot

### 1. Reconhecimento de Intenções

```typescript
type Intent = 
  | 'greeting'           // Saudação
  | 'menu_request'       // Pedir cardápio
  | 'product_search'     // Buscar produto
  | 'product_details'    // Detalhes de produto
  | 'price_inquiry'      // Consultar preço
  | 'delivery_info'      // Informações de entrega
  | 'payment_info'       // Informações de pagamento
  | 'loyalty_info'       // Programa de fidelidade
  | 'place_order'        // Fazer pedido
  | 'contact_info'       // Informações de contato
  | 'help'               // Ajuda
  | 'promotions'         // Promoções
  | 'unknown'            // Não reconhecido

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  
  // Greeting
  if (lower.match(/\b(oi|olá|ola|hey|e aí|eai)\b/)) return 'greeting';
  
  // Menu
  if (lower.match(/\b(cardápio|cardapio|menu|produtos|o que tem|o que vocês têm)\b/)) return 'menu_request';
  
  // Product Search
  if (lower.match(/\b(tem|tem|vocês têm|voces tem|buscar|procurar|quero|gostaria)\b/)) return 'product_search';
  
  // Price
  if (lower.match(/\b(preço|preco|quanto custa|valor|quanto é|quanto sai)\b/)) return 'price_inquiry';
  
  // Delivery
  if (lower.match(/\b(frete|entrega|entregam|bairro|delivery)\b/)) return 'delivery_info';
  
  // Payment
  if (lower.match(/\b(pagamento|pix|cartão|cartao|dinheiro|aceita)\b/)) return 'payment_info';
  
  // Loyalty
  if (lower.match(/\b(fidelidade|selo|selos|pontos|troca)\b/)) return 'loyalty_info';
  
  // Order
  if (lower.match(/\b(pedido|pedir|quero pedir|fazer pedido|comprar)\b/)) return 'place_order';
  
  // Contact
  if (lower.match(/\b(contato|telefone|endereço|endereco|onde|localização|localizacao)\b/)) return 'contact_info';
  
  // Help
  if (lower.match(/\b(ajuda|help|não entendi|não entendo|como funciona)\b/)) return 'help';
  
  return 'unknown';
}
```

### 2. Extração de Entidades

```typescript
function extractEntities(message: string): {
  product?: string;
  category?: string;
  neighborhood?: string;
  city?: string;
  quantity?: number;
  price?: number;
} {
  const entities: any = {};
  const lower = message.toLowerCase();
  
  // Extrair nome de produto (buscar no banco)
  // Extrair categoria
  // Extrair bairro/cidade
  // Extrair quantidade (1, 2, uma, duas, etc.)
  
  return entities;
}
```

### 3. Geração de Respostas

```typescript
async function generateResponse(
  intent: Intent,
  entities: any,
  context: ChatContext,
  restaurantId: string
): Promise<string> {
  switch (intent) {
    case 'greeting':
      return getWelcomeMessage(restaurantId);
    
    case 'menu_request':
      const categories = await getCategories(restaurantId);
      return formatCategoriesMessage(categories);
    
    case 'product_search':
      if (entities.product) {
        const products = await searchProducts(entities.product, restaurantId);
        return formatProductsList(products);
      }
      return "Qual produto você está procurando?";
    
    case 'price_inquiry':
      if (entities.product) {
        const product = await getProductDetails(entities.product, restaurantId);
        if (product) {
          return `💰 ${product.name} - ${formatCurrency(product.price)}`;
        }
      }
      return "Qual produto você gostaria de saber o preço?";
    
    case 'delivery_info':
      if (entities.neighborhood && entities.city) {
        const delivery = await getDeliveryInfo(entities.neighborhood, entities.city, restaurantId);
        return formatDeliveryMessage(delivery);
      }
      return getDeliveryAreasMessage(restaurantId);
    
    case 'payment_info':
      return getPaymentMethodsMessage();
    
    case 'loyalty_info':
      return getLoyaltyProgramMessage();
    
    case 'place_order':
      return startOrderFlow(context);
    
    case 'contact_info':
      const info = await getRestaurantInfo(restaurantId);
      return formatContactMessage(info);
    
    case 'help':
      return getHelpMessage();
    
    default:
      return getDefaultResponse();
  }
}
```

## 📊 Estrutura de Dados do Chatbot

### Contexto da Conversa

```typescript
interface ChatContext {
  sessionId: string;
  restaurantId: string;
  state: ChatState;
  cart: CartItem[];
  currentProduct?: Product;
  currentCategory?: Category;
  deliveryInfo?: {
    neighborhood: string;
    city: string;
    fee: number;
  };
  orderData?: {
    name?: string;
    phone?: string;
    address?: string;
    paymentMethod?: string;
  };
  conversationHistory: Message[];
}
```

### Mensagem

```typescript
interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  intent?: Intent;
  entities?: any;
}
```

## 🔄 Fluxo de Estados Completo

```typescript
const stateMachine: Record<ChatState, {
  possibleIntents: Intent[];
  nextStates: ChatState[];
  actions: (context: ChatContext) => Promise<string>;
}> = {
  welcome: {
    possibleIntents: ['greeting', 'menu_request', 'help', 'contact_info'],
    nextStates: ['menu', 'help', 'contact'],
    actions: async (ctx) => getWelcomeMessage(ctx.restaurantId)
  },
  
  menu: {
    possibleIntents: ['menu_request', 'product_search', 'product_details', 'place_order'],
    nextStates: ['product_details', 'cart', 'search'],
    actions: async (ctx) => {
      if (ctx.currentCategory) {
        const products = await getProductsByCategory(ctx.currentCategory.id, ctx.restaurantId);
        return formatProductsList(products);
      }
      const categories = await getCategories(ctx.restaurantId);
      return formatCategoriesMessage(categories);
    }
  },
  
  product_details: {
    possibleIntents: ['place_order', 'menu_request', 'price_inquiry'],
    nextStates: ['cart', 'menu'],
    actions: async (ctx) => {
      if (ctx.currentProduct) {
        return formatProductDetails(ctx.currentProduct);
      }
      return "Qual produto você gostaria de ver?";
    }
  },
  
  cart: {
    possibleIntents: ['place_order', 'menu_request'],
    nextStates: ['checkout', 'menu'],
    actions: async (ctx) => formatCart(ctx.cart)
  },
  
  checkout: {
    possibleIntents: [],
    nextStates: ['delivery_info', 'payment_info'],
    actions: async (ctx) => {
      if (!ctx.deliveryInfo) {
        return "Para calcular o frete, preciso do seu bairro e cidade.";
      }
      if (!ctx.orderData?.paymentMethod) {
        return "Qual forma de pagamento você prefere?";
      }
      return "Confirmando seu pedido...";
    }
  },
  
  // ... outros estados
};
```

## 🎨 Formatação de Mensagens

### Formatar Lista de Categorias

```typescript
function formatCategoriesMessage(categories: Category[]): string {
  const list = categories.map((cat, index) => 
    `${index + 1}. ${cat.name}`
  ).join('\n');
  
  return `🍕 *NOSSO CARDÁPIO*\n\n${list}\n\nDigite o número ou nome da categoria!`;
}
```

### Formatar Lista de Produtos

```typescript
function formatProductsList(products: Product[]): string {
  if (products.length === 0) {
    return "Não encontrei produtos nesta categoria. 😔";
  }
  
  const list = products.map((product, index) => 
    `${index + 1}. ${product.name} - ${formatCurrency(product.price)}\n   ${product.description}`
  ).join('\n\n');
  
  return `📦 *PRODUTOS ENCONTRADOS*\n\n${list}\n\nDigite o número ou nome do produto para ver detalhes!`;
}
```

### Formatar Detalhes do Produto

```typescript
function formatProductDetails(product: Product): string {
  return `🍕 *${product.name.toUpperCase()}*\n\n` +
         `*Descrição:*\n${product.description}\n\n` +
         `*Preço:* ${formatCurrency(product.price)}\n\n` +
         `O que você gostaria de fazer?\n` +
         `• ➕ Adicionar ao carrinho\n` +
         `• 🔙 Voltar ao cardápio`;
}
```

### Formatar Informações de Frete

```typescript
function formatDeliveryMessage(delivery: DeliveryInfo): string {
  if (delivery.found) {
    return `🚚 *FRETE CALCULADO*\n\n` +
           `📍 *${delivery.area.neighborhood}, ${delivery.area.city}*\n` +
           `💰 Frete: ${formatCurrency(delivery.fee)}\n\n` +
           `*Tempo estimado:* 30-45 minutos`;
  }
  
  return `🚚 *FRETE*\n\n` +
         `📍 *${delivery.neighborhood}, ${delivery.city}*\n` +
         `💰 Frete padrão: ${formatCurrency(delivery.fee)}\n\n` +
         `*Tempo estimado:* 30-45 minutos`;
}
```

## 🔍 Busca Inteligente

### Busca por Nome

```typescript
async function searchProductByName(query: string, restaurantId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .ilike('name', `%${query}%`)
    .order('name');
  
  return data || [];
}
```

### Busca por Descrição

```typescript
async function searchProductByDescription(query: string, restaurantId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .ilike('description', `%${query}%`)
    .order('name');
  
  return data || [];
}
```

### Busca Combinada

```typescript
async function searchProducts(query: string, restaurantId: string): Promise<Product[]> {
  const [byName, byDescription] = await Promise.all([
    searchProductByName(query, restaurantId),
    searchProductByDescription(query, restaurantId)
  ]);
  
  // Combinar e remover duplicatas
  const all = [...byName, ...byDescription];
  const unique = Array.from(new Map(all.map(p => [p.id, p])).values());
  
  return unique;
}
```

## 💾 Persistência de Estado

### Salvar Contexto da Sessão

```typescript
async function saveSession(context: ChatContext) {
  await supabase
    .from('chatbot_sessions')
    .upsert({
      session_id: context.sessionId,
      restaurant_id: context.restaurantId,
      state: context.state,
      cart_data: context.cart,
      context_data: {
        currentProduct: context.currentProduct?.id,
        currentCategory: context.currentCategory?.id,
        deliveryInfo: context.deliveryInfo,
        orderData: context.orderData
      },
      updated_at: new Date().toISOString()
    });
}
```

### Carregar Contexto da Sessão

```typescript
async function loadSession(sessionId: string): Promise<ChatContext | null> {
  const { data } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  
  if (!data) return null;
  
  // Reconstruir contexto
  return {
    sessionId: data.session_id,
    restaurantId: data.restaurant_id,
    state: data.state,
    cart: data.cart_data || [],
    // ... outros campos
  };
}
```

## 📝 Exemplos de Conversas Completas

### Exemplo 1: Buscar Produto e Ver Preço

```
Cliente: Tem pizza de calabresa?

Bot: 🔍 *BUSCA: "calabresa"*

Encontrei:
1. Pizza Calabresa - R$ 48,00
2. Pizza Calabresa com Catupiry - R$ 52,00

Qual você gostaria de ver?

Cliente: A primeira

Bot: 🍕 *PIZZA CALABRESA*

*Descrição:*
Molho de tomate, mussarela, calabresa fatiada e cebola.

*Preço:* R$ 48,00

*Tamanho:* Grande (8 fatias)

O que você gostaria de fazer?
• ➕ Adicionar ao carrinho
• 🔙 Voltar ao cardápio
```

### Exemplo 2: Consultar Frete

```
Cliente: Qual o frete para o centro?

Bot: 🚚 *FRETE PARA CENTRO*

📍 *Centro, Rio Grande da Serra*
💰 Frete: R$ 3,00

*Tempo estimado:* 30-45 minutos

Deseja fazer um pedido?
```

### Exemplo 3: Programa de Fidelidade

```
Cliente: Como funciona o programa de fidelidade?

Bot: 💎 *PROGRAMA DE FIDELIDADE*

*Como funciona:*
• Em cada pedido acima de R$ 50,00 em produtos, você ganha 1 selo
• Junte 10 selos e troque por um produto do menu Troca Fidelidade
• Taxa de entrega NÃO conta para o valor mínimo

*Onde vejo meus selos?*
Seus selos aparecem automaticamente no seu perfil após cada pedido qualificado.

*Como faço a troca?*
Quando você tiver 10 selos, escolha um produto do menu Troca Fidelidade no carrinho!

Tem mais alguma dúvida?
```

## 🎯 Respostas para Perguntas Frequentes

### Sobre Produtos

**"Qual o sabor mais pedido?"**
```
🍕 Nossos sabores mais pedidos são:
1. Pizza Margherita
2. Pizza Calabresa
3. Pizza Portuguesa

Todos são deliciosos! Qual você gostaria de experimentar?
```

**"Tem pizza doce?"**
```
🍰 Sim! Temos pizzas doces:
[Buscar produtos da categoria "Sobremesas" ou com "doce" na descrição]

Qual você prefere?
```

**"Qual o tamanho das pizzas?"**
```
🍕 Nossas pizzas são tamanho GRANDE (8 fatias)!

Perfeitas para compartilhar ou para você mesmo! 😊
```

### Sobre Entrega

**"Quanto tempo demora?"**
```
⏰ *TEMPO DE ENTREGA*

Nosso tempo médio é de 30-45 minutos, dependendo da distância e do volume de pedidos.

Em horários de pico (finais de semana à noite), pode levar até 60 minutos.

Mas sempre fazemos o possível para entregar o mais rápido possível! 🚀
```

**"Entregam em [bairro]?"**
```
📍 Vou verificar se entregamos no seu bairro...

[Buscar no delivery_areas]

Sim! Entregamos em [bairro] com frete de R$ X,XX
OU
Desculpe, ainda não entregamos em [bairro]. Mas você pode retirar no balcão!
```

### Sobre Pagamento

**"Tem desconto no PIX?"**
```
💰 Sim! Temos 5% de desconto para pagamentos via PIX!

*Exemplo:*
Pedido de R$ 100,00
• Com PIX: R$ 95,00 (economia de R$ 5,00!)
• Outras formas: R$ 100,00

Vale muito a pena! 😊
```

**"Aceita cartão de débito?"**
```
💳 Sim! Aceitamos:
• Cartão de Crédito
• Cartão de Débito
• PIX (com 5% de desconto)
• Dinheiro na Entrega

Qual você prefere?
```

## 🔧 Implementação Técnica

### Estrutura de Arquivos

```
components/
  chatbot/
    expert-chatbot.tsx          # Componente principal
    chat-engine.ts              # Motor de conversação
    intent-detector.ts          # Detecção de intenções
    entity-extractor.ts         # Extração de entidades
    response-generator.ts       # Geração de respostas
    state-manager.ts            # Gerenciamento de estado
    message-formatter.ts        # Formatação de mensagens

lib/
  chatbot/
    knowledge-base.ts           # Base de conhecimento
    product-searcher.ts         # Busca de produtos
    delivery-calculator.ts      # Cálculo de frete
    order-assistant.ts          # Assistente de pedidos
```

### API Routes

```
app/api/
  chatbot/
    message/route.ts            # Processar mensagem
    search/route.ts             # Buscar produtos
    delivery/route.ts           # Calcular frete
    order/route.ts              # Criar pedido
```

## 📊 Tabela de Banco de Dados

```sql
-- Sessões do chatbot
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES auth.users(id),
  state VARCHAR(50) DEFAULT 'welcome',
  cart_data JSONB DEFAULT '[]'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de conversas
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  sender VARCHAR(10) NOT NULL, -- 'bot' | 'user'
  intent VARCHAR(50),
  entities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_restaurant ON chatbot_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session ON chatbot_messages(session_id);
```

## 🎯 Próximos Passos

1. **Implementar detecção de intenções**
2. **Criar base de conhecimento dinâmica**
3. **Implementar busca de produtos**
4. **Criar fluxo de pedidos**
5. **Adicionar persistência de sessão**
6. **Testar conversas completas**
7. **Ajustar respostas baseado em feedback**

---

## 📌 Resumo

Este documento define o **fluxo completo** para transformar o chatbot em um **especialista da pizzaria** que:

✅ Conhece todos os produtos e preços
✅ Sabe calcular frete por bairro
✅ Explica formas de pagamento
✅ Entende o programa de fidelidade
✅ Ajuda a fazer pedidos
✅ Responde perguntas frequentes
✅ Busca produtos inteligentemente
✅ Mantém contexto da conversa

**O chatbot será um verdadeiro assistente especialista!** 🍕🤖

