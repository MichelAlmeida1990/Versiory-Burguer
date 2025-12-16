# 🔧 Instruções para Corrigir Pedidos do Batatamaria

## Problema Identificado
Os pedidos do batatamaria não aparecem no admin porque:
1. Os produtos podem não ter `restaurant_id` correto
2. Os pedidos podem ter sido criados com `user_id` legado
3. Pode haver diferença de tipos na comparação (UUID vs string)

## Soluções Implementadas

### 1. ✅ Correção Automática no Código
- O admin agora busca pedidos por produtos do restaurante se não encontrar pelo `user_id`
- Corrige automaticamente o `user_id` dos pedidos encontrados
- Logs detalhados para diagnóstico

### 2. ✅ Scripts SQL de Correção

#### Passo 1: Diagnóstico
Execute `DIAGNOSTICO_COMPLETO_BATATAMARIA.sql` para ver:
- Se o usuário batatamaria existe
- Se os produtos têm `restaurant_id` correto
- Quais pedidos foram criados e com qual `user_id`
- Se há pedidos que deveriam ser do batatamaria mas não estão

#### Passo 2: Correção Automática
Execute `CORRIGIR_PEDIDOS_BATATAMARIA_AUTO.sql` para:
- Corrigir automaticamente todos os pedidos que têm produtos do batatamaria
- Atualizar o `user_id` para o UUID correto do batatamaria
- Mostrar relatório dos pedidos corrigidos

## Como Executar

### No Supabase SQL Editor:

1. **Primeiro, execute o diagnóstico:**
   ```sql
   -- Copie e cole o conteúdo de DIAGNOSTICO_COMPLETO_BATATAMARIA.sql
   ```

2. **Analise os resultados:**
   - Verifique se os produtos têm `restaurant_id` correto
   - Veja quais pedidos precisam ser corrigidos

3. **Execute a correção automática:**
   ```sql
   -- Copie e cole o conteúdo de CORRIGIR_PEDIDOS_BATATAMARIA_AUTO.sql
   ```

4. **Recarregue o admin do batatamaria:**
   - Abra o navegador
   - Faça login como batatamaria@gmail.com
   - Acesse `/admin`
   - Os pedidos devem aparecer agora

## Verificação

Após executar os scripts, verifique:

1. **No console do navegador (F12):**
   - Procure por logs que começam com `🔍`, `✅`, `⚠️`
   - Verifique se os pedidos estão sendo encontrados

2. **No Supabase:**
   - Execute a query de verificação no final do script de correção
   - Confirme que os pedidos têm `user_id` correto

## Se Ainda Não Funcionar

1. **Verifique se os produtos têm `restaurant_id`:**
   ```sql
   SELECT id, name, restaurant_id 
   FROM products 
   WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')
   LIMIT 10;
   ```

2. **Verifique o último pedido criado:**
   ```sql
   SELECT o.id, o.user_id, o.customer_name, o.created_at,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as total_itens
   FROM orders o
   ORDER BY o.created_at DESC
   LIMIT 5;
   ```

3. **Envie os logs do console do navegador** para análise

## Notas Importantes

- ⚠️ Os scripts corrigem apenas pedidos dos últimos 30 dias
- ✅ A correção é automática e segura
- 🔄 Após executar, recarregue a página do admin
- 📊 Os logs no console mostram o que está acontecendo

