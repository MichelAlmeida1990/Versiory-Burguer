# 🌐 URLs e Rotas do Sistema

## 📋 Estrutura de URLs Após Deploy

Após fazer o deploy, a estrutura de URLs será baseada no domínio configurado. Exemplos:

### **Versiory Delivery (Demo/Plataforma)**
- **Home:** `https://seudominio.com/`
- **Cardápio:** `https://seudominio.com/cardapio`
- **Meus Pedidos:** `https://seudominio.com/pedidos`
- **Checkout:** `https://seudominio.com/checkout`
- **Carrinho:** `https://seudominio.com/carrinho`

### **Tom & Jerry (Restaurante Específico)**
- **Home:** `https://seudominio.com/restaurante/tomjerry`
- **Cardápio:** `https://seudominio.com/restaurante/tomjerry#cardapio`
- **Meus Pedidos:** `https://seudominio.com/restaurante/tomjerry/pedidos` (ou `/pedidos?restaurant=tomjerry`)
- **Login Cliente:** `https://seudominio.com/restaurante/tomjerry/cliente/login`
- **Admin:** `https://seudominio.com/admin` (acesso universal, login específico)

### **Outros Restaurantes**
- **Padrão:** `https://seudominio.com/restaurante/[slug-do-restaurante]`

---

## 🔧 Como Funciona

### 1. **Rota Dinâmica por Slug**

O sistema usa o **slug** (identificador único) de cada restaurante para criar rotas específicas:

```typescript
// Exemplo: slug = "tomjerry"
/restaurante/tomjerry → Página do Tom & Jerry
/restaurante/batatamaria → Página da Batata Maria
```

### 2. **Configuração do Slug**

O slug é configurado na tabela `restaurant_settings`:

```sql
-- Verificar/atualizar slug de um restaurante
SELECT restaurant_name, slug FROM restaurant_settings WHERE restaurant_id = 'UUID_DO_RESTAURANTE';

-- Definir/atualizar slug
UPDATE restaurant_settings 
SET slug = 'tomjerry' 
WHERE restaurant_id = 'UUID_DO_RESTAURANTE';
```

### 3. **Acesso ao Admin**

O admin é **universal** (mesmo caminho para todos):
- `https://seudominio.com/admin`
- Cada restaurante faz login com suas próprias credenciais
- O sistema automaticamente filtra dados pelo restaurante logado

---

## 📝 Exemplos Práticos

### **Cenário 1: Cliente Acessando Tom & Jerry**
```
1. Cliente acessa: https://seudominio.com/restaurante/tomjerry
2. Vê o cardápio do Tom & Jerry
3. Faz login em: https://seudominio.com/restaurante/tomjerry/cliente/login
4. Faz pedido → aparece em: https://seudominio.com/pedidos?restaurant=tomjerry
```

### **Cenário 2: Versiory (Demo)**
```
1. Cliente acessa: https://seudominio.com/
2. Vê o cardápio da Versiory (demo)
3. Faz pedido sem login (usa email do localStorage)
4. Vê pedidos em: https://seudominio.com/pedidos
```

### **Cenário 3: Admin do Tom & Jerry**
```
1. Admin acessa: https://seudominio.com/admin/login
2. Faz login com: tomjerry@gmail.com
3. Vê apenas pedidos/produtos/categorias do Tom & Jerry
4. Pode acessar site público em: https://seudominio.com/restaurante/tomjerry
```

---

## 🚀 Preparação para Deploy

### **1. Definir Domínio Principal**

Configure o domínio no seu provedor de hospedagem (Vercel, Netlify, etc.):
- Domínio principal: `seudominio.com`
- Ou subdomínio: `app.seudominio.com`

### **2. Variáveis de Ambiente**

Certifique-se de que as variáveis estão configuradas:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
```

### **3. Slugs dos Restaurantes**

Verifique se todos os restaurantes têm slugs definidos:
```sql
-- Listar todos os restaurantes e seus slugs
SELECT 
  rs.restaurant_name,
  rs.slug,
  u.email as admin_email
FROM restaurant_settings rs
JOIN auth.users u ON u.id = rs.restaurant_id;
```

---

## 🔗 Links Importantes para Documentar

### **Para Clientes**
- Página inicial: `/` (Versiory) ou `/restaurante/[slug]`
- Cardápio: `/#cardapio` ou `/restaurante/[slug]#cardapio`
- Meus Pedidos: `/pedidos` ou `/pedidos?restaurant=[slug]`

### **Para Restaurantes (Admin)**
- Login Admin: `/admin/login`
- Dashboard: `/admin`
- Acesso ao site público: `/restaurante/[slug]`

---

## ⚠️ Importante

1. **Slugs devem ser únicos** - não pode haver dois restaurantes com o mesmo slug
2. **Slugs são case-sensitive** - "tomjerry" ≠ "TomJerry"
3. **Slugs não devem ter espaços** - use hífens ou junte tudo (ex: `tom-e-jerry` ou `tomjerry`)
4. **Versiory não tem slug** - usa rotas diretas (`/`, `/cardapio`)

---

## 🛠️ Scripts Úteis

Veja `supabase/migrations/` para scripts SQL relacionados a slugs:
- `DEFINIR_SLUG_TOM_JERRY.sql`
- `ADICIONAR_SLUG_RESTAURANT_SETTINGS.sql`




