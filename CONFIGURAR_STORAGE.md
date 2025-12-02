# Configurar Supabase Storage para Upload de Imagens

## Passo a Passo

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique no botão **New bucket**
5. Configure o bucket:
   - **Name**: `images`
   - **Public bucket**: ✅ Marque como público (para permitir acesso às imagens)
   - Clique em **Create bucket**

## Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso:

1. No bucket `images`, clique em **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Cole a seguinte política SQL:

```sql
-- Permitir upload de imagens (INSERT)
CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'images');

-- Permitir leitura de imagens (SELECT)
CREATE POLICY "Permitir leitura de imagens"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'images');

-- Permitir exclusão de imagens (DELETE)
CREATE POLICY "Permitir exclusão de imagens"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'images');
```

5. Clique em **Review** e depois em **Save policy**

## Estrutura de Pastas

As imagens serão organizadas automaticamente na pasta `product_images/` dentro do bucket `images`.

## Teste

Após configurar, tente fazer upload de uma imagem ao cadastrar um novo produto. O upload deve funcionar corretamente.

