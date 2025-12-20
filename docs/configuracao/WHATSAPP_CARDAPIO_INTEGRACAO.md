# 📱 Cardápio Digital no WhatsApp - Integração Reversa

## 📋 Objetivo

Criar um **cardápio digital no WhatsApp** que permite:
1. Cliente acessa cardápio via WhatsApp
2. Cliente faz pedido pelo WhatsApp
3. Pedido é enviado automaticamente para o sistema
4. Sistema processa pedido normalmente

## ✅ É Possível Implementar?

**SIM, é totalmente possível!** Existem várias formas de implementar:

### Opções Disponíveis

1. **WhatsApp Business API (Oficial)** - Recomendado
2. **Evolution API / Baileys** - Alternativa
3. **Chatbot com Menu Interativo** - Via WhatsApp Business API
4. **Link para Cardápio + Webhook** - Solução híbrida

## 🎯 Funcionalidades Propostas

### 1. Cardápio no WhatsApp

**Funcionalidade:**
- Cliente envia mensagem para número da pizzaria
- Bot responde com menu interativo
- Cliente navega por categorias
- Cliente vê produtos com imagens, preços, descrições
- Cliente adiciona itens ao carrinho

**Interface:**
- Mensagens de texto formatadas
- Botões interativos (List Messages)
- Imagens dos produtos
- Carrinho em tempo real

### 2. Pedido pelo WhatsApp

**Fluxo:**
1. Cliente adiciona itens ao carrinho
2. Cliente clica "Finalizar Pedido"
3. Bot solicita dados (endereço, telefone, pagamento)
4. Bot confirma pedido
5. **Webhook envia pedido para o sistema**
6. Sistema cria pedido automaticamente
7. Cliente recebe confirmação com número do pedido

### 3. Integração com Sistema

**Funcionalidade:**
- Webhook recebe pedido do WhatsApp
- Valida dados do pedido
- Cria pedido no Supabase
- Atualiza status em tempo real
- Notifica cliente via WhatsApp

## 🏗️ Arquitetura Proposta

### Fluxo de Dados

```
Cliente (WhatsApp) → WhatsApp Business API → Webhook → Sistema (Next.js) → Supabase
                                                              ↓
                                                         Notificação → Cliente (WhatsApp)
```

### Componentes Necessários

#### 1. **WhatsApp Business API**
- Conta WhatsApp Business verificada
- Acesso à API (Meta for Developers)
- Webhook configurado

#### 2. **Webhook Handler** (`/api/webhooks/whatsapp`)
- Recebe mensagens do WhatsApp
- Processa comandos do usuário
- Gerencia estado da conversa
- Envia respostas

#### 3. **Chatbot Logic**
- Lógica de navegação do cardápio
- Gerenciamento de carrinho
- Coleta de dados do cliente
- Criação de pedido

#### 4. **Order Integration**
- Integração com API de pedidos existente
- Validação de dados
- Criação de pedido no Supabase

## 🛠️ Tecnologias e Integrações

### Opção 1: WhatsApp Business API (Oficial) - Recomendado

**Vantagens:**
- ✅ Oficial e confiável
- ✅ Suporte completo da Meta
- ✅ Recursos avançados (botões, listas, imagens)
- ✅ Webhooks nativos
- ✅ Escalável

**Desvantagens:**
- ❌ Requer aprovação da Meta
- ❌ Processo de verificação pode demorar
- ❌ Custo variável (consulte Meta)

**Recursos Disponíveis:**
- **List Messages**: Menu interativo com botões
- **Template Messages**: Mensagens pré-aprovadas
- **Interactive Messages**: Botões e listas
- **Media Messages**: Imagens, vídeos, documentos
- **Webhooks**: Receber mensagens em tempo real

**Documentação:**
- https://developers.facebook.com/docs/whatsapp

### Opção 2: Evolution API / Baileys

**Vantagens:**
- ✅ Implementação rápida
- ✅ Sem necessidade de aprovação
- ✅ Gratuito (self-hosted)
- ✅ Controle total

**Desvantagens:**
- ❌ Pode violar termos do WhatsApp
- ❌ Risco de bloqueio
- ❌ Não é oficial
- ❌ Requer servidor próprio

**Documentação:**
- Evolution API: https://evolution-api.com
- Baileys: https://github.com/WhiskeySockets/Baileys

### Opção 3: Serviços de Terceiros

**Fornecedores:**
- **Twilio WhatsApp API**: https://www.twilio.com/whatsapp
- **MessageBird**: https://www.messagebird.com
- **ChatAPI**: https://www.chatapi.com

**Vantagens:**
- ✅ Implementação rápida
- ✅ Suporte técnico
- ✅ Infraestrutura gerenciada

**Desvantagens:**
- ❌ Custo mensal
- ❌ Dependência de terceiros

## 📐 Implementação Detalhada

### Estrutura de Banco de Dados

**Adicionar tabela para sessões do WhatsApp:**
```sql
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE, -- Número do WhatsApp do cliente
  session_state VARCHAR(50) DEFAULT 'menu', -- menu, cart, checkout, order
  cart_data JSONB DEFAULT '[]'::jsonb, -- Itens do carrinho
  order_data JSONB DEFAULT NULL, -- Dados do pedido em andamento
  restaurant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_restaurant ON whatsapp_sessions(restaurant_id);
```

**Adicionar campo na tabela orders:**
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255);
```

### API Routes Necessárias

#### 1. `POST /api/webhooks/whatsapp`
Webhook para receber mensagens do WhatsApp.

**Request (do WhatsApp):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "5511888888888",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "text": {
                  "body": "menu"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

#### 2. `POST /api/whatsapp/send-message`
Enviar mensagem para cliente via WhatsApp.

**Request:**
```json
{
  "to": "5511888888888",
  "type": "text" | "interactive" | "template",
  "message": {
    "text": "Olá! Bem-vindo ao cardápio digital..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "wamid.xxx"
}
```

#### 3. `POST /api/whatsapp/send-menu`
Enviar menu interativo para cliente.

**Request:**
```json
{
  "to": "5511888888888",
  "restaurant_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "wamid.xxx"
}
```

### Código de Implementação

#### 1. Webhook Handler

```typescript
// app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se é do WhatsApp Business API
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Processar entrada
    const entry = body.entry?.[0];
    if (!entry) {
      return NextResponse.json({ success: true });
    }

    const changes = entry.changes?.[0];
    if (!changes || changes.field !== 'messages') {
      return NextResponse.json({ success: true });
    }

    const message = changes.value.messages?.[0];
    if (!message) {
      return NextResponse.json({ success: true });
    }

    const from = message.from; // Número do cliente
    const messageText = message.text?.body?.toLowerCase() || '';
    const messageType = message.type;

    // Processar mensagem
    await processWhatsAppMessage(from, messageText, messageType);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro no webhook WhatsApp:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processWhatsAppMessage(phone: string, text: string, type: string) {
  // Buscar ou criar sessão
  let session = await getOrCreateSession(phone);

  // Processar comando
  if (text === 'menu' || text === 'cardapio' || text === 'inicio') {
    await sendMenu(phone, session.restaurant_id);
    await updateSession(phone, { session_state: 'menu' });
  } else if (text.startsWith('categoria:')) {
    const categoryId = text.split(':')[1];
    await sendCategoryProducts(phone, categoryId, session.restaurant_id);
  } else if (text.startsWith('produto:')) {
    const productId = text.split(':')[1];
    await sendProductDetails(phone, productId, session.restaurant_id);
  } else if (text.startsWith('adicionar:')) {
    const productId = text.split(':')[1];
    await addToCart(phone, productId, session);
  } else if (text === 'carrinho') {
    await sendCart(phone, session);
  } else if (text === 'finalizar') {
    await startCheckout(phone, session);
  } else {
    // Resposta padrão
    await sendDefaultMessage(phone);
  }
}
```

#### 2. Enviar Menu Interativo

```typescript
// lib/whatsapp/menu.ts
import { sendWhatsAppMessage } from './api';

export async function sendMenu(phone: string, restaurantId: string) {
  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('order');

  if (!categories || categories.length === 0) {
    await sendWhatsAppMessage(phone, 'text', {
      text: 'Desculpe, não há categorias disponíveis no momento.'
    });
    return;
  }

  // Criar mensagem interativa com botões
  const buttons = categories.slice(0, 10).map(cat => ({
    type: 'reply',
    reply: {
      id: `categoria:${cat.id}`,
      title: cat.name
    }
  }));

  // Adicionar botão "Ver Carrinho"
  buttons.push({
    type: 'reply',
    reply: {
      id: 'carrinho',
      title: '🛒 Ver Carrinho'
    }
  });

  await sendWhatsAppMessage(phone, 'interactive', {
    type: 'button',
    body: {
      text: '🍕 *CARDÁPIO TOM & JERRY*\n\nEscolha uma categoria:'
    },
    action: {
      buttons: buttons
    }
  });
}
```

#### 3. Enviar Produtos de uma Categoria

```typescript
// lib/whatsapp/products.ts
export async function sendCategoryProducts(phone: string, categoryId: string, restaurantId: string) {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('name');

  if (!products || products.length === 0) {
    await sendWhatsAppMessage(phone, 'text', {
      text: 'Nenhum produto disponível nesta categoria.'
    });
    return;
  }

  // Enviar lista interativa
  const rows = products.slice(0, 10).map(product => ({
    id: `produto:${product.id}`,
    title: product.name,
    description: `${formatCurrency(product.price)}`
  }));

  await sendWhatsAppMessage(phone, 'interactive', {
    type: 'list',
    body: {
      text: '📦 *PRODUTOS DISPONÍVEIS*\n\nEscolha um produto:'
    },
    action: {
      button: 'Ver Produtos',
      sections: [
        {
          title: 'Produtos',
          rows: rows
        }
      ]
    }
  });
}
```

#### 4. Detalhes do Produto

```typescript
// lib/whatsapp/product-details.ts
export async function sendProductDetails(phone: string, productId: string, restaurantId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('restaurant_id', restaurantId)
    .single();

  if (!product) {
    await sendWhatsAppMessage(phone, 'text', {
      text: 'Produto não encontrado.'
    });
    return;
  }

  // Enviar imagem do produto (se disponível)
  if (product.image) {
    await sendWhatsAppMessage(phone, 'image', {
      link: product.image,
      caption: `*${product.name}*\n\n${product.description}\n\n💰 ${formatCurrency(product.price)}`
    });
  }

  // Enviar botões de ação
  await sendWhatsAppMessage(phone, 'interactive', {
    type: 'button',
    body: {
      text: `*${product.name}*\n\n${product.description}\n\n💰 ${formatCurrency(product.price)}`
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: `adicionar:${product.id}`,
            title: '➕ Adicionar ao Carrinho'
          }
        },
        {
          type: 'reply',
          reply: {
            id: 'menu',
            title: '🔙 Voltar ao Menu'
          }
        }
      ]
    }
  });
}
```

#### 5. Gerenciar Carrinho

```typescript
// lib/whatsapp/cart.ts
export async function sendCart(phone: string, session: any) {
  const cart = session.cart_data || [];

  if (cart.length === 0) {
    await sendWhatsAppMessage(phone, 'text', {
      text: '🛒 Seu carrinho está vazio.\n\nDigite *menu* para ver o cardápio.'
    });
    return;
  }

  // Buscar produtos
  const productIds = cart.map((item: any) => item.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds);

  // Calcular total
  let total = 0;
  const itemsText = cart.map((item: any) => {
    const product = products?.find(p => p.id === item.product_id);
    const itemTotal = (product?.price || 0) * item.quantity;
    total += itemTotal;
    return `• ${item.quantity}x ${product?.name} - ${formatCurrency(itemTotal)}`;
  }).join('\n');

  const message = `🛒 *SEU CARRINHO*\n\n${itemsText}\n\n💰 *TOTAL:* ${formatCurrency(total)}\n\nEscolha uma opção:`;

  await sendWhatsAppMessage(phone, 'interactive', {
    type: 'button',
    body: {
      text: message
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'finalizar',
            title: '✅ Finalizar Pedido'
          }
        },
        {
          type: 'reply',
          reply: {
            id: 'menu',
            title: '🔙 Continuar Comprando'
          }
        }
      ]
    }
  });
}
```

#### 6. Finalizar Pedido

```typescript
// lib/whatsapp/checkout.ts
export async function startCheckout(phone: string, session: any) {
  // Atualizar estado da sessão
  await updateSession(phone, { session_state: 'checkout' });

  // Solicitar dados do cliente
  await sendWhatsAppMessage(phone, 'text', {
    text: `📝 *FINALIZAR PEDIDO*\n\nPor favor, envie seus dados no seguinte formato:\n\n` +
          `*Nome:* Seu nome completo\n` +
          `*Endereço:* Rua, número, complemento\n` +
          `*Bairro:* Nome do bairro\n` +
          `*Cidade:* Nome da cidade\n` +
          `*CEP:* 00000-000\n` +
          `*Pagamento:* PIX, Cartão ou Dinheiro\n\n` +
          `Exemplo:\n` +
          `Nome: João Silva\n` +
          `Endereço: Rua Exemplo, 123, Apto 45\n` +
          `Bairro: Centro\n` +
          `Cidade: São Paulo\n` +
          `CEP: 01234-567\n` +
          `Pagamento: PIX`
  });
}

export async function processCheckoutData(phone: string, message: string, session: any) {
  // Extrair dados da mensagem
  const data = parseCheckoutMessage(message);
  
  if (!data.complete) {
    await sendWhatsAppMessage(phone, 'text', {
      text: '❌ Dados incompletos. Por favor, envie todos os dados solicitados.'
    });
    return;
  }

  // Criar pedido
  const order = await createOrderFromWhatsApp({
    phone,
    cart: session.cart_data,
    customer: data,
    restaurant_id: session.restaurant_id
  });

  // Confirmar pedido
  await sendWhatsAppMessage(phone, 'text', {
    text: `✅ *PEDIDO CONFIRMADO!*\n\n` +
          `📦 *Pedido #${order.id}*\n\n` +
          `Seus dados:\n` +
          `👤 ${data.name}\n` +
          `📍 ${data.address}\n` +
          `💳 ${data.payment}\n\n` +
          `⏰ Tempo estimado: 30-45 minutos\n\n` +
          `Obrigado pelo pedido! 🍕`
  });

  // Limpar carrinho
  await updateSession(phone, {
    session_state: 'menu',
    cart_data: []
  });
}
```

#### 7. Criar Pedido no Sistema

```typescript
// lib/whatsapp/order.ts
export async function createOrderFromWhatsApp(data: {
  phone: string;
  cart: any[];
  customer: any;
  restaurant_id: string;
}) {
  // Buscar produtos
  const productIds = data.cart.map(item => item.product_id);
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  // Calcular total
  let total = 0;
  const items = data.cart.map(item => {
    const product = products?.find(p => p.id === item.product_id);
    const itemTotal = (product?.price || 0) * item.quantity;
    total += itemTotal;
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      price: product?.price || 0,
      observations: item.observations
    };
  });

  // Criar pedido via API existente
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.customer.name,
      phone: data.phone,
      email: null,
      address: data.customer.address,
      complement: data.customer.complement || '',
      neighborhood: data.customer.neighborhood,
      city: data.customer.city,
      zipCode: data.customer.cep,
      paymentMethod: data.customer.payment.toLowerCase(),
      deliveryType: 'delivery',
      items: items,
      total: total,
      delivery_fee: 0, // Calcular se necessário
      restaurant_id: data.restaurant_id
    })
  });

  const result = await response.json();
  return result.order;
}
```

#### 8. API do WhatsApp

```typescript
// lib/whatsapp/api.ts
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(
  to: string,
  type: 'text' | 'interactive' | 'image' | 'template',
  message: any
) {
  const payload: any = {
    messaging_product: 'whatsapp',
    to: to,
    type: type
  };

  if (type === 'text') {
    payload.text = message;
  } else if (type === 'interactive') {
    payload.interactive = message;
  } else if (type === 'image') {
    payload.image = message;
  } else if (type === 'template') {
    payload.template = message;
  }

  const response = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}
```

## 🔄 Fluxo Completo

### 1. Cliente Inicia Conversa

```
Cliente: "Oi" ou "menu"
Bot: [Envia menu interativo com categorias]
```

### 2. Cliente Navega pelo Cardápio

```
Cliente: [Clica em "Pizzas"]
Bot: [Envia lista de pizzas com preços]
Cliente: [Clica em "Pizza Margherita"]
Bot: [Envia imagem e detalhes do produto]
```

### 3. Cliente Adiciona ao Carrinho

```
Cliente: [Clica em "Adicionar ao Carrinho"]
Bot: "✅ Pizza Margherita adicionada ao carrinho!"
Bot: [Mostra opções: "Ver Carrinho" ou "Continuar Comprando"]
```

### 4. Cliente Finaliza Pedido

```
Cliente: [Clica em "Ver Carrinho"]
Bot: [Mostra itens e total]
Cliente: [Clica em "Finalizar Pedido"]
Bot: "Por favor, envie seus dados..."
Cliente: [Envia dados formatados]
Bot: "✅ Pedido #123 confirmado!"
```

### 5. Sistema Processa Pedido

```
Webhook → Valida dados → Cria pedido no Supabase → 
Notifica cozinha → Atualiza status → Notifica cliente
```

## 🔒 Segurança e Validação

### Validações Necessárias

1. **Verificar Webhook**: Validar assinatura do WhatsApp
2. **Rate Limiting**: Limitar mensagens por número
3. **Validação de Dados**: Validar dados do cliente
4. **Sanitização**: Limpar inputs
5. **RLS**: Garantir isolamento multi-tenant

### Verificação de Webhook

```typescript
// app/api/webhooks/whatsapp/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar token
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}
```

## 💰 Custos

### WhatsApp Business API
- **Meta**: Variável (consulte)
- **Mensagens**: Primeiras 1.000 conversas/mês podem ser gratuitas
- **Templates**: Gratuitos após aprovação

### Serviços de Terceiros
- **Twilio**: ~$0.005 por mensagem
- **MessageBird**: ~€0.05 por mensagem
- **Evolution API**: Gratuito (self-hosted)

## 📝 Próximos Passos

### Fase 1: Configuração
1. Criar conta WhatsApp Business
2. Configurar WhatsApp Business API
3. Obter tokens de acesso
4. Configurar webhook

### Fase 2: Desenvolvimento
1. Criar webhook handler
2. Implementar lógica do chatbot
3. Criar funções de envio de mensagens
4. Integrar com API de pedidos

### Fase 3: Testes
1. Testar fluxo completo
2. Validar criação de pedidos
3. Testar diferentes cenários
4. Ajustar UX

### Fase 4: Deploy
1. Deploy em produção
2. Configurar webhook público
3. Monitorar uso
4. Coletar feedback

## 🎯 Vantagens

1. **Acessibilidade**: WhatsApp é universal
2. **Familiaridade**: Clientes já usam WhatsApp
3. **Interatividade**: Botões e menus intuitivos
4. **Automação**: Reduz trabalho manual
5. **Notificações**: Cliente recebe atualizações em tempo real

## ⚠️ Considerações

### Limitações

1. **Aprovação**: WhatsApp Business API requer aprovação
2. **Templates**: Mensagens automáticas precisam ser aprovadas
3. **Rate Limits**: Limites de mensagens por segundo
4. **Custos**: Pode ter custos conforme volume

### Melhorias Futuras

1. **IA para Processamento**: Entender mensagens livres
2. **Pagamento**: Integrar pagamento via WhatsApp
3. **Rastreamento**: Status de entrega em tempo real
4. **Promoções**: Enviar ofertas personalizadas

---

## 📌 Resumo

**É totalmente possível implementar:**
- ✅ Cardápio digital no WhatsApp
- ✅ Pedidos pelo WhatsApp
- ✅ Integração automática com o sistema

**Recomendação:**
- Começar com WhatsApp Business API (oficial)
- Implementar webhook para receber mensagens
- Criar lógica de chatbot para navegação
- Integrar com API de pedidos existente

**Tempo estimado:** 3-4 semanas de desenvolvimento

**Complexidade:** Média-Alta (requer configuração de API externa)

