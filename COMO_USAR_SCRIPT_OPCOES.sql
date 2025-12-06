# 📋 Como Usar o Script de Opções para TODOS os Produtos

## ✅ O QUE O SCRIPT FAZ

O arquivo `supabase/INSERIR_OPCOES_TODOS_PRODUTOS.sql` cria automaticamente opções para:

- ✅ **Pizzas**: Tamanho, Borda, Ingredientes Extras
- ✅ **Hambúrgueres**: Tamanho, Adicionais, Molhos
- ✅ **Bebidas**: Tamanho, Gelo
- ✅ **Saladas**: Tamanho, Proteínas, Toppings
- ✅ **Massas**: Proteínas Adicionais, Queijo Extra
- ✅ **Pratos Quentes**: Acompanhamentos
- ✅ **Sobremesas**: Tamanho, Coberturas
- ✅ **Entradas**: Quantidade, Recheios

## 🚀 COMO EXECUTAR

### Passo 1: Executar o SQL Base (se ainda não executou)
1. Supabase → SQL Editor
2. Execute: `supabase/PRODUTO_OPCOES_SEM_COMENTARIOS.sql`
3. Isso cria as 3 tabelas necessárias

### Passo 2: Executar o Script de Opções
1. Supabase → SQL Editor
2. Abra: `supabase/INSERIR_OPCOES_TODOS_PRODUTOS.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**

**Pronto!** O script vai:
- Identificar automaticamente os produtos pelo nome
- Criar as opções apropriadas
- Criar os valores para cada opção
- Evitar duplicatas (pode executar várias vezes sem problema)

## 🔍 COMO O SCRIPT IDENTIFICA OS PRODUTOS

O script usa palavras-chave no nome do produto:

- **Pizzas**: produtos com "pizza" no nome
- **Hambúrgueres**: produtos com "hambúrguer", "hamburger" ou "burger"
- **Bebidas**: produtos com "refrigerante", "suco", "água", "bebida" OU na categoria "Bebidas"
- **Saladas**: produtos com "salada" no nome
- **Massas**: produtos com "massa", "penne", "espaguete", "lasanha", "risotto"
- **Pratos Quentes**: produtos com "frango", "carne", "grelhado", "assado"
- **Sobremesas**: produtos com "sobremesa", "sorvete", "açaí", "pudim", "mousse" OU na categoria "Sobremesas"
- **Entradas**: produtos com "pão" ou "entrada" OU na categoria "Entradas"

## ✅ VERIFICAR SE FUNCIONOU

Execute esta query no Supabase SQL Editor:

```sql
SELECT 
  p.name as produto,
  po.name as opcao,
  po.type,
  po.required,
  COUNT(pov.id) as quantidade_valores
FROM products p
LEFT JOIN product_options po ON po.product_id = p.id
LEFT JOIN product_option_values pov ON pov.option_id = po.id
GROUP BY p.id, p.name, po.id, po.name, po.type, po.required
ORDER BY p.name, po.display_order;
```

**Você deve ver:**
- Pizzas com 3 opções (Tamanho, Borda, Ingredientes Extras)
- Hambúrgueres com 3 opções (Tamanho, Adicionais, Molhos)
- Bebidas com 2 opções (Tamanho, Gelo)
- E assim por diante...

## ⚠️ IMPORTANTE

1. **O script é seguro**: Pode executar várias vezes sem criar duplicatas
2. **Não apaga nada**: Apenas adiciona opções, não remove produtos existentes
3. **Funciona automaticamente**: Identifica produtos pelo nome, não precisa configurar manualmente

## 🎯 DEPOIS DE EXECUTAR

1. ✅ Recarregue o site
2. ✅ Vá no cardápio
3. ✅ Clique em "Adicionar" em uma pizza
4. ✅ O modal deve mostrar as opções!

## 🛠️ SE ALGUM PRODUTO NÃO FOR IDENTIFICADO

Se algum produto não tiver opções criadas, você pode:

1. **Opção 1**: Renomear o produto para incluir a palavra-chave
   - Ex: "Frango" → "Frango Grelhado"

2. **Opção 2**: Criar manualmente no Table Editor
   - Siga o guia: `GUIA_PASSO_A_PASSO_OPCOES.md`

3. **Opção 3**: Adicionar ao script SQL
   - Adicione mais condições WHERE no script

## 📝 EXEMPLO DE RESULTADO

Após executar, uma Pizza Margherita terá:

**Opção 1: Tamanho** (obrigatória)
- Pequena (4 fatias) - R$ 0,00
- Média (6 fatias) - R$ 5,00
- Grande (8 fatias) - R$ 10,00
- Família (12 fatias) - R$ 18,00

**Opção 2: Borda** (opcional)
- Normal - R$ 0,00
- Borda Recheada Catupiry - R$ 3,00
- Borda Recheada Cheddar - R$ 3,50
- etc...

**Opção 3: Ingredientes Extras** (opcional, múltipla escolha)
- Queijo Extra - R$ 2,00
- Bacon - R$ 3,00
- etc...

---

## ✅ PRONTO!

Execute o script e todos os produtos terão suas opções criadas automaticamente!




