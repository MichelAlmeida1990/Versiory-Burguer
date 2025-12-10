# 📋 Instruções: Demo é Dona dos Produtos Antigos

## 🎯 Estratégia Definida

- ✅ **demo@versiory.com.br** é a dona de todos os produtos antigos (sem `restaurant_id`)
- ✅ Produtos antigos serão associados ao demo (não copiados)
- ✅ Novos produtos cadastrados pelo demo terão `restaurant_id` automaticamente
- ✅ Outros restaurantes (botecomario, batatamaria) terão seus próprios produtos novos

## 📝 Passo a Passo

### Passo 1: Associar Produtos Antigos ao Demo

Execute no Supabase SQL Editor:
- `ASSOCIAR_PRODUTOS_ANTIGOS_AO_DEMO.sql`

Este script vai:
- ✅ Associar todas as categorias antigas ao demo
- ✅ Associar todos os produtos antigos ao demo
- ✅ Atualizar o `restaurant_id` para o ID do demo
- ✅ Mostrar um resumo do que foi feito

### Passo 2: Verificar

O script já inclui queries de verificação que mostram:
- Quantos produtos o demo tem
- Se ainda há produtos sem restaurante (deve ser 0)
- Lista de alguns produtos do demo

### Passo 3: Testar

1. Faça login como `demo@versiory.com.br`
2. Acesse `/admin`
3. Verifique se os produtos aparecem
4. Faça um pedido de teste
5. Verifique se o pedido aparece no admin

## ✅ Resultado Final

Depois de executar:

- ✅ Demo tem todos os produtos antigos (associados, não copiados)
- ✅ Demo pode criar novos produtos (com `restaurant_id` automático)
- ✅ Outros restaurantes podem criar seus próprios produtos
- ✅ Cada restaurante vê apenas seus próprios produtos e pedidos
- ✅ Sistema limpo e organizado

## 🔍 Verificação

```sql
-- Verificar produtos do demo
SELECT COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');

-- Verificar se não há mais produtos sem restaurante
SELECT COUNT(*) as produtos_sem_restaurante
FROM products
WHERE restaurant_id IS NULL;
-- Deve retornar 0
```

## 🎉 Vantagens

- ✅ **Simples**: Apenas associar, não copiar
- ✅ **Rápido**: Uma query UPDATE
- ✅ **Limpo**: Não duplica dados
- ✅ **Organizado**: Demo é dona dos produtos antigos
- ✅ **Escalável**: Outros restaurantes criam seus próprios produtos

## ⚠️ Importante

- ⚠️ Execute o script apenas uma vez
- ✅ Os produtos antigos serão associados ao demo (não removidos)
- ✅ Novos produtos do demo terão `restaurant_id` automaticamente
- ✅ Outros restaurantes precisam criar seus próprios produtos

