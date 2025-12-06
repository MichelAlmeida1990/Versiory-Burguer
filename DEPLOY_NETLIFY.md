# 🚀 Guia de Deploy na Netlify

Este guia explica como fazer deploy do projeto Versiory Delivery na Netlify.

## 📋 Pré-requisitos

1. Conta no [Netlify](https://www.netlify.com/)
2. Repositório no GitHub/GitLab/Bitbucket
3. Variáveis de ambiente do Supabase configuradas

## 🔧 Configuração Inicial

### 1. Conectar o Repositório

1. Acesse [Netlify Dashboard](https://app.netlify.com/)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub, GitLab, Bitbucket)
4. Selecione o repositório `Versiory-Burguer`
5. Configure as opções de build:

   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (ou deixe em branco, o Netlify detecta automaticamente)
   - **Base directory**: (deixe em branco)

### 2. Configurar Variáveis de Ambiente

No painel do Netlify, vá em **Site settings** → **Environment variables** e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

**⚠️ IMPORTANTE**: 
- Use os mesmos valores do `.env.local` local
- Variáveis `NEXT_PUBLIC_*` são expostas ao cliente
- Nunca commite o `.env.local` no Git

### 3. Configurações Avançadas (Opcional)

No painel do Netlify, em **Site settings** → **Build & deploy**:

- **Node version**: `20` (ou a versão que você usa localmente)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

## 🚀 Deploy Automático

Após conectar o repositório, o Netlify fará deploy automaticamente:

- ✅ **A cada push na branch `main`** → Deploy de produção
- ✅ **A cada pull request** → Deploy preview (opcional)

## 📝 Comandos Úteis

### Deploy Manual

Se precisar fazer deploy manual:

1. No Netlify Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

### Ver Logs de Build

1. No Netlify Dashboard → **Deploys** → Clique no deploy desejado
2. Veja os logs completos do build

### Redeploy

1. No Netlify Dashboard → **Deploys**
2. Clique nos três pontos (...) no deploy → **Redeploy**

## 🔍 Troubleshooting

### Erro: "Build failed"

**Possíveis causas:**
- Variáveis de ambiente não configuradas
- Versão do Node.js incompatível
- Dependências faltando

**Solução:**
1. Verifique os logs de build no Netlify
2. Confirme que todas as variáveis `NEXT_PUBLIC_*` estão configuradas
3. Verifique se o `package.json` tem todas as dependências

### Erro: "Module not found"

**Causa**: Dependências não instaladas corretamente

**Solução:**
- O Netlify instala automaticamente via `npm install`
- Se persistir, adicione `npm ci` no build command

### Erro: "Environment variables not found"

**Causa**: Variáveis não configuradas no Netlify

**Solução:**
1. Vá em **Site settings** → **Environment variables**
2. Adicione todas as variáveis `NEXT_PUBLIC_*`
3. Faça um novo deploy

### Deploy diferente do local

**Possíveis causas:**
- Cache do Netlify
- Variáveis de ambiente diferentes
- Build cache desatualizado

**Solução:**
1. Limpe o cache: **Site settings** → **Build & deploy** → **Clear cache and deploy site**
2. Verifique se as variáveis de ambiente estão corretas
3. Faça um novo deploy

## 🎯 Diferenças entre Vercel e Netlify

| Aspecto | Vercel | Netlify |
|---------|--------|---------|
| **Detecção automática** | ✅ Detecta Next.js automaticamente | ✅ Detecta com plugin |
| **Build command** | Automático | `npm run build` |
| **Publish directory** | Automático | `.next` |
| **Cache** | Automático | Configurável via `netlify.toml` |
| **Headers** | Configurável via `vercel.json` | Configurável via `netlify.toml` |

## 📦 Arquivos de Configuração

O projeto inclui os seguintes arquivos para o Netlify:

- **`netlify.toml`**: Configuração principal (build, headers, redirects)
- **`public/_redirects`**: Redirecionamentos adicionais
- **`.gitignore`**: Inclui `.netlify` (pasta de cache local)

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] `netlify.toml` está no repositório
- [ ] `package.json` tem todas as dependências
- [ ] Build local funciona: `npm run build`
- [ ] Preview local funciona: `npm run preview`
- [ ] Testes passam (se houver)

## 🔗 Links Úteis

- [Netlify Docs - Next.js](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Plugin Next.js](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## 💡 Dicas

1. **Use Deploy Previews**: Ative deploy previews para testar PRs antes de merge
2. **Monitore Build Times**: Builds longos podem indicar problemas
3. **Configure Notificações**: Receba emails quando o deploy falhar
4. **Use Branch Deploys**: Configure deploys para branches específicas

---

**Pronto!** Seu projeto está configurado para deploy na Netlify. 🎉

