# Mudanças: Sistema de CEP e Separação de Páginas por Restaurante

## 📋 Resumo

Este documento detalha as principais mudanças implementadas relacionadas a:
1. **Sistema de CEP e Cálculo de Frete por Bairro**
2. **Separação de Páginas por Restaurante (Multi-tenancy)**

## 🔧 Versões Utilizadas (HEAD Atual)

- **Node.js**: v20.18.0
- **Next.js**: ^14.2.3
- **React**: ^18.2.0
- **React DOM**: ^18.2.0
- **TypeScript**: ^5.3.3

**Commit de Referência:** HEAD (verificado em 2025-01-XX)

---

## 1. Sistema de CEP e Cálculo de Frete por Bairro

### 1.1. Estrutura de Dados

#### Tabela `delivery_areas`
Criada para armazenar áreas de entrega com valores de frete específicos:

```sql
CREATE TABLE IF NOT EXISTS public.delivery_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurant_settings(restaurant_id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (restaurant_id, city, neighborhood)
);
```

**Arquivo:** `supabase/migrations/CRIAR_TABELA_DELIVERY_AREAS.sql`

### 1.2. Dados Iniciais - Tom & Jerry

Bairros cadastrados para Tom & Jerry (Rio Grande da Serra e Ribeirão Pires):

```sql
-- Rio Grande da Serra
- Centro: R$ 3,00
- Vila Conde: R$ 8,00
- Pedreira: R$ 9,00
- Lavínia: R$ 4,00

-- Ribeirão Pires
- Ribeirão Pires: R$ 14,00
```

**Arquivo:** `supabase/clientes/INSERIR_BAIRROS_TOM_JERRY.sql`

### 1.3. Interface TypeScript

```typescript
export interface DeliveryArea {
  id: string;
  restaurant_id: string;
  city: string;
  neighborhood: string;
  delivery_fee: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Arquivo:** `lib/supabase.ts`

### 1.4. Funcionalidade no Checkout

#### Campos de Endereço
- **Cidade**: Campo de texto livre (não dropdown)
- **Bairro**: Campo de texto livre (não dropdown)
- **CEP**: Campo opcional (não usado para cálculo de frete)

#### Cálculo de Frete
```typescript
const calculateDeliveryFee = useCallback((city: string, neighborhood: string, areas?: DeliveryArea[]) => {
  const areasToSearch = areas || deliveryAreas;
  if (areasToSearch.length === 0) {
    setDeliveryFee(5.0); // Valor padrão
    return;
  }

  const area = areasToSearch.find(
    a => a.city.toLowerCase().trim() === city.toLowerCase().trim() && 
         a.neighborhood.toLowerCase().trim() === neighborhood.toLowerCase().trim()
  );

  if (area) {
    setDeliveryFee(Number(area.delivery_fee));
    console.log(`✅ Bairro encontrado: ${area.neighborhood} - Frete: ${formatCurrency(Number(area.delivery_fee))}`);
  } else {
    setDeliveryFee(5.0); // Valor padrão se não encontrar
    console.log(`⚠️ Bairro não encontrado: "${neighborhood}" - Usando frete padrão: R$ 5,00`);
  }
}, [deliveryAreas]);
```

**Características:**
- Busca case-insensitive (não diferencia maiúsculas/minúsculas)
- Remove espaços em branco antes de comparar
- Se não encontrar bairro cadastrado, usa valor padrão de R$ 5,00
- Logs apenas no console (sem feedback visual para o cliente)

**Arquivo:** `app/checkout/page.tsx`

#### Carregamento de Áreas de Entrega
```typescript
const loadDeliveryAreas = useCallback(async (restaurantId: string) => {
  setLoadingAreas(true);
  try {
    const { data, error } = await supabase
      .from("delivery_areas")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("city")
      .order("neighborhood");

    if (error) {
      console.error("Erro ao buscar áreas de entrega:", error);
      setDeliveryAreas([]);
    } else {
      setDeliveryAreas(data || []);
    }
  } catch (error) {
    console.error("Erro ao carregar áreas de entrega:", error);
    setDeliveryAreas([]);
  } finally {
    setLoadingAreas(false);
  }
}, []);
```

**Arquivo:** `app/checkout/page.tsx`

### 1.5. Armazenamento no Pedido

O valor do frete é salvo no campo `delivery_fee` da tabela `orders`:

```typescript
const orderData = {
  // ... outros campos
  delivery_fee: deliveryFee,
  // ...
};
```

**Arquivo:** `app/api/orders/route.ts`

---

## 2. Separação de Páginas por Restaurante (Multi-tenancy)

### 2.1. Contexto de Restaurante

#### Helper Functions
Criado arquivo `lib/restaurant-context.ts` com funções auxiliares:

```typescript
// Extrair slug do pathname
export function getRestaurantSlugFromPathname(pathname: string | null): string | null {
  const match = pathname?.match(/^\/restaurante\/([^/]+)/);
  return match ? match[1] : null;
}

// Obter slug do localStorage
export function getRestaurantSlugFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastRestaurantContext');
  }
  return null;
}

// Adicionar contexto de restaurante a uma URL
export function withRestaurantContext(path: string, restaurantSlug: string | null): string {
  if (restaurantSlug) {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}restaurant=${restaurantSlug}`;
  }
  return path;
}
```

**Arquivo:** `lib/restaurant-context.ts`

### 2.2. Header - Navegação Multi-tenant

#### Detecção de Contexto
O header detecta o contexto do restaurante através de:
1. Pathname: `/restaurante/[slug]`
2. Query parameter: `?restaurant=[slug]`
3. localStorage: `lastRestaurantContext`
4. Settings do restaurante logado (apenas no admin)

```typescript
const slugMatch = pathname?.match(/^\/restaurante\/([^/]+)/);
const restaurantSlugFromPath = slugMatch?.[1] || null;
const restaurantFromQuery = searchParams?.get('restaurant');
const restaurantFromSettings = settings?.slug || null;
const restaurantSlugFromStorage = typeof window !== 'undefined' ? getRestaurantSlug() : null;

const restaurantSlug = restaurantSlugFromPath || restaurantFromQuery || restaurantFromSettings || restaurantSlugFromStorage || null;
```

#### Links com Contexto
Todos os links de navegação preservam o contexto do restaurante:

```typescript
// Exemplo: Link "Meus Pedidos"
<Link href={withRestaurantContext('/pedidos', restaurantSlug)}>
  Meus Pedidos
</Link>
```

**Arquivo:** `components/layout/header.tsx`

### 2.3. Página de Pedidos (`/pedidos`)

#### Filtro por Restaurante
```typescript
// Detectar contexto de restaurante
const restaurantSlugFromQuery = searchParams?.get('restaurant');
const restaurantSlug = restaurantSlugFromQuery || (typeof window !== 'undefined' ? localStorage.getItem('lastRestaurantContext') : null);

// Buscar UUID do restaurante através do slug
if (restaurantSlug) {
  const response = await fetch(`/api/restaurante/${restaurantSlug}`);
  const restaurantData = await response.json();
  restaurantIdToFilter = restaurantData.restaurant_id;
}
```

#### Exibição de Nome do Cliente
```typescript
interface Order {
  // ...
  customer_name?: string;
  // ...
}

// Exibição
{order.customer_name && (
  <p className="text-gray-400 text-sm">{order.customer_name}</p>
)}
```

#### Cards Clicáveis
```typescript
<Link
  key={order.id}
  href={`/pedidos/${order.id}${restaurantSlug ? `?restaurant=${restaurantSlug}` : ''}`}
  className="block bg-gray-900 rounded-lg p-4 md:p-6 hover:bg-gray-800 transition cursor-pointer"
>
  {/* Conteúdo do card */}
</Link>
```

**Arquivo:** `app/pedidos/page.tsx`

### 2.4. Detalhes do Pedido (`/pedidos/[id]`)

#### Exibição de Taxa de Entrega
```typescript
{order.delivery_fee !== undefined && order.delivery_fee > 0 && (
  <div>
    <p className="text-gray-400 text-xs md:text-sm">Taxa de Entrega</p>
    <p className="font-medium text-sm md:text-base text-primary-yellow">
      {formatCurrency(order.delivery_fee)}
    </p>
  </div>
)}
```

#### Preservação de Contexto
```typescript
// Botão "Continuar Comprando"
const handleContinueShopping = () => {
  if (restaurantSlug) {
    router.push(`/restaurante/${restaurantSlug}`);
  } else {
    router.push('/cardapio');
  }
};
```

**Arquivo:** `app/pedidos/[id]/page.tsx`

### 2.5. Checkout (`/checkout`)

#### Redirecionamento com Contexto
```typescript
// Após criar pedido com sucesso
if (restaurantSlug) {
  router.push(`/pedidos/${orderId}?restaurant=${restaurantSlug}`);
} else {
  router.push(`/pedidos/${orderId}`);
}
```

**Arquivo:** `app/checkout/page.tsx`

### 2.6. Login de Cliente (`/cliente/login`)

#### Restrição por Restaurante
- Login de cliente disponível **apenas** para restaurantes específicos (ex: Tom & Jerry)
- **Não disponível** para Versiory (demo)

```typescript
// No header
{isInRestaurantContext && (
  <Link href={withRestaurantContext('/cliente/login', restaurantSlug)}>
    Login/Cadastro
  </Link>
)}
```

**Arquivo:** `components/layout/header.tsx`

#### Preservação de ReturnUrl
```typescript
// Ao fazer login
const returnUrl = searchParams?.get('returnUrl');
if (returnUrl) {
  router.push(returnUrl);
} else if (restaurantSlug) {
  router.push(`/restaurante/${restaurantSlug}`);
} else {
  router.push('/');
}
```

**Arquivo:** `app/cliente/login/page.tsx`

### 2.7. Callback de Autenticação (`/auth/callback`)

#### Redirecionamento com Contexto
```typescript
// Após autenticação bem-sucedida
const restaurantSlug = searchParams?.get('restaurant');
if (restaurantSlug) {
  router.push(`/restaurante/${restaurantSlug}`);
} else {
  router.push('/');
}
```

**Arquivo:** `app/auth/callback/route.ts`

---

## 3. Mudanças em Outros Componentes

### 3.1. Cart Button
```typescript
// Link do carrinho preserva contexto
<Link href="/carrinho">
  {/* Botão do carrinho */}
</Link>
```

**Arquivo:** `components/cart/cart-button.tsx`

### 3.2. Carrinho (`/carrinho`)
```typescript
// Redirecionamento para checkout preserva contexto
const handleCheckout = () => {
  if (restaurantSlug) {
    router.push(`/checkout?restaurant=${restaurantSlug}`);
  } else {
    router.push('/checkout');
  }
};
```

**Arquivo:** `app/carrinho/page.tsx`

### 3.3. Página do Restaurante (`/restaurante/[slug]`)
```typescript
// Redirecionamento para login preserva contexto
const handleAddToCart = () => {
  if (!user && restaurantSlug) {
    router.push(`/restaurante/${restaurantSlug}/cliente/login`);
    return;
  }
  // Adicionar ao carrinho
};
```

**Arquivo:** `app/restaurante/[slug]/page.tsx`

---

## 4. LocalStorage - Persistência de Contexto

O contexto do restaurante é salvo no `localStorage` para persistir entre navegações:

```typescript
// Salvar contexto
if (restaurantSlug && typeof window !== 'undefined') {
  localStorage.setItem('lastRestaurantContext', restaurantSlug);
}

// Recuperar contexto
const restaurantSlug = typeof window !== 'undefined' 
  ? localStorage.getItem('lastRestaurantContext') 
  : null;
```

**Chave:** `lastRestaurantContext`

---

## 5. Fluxo Completo de Navegação

### 5.1. Cliente acessa Tom & Jerry
1. Acessa `/restaurante/tomjerry`
2. Header detecta slug e carrega configurações do restaurante
3. Slug é salvo no `localStorage`
4. Links de navegação incluem `?restaurant=tomjerry`

### 5.2. Cliente adiciona produto ao carrinho
1. Clica em "Adicionar ao Carrinho"
2. Se não estiver logado, redireciona para `/restaurante/tomjerry/cliente/login`
3. Após login, volta para a página do restaurante

### 5.3. Cliente finaliza pedido
1. Vai para `/checkout?restaurant=tomjerry`
2. Preenche endereço (cidade e bairro)
3. Sistema calcula frete baseado no bairro
4. Após criar pedido, redireciona para `/pedidos/[id]?restaurant=tomjerry`

### 5.4. Cliente visualiza pedidos
1. Acessa `/pedidos?restaurant=tomjerry`
2. Sistema filtra pedidos apenas do restaurante Tom & Jerry
3. Ao clicar em um pedido, vai para `/pedidos/[id]?restaurant=tomjerry`
4. Detalhes do pedido mostram taxa de entrega

---

## 6. Arquivos Modificados

### 6.1. Novos Arquivos
- `lib/restaurant-context.ts` - Funções auxiliares para contexto de restaurante
- `supabase/migrations/CRIAR_TABELA_DELIVERY_AREAS.sql` - Criação da tabela
- `supabase/clientes/INSERIR_BAIRROS_TOM_JERRY.sql` - Dados iniciais

### 6.2. Arquivos Modificados
- `app/checkout/page.tsx` - Sistema de cálculo de frete por bairro
- `app/pedidos/page.tsx` - Filtro por restaurante, nome do cliente, cards clicáveis
- `app/pedidos/[id]/page.tsx` - Exibição de taxa de entrega, preservação de contexto
- `components/layout/header.tsx` - Navegação multi-tenant
- `app/cliente/login/page.tsx` - Preservação de returnUrl
- `app/auth/callback/route.ts` - Redirecionamento com contexto
- `app/carrinho/page.tsx` - Preservação de contexto
- `app/restaurante/[slug]/page.tsx` - Redirecionamento para login
- `lib/supabase.ts` - Interface DeliveryArea
- `app/api/orders/route.ts` - Armazenamento de delivery_fee

---

## 7. Observações Importantes

### 7.1. CEP
- O campo CEP é **opcional** e **não é usado** para cálculo de frete
- O cálculo de frete é baseado **apenas** em cidade e bairro
- O cliente digita cidade e bairro livremente (não há dropdowns)

### 7.2. Multi-tenancy
- Versiory (demo) **não tem** login de cliente
- Login de cliente disponível **apenas** para restaurantes específicos
- Contexto de restaurante é preservado em **todas** as navegações
- Pedidos são filtrados por restaurante para evitar mistura de dados

### 7.3. Frete
- Valor padrão: **R$ 5,00** (quando bairro não é encontrado)
- Busca case-insensitive (não diferencia maiúsculas/minúsculas)
- Logs apenas no console (sem feedback visual para o cliente)

---

## 8. Próximos Passos Sugeridos

1. **Validação de CEP**: Implementar busca automática de endereço via API de CEP
2. **Autocomplete de Bairros**: Sugerir bairros cadastrados enquanto o cliente digita
3. **Mapa de Cobertura**: Mostrar áreas de entrega no site
4. **Histórico de Endereços**: Salvar endereços do cliente para reutilização
5. **Cálculo de Distância**: Usar coordenadas para cálculo mais preciso de frete

---

## 9. Informações Técnicas

### 9.1. Versões do HEAD Atual (Commit mais recente)

**Dependencies:**
- **Next.js**: ^14.2.3
- **React**: ^18.2.0
- **React DOM**: ^18.2.0
- **Supabase JS**: ^2.39.0
- **TypeScript**: ^5.3.3

**DevDependencies:**
- **Autoprefixer**: ^10.4.15
- **PostCSS**: ^8.4.31
- **Tailwind CSS**: ^3.3.0

### 9.2. package.json Completo do Último Commit

```json
{
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.0"
  }
}
```

**Nota:** As versões com `^` permitem atualizações de patch e minor conforme definido no `package.json` do HEAD atual. As versões permanecem consistentes desde o commit 28b3094 até o HEAD atual.

---

**Data de Criação:** 2025-01-XX  
**Última Atualização:** 2025-01-XX

