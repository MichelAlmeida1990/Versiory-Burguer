# 🗺️ ROADMAP: Sistema de Login e Gestão de Pedidos para Cozinha

## 📊 Análise de Sistemas Externos que Funcionam

### 🏆 Referências de Sistemas de Sucesso

#### 1. **Toast POS** (Sistema de Restaurante Completo)
**Características principais:**
- ✅ Dashboard de cozinha em tempo real
- ✅ Pedidos aparecem automaticamente em ordem de chegada
- ✅ Notificações visuais e sonoras
- ✅ Status: Novo → Em Preparo → Pronto → Entregue
- ✅ Timer de tempo de preparo
- ✅ Agrupamento por tipo de prato
- ✅ Priorização automática por horário

**Ideias para implementar:**
- Cards grandes e visíveis na cozinha
- Cores diferentes por status (amarelo = novo, laranja = preparando, verde = pronto)
- Som de notificação quando novo pedido chega
- Contador de tempo desde que o pedido foi criado
- Botão grande "Iniciar Preparo" e "Finalizar"

#### 2. **Square for Restaurants**
**Características principais:**
- ✅ Fila de pedidos ordenada por horário
- ✅ Separação por tipo de pedido (Delivery, Balcão, Mesa)
- ✅ Alertas quando pedido está demorando
- ✅ Histórico de tempo médio de preparo
- ✅ Sistema de prioridades

**Ideias para implementar:**
- Mostrar tempo estimado de preparo baseado em histórico
- Alertar quando pedido passa do tempo médio
- Separar visualmente pedidos de delivery vs balcão

#### 3. **iiko** (Sistema Russo de Restaurantes)
**Características principais:**
- ✅ Múltiplas telas de cozinha (uma por setor)
- ✅ Pedidos aparecem em colunas (Novos, Em Preparo, Prontos)
- ✅ Drag and drop para mudar status
- ✅ Filtros por tipo de prato

**Ideias para implementar:**
- Layout tipo Kanban (colunas)
- Arrastar pedido entre colunas para mudar status
- Filtros por categoria de produto

#### 4. **Lightspeed Restaurant**
**Características principais:**
- ✅ Timer visual grande em cada pedido
- ✅ Cores vibrantes para chamar atenção
- ✅ Agrupamento inteligente de itens similares
- ✅ Modo escuro para cozinha (menos cansaço visual)

**Ideias para implementar:**
- Timer grande e visível
- Modo escuro otimizado
- Agrupar itens do mesmo tipo

---

## 🎯 OBJETIVOS

### 1. Sistema de Autenticação
- ✅ Login para Admin (email/senha ou Google)
- ✅ Login para Clientes (email/senha, Google, ou WhatsApp OTP)
- ✅ Proteção de rotas admin
- ✅ Sessão persistente
- ✅ Logout

### 2. Gestão de Pedidos para Cozinha
- ✅ Pedidos aparecem automaticamente em ordem de chegada
- ✅ Interface otimizada para tablets/telas grandes
- ✅ Notificações visuais e sonoras
- ✅ Sistema de liberação (marcar como "Em Preparo")
- ✅ Timer de tempo de preparo
- ✅ Status claro e visível
- ✅ Histórico de pedidos do dia

---

## 📋 FASE 1: Sistema de Autenticação

### 1.1 Sistema de Identificação por Telefone (Clientes)

**Conceito:**
- ✅ Cliente informa número de telefone no checkout
- ✅ Sistema verifica se já existe cliente com esse telefone
- ✅ Se existir: carrega dados salvos (nome, endereço, histórico)
- ✅ Se não existir: cria novo registro e salva dados
- ✅ Próxima vez que usar o mesmo telefone: dados já estão salvos!

**Vantagens:**
- ✅ Não precisa criar conta/senha
- ✅ Experiência mais rápida
- ✅ Dados salvos automaticamente
- ✅ Histórico de pedidos vinculado ao telefone
- ✅ Funciona como "login sem senha"

**Estrutura de Clientes:**
```sql
-- Tabela de clientes (identificados por telefone)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(50) NOT NULL UNIQUE,  -- Telefone como identificador único
  name VARCHAR(255),
  email VARCHAR(255),
  default_address TEXT,
  default_complement TEXT,
  default_neighborhood VARCHAR(255),
  default_city VARCHAR(255),
  default_zip_code VARCHAR(20),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Fluxo de Identificação:**
1. Cliente preenche checkout com telefone
2. Sistema busca: `SELECT * FROM customers WHERE phone = '...'`
3. Se encontrou: Preenche automaticamente nome, endereço, etc.
4. Se não encontrou: Cliente preenche tudo, sistema salva
5. Ao finalizar pedido: Atualiza dados do cliente (se mudou algo)

### 1.2 Sistema de Autenticação para Admin/Cozinha

**Vantagens do Supabase Auth:**
- ✅ Já está no projeto
- ✅ Suporta múltiplos provedores (Email, Google, WhatsApp)
- ✅ Gerenciamento de sessões automático
- ✅ Row Level Security (RLS) integrado
- ✅ Gratuito até certo limite

**Estrutura de Usuários (Admin/Cozinha):**
```sql
-- Tabela de usuários administrativos (já existe no Supabase Auth)
-- Precisamos criar tabela de perfis para roles

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'kitchen', 'customer')),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

### 1.3 Integração: Clientes com Pedidos

**Atualizar tabela orders:**
```sql
-- Adicionar referência ao cliente
ALTER TABLE orders 
ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Trigger para atualizar estatísticas do cliente
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total,
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();
```

### 1.4 Página de Login (Admin/Cozinha)

**Rota:** `/login`
- Formulário de email/senha
- Botão "Entrar com Google"
- Link "Esqueci minha senha"
- Redirecionamento automático após login:
  - Admin → `/admin`
  - Cozinha → `/cozinha`

**Componente:**
```typescript
// app/login/page.tsx
- Formulário de login
- Integração com Supabase Auth
- Redirecionamento baseado em role
```

### 1.5 Checkout com Identificação por Telefone

**Rota:** `/checkout` (já existe, precisa melhorar)

**Funcionalidades:**
1. Campo de telefone (obrigatório)
2. Ao digitar telefone, buscar cliente existente
3. Se encontrou: Preencher automaticamente
   - Nome
   - Email
   - Endereço padrão
   - Histórico de pedidos (opcional, mostrar link)
4. Se não encontrou: Cliente preenche tudo
5. Ao finalizar: Salvar/atualizar dados do cliente

**Código de Exemplo:**
```typescript
// Em app/checkout/page.tsx

const [phone, setPhone] = useState("");
const [customerData, setCustomerData] = useState(null);

// Buscar cliente ao digitar telefone
const searchCustomer = async (phoneNumber: string) => {
  if (phoneNumber.length >= 10) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phoneNumber)
      .single();
    
    if (data) {
      setCustomerData(data);
      // Preencher formulário automaticamente
      setFormData({
        name: data.name || '',
        email: data.email || '',
        address: data.default_address || '',
        // ... outros campos
      });
      toast.success(`Bem-vindo de volta, ${data.name}!`);
    }
  }
};

// Salvar/atualizar cliente ao finalizar pedido
const saveCustomer = async (orderData: any) => {
  const customerPayload = {
    phone: orderData.phone,
    name: orderData.name,
    email: orderData.email,
    default_address: orderData.address,
    default_complement: orderData.complement,
    default_neighborhood: orderData.neighborhood,
    default_city: orderData.city,
    default_zip_code: orderData.zipCode,
    updated_at: new Date().toISOString()
  };

  // Upsert (inserir ou atualizar)
  const { data, error } = await supabase
    .from('customers')
    .upsert(customerPayload, { 
      onConflict: 'phone',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (data) {
    // Associar pedido ao cliente
    await supabase
      .from('orders')
      .update({ customer_id: data.id })
      .eq('id', orderId);
  }
};
```

### 1.3 Middleware de Proteção

**Arquivo:** `middleware.ts`
- Proteger rotas `/admin/*` (só admin)
- Proteger rotas `/cozinha/*` (admin ou kitchen)
- Redirecionar não autenticados para `/login`

### 1.4 Context/Hook de Autenticação

**Arquivo:** `lib/auth.ts` ou `contexts/auth-context.tsx`
- Hook `useAuth()` para acessar usuário atual
- Função `login()`, `logout()`, `signup()`
- Verificação de role

---

## 📋 FASE 2: Melhorias na Tela de Cozinha

### 2.1 Layout Inspirado em Toast POS

**Características:**
- ✅ Cards grandes e visíveis
- ✅ Ordem estrita por `created_at ASC`
- ✅ Cores vibrantes por status
- ✅ Timer grande em cada pedido
- ✅ Botões grandes para ações

**Status e Cores:**
```
🟡 confirmed (Novo)     - Amarelo vibrante, animação pulsante
🟠 preparing (Preparando) - Laranja, sem animação
🟢 ready (Pronto)        - Verde, sem animação
```

### 2.2 Sistema de Liberação

**Fluxo:**
1. Pedido chega com status `confirmed` (amarelo, pulsante)
2. Cozinheiro clica "Iniciar Preparo" → status vira `preparing`
3. Quando termina, clica "Finalizar" → status vira `ready`
4. Admin pode marcar como "Entregue" depois

**Botões:**
- "Iniciar Preparo" (grande, amarelo) - só aparece se status = confirmed
- "Finalizar" (grande, verde) - só aparece se status = preparing
- "Ver Detalhes" (pequeno, cinza)

### 2.3 Timer de Tempo de Preparo

**Funcionalidade:**
- Mostrar tempo desde que pedido foi criado
- Exemplo: "Há 5 minutos"
- Se passar de 15 minutos, alertar em vermelho
- Se passar de 30 minutos, alertar crítico

### 2.4 Notificações

**Visual:**
- Card novo pedido: animação pulsante
- Borda amarela brilhante
- Ícone de relógio girando

**Sonora:**
- Som ao detectar novo pedido
- Configuração para ligar/desligar som
- Diferentes sons para diferentes tipos

### 2.5 Agrupamento e Filtros

**Agrupamento:**
- Agrupar itens do mesmo pedido
- Mostrar total de itens no pedido
- Mostrar observações destacadas

**Filtros (opcional):**
- Filtrar por tipo de produto (Pizza, Hambúrguer, etc)
- Filtrar por tempo (últimos 30 min, última hora)

---

## 📋 FASE 3: Melhorias no Admin - Gestão de Pedidos

### 3.1 Dashboard de Pedidos Melhorado

**Características:**
- ✅ Lista de pedidos em ordem de chegada
- ✅ Filtros por status
- ✅ Busca por cliente/número do pedido
- ✅ Ações rápidas (Confirmar, Cancelar, Marcar como Entregue)

### 3.2 Controle de Status

**Fluxo completo:**
```
pending → confirmed → preparing → ready → delivering → delivered
         ↓
      cancelled (pode cancelar em qualquer momento)
```

**Permissões:**
- Admin: pode mudar qualquer status
- Cozinha: só pode mudar confirmed → preparing → ready

### 3.3 Histórico e Relatórios

**Histórico:**
- Ver todos os pedidos do dia
- Tempo médio de preparo
- Pedidos mais demorados

**Relatórios:**
- Pedidos por hora
- Produtos mais vendidos
- Tempo médio de preparo por produto

---

## 📋 FASE 4: Real-time com Supabase

### 4.1 Subscription em Tempo Real

**Implementação:**
```typescript
// Usar Supabase Realtime
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      // Novo pedido chegou!
      playSound();
      addOrderToQueue(payload.new);
    }
  )
  .subscribe();
```

**Vantagens:**
- ✅ Pedidos aparecem instantaneamente
- ✅ Não precisa ficar atualizando página
- ✅ Sincronização automática entre telas

### 4.2 Atualização Automática de Status

**Quando um pedido muda de status:**
- Todas as telas (admin, cozinha) atualizam automaticamente
- Cliente vê atualização em tempo real na página de acompanhamento

---

## 🎨 Design da Tela de Cozinha (Inspirado em Toast)

### Layout Proposto:

```
┌─────────────────────────────────────────────────────────┐
│  🍽️ COZINHA - Pedidos em Andamento                      │
│  🔊 Som: [ON]  📊 Hoje: 45 pedidos                      │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🟡 NOVO         │  │  🟠 PREPARANDO   │  │  🟢 PRONTO       │
│                  │  │                  │  │                  │
│  #1234           │  │  #1233           │  │  #1232           │
│  ⏱️ Há 2 min     │  │  ⏱️ Há 8 min     │  │  ⏱️ Há 15 min    │
│  👤 João Silva   │  │  👤 Maria Santos │  │  👤 Pedro Costa   │
│                  │  │                  │  │                  │
│  2x Pizza M      │  │  1x Hambúrguer   │  │  3x Refrigerante │
│  1x Refrigerante  │  │  2x Batata       │  │                  │
│                  │  │                  │  │                  │
│  [INICIAR]       │  │  [FINALIZAR]     │  │  [ENTREGAR]      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Características Visuais:

1. **Cards Grandes:**
   - Mínimo 300px de largura
   - Altura suficiente para todas as informações
   - Espaçamento generoso

2. **Cores:**
   - Amarelo (#FFD700) para novos pedidos
   - Laranja (#FF8C00) para em preparo
   - Verde (#32CD32) para prontos

3. **Tipografia:**
   - Número do pedido: 24px, bold
   - Timer: 18px, monospace
   - Itens: 16px, regular

4. **Animações:**
   - Pulsar para novos pedidos
   - Fade in quando aparece
   - Slide quando muda de coluna

---

## 🔄 Fluxo Completo de um Pedido

### 1. Cliente faz pedido
- Status: `pending`
- Aparece no admin

### 2. Admin confirma pedido
- Status: `pending` → `confirmed`
- **Aparece na cozinha** (amarelo, pulsante, com som)
- Timer começa a contar

### 3. Cozinheiro inicia preparo
- Clica "Iniciar Preparo"
- Status: `confirmed` → `preparing`
- Card muda para laranja
- Timer continua contando

### 4. Cozinheiro finaliza
- Clica "Finalizar"
- Status: `preparing` → `ready`
- Card muda para verde
- Admin é notificado

### 5. Admin marca como entregue
- Status: `ready` → `delivered`
- Pedido sai da tela de cozinha
- Cliente recebe notificação

---

## 📅 Estimativa de Implementação

| Fase | Complexidade | Tempo Estimado |
|------|--------------|----------------|
| Fase 1: Clientes por Telefone | Média | 3-4 horas |
| Fase 2: Autenticação Admin/Cozinha | Média | 4-6 horas |
| Fase 3: Tela de Cozinha | Alta | 6-8 horas |
| Fase 4: Real-time | Média | 2-3 horas |
| Fase 5: Admin Melhorado | Média | 3-4 horas |
| **TOTAL** | | **18-25 horas** |

---

## 🚀 Próximos Passos (Ordem de Implementação)

### Prioridade 1: Sistema de Clientes por Telefone
1. ✅ Criar tabela `customers`
2. ✅ Implementar busca de cliente por telefone no checkout
3. ✅ Preencher formulário automaticamente se cliente existir
4. ✅ Salvar/atualizar dados do cliente ao finalizar pedido
5. ✅ Associar pedidos ao cliente
6. ✅ Criar página de histórico de pedidos do cliente

### Prioridade 2: Autenticação Admin/Cozinha
1. ✅ Configurar Supabase Auth
2. ✅ Criar tabela `user_profiles`
3. ✅ Criar página de login
4. ✅ Criar middleware de proteção
5. ✅ Criar hook `useAuth()`
6. ✅ Proteger rotas admin e cozinha

### Prioridade 3: Tela de Cozinha
1. ✅ Redesenhar layout (cards grandes, cores)
2. ✅ Implementar ordem estrita por `created_at`
3. ✅ Adicionar timer em cada pedido
4. ✅ Implementar botões "Iniciar Preparo" e "Finalizar"
5. ✅ Adicionar notificações visuais e sonoras
6. ✅ Adicionar filtros e busca

### Prioridade 4: Real-time
1. ✅ Implementar Supabase Realtime
2. ✅ Atualização automática de pedidos
3. ✅ Sincronização entre telas

### Prioridade 5: Admin Melhorado
1. ✅ Melhorar dashboard de pedidos
2. ✅ Adicionar filtros e busca
3. ✅ Adicionar relatórios básicos

---

## 💡 Exemplo Prático: Fluxo Completo

### Cenário: Cliente Novo - Pizza Margherita Média + Queijo Extra

1. **Cliente acessa checkout (13:00)**
   - Digita telefone: `(11) 98765-4321`
   - Sistema busca: não encontrou
   - Cliente preenche: Nome, Email, Endereço
   - Finaliza pedido

2. **Sistema salva cliente**
   - Cria registro em `customers` com telefone
   - Salva todos os dados fornecidos
   - Cria pedido com `customer_id` vinculado

3. **Próxima vez que usar mesmo telefone (13:30)**
   - Digita telefone: `(11) 98765-4321`
   - Sistema busca: encontrou!
   - **Preenche automaticamente:**
     - Nome: "João Silva"
     - Email: "joao@email.com"
     - Endereço completo
   - Cliente só confirma e finaliza (muito mais rápido!)

4. **Pedido criado (13:00)**
   - Status: `pending`
   - Admin vê no dashboard

2. **Admin confirma (13:01)**
   - Status: `pending` → `confirmed`
   - **Cozinha recebe:**
     - Card amarelo pulsante
     - Som de notificação
     - Timer: "Há 0 minutos"
     - Botão grande "INICIAR PREPARO"

6. **Cozinheiro inicia (13:02)**
   - Clica "INICIAR PREPARO"
   - Status: `confirmed` → `preparing`
   - Card muda para laranja
   - Timer: "Há 1 minuto"
   - Botão muda para "FINALIZAR"

7. **Cozinheiro finaliza (13:12)**
   - Clica "FINALIZAR"
   - Status: `preparing` → `ready`
   - Card muda para verde
   - Timer: "Há 11 minutos"
   - Admin é notificado

8. **Admin entrega (13:15)**
   - Status: `ready` → `delivered`
   - Pedido sai da tela de cozinha
   - Cliente recebe notificação

---

## ✅ Conclusão

**É totalmente viável e já temos a base!**

O sistema atual já tem:
- ✅ Tela de cozinha básica (`/cozinha`)
- ✅ Sistema de pedidos funcionando
- ✅ Supabase configurado (pode usar Auth)
- ✅ Checkout funcionando

**O que precisa:**
1. **Sistema de clientes por telefone** (novo, muito útil!)
   - Identificação automática
   - Dados salvos automaticamente
   - Histórico de pedidos
2. Adicionar autenticação para admin/cozinha (Supabase Auth)
3. Melhorar UI da cozinha (inspirado em Toast POS)
4. Implementar ordem estrita por chegada
5. Adicionar real-time
6. Sistema de liberação de pedidos

**Complexidade:** Média-Alta
**Tempo:** 18-25 horas
**Resultado:** Sistema profissional com identificação inteligente de clientes e gestão completa de cozinha

### 🎯 Vantagens do Sistema por Telefone

✅ **Para o Cliente:**
- Não precisa criar conta/senha
- Dados salvos automaticamente
- Próxima compra é mais rápida
- Histórico de pedidos disponível

✅ **Para o Restaurante:**
- Identifica clientes recorrentes
- Dados sempre atualizados
- Histórico completo de compras
- Pode criar programa de fidelidade depois
- Estatísticas por cliente

---

## 📚 Referências de Design

- **Toast POS:** https://pos.toasttab.com/
- **Square for Restaurants:** https://squareup.com/us/en/restaurants
- **Material Design:** Para componentes UI
- **Tailwind UI:** Para inspiração de layouts

---

## 🎯 Funcionalidades Extras (Futuro)

- [ ] Múltiplas telas de cozinha (uma por setor)
- [ ] Drag and drop para mudar status
- [ ] Previsão de tempo de preparo baseada em IA
- [ ] Notificações push para mobile
- [ ] Integração com impressora de cozinha
- [ ] Modo escuro otimizado para cozinha
- [ ] Estatísticas de tempo médio por produto

