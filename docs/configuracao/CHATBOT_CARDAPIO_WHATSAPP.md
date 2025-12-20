# 🤖 Chatbot com Cardápio e Integração WhatsApp

## 📋 Objetivo

Transformar o chatbot atual (Programa de Fidelidade) em um **assistente completo de pedidos** que permite:
1. **Exibir cardápio completo** dentro do chatbot
2. **Automatizar criação de pedidos** diretamente pelo chat
3. **Enviar pedido para WhatsApp** da pizzaria se o cliente preferir

## ✅ É Possível Implementar?

**SIM, é totalmente possível!** O sistema já possui:
- ✅ Chatbot funcional (`LoyaltyChatbot`)
- ✅ Estrutura de produtos e categorias no banco
- ✅ Sistema de carrinho e pedidos
- ✅ API de criação de pedidos

**O que precisa ser adicionado:**
- Integração com WhatsApp Business API
- Interface de cardápio dentro do chatbot
- Fluxo de pedido pelo chat
- Opção de enviar para WhatsApp

## 🎯 Funcionalidades Propostas

### 1. Cardápio no Chatbot

**Funcionalidade:**
- Cliente abre chatbot e vê opção "Ver Cardápio"
- Chatbot exibe categorias e produtos
- Cliente pode navegar, ver detalhes e adicionar ao carrinho
- Carrinho visível dentro do chatbot

**Interface:**
- Cards de produtos com imagem, nome, preço
- Botões "Ver Detalhes" e "Adicionar ao Carrinho"
- Carrinho flutuante mostrando itens adicionados
- Total do pedido sempre visível

### 2. Automação de Pedido

**Fluxo:**
1. Cliente adiciona produtos ao carrinho pelo chatbot
2. Cliente clica em "Finalizar Pedido"
3. Chatbot solicita dados (endereço, telefone, método de pagamento)
4. Sistema cria pedido automaticamente
5. Confirmação enviada ao cliente

**Vantagens:**
- Pedido rápido sem sair do chat
- Experiência fluida e intuitiva
- Reduz abandono de carrinho

### 3. Envio para WhatsApp

**Funcionalidade:**
- Cliente tem opção "Prefiro pedir pelo WhatsApp"
- Sistema formata pedido em mensagem
- Abre WhatsApp Web/App com mensagem pré-formatada
- Cliente só precisa enviar

**Formato da Mensagem:**
```
🍕 *PEDIDO - TOM & JERRY PIZZARIA*

👤 *Cliente:* [Nome]
📞 *Telefone:* [Telefone]
📍 *Endereço:* [Endereço completo]

📦 *ITENS:*
• 2x Pizza Margherita - R$ 45,00
• 1x Refrigerante - R$ 8,00

💰 *TOTAL:* R$ 98,00
🚚 *Taxa de Entrega:* R$ 5,00
💳 *Pagamento:* PIX

⏰ *Horário:* [Data e Hora]
```

## 🏗️ Arquitetura Proposta

### Estrutura de Componentes

#### 1. `ChatbotWithMenu` (Componente Principal)
Substitui ou estende `LoyaltyChatbot` para incluir funcionalidades de cardápio.

**Funcionalidades:**
- Gerenciar estado do chat
- Alternar entre modos: "Fidelidade" e "Cardápio"
- Exibir produtos e categorias
- Gerenciar carrinho dentro do chat
- Processar pedidos

#### 2. `MenuView` (Componente de Cardápio)
Exibe produtos dentro do chatbot.

**Funcionalidades:**
- Listar categorias
- Exibir produtos por categoria
- Mostrar detalhes do produto
- Adicionar ao carrinho
- Visualizar carrinho

#### 3. `CartView` (Componente de Carrinho)
Carrinho dentro do chatbot.

**Funcionalidades:**
- Listar itens adicionados
- Editar quantidades
- Remover itens
- Calcular total
- Finalizar pedido

#### 4. `OrderForm` (Formulário de Pedido)
Formulário para coletar dados do cliente.

**Campos:**
- Nome
- Telefone
- Endereço (CEP, rua, número, complemento, bairro, cidade)
- Método de pagamento
- Tipo de entrega (Delivery/Retirada)

#### 5. `WhatsAppButton` (Botão de WhatsApp)
Botão para enviar pedido para WhatsApp.

**Funcionalidade:**
- Formatar pedido como mensagem
- Gerar link do WhatsApp com mensagem pré-formatada
- Abrir WhatsApp Web/App

### Estrutura de Banco de Dados

**Nenhuma alteração necessária!** O sistema já possui:
- `products`: Produtos do cardápio
- `categories`: Categorias
- `orders`: Pedidos
- `order_items`: Itens dos pedidos

**Opcional - Adicionar tabela para histórico de pedidos do chatbot:**
```sql
CREATE TABLE IF NOT EXISTS chatbot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  chat_session_id VARCHAR(255), -- ID da sessão do chat
  sent_to_whatsapp BOOLEAN DEFAULT FALSE, -- Se foi enviado para WhatsApp
  whatsapp_message TEXT, -- Mensagem formatada enviada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Routes Necessárias

#### 1. `GET /api/chatbot/products`
Busca produtos e categorias para o chatbot.

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Pizzas",
      "image": "url"
    }
  ],
  "products": [
    {
      "id": "uuid",
      "name": "Pizza Margherita",
      "description": "Molho, mussarela, manjericão",
      "price": 45.00,
      "image": "url",
      "category_id": "uuid"
    }
  ]
}
```

#### 2. `POST /api/chatbot/orders`
Cria pedido a partir do chatbot.

**Request:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "observations": "Sem cebola"
    }
  ],
  "customer": {
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "email": "joao@email.com"
  },
  "delivery": {
    "type": "delivery",
    "address": "Rua Exemplo, 123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "zipCode": "01234-567"
  },
  "payment": {
    "method": "pix"
  },
  "restaurant_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "pending",
    "total": 98.00
  }
}
```

#### 3. `POST /api/chatbot/whatsapp/format`
Formata pedido para envio via WhatsApp.

**Request:**
```json
{
  "orderId": "uuid",
  "restaurantId": "uuid"
}
```

**Response:**
```json
{
  "message": "🍕 *PEDIDO - TOM & JERRY PIZZARIA*\n\n...",
  "whatsapp_url": "https://wa.me/5511999999999?text=..."
}
```

## 🔄 Fluxo de Uso

### Fluxo 1: Pedido pelo Chatbot

1. **Cliente abre chatbot** → Vê opções: "Programa de Fidelidade" e "Ver Cardápio"
2. **Cliente clica "Ver Cardápio"** → Chatbot exibe categorias
3. **Cliente seleciona categoria** → Chatbot exibe produtos
4. **Cliente clica em produto** → Chatbot mostra detalhes e botão "Adicionar"
5. **Cliente adiciona produtos** → Carrinho é atualizado
6. **Cliente clica "Finalizar Pedido"** → Chatbot solicita dados
7. **Cliente preenche formulário** → Nome, telefone, endereço, pagamento
8. **Sistema cria pedido** → Confirmação enviada ao cliente
9. **Cliente recebe confirmação** → "Pedido #123 criado com sucesso!"

### Fluxo 2: Pedido via WhatsApp

1. **Cliente abre chatbot** → Vê opções
2. **Cliente adiciona produtos ao carrinho** → Pelo chatbot
3. **Cliente clica "Enviar para WhatsApp"** → Sistema formata mensagem
4. **Sistema abre WhatsApp** → Com mensagem pré-formatada
5. **Cliente revisa e envia** → Mensagem vai para WhatsApp da pizzaria
6. **Pizzaria recebe pedido** → Processa manualmente

**Vantagem:** Cliente não precisa digitar tudo, apenas enviar.

## 🛠️ Tecnologias e Integrações

### 1. WhatsApp Business API

**Opções:**

#### **Opção A: WhatsApp Business API Oficial (Meta)**
- **Custo**: Variável (consulte Meta)
- **Requisitos**: Aprovação da Meta, número verificado
- **Vantagem**: Oficial, confiável
- **Desvantagem**: Processo de aprovação demorado

#### **Opção B: WhatsApp Web Link (Recomendado para início)**
- **Custo**: Gratuito
- **Requisitos**: Nenhum
- **Vantagem**: Implementação imediata
- **Funcionalidade**: Abre WhatsApp Web/App com mensagem pré-formatada
- **Limitação**: Cliente precisa enviar manualmente

**Implementação:**
```typescript
const formatWhatsAppMessage = (order: Order) => {
  const message = `🍕 *PEDIDO - TOM & JERRY PIZZARIA*

👤 *Cliente:* ${order.customer_name}
📞 *Telefone:* ${order.phone}
📍 *Endereço:* ${order.address}

📦 *ITENS:*
${order.items.map(item => `• ${item.quantity}x ${item.product.name} - ${formatCurrency(item.price * item.quantity)}`).join('\n')}

💰 *TOTAL:* ${formatCurrency(order.total)}
🚚 *Taxa de Entrega:* ${formatCurrency(order.delivery_fee)}
💳 *Pagamento:* ${order.payment_method}

⏰ *Horário:* ${new Date(order.created_at).toLocaleString('pt-BR')}`;

  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = '5511999999999'; // Número da pizzaria
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};
```

#### **Opção C: API de Terceiros (Evolution API, Baileys, etc.)**
- **Custo**: Variável (geralmente mensal)
- **Requisitos**: Servidor próprio ou serviço gerenciado
- **Vantagem**: Automação completa
- **Desvantagem**: Pode violar termos do WhatsApp

### 2. Interface do Chatbot

**Tecnologias:**
- **React**: Componentes do chatbot
- **Framer Motion**: Animações
- **Tailwind CSS**: Estilização
- **Zustand**: Gerenciamento de estado do carrinho

**Estrutura:**
```
components/
  chatbot/
    chatbot-with-menu.tsx      # Componente principal
    menu-view.tsx              # Visualização do cardápio
    cart-view.tsx              # Carrinho dentro do chat
    order-form.tsx              # Formulário de pedido
    whatsapp-button.tsx         # Botão de WhatsApp
    message-bubble.tsx          # Bolha de mensagem
```

## 📐 Implementação Detalhada

### Fase 1: Cardápio no Chatbot

**Passos:**
1. Criar componente `MenuView` para exibir produtos
2. Integrar busca de produtos do Supabase
3. Adicionar navegação por categorias
4. Implementar visualização de detalhes do produto
5. Adicionar botão "Adicionar ao Carrinho"

**Código Base:**
```typescript
// components/chatbot/menu-view.tsx
import { useState, useEffect } from 'react';
import { supabase, Product, Category } from '@/lib/supabase';

export function MenuView({ onAddToCart }: { onAddToCart: (product: Product) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    // Buscar categorias e produtos do restaurante atual
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('order');

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('available', true)
      .order('name');

    if (categoriesData) setCategories(categoriesData);
    if (productsData) setProducts(productsData);
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  return (
    <div className="space-y-4">
      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setSelectedCategory(null)}>
          Todos
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Produtos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredProducts.map(product => (
          <div key={product.id} className="flex gap-3 p-3 bg-white rounded-lg">
            <img src={product.image} alt={product.name} className="w-16 h-16 rounded" />
            <div className="flex-1">
              <h4 className="font-bold">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-lg font-bold text-primary-yellow">
                {formatCurrency(product.price)}
              </p>
            </div>
            <button onClick={() => onAddToCart(product)}>
              Adicionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Fase 2: Carrinho no Chatbot

**Passos:**
1. Criar componente `CartView`
2. Integrar com `useCartStore` (Zustand)
3. Exibir itens do carrinho
4. Permitir editar/remover itens
5. Calcular total
6. Botão "Finalizar Pedido"

**Código Base:**
```typescript
// components/chatbot/cart-view.tsx
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';

export function CartView({ onCheckout }: { onCheckout: () => void }) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg">Seu Carrinho</h3>
      
      {items.length === 0 ? (
        <p className="text-gray-500">Carrinho vazio</p>
      ) : (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white rounded">
                <span className="flex-1">{item.product.name} x{item.quantity}</span>
                <span className="font-bold">{formatCurrency(item.product.price * item.quantity)}</span>
                <button onClick={() => removeItem(index)}>Remover</button>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            <button onClick={onCheckout} className="w-full mt-2 bg-primary-yellow text-black py-2 rounded">
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Fase 3: Formulário de Pedido

**Passos:**
1. Criar componente `OrderForm`
2. Coletar dados do cliente
3. Validar campos obrigatórios
4. Chamar API para criar pedido
5. Exibir confirmação

**Código Base:**
```typescript
// components/chatbot/order-form.tsx
import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';

export function OrderForm({ restaurantId, onSuccess }: { restaurantId: string, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    city: '',
    zipCode: '',
    paymentMethod: 'pix' as 'pix' | 'card' | 'cash'
  });
  const { items, getTotal, clearCart } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/chatbot/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          observations: item.observations
        })),
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        },
        delivery: {
          type: 'delivery',
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          zipCode: formData.zipCode
        },
        payment: {
          method: formData.paymentMethod
        },
        restaurant_id: restaurantId
      })
    });

    if (response.ok) {
      clearCart();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Campos do formulário */}
      <input
        type="text"
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      {/* ... outros campos ... */}
      
      <button type="submit" className="w-full bg-primary-yellow text-black py-2 rounded">
        Confirmar Pedido
      </button>
    </form>
  );
}
```

### Fase 4: Integração WhatsApp

**Passos:**
1. Criar função para formatar mensagem
2. Criar componente `WhatsAppButton`
3. Gerar link do WhatsApp
4. Abrir WhatsApp Web/App

**Código Base:**
```typescript
// components/chatbot/whatsapp-button.tsx
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';

export function WhatsAppButton({ restaurantPhone, restaurantName }: { restaurantPhone: string, restaurantName: string }) {
  const { items, getTotal } = useCartStore();

  const formatMessage = () => {
    const itemsText = items.map(item => 
      `• ${item.quantity}x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}`
    ).join('\n');

    return `🍕 *PEDIDO - ${restaurantName}*

📦 *ITENS:*
${itemsText}

💰 *TOTAL:* ${formatCurrency(getTotal())}

⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}`;
  };

  const handleClick = () => {
    const message = formatMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-green-500 text-white py-2 rounded flex items-center justify-center gap-2"
    >
      <span>📱</span>
      Enviar para WhatsApp
    </button>
  );
}
```

## 🎨 Interface do Usuário

### Estados do Chatbot

1. **Estado Inicial**: Menu de opções
   - "Programa de Fidelidade"
   - "Ver Cardápio"
   - "Meus Pedidos"

2. **Estado Cardápio**: Visualização de produtos
   - Lista de categorias
   - Lista de produtos
   - Carrinho flutuante

3. **Estado Carrinho**: Itens adicionados
   - Lista de itens
   - Total
   - Botões: "Continuar Comprando" e "Finalizar Pedido"

4. **Estado Formulário**: Dados do cliente
   - Campos de preenchimento
   - Validação
   - Botão "Confirmar Pedido"

5. **Estado Confirmação**: Pedido criado
   - Número do pedido
   - Resumo
   - Opções: "Ver Pedido" ou "Novo Pedido"

### Design Responsivo

- **Mobile**: Chatbot ocupa tela inteira ou grande parte
- **Desktop**: Chatbot em janela flutuante (como atual)
- **Produtos**: Cards compactos com imagem, nome, preço
- **Carrinho**: Lista simples e clara
- **Formulário**: Campos grandes e fáceis de preencher

## 📊 Fluxo de Dados

```
Cliente → Chatbot → MenuView → Carrinho → OrderForm → API /api/chatbot/orders → Supabase (orders)
                                                              ↓
                                                         WhatsAppButton → WhatsApp
```

## 🔒 Segurança e Validação

### Validações Necessárias

1. **Produtos**: Verificar se produto existe e está disponível
2. **Quantidade**: Validar quantidade mínima e máxima
3. **Dados do Cliente**: Validar telefone, email, CEP
4. **Endereço**: Validar CEP e calcular frete
5. **Restaurante**: Garantir isolamento multi-tenant

### Segurança

- **Sanitização**: Limpar inputs do usuário
- **Rate Limiting**: Limitar criação de pedidos por IP
- **Validação Backend**: Sempre validar no servidor
- **RLS**: Usar Row Level Security do Supabase

## 💰 Custos

### WhatsApp Business API (Opcional)
- **Meta WhatsApp API**: Variável (consulte)
- **Serviços Terceiros**: R$ 50-200/mês

### Desenvolvimento
- **Tempo estimado**: 2-3 semanas
- **Complexidade**: Média

## 📝 Próximos Passos

### Fase 1: Planejamento
1. Definir design da interface
2. Mapear fluxos de usuário
3. Criar mockups

### Fase 2: Desenvolvimento
1. Criar componentes do chatbot
2. Integrar busca de produtos
3. Implementar carrinho
4. Criar formulário de pedido
5. Integrar API de pedidos

### Fase 3: Integração WhatsApp
1. Implementar formatação de mensagem
2. Criar botão de WhatsApp
3. Testar abertura do WhatsApp

### Fase 4: Testes
1. Testar fluxo completo
2. Validar em diferentes dispositivos
3. Testar integração com WhatsApp
4. Ajustar UX

### Fase 5: Deploy
1. Deploy em produção
2. Monitorar uso
3. Coletar feedback
4. Iterar melhorias

## 🎯 Vantagens da Implementação

1. **Experiência do Cliente**: Pedido rápido sem sair do chat
2. **Redução de Abandono**: Menos cliques = mais conversões
3. **Flexibilidade**: Cliente escolhe como pedir
4. **Automação**: Reduz trabalho manual
5. **Integração**: WhatsApp já é familiar para clientes

## ⚠️ Considerações

### Limitações do WhatsApp Web Link
- Cliente precisa enviar mensagem manualmente
- Não há confirmação automática
- Pizzaria precisa processar manualmente

### Melhorias Futuras
- Integração completa com WhatsApp Business API
- Notificações automáticas
- Status de pedido via WhatsApp
- Chatbot com IA para respostas automáticas

---

## 📌 Resumo

**É totalmente possível implementar:**
- ✅ Cardápio dentro do chatbot
- ✅ Automação de pedidos
- ✅ Envio para WhatsApp

**Recomendação:**
- Começar com WhatsApp Web Link (gratuito e rápido)
- Implementar cardápio e pedido pelo chatbot
- Depois evoluir para WhatsApp Business API se necessário

**Tempo estimado:** 2-3 semanas de desenvolvimento

