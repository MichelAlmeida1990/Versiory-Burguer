# Isolamento de Restaurantes - Versiory vs Tom & Jerry

## Visão Geral

Este documento descreve como o sistema garante isolamento total entre o Versiory Delivery (demo) e o Tom & Jerry Pizzaria.

## Princípios de Isolamento

### 1. Versiory Delivery (Demo)
- **UUID**: `f5f457d9-821e-4a21-9029-e181b1bee792`
- **Rotas padrão**: `/`, `/cardapio` → Sempre mostram conteúdo do Versiory
- **Acesso**: Público, não requer login
- **Produtos antigos**: Produtos sem `restaurant_id` pertencem ao Versiory

### 2. Tom & Jerry Pizzaria
- **Rota específica**: `/restaurante/tomjerry`
- **Acesso**: Requer login do cliente para fazer pedidos
- **Produtos**: Todos têm `restaurant_id` = UUID do Tom & Jerry
- **Isolamento**: Nunca mostra conteúdo do Versiory

## Regras de Isolamento

### ✅ Permitido
- Versiory mostra apenas produtos do Versiory (DEMO_UUID)
- Tom & Jerry mostra apenas produtos do Tom & Jerry
- Admin de cada restaurante vê apenas seus pedidos
- Cliente logado vê apenas seus próprios pedidos

### ❌ Proibido
- Misturar produtos de restaurantes diferentes no mesmo pedido
- Admin do Tom & Jerry ver pedidos do Versiory
- Versiory mostrar produtos do Tom & Jerry
- Tom & Jerry mostrar produtos do Versiory

## Implementação Técnica

### Constantes Centralizadas
- Arquivo: `lib/restaurant-constants.ts`
- Define: `DEMO_RESTAURANT_UUID`
- Função: `validateRestaurantIsolation()` - valida isolamento

### Validações

1. **Checkout**: Valida que todos os produtos pertencem ao mesmo restaurante
2. **API de Pedidos**: Rejeita pedidos com produtos misturados
3. **Admin**: Filtra pedidos por `user_id` (restaurant_id) com validação dupla
4. **Cliente**: Mostra apenas pedidos do email logado (se for cliente)

### Filtros Aplicados

#### Rotas Públicas (Versiory)
```typescript
// Sempre usa DEMO_RESTAURANT_UUID
.eq("restaurant_id", DEMO_RESTAURANT_UUID)
```

#### Rotas do Restaurante
```typescript
// Usa o restaurant_id específico do restaurante
.eq("restaurant_id", restaurantIdFromSettings)
```

#### Admin
```typescript
// Filtra pedidos pelo UUID do restaurante logado
.eq("user_id", user.id) // user.id é o restaurant_id
```

#### Cliente
```typescript
// Filtra pedidos pelo email do cliente logado
.eq("customer_email", user.email)
```

## Checklist de Isolamento

- [x] Constantes centralizadas (`lib/restaurant-constants.ts`)
- [x] Validação no checkout
- [x] Validação na API de pedidos
- [x] Filtros no admin
- [x] Filtros no cliente
- [x] Rotas públicas sempre usam DEMO_UUID
- [x] Rotas do restaurante sempre usam restaurant_id específico

## Troubleshooting

### Pedidos aparecendo no restaurante errado
1. Verificar se `user_id` no pedido corresponde ao `restaurant_id` correto
2. Verificar logs no console para ver qual `restaurant_id` está sendo usado
3. Verificar se produtos têm `restaurant_id` correto

### Produtos aparecendo no restaurante errado
1. Verificar se `restaurant_id` nos produtos está correto
2. Verificar se a rota está usando o filtro correto
3. Verificar se não há cache de dados antigos

