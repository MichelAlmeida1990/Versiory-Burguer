# 🚀 Deploy na Vercel - Versiory Burguer

## Passos para Deploy

### 1. Conectar Repositório GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Selecione o repositório: `MichelAlmeida1990/Versiory-Burguer`

### 2. Configurar Variáveis de Ambiente
Na Vercel, adicione as seguintes variáveis de ambiente:

```
NEXT_PUBLIC_SUPABASE_URL=https://hibtybvsryravqmqozne.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sHAOoDqnDGtW7ePMOZKwyQ_xZqjprHa
```

**Como adicionar:**
- No projeto na Vercel, vá em **Settings** → **Environment Variables**
- Adicione cada variável separadamente
- Selecione **Production**, **Preview** e **Development**

### 3. Configurações do Projeto
- **Framework Preset:** Next.js
- **Root Directory:** `./` (raiz do projeto)
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

### 4. Deploy
1. Clique em **Deploy**
2. Aguarde o build completar (2-3 minutos)
3. Acesse a URL fornecida pela Vercel

### 5. Configurar Domínio (Opcional)
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

## ✅ Checklist Pré-Deploy

- [x] Build local funcionando (`npm run build`)
- [x] Variáveis de ambiente configuradas
- [x] Supabase configurado e funcionando
- [x] Imagens organizadas em `/public/images`
- [x] Código commitado e pushado para GitHub

## 📝 Notas Importantes

1. **Variáveis de Ambiente:** Nunca commite o arquivo `.env.local` no Git
2. **Supabase:** Certifique-se de que as políticas RLS estão configuradas corretamente
3. **Imagens:** Todas as imagens devem estar em `/public/images`
4. **Build:** O build está otimizado e funcionando corretamente

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 🐛 Troubleshooting

### Build falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Confira os logs de build na Vercel

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o Supabase está ativo

### Imagens não aparecem
- Verifique se as imagens estão em `/public/images`
- Confirme os caminhos das imagens no código

