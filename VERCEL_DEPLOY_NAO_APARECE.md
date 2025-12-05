# 🔍 Por que o Deploy não Aparece na Vercel?

## 📋 Checklist de Verificação

### 1. **Repositório está Conectado ao Vercel?**
- Acesse: https://vercel.com/dashboard
- Vá em **Settings** → **Git**
- Verifique se o repositório `Versiory-Burguer` está listado
- Se não estiver, clique em **Connect Git Repository**

### 2. **Webhook do GitHub está Configurado?**
- Acesse: https://github.com/MichelAlmeida1990/Versiory-Burguer/settings/hooks
- Verifique se há um webhook do Vercel ativo
- Deve ter URL: `https://api.vercel.com/v1/integrations/deploy/...`
- Status deve estar **ativo** (verde)

### 3. **Permissões do Repositório**
- O repositório precisa estar **público** OU você precisa ter permissões na equipe do Vercel
- Verifique em: GitHub → Settings → Collaborators

### 4. **Autor do Commit tem Permissões?**
- O email do commit (`michelpaulo06@hotmail.com`) precisa estar vinculado à conta do Vercel
- Verifique em: Vercel Dashboard → Settings → Git → Email

### 5. **Branch Configurada Corretamente?**
- No Vercel Dashboard → Settings → Git
- Verifique se a branch `main` está configurada para produção
- Deve estar marcada como **Production Branch**

### 6. **Build está Falhando?**
- Acesse: Vercel Dashboard → Deployments
- Verifique se há deploys com status **Failed** ou **Error**
- Clique no deploy para ver os logs de erro

## 🛠️ Soluções Rápidas

### Solução 1: Reconectar o Repositório
1. Vercel Dashboard → Settings → Git
2. Clique em **Disconnect** no repositório
3. Clique em **Connect Git Repository** novamente
4. Selecione `Versiory-Burguer`
5. Configure a branch `main` como produção

### Solução 2: Deploy Manual
1. Vercel Dashboard → **Deployments**
2. Clique em **Add New...** → **Deploy**
3. Selecione o repositório e branch `main`
4. Clique em **Deploy**

### Solução 3: Verificar Webhook
1. GitHub → Settings → Webhooks
2. Se não houver webhook do Vercel:
   - Vercel Dashboard → Settings → Git
   - Reconecte o repositório (isso cria o webhook automaticamente)

### Solução 4: Forçar Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy manual
vercel --prod
```

## 🔍 Verificações Adicionais

### Verificar se o Push foi Recebido
- GitHub → Repositório → Commits
- Verifique se o commit `430ccae` está visível
- Se estiver, o problema é na integração Vercel

### Verificar Logs do Vercel
- Vercel Dashboard → Deployments
- Procure por qualquer deploy recente
- Se houver, clique para ver os logs

### Verificar Configuração do Projeto
- Vercel Dashboard → Settings → General
- Verifique:
  - **Framework Preset**: Next.js
  - **Root Directory**: `./` (raiz)
  - **Build Command**: `npm run build`
  - **Output Directory**: `.next` (padrão do Next.js)

## 📝 Comandos Úteis

```bash
# Verificar se há integração Vercel
vercel whoami

# Listar projetos
vercel ls

# Verificar configuração
vercel inspect
```

## ⚠️ Problemas Comuns

1. **Repositório Privado sem Permissões**
   - Solução: Tornar público OU adicionar permissões na equipe Vercel

2. **Email do Commit Diferente**
   - Solução: Configurar mesmo email no Git e Vercel

3. **Branch Diferente**
   - Solução: Verificar se está fazendo push na branch correta (`main`)

4. **Build Falhando Silenciosamente**
   - Solução: Verificar logs no Vercel Dashboard

5. **Webhook Expirado ou Removido**
   - Solução: Reconectar repositório no Vercel

## 🚀 Próximos Passos

1. Acesse o Vercel Dashboard
2. Verifique se o projeto está listado
3. Se não estiver, conecte o repositório
4. Se estiver, verifique os logs de deploy
5. Se necessário, faça deploy manual

