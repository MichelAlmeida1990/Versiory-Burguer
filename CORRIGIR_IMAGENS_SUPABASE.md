# Corrigir Erro de Imagens do Supabase Storage

## Problema
Erro `400 Bad Request` ao carregar imagens do Supabase Storage:
```
upstream image response failed for https://hibtybvsryravqmqozne.supabase.co/storage/v1/object/public/images/product_images/...
[Error: "url" parameter is valid but upstream response is invalid] { statusCode: 400 }
```

## Solução

### 1. Verificar se o Bucket está Público

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Storage** > **Buckets**
4. Clique no bucket `images`
5. Verifique se está marcado como **Public bucket**
6. Se não estiver, edite o bucket e marque como público

### 2. Configurar Políticas RLS do Storage

Execute no **SQL Editor** do Supabase:

```sql
-- Execute o arquivo: supabase/STORAGE_POLICIES.sql
-- Ou cole este código:

DROP POLICY IF EXISTS "Permitir upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens" ON storage.objects;

CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir leitura de imagens"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'images');

CREATE POLICY "Permitir exclusão de imagens"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'images');
```

### 3. Verificar Configuração do Next.js

O arquivo `next.config.js` já está configurado corretamente com:
- `remotePatterns` para `**.supabase.co`
- `unoptimized` para imagens do Supabase (aplicado automaticamente)

### 4. Testar

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Tente fazer upload de uma nova imagem
3. Verifique se a imagem aparece corretamente

## Se o Problema Persistir

1. **Verifique se o arquivo existe no Storage:**
   - Vá em Storage > images > product_images
   - Confirme que o arquivo está lá

2. **Teste a URL diretamente no navegador:**
   - Copie a URL da imagem
   - Cole no navegador
   - Se não abrir, o problema é nas políticas RLS

3. **Verifique as políticas RLS:**
   - Vá em Storage > images > Policies
   - Confirme que as 3 políticas estão ativas

4. **Limpe o cache do Next.js:**
   ```bash
   rm -rf .next
   npm run dev
   ```

## Nota

As imagens do Supabase agora usam `unoptimized={true}` para evitar problemas com a otimização do Next.js Image. Isso significa que as imagens serão servidas diretamente do Supabase sem otimização, o que é aceitável para a maioria dos casos.

