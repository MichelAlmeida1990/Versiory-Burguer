# 🔧 Solução: Pedidos do Demo Não Aparecem

## Problema Identificado

O usuário `demo@versiory.com.br` fez um pedido, mas ele não aparece no admin porque:
1. Os produtos podem não ter sido copiados para o demo ainda
2. O pedido foi criado com produtos antigos (sem `restaurant_id`)
3. O pedido foi criado com `user_id` incorreto

## Solução Passo a Passo

### Passo 1: Verificar se os produtos foram copiados

Execute no Supabase SQL Editor:
```sql
SELECT COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');
```

**Se retornar 0:** Os produtos não foram copiados ainda. Execute o script `COPIAR_E_REMOVER_PRODUTOS_ANTIGOS.sql`.

### Passo 2: Verificar o pedido criado

Execute: `VERIFICAR_PEDIDOS_DEMO.sql`

Isso vai mostrar:
- Qual `user_id` foi usado no pedido
- Quais produtos estão no pedido
- Se os produtos pertencem ao demo

### Passo 3: Corrigir o pedido

Execute: `CORRIGIR_PEDIDOS_DEMO.sql`

Isso vai:
- Identificar pedidos que têm produtos do demo mas `user_id` incorreto
- Corrigir o `user_id` para o UUID do demo
- Mostrar um relatório dos pedidos corrigidos

### Passo 4: Verificar novamente

Recarregue o admin do demo. Os pedidos devem aparecer agora.

## Se Ainda Não Funcionar

1. **Verifique se os produtos foram copiados:**
   ```sql
   SELECT COUNT(*) FROM products 
   WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');
   ```

2. **Verifique o último pedido:**
   ```sql
   SELECT o.id, o.user_id, o.customer_name, o.created_at
   FROM orders o
   ORDER BY o.created_at DESC
   LIMIT 1;
   ```

3. **Verifique os produtos do pedido:**
   ```sql
   SELECT p.id, p.name, p.restaurant_id
   FROM orders o
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   WHERE o.id = 'ID_DO_PEDIDO';
   ```

## Importante

- ⚠️ Execute o script `COPIAR_E_REMOVER_PRODUTOS_ANTIGOS.sql` primeiro para copiar produtos para o demo
- ✅ Depois execute `CORRIGIR_PEDIDOS_DEMO.sql` para corrigir pedidos existentes
- 🔄 Recarregue o admin após executar os scripts

