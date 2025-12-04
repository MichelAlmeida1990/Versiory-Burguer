# Proposta: Sistema de Opções/Adicionais para Produtos

## 📋 Visão Geral

Implementar um sistema flexível que permite adicionar opções personalizáveis aos produtos, como:
- **Pizza**: Tamanho (P, M, G), Borda (Normal, Recheada), Ingredientes Extras
- **Hambúrguer**: Tamanho (Simples, Duplo), Adicionais (Bacon, Ovo, Queijo Extra)
- **Bebida**: Tamanho (300ml, 500ml, 1L), Gelo (Sim, Não)
- **Açaí**: Tamanho (300ml, 500ml, 700ml), Complementos (Granola, Banana, Leite Condensado)

## 🗄️ Estrutura do Banco de Dados

### 1. Tabela `product_options`
Armazena as opções disponíveis para cada produto (ex: "Tamanho", "Borda", "Adicionais")

```sql
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Tamanho", "Borda", "Ingredientes Extras"
  type VARCHAR(50) NOT NULL CHECK (type IN ('single', 'multiple')), -- single = escolha única, multiple = múltiplas escolhas
  required BOOLEAN DEFAULT false, -- Se a opção é obrigatória
  display_order INTEGER DEFAULT 0, -- Ordem de exibição
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tabela `product_option_values`
Armazena os valores possíveis para cada opção (ex: "Pequena", "Média", "Grande")

```sql
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Pequena", "Média", "Grande", "Queijo Extra"
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Valor adicional (pode ser negativo para desconto)
  display_order INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Tabela `order_item_options`
Armazena as opções selecionadas para cada item do pedido

```sql
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID REFERENCES product_options(id) ON DELETE SET NULL,
  option_value_id UUID REFERENCES product_option_values(id) ON DELETE SET NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Valor no momento da compra (snapshot)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 💡 Exemplos de Uso

### Exemplo 1: Pizza
**Produto**: Pizza Margherita (R$ 25,00)

**Opções**:
1. **Tamanho** (obrigatório, escolha única)
   - Pequena: +R$ 0,00
   - Média: +R$ 5,00
   - Grande: +R$ 10,00

2. **Borda** (opcional, escolha única)
   - Normal: +R$ 0,00
   - Recheada: +R$ 3,00

3. **Ingredientes Extras** (opcional, múltipla escolha)
   - Queijo Extra: +R$ 2,00
   - Bacon: +R$ 3,00
   - Azeitona: +R$ 1,50
   - Cebola: +R$ 1,00

**Resultado**: Pizza Média + Borda Recheada + Queijo Extra + Bacon = R$ 25,00 + R$ 5,00 + R$ 3,00 + R$ 2,00 + R$ 3,00 = **R$ 38,00**

### Exemplo 2: Hambúrguer
**Produto**: Hambúrguer Artesanal (R$ 15,00)

**Opções**:
1. **Tamanho** (obrigatório, escolha única)
   - Simples: +R$ 0,00
   - Duplo: +R$ 8,00

2. **Adicionais** (opcional, múltipla escolha)
   - Bacon: +R$ 3,00
   - Ovo: +R$ 2,00
   - Queijo Extra: +R$ 2,50
   - Cebola Caramelizada: +R$ 1,50

**Resultado**: Duplo + Bacon + Ovo = R$ 15,00 + R$ 8,00 + R$ 3,00 + R$ 2,00 = **R$ 28,00**

### Exemplo 3: Bebida
**Produto**: Refrigerante (R$ 5,00)

**Opções**:
1. **Tamanho** (obrigatório, escolha única)
   - 300ml: +R$ 0,00
   - 500ml: +R$ 2,00
   - 1L: +R$ 4,00

2. **Gelo** (opcional, escolha única)
   - Sim: +R$ 0,00
   - Não: +R$ 0,00

## 🎨 Interface do Usuário

### 1. Modal de Opções (ao clicar em "Adicionar")
- Exibir todas as opções do produto
- Para opções do tipo "single": radio buttons
- Para opções do tipo "multiple": checkboxes
- Mostrar preço adicional de cada opção
- Exibir preço total atualizado em tempo real
- Botão "Adicionar ao Carrinho" com preço final

### 2. Carrinho
- Exibir produto com opções selecionadas
- Mostrar breakdown do preço (base + opções)
- Permitir editar opções (abrir modal novamente)
- Calcular total corretamente

### 3. Painel Admin
- Gerenciar opções de cada produto
- Criar/editar/deletar opções e valores
- Definir preços e disponibilidade

## 🔧 Implementação Técnica

### Backend (Supabase)
1. Criar as 3 novas tabelas
2. Adicionar RLS policies
3. Criar índices para performance

### Frontend
1. **Componente `ProductOptionsModal`**
   - Modal que exibe opções do produto
   - Validação de opções obrigatórias
   - Cálculo de preço em tempo real

2. **Atualizar `ProductCard`**
   - Ao clicar em "Adicionar", abrir modal de opções
   - Passar opções selecionadas para o carrinho

3. **Atualizar `CartStore`**
   - Armazenar opções selecionadas junto com o produto
   - Calcular preço total incluindo opções

4. **Atualizar `Checkout`**
   - Enviar opções selecionadas para o backend
   - Salvar em `order_item_options`

5. **Atualizar Painel Admin**
   - CRUD de opções e valores
   - Interface para gerenciar opções de produtos

## 📊 Fluxo de Dados

```
1. Usuário clica em "Adicionar" no produto
   ↓
2. Modal de opções abre (busca opções do produto)
   ↓
3. Usuário seleciona opções
   ↓
4. Preço é calculado em tempo real (base + opções)
   ↓
5. Usuário confirma e adiciona ao carrinho
   ↓
6. Item é adicionado com opções selecionadas
   ↓
7. No checkout, opções são enviadas para o backend
   ↓
8. Backend salva em order_items e order_item_options
```

## ✅ Vantagens

1. **Flexibilidade**: Qualquer produto pode ter opções personalizadas
2. **Escalabilidade**: Fácil adicionar novas opções sem alterar código
3. **Precisão**: Preço calculado automaticamente
4. **Histórico**: Opções são salvas com o pedido (snapshot)
5. **UX**: Interface intuitiva e clara

## 🚀 Próximos Passos

1. Criar schema SQL completo
2. Implementar componente de modal de opções
3. Atualizar carrinho e checkout
4. Criar interface admin para gerenciar opções
5. Testar com produtos reais


