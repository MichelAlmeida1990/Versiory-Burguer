# 📋 Como Executar o SQL de Opções de Produtos

## ✅ Passo a Passo

### 1. Acesse o Supabase
1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### 2. Abra o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### 3. Execute o SQL
1. Abra o arquivo `supabase/PRODUTO_OPCOES_SEM_COMENTARIOS.sql` no seu editor
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl + Enter`)

### 4. Verifique se Funcionou
Após executar, você deve ver:
- ✅ Mensagem de sucesso
- ✅ 3 novas tabelas criadas:
  - `product_options`
  - `product_option_values`
  - `order_item_options`

## 📁 Arquivos Disponíveis

Você tem **2 opções** de arquivo SQL:

### Opção 1: Com Comentários (Recomendado para entender)
📄 `supabase/PRODUTO_OPCOES.sql`
- Contém comentários explicativos
- Mais fácil de entender
- Melhor para aprender

### Opção 2: Sem Comentários (Mais limpo)
📄 `supabase/PRODUTO_OPCOES_SEM_COMENTARIOS.sql`
- Sem comentários
- Mais compacto
- Similar ao seu `COMPLETO_SEM_COMENTARIOS.sql`

**Recomendação**: Use o arquivo **SEM COMENTARIOS** se você já entendeu o sistema.

## ⚠️ Importante

- ✅ **Seguro**: O SQL usa `IF NOT EXISTS`, então pode executar várias vezes sem erro
- ✅ **Não afeta dados existentes**: Não modifica produtos, pedidos ou categorias existentes
- ✅ **Apenas adiciona**: Cria apenas as novas tabelas e políticas

## 🔍 Verificar se Funcionou

Execute esta query no SQL Editor para verificar:

```sql
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('product_options', 'product_option_values', 'order_item_options');
```

Você deve ver 3 linhas retornadas.

## 📝 Próximos Passos

Após executar o SQL:
1. ✅ Tabelas criadas
2. ⏳ Implementar frontend (modal de opções)
3. ⏳ Atualizar carrinho
4. ⏳ Criar interface admin

## ❓ Dúvidas?

Se der algum erro:
1. Verifique se você está no projeto correto do Supabase
2. Verifique se as tabelas `products` e `order_items` já existem
3. Copie a mensagem de erro e me envie




