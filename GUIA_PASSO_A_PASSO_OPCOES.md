# 🎯 GUIA PASSO A PASSO: Implementar Opções de Produtos

## ✅ O QUE JÁ ESTÁ PRONTO

1. ✅ **Sistema de opções implementado no código**
   - Modal de opções criado
   - Carrinho atualizado
   - Checkout atualizado
   - API atualizada

2. ✅ **Banco de dados preparado**
   - Tabelas criadas (se você executou o SQL)
   - Políticas RLS configuradas

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Verificar se o Supabase está configurado**

#### 1.1. Acesse o Supabase
- Vá para [https://supabase.com](https://supabase.com)
- Faça login e selecione seu projeto

#### 1.2. Execute o SQL (se ainda não executou)
1. Clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo: `supabase/PRODUTO_OPCOES_SEM_COMENTARIOS.sql`
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor
6. Clique em **"Run"** (ou pressione `Ctrl + Enter`)

#### 1.3. Verificar se funcionou
Execute esta query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_options', 'product_option_values', 'order_item_options');
```

**Deve retornar 3 linhas.** Se retornar, está tudo certo! ✅

---

### **PASSO 2: Criar opções para uma PIZZA (exemplo prático)**

Vamos usar uma pizza como exemplo. Siga estes passos:

#### 2.1. Encontrar o ID da pizza
1. No Supabase, vá em **"Table Editor"**
2. Clique na tabela **"products"**
3. Encontre uma pizza (ex: "Pizza Margherita")
4. **Anote o ID** da pizza (é um UUID longo)

#### 2.2. Criar a opção "Tamanho"
1. Vá em **"Table Editor"** → **"product_options"**
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha:
   - **product_id**: Cole o ID da pizza que você anotou
   - **name**: `Tamanho`
   - **type**: `single` (escolha única)
   - **required**: `true` (marcar como obrigatória)
   - **display_order**: `1`
4. Clique em **"Save"**
5. **Anote o ID** que foi criado (aparece na linha)

#### 2.3. Criar valores para "Tamanho"
1. Vá em **"Table Editor"** → **"product_option_values"**
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha o primeiro valor:
   - **option_id**: Cole o ID da opção "Tamanho" que você anotou
   - **name**: `Pequena (4 fatias)`
   - **price_modifier**: `0.00`
   - **display_order**: `1`
   - **available**: `true`
4. Clique em **"Save"**
5. Repita para os outros tamanhos:
   - **Média (6 fatias)**: price_modifier = `5.00`, display_order = `2`
   - **Grande (8 fatias)**: price_modifier = `10.00`, display_order = `3`
   - **Família (12 fatias)**: price_modifier = `18.00`, display_order = `4`

#### 2.4. Criar a opção "Borda" (MUITO IMPORTANTE!)
1. Volte em **"product_options"**
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha:
   - **product_id**: Mesmo ID da pizza
   - **name**: `Borda`
   - **type**: `single`
   - **required**: `false` (opcional)
   - **display_order**: `2`
4. Clique em **"Save"**
5. **Anote o ID** da opção "Borda"

#### 2.5. Criar valores para "Borda"
1. Vá em **"product_option_values"**
2. Crie os seguintes valores (use o ID da opção "Borda"):
   - **Normal**: price_modifier = `0.00`, display_order = `1`
   - **Borda Recheada Catupiry**: price_modifier = `3.00`, display_order = `2`
   - **Borda Recheada Cheddar**: price_modifier = `3.50`, display_order = `3`
   - **Borda Recheada Cream Cheese**: price_modifier = `3.50`, display_order = `4`
   - **Borda Recheada Calabresa**: price_modifier = `4.00`, display_order = `5`
   - **Borda Doce (Chocolate)**: price_modifier = `4.50`, display_order = `6`

#### 2.6. Criar a opção "Ingredientes Extras" (opcional)
1. Volte em **"product_options"**
2. Crie uma nova opção:
   - **product_id**: Mesmo ID da pizza
   - **name**: `Ingredientes Extras`
   - **type**: `multiple` (múltipla escolha)
   - **required**: `false`
   - **display_order**: `3`
3. **Anote o ID**

#### 2.7. Criar valores para "Ingredientes Extras"
Crie os seguintes valores (use o ID da opção "Ingredientes Extras"):
- **Queijo Extra**: price_modifier = `2.00`, display_order = `1`
- **Bacon**: price_modifier = `3.00`, display_order = `2`
- **Calabresa**: price_modifier = `2.50`, display_order = `3`
- **Azeitona**: price_modifier = `1.50`, display_order = `4`
- **Cebola**: price_modifier = `1.00`, display_order = `5`
- **Champignon**: price_modifier = `2.50`, display_order = `6`
- **Pepperoni**: price_modifier = `3.50`, display_order = `7`

---

### **PASSO 3: Testar no site**

1. **Acesse o site** (localhost ou produção)
2. **Vá até a página do cardápio**
3. **Clique em "Adicionar"** na pizza que você configurou
4. **O modal deve abrir** mostrando as opções:
   - Tamanho (obrigatório)
   - Borda (opcional)
   - Ingredientes Extras (opcional)
5. **Selecione algumas opções**
6. **Veja o preço atualizar** em tempo real
7. **Clique em "Adicionar ao Carrinho"**
8. **Verifique o carrinho** - deve mostrar as opções selecionadas

---

### **PASSO 4: Verificar se está funcionando**

#### 4.1. Teste completo:
- ✅ Modal abre ao clicar em "Adicionar"
- ✅ Opções aparecem corretamente
- ✅ Preço atualiza em tempo real
- ✅ Produto é adicionado ao carrinho com opções
- ✅ Carrinho mostra as opções selecionadas
- ✅ Checkout envia as opções corretamente

#### 4.2. Se algo não funcionar:
- Verifique o console do navegador (F12)
- Verifique se as tabelas existem no Supabase
- Verifique se as opções foram criadas corretamente

---

## 🔧 AJUSTES NO SUPABASE (se necessário)

### Verificar se precisa ajustar:

1. **As tabelas existem?**
   - Execute: `SELECT * FROM product_options LIMIT 1;`
   - Se der erro, execute o SQL do Passo 1.2

2. **As políticas RLS estão corretas?**
   - Se você conseguir inserir opções, está tudo certo
   - Se der erro de permissão, verifique as políticas

3. **Os dados estão corretos?**
   - Verifique se os `product_id` estão corretos
   - Verifique se os `option_id` nos valores estão corretos

---

## 📝 RESUMO RÁPIDO

1. ✅ **Código já está pronto** - não precisa mexer
2. ⚠️ **Supabase precisa:**
   - Executar o SQL (se ainda não executou)
   - Criar opções para os produtos (usando Table Editor)
3. ✅ **Testar no site**

---

## 🆘 SE DER ERRO

### Erro: "Tabela não existe"
**Solução**: Execute o SQL do Passo 1.2

### Erro: "Modal não abre"
**Solução**: 
- Verifique se o produto tem opções cadastradas
- Verifique o console do navegador (F12)

### Erro: "Opções não aparecem"
**Solução**:
- Verifique se as opções foram criadas no Supabase
- Verifique se o `product_id` está correto
- Verifique se os valores têm `available = true`

### Erro: "Preço não atualiza"
**Solução**:
- Verifique se os `price_modifier` estão preenchidos
- Verifique o console do navegador

---

## ✅ CHECKLIST FINAL

- [ ] SQL executado no Supabase
- [ ] Tabelas criadas (verificar com query)
- [ ] Opções criadas para pelo menos 1 produto
- [ ] Valores criados para cada opção
- [ ] Testado no site - modal abre
- [ ] Testado no site - opções aparecem
- [ ] Testado no site - preço atualiza
- [ ] Testado no site - adiciona ao carrinho
- [ ] Testado no site - carrinho mostra opções
- [ ] Testado no site - checkout funciona

---

## 🎉 PRONTO!

Depois de seguir estes passos, seu sistema de opções estará funcionando!

**Dica**: Comece com 1 produto (pizza) para testar. Depois adicione opções para os outros produtos.




