# 📧 Solução: Email de Confirmação do Cliente Não Está Chegando

## 🔍 Problema

Os emails de confirmação não estão sendo enviados quando o cliente cria uma conta.

## ✅ Soluções

### **Solução 1: Desabilitar Confirmação de Email (Recomendado para Desenvolvimento/Teste)**

Esta é a solução mais rápida para desenvolvimento:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://app.supabase.com
   - Selecione seu projeto

2. **Vá em Authentication > Providers**
   - No menu lateral, clique em **Authentication**
   - Clique em **Providers**

3. **Configure o Email Provider**
   - Clique na aba **Email**
   - **Desmarque** a opção **"Enable email confirmations"**
   - Clique em **Save**

4. **Resultado:**
   - ✅ Clientes serão criados automaticamente sem precisar confirmar email
   - ✅ Login funcionará imediatamente após cadastro
   - ✅ Não precisa configurar SMTP

---

### **Solução 2: Configurar SMTP (Para Produção)**

Se você precisa que os emails sejam enviados de verdade:

1. **Acesse o Supabase Dashboard**
   - Vá em **Settings** > **Auth**
   - Role até a seção **SMTP Settings**

2. **Configure o SMTP**
   - **Enable Custom SMTP**: ✅ Marque esta opção
   - **SMTP Host**: (ex: `smtp.gmail.com` para Gmail)
   - **SMTP Port**: (ex: `587` para TLS ou `465` para SSL)
   - **SMTP User**: Seu email
   - **SMTP Password**: Senha de app (não a senha normal)
   - **Sender Email**: Email que aparecerá como remetente
   - **Sender Name**: Nome que aparecerá (ex: "Tom & Jerry Pizzaria")

3. **Exemplo para Gmail:**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: seuemail@gmail.com
   SMTP Password: (senha de app do Gmail)
   Sender Email: seuemail@gmail.com
   Sender Name: Tom & Jerry Pizzaria
   ```

4. **Teste o Envio**
   - Após salvar, tente criar uma nova conta
   - Verifique se o email chegou

---

### **Solução 3: Confirmar Email Manualmente (Temporário)**

Se você precisa que o cliente use a conta imediatamente:

1. **Acesse o Supabase Dashboard**
2. **Vá em Authentication > Users**
3. **Encontre o usuário** pelo email
4. **Clique nos três pontos** (⋯) ao lado do usuário
5. **Selecione "Confirm email"** ou "Auto Confirm User"

---

## 🔧 Verificar Configuração Atual

Para verificar se a confirmação está habilitada:

1. No Supabase Dashboard, vá em **Authentication > Providers > Email**
2. Veja se **"Enable email confirmations"** está marcado
3. Se estiver marcado e não configurou SMTP, os emails não serão enviados

---

## 📝 Código Atual

O código já está preparado para ambos os casos:

- **Se confirmação estiver desabilitada**: Cliente é logado automaticamente
- **Se confirmação estiver habilitada**: Mostra mensagem para verificar email e botão de reenvio

Veja em: `app/cliente/login/page.tsx` (linhas 82-107)

---

## ⚠️ Importante

- **Desenvolvimento**: Desabilite confirmação de email (Solução 1)
- **Produção**: Configure SMTP (Solução 2)
- **Teste Rápido**: Confirme manualmente (Solução 3)

---

## 🎯 Recomendação

Para o projeto Tom & Jerry em desenvolvimento/teste:
- **Use a Solução 1** (desabilitar confirmação)
- Isso permite que os clientes façam pedidos imediatamente
- Quando for para produção, configure o SMTP

