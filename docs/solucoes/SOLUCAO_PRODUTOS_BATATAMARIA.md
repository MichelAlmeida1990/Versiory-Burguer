# 🔍 Solução: Produtos do Batatamaria

## Problema Identificado

Se o **batatamaria não tem produtos cadastrados** com `restaurant_id` dele, então:

1. ❌ Quando o cliente faz um pedido, os produtos não têm `restaurant_id` do batatamaria
2. ❌ O pedido é criado com `user_id` legado (`legacy_1234567890`)
3. ❌ O admin busca por `user_id` do batatamaria e não encontra os pedidos
4. ❌ Os pedidos não aparecem no admin

## Como Verificar

Execute o script `VERIFICAR_SE_BATATAMARIA_TEM_PRODUTOS.sql` no Supabase SQL Editor.

Este script vai mostrar:
- ✅ Se o usuário batatamaria existe
- ✅ Quantos produtos ele tem cadastrados
- ✅ Se não tiver produtos, vai mostrar uma mensagem explicando o problema

## Solução

### Passo 1: Verificar se tem produtos
Execute: `VERIFICAR_SE_BATATAMARIA_TEM_PRODUTOS.sql`

### Passo 2: Se NÃO tiver produtos, executar:
Execute: `ASSOCIAR_PRODUTOS_BOTECOMARIO.sql`

Este script vai:
- ✅ Copiar todas as categorias antigas para o batatamaria
- ✅ Copiar todos os produtos antigos para o batatamaria
- ✅ Associar cada produto à categoria correspondente
- ✅ Garantir que cada restaurante tenha seus próprios produtos isolados

### Passo 3: Verificar novamente
Execute novamente: `VERIFICAR_SE_BATATAMARIA_TEM_PRODUTOS.sql`

Agora deve mostrar que o batatamaria tem produtos.

### Passo 4: Corrigir pedidos antigos (se necessário)
Se já fez pedidos antes de associar os produtos, execute:
`CORRIGIR_PEDIDOS_BATATAMARIA_AUTO.sql`

Este script vai corrigir os pedidos que foram criados com `user_id` legado.

### Passo 5: Testar
1. Faça login como batatamaria@gmail.com
2. Acesse `/admin`
3. Os pedidos devem aparecer agora!

## Resumo do Fluxo

```
❌ Sem produtos → Pedido com user_id legado → Não aparece no admin
✅ Com produtos → Pedido com user_id correto → Aparece no admin
```

## Scripts Necessários (em ordem)

1. `VERIFICAR_SE_BATATAMARIA_TEM_PRODUTOS.sql` - Verificar se tem produtos
2. `ASSOCIAR_PRODUTOS_BOTECOMARIO.sql` - Associar produtos (se não tiver)
3. `CORRIGIR_PEDIDOS_BATATAMARIA_AUTO.sql` - Corrigir pedidos antigos (se necessário)

## Importante

- ⚠️ O script `ASSOCIAR_PRODUTOS_BOTECOMARIO.sql` copia produtos para **AMBOS** os restaurantes (botecomario e batatamaria)
- ✅ Cada restaurante terá seus próprios produtos isolados
- ✅ Os produtos antigos originais (sem `restaurant_id`) permanecem intactos
- ✅ Você pode executar o script várias vezes sem problemas (ele cria cópias)

