# 📋 Instruções: Copiar e Remover Produtos Antigos

## 🎯 Objetivo

Copiar todos os produtos antigos (sem `restaurant_id`) para cada restaurante, e depois remover os produtos antigos originais.

## 📝 Passo a Passo

### Passo 1: Executar a Cópia

1. Abra o Supabase SQL Editor
2. Execute o arquivo: `COPIAR_E_REMOVER_PRODUTOS_ANTIGOS.sql`
3. O script vai:
   - ✅ Copiar todas as categorias antigas para cada restaurante
   - ✅ Copiar todos os produtos antigos para cada restaurante
   - ✅ Associar produtos às categorias corretas
   - ✅ Mostrar um resumo do que foi feito

### Passo 2: Verificar

Execute esta query para verificar se os produtos foram copiados:

```sql
SELECT 
    COALESCE(u.email, 'SEM RESTAURANTE') as restaurante,
    COUNT(*) as total_produtos
FROM products p
LEFT JOIN auth.users u ON u.id = p.restaurant_id
GROUP BY u.email, p.restaurant_id
ORDER BY 
    CASE WHEN p.restaurant_id IS NULL THEN 1 ELSE 0 END,
    u.email;
```

**Verifique:**
- ✅ Cada restaurante tem produtos
- ✅ Os produtos antigos ainda existem (para comparação)
- ✅ Nenhum produto foi perdido

### Passo 3: Testar o Sistema

1. Acesse o cardápio público
2. Verifique se os produtos aparecem
3. Faça um pedido de teste
4. Verifique se o pedido aparece no admin do restaurante correto

### Passo 4: Remover Produtos Duplicados (Opcional)

**⚠️ ATENÇÃO:** Execute isso se houver produtos duplicados no mesmo restaurante!

1. Execute a query de verificação de duplicados (já está no script)
2. Se houver duplicados, descomente a seção "PASSO 2: REMOVER PRODUTOS DUPLICADOS"
3. Execute novamente

O script vai:
- ✅ Identificar produtos duplicados (mesmo nome, mesmo restaurante)
- ✅ Manter apenas o mais antigo (menor ID)
- ✅ Remover os duplicados
- ✅ Mostrar um relatório do que foi removido

### Passo 5: Remover Produtos Antigos (Opcional)

**⚠️ ATENÇÃO:** Só execute isso depois de verificar que tudo está funcionando!

1. Abra o arquivo `COPIAR_E_REMOVER_PRODUTOS_ANTIGOS.sql`
2. Descomente a seção "PASSO 3: REMOVER PRODUTOS ANTIGOS"
3. Execute novamente

Ou execute manualmente:

```sql
-- Remover produtos antigos
DELETE FROM products WHERE restaurant_id IS NULL;

-- Remover categorias antigas
DELETE FROM categories WHERE restaurant_id IS NULL;
```

## ✅ Resultado Final

Depois de executar tudo:

- ✅ Cada restaurante tem seus próprios produtos (com `restaurant_id`)
- ✅ Produtos antigos foram removidos
- ✅ Cardápio público mostra apenas produtos com `restaurant_id`
- ✅ Pedidos vão para o restaurante correto
- ✅ Cada restaurante vê apenas seus pedidos no admin

## 🔍 Verificação Final

```sql
-- Verificar se não há mais produtos sem restaurante
SELECT COUNT(*) as produtos_sem_restaurante
FROM products
WHERE restaurant_id IS NULL;
-- Deve retornar 0

-- Verificar produtos por restaurante
SELECT 
    u.email,
    COUNT(*) as total_produtos
FROM products p
JOIN auth.users u ON u.id = p.restaurant_id
GROUP BY u.email;
```

## ⚠️ Importante

- **Faça backup** antes de remover os produtos antigos
- **Teste tudo** antes de remover
- **Verifique** se todos os restaurantes têm produtos
- **Não remova** se houver dúvidas

## 🎉 Pronto!

Depois disso, o sistema estará limpo e organizado:
- Cada restaurante tem seus próprios produtos
- Não há mais produtos "órfãos" (sem restaurante)
- Tudo funciona perfeitamente!

