# Configurar Políticas via Interface (Passo a Passo)

## Política 1: Upload de Imagens (INSERT)

1. No bucket `images`, clique em **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Cole apenas esta política:

```sql
CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'images');
```

5. Clique em **Review** e depois em **Save policy**

---

## Política 2: Leitura de Imagens (SELECT)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Cole apenas esta política:

```sql
CREATE POLICY "Permitir leitura de imagens"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'images');
```

4. Clique em **Review** e depois em **Save policy**

---

## Política 3: Exclusão de Imagens (DELETE)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Cole apenas esta política:

```sql
CREATE POLICY "Permitir exclusão de imagens"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'images');
```

4. Clique em **Review** e depois em **Save policy**

---

## ⚠️ IMPORTANTE

**Use o SQL Editor** (Opção 1) para executar todas as políticas de uma vez. É mais rápido e evita erros!





