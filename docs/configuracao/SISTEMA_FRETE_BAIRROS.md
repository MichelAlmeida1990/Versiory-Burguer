# 🚚 Sistema de Frete por Bairro - Tom & Jerry

## 📋 Resumo

Sistema implementado para calcular o frete automaticamente baseado no bairro e cidade selecionados pelo cliente no checkout.

## 🎯 Bairros Configurados

### Rio Grande da Serra
- **Centro**: R$ 3,00
- **Vila Conde**: R$ 8,00
- **Pedreira**: R$ 9,00
- **Lavínia**: R$ 4,00

### Ribeirão Pires (Cidade Vizinha)
- **Ribeirão Pires**: R$ 14,00

## 🗄️ Estrutura do Banco

### Tabela: `delivery_areas`
```sql
- id: UUID (PK)
- restaurant_id: UUID (FK para auth.users)
- city: VARCHAR(255) - Cidade
- neighborhood: VARCHAR(255) - Bairro
- delivery_fee: DECIMAL(10,2) - Valor do frete
- active: BOOLEAN - Se está ativo
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 📝 Scripts SQL

### 1. Criar Tabela
Execute primeiro: `supabase/migrations/CRIAR_TABELA_DELIVERY_AREAS.sql`

### 2. Inserir Bairros Tom & Jerry
Execute depois: `supabase/clientes/INSERIR_BAIRROS_TOM_JERRY.sql`

## ⚙️ Como Funciona

1. **No Checkout:**
   - Sistema identifica o restaurante pelos produtos do carrinho
   - Busca automaticamente as áreas de entrega do restaurante
   - Mostra dropdown de cidades e bairros (se houver áreas configuradas)
   - Calcula o frete automaticamente quando bairro é selecionado

2. **Cálculo do Frete:**
   - Quando cliente seleciona cidade → limpa bairro
   - Quando cliente seleciona bairro → calcula frete automaticamente
   - Valor do frete aparece ao lado do bairro e no resumo do pedido

3. **Fallback:**
   - Se não houver áreas configuradas → usa valor padrão (R$ 5,00)
   - Se bairro não encontrado → usa valor padrão (R$ 5,00)

## 🔧 Adicionar Novos Bairros

Para adicionar novos bairros, execute no Supabase SQL Editor:

```sql
INSERT INTO delivery_areas (restaurant_id, city, neighborhood, delivery_fee, active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com'),
  'Rio Grande da Serra', -- ou outra cidade
  'Nome do Bairro',
  10.00, -- valor do frete
  true
);
```

## 📍 Endereço da Pizzaria

**Tom & Jerry Pizzaria**
- Endereço: Rua Valdir Gil Da Silva, 285 - Parque Indaia, Rio Grande da Serra - SP
- Telefones: (11) 4820-3123, (11) 4821-7128, (11) 96905-4541
- Instagram: @pizzariatomejerry

## ✅ Funcionalidades Implementadas

- ✅ Tabela `delivery_areas` criada
- ✅ Bairros de Rio Grande da Serra inseridos
- ✅ Ribeirão Pires inserido
- ✅ Checkout calcula frete automaticamente
- ✅ Dropdown de cidades e bairros
- ✅ Valor do frete exibido em tempo real
- ✅ Interface TypeScript para DeliveryArea

## 🎨 Interface

No checkout, quando há áreas configuradas:
- **Cidade**: Dropdown com cidades disponíveis
- **Bairro**: Dropdown com bairros da cidade selecionada
- **Frete**: Mostra valor ao lado do bairro e no resumo

Se não houver áreas configuradas, usa campos de texto normais.

