# Configuração de Email de Confirmação

## Problema
Em desenvolvimento, os emails de confirmação do Supabase não são enviados automaticamente, a menos que você configure um provedor SMTP.

## Soluções

### Opção 1: Desabilitar Confirmação de Email (Recomendado para Desenvolvimento)

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Providers** > **Email**
3. Desmarque a opção **"Enable email confirmations"**
4. Salve as alterações

Agora os usuários serão criados automaticamente sem precisar confirmar o email.

### Opção 2: Configurar SMTP (Para Produção)

1. No Supabase Dashboard, vá em **Settings** > **Auth**
2. Role até a seção **SMTP Settings**
3. Configure seu provedor SMTP (Gmail, SendGrid, etc.)
4. Teste o envio

### Opção 3: Usar Email de Teste do Supabase

Para desenvolvimento, você pode usar o email de teste que o Supabase fornece, mas isso requer configuração adicional.

## Como Verificar se está Funcionando

Após desabilitar a confirmação de email:
1. Tente criar uma nova conta
2. Você deve ser logado automaticamente após o cadastro
3. Não será necessário confirmar o email

