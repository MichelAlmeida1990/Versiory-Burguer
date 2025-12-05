# 🔍 Análise: Diferenças entre Deploy e Local

## 📋 Principais Causas Identificadas

### 1. **Cache e Build Desatualizado**
- **Problema**: O Next.js armazena dados de build no diretório `.next`. Se esse cache não for limpo, pode resultar na exibição de conteúdo desatualizado.
- **Solução**: Sempre limpar o cache antes de cada build:
  ```bash
  rm -rf .next
  npm run build
  ```

### 2. **Variáveis de Ambiente Diferentes**
- **Problema**: Variáveis de ambiente podem ser diferentes entre desenvolvimento e produção.
- **Solução**: 
  - Verificar `.env.local` (dev) vs variáveis no Vercel/Netlify (produção)
  - Garantir que todas as variáveis `NEXT_PUBLIC_*` estejam configuradas

### 3. **Sensibilidade a Maiúsculas/Minúsculas**
- **Problema**: Windows/macOS não diferenciam maiúsculas, mas Linux (servidores) sim.
- **Solução**: Verificar nomes de arquivos e caminhos no código correspondam exatamente.

### 4. **Diferenças entre Dev e Produção**
- **Problema**: Next.js opera diferente em `next dev` vs `next build` + `next start`
- **Solução**: Sempre testar localmente em modo produção antes de fazer deploy:
  ```bash
  npm run build
  npm run start
  ```

### 5. **Dependências Inconsistentes**
- **Problema**: Versões diferentes de bibliotecas entre ambientes.
- **Solução**: Usar `package-lock.json` e garantir que o deploy use `npm ci` (não `npm install`)

### 6. **Otimizações de Produção**
- **Problema**: Next.js aplica otimizações em produção que não existem em dev:
  - Minificação de código
  - Tree-shaking mais agressivo
  - SSR/SSG diferente
  - Compressão de assets

### 7. **CDN e Cache do Navegador**
- **Problema**: CDN (Vercel/Netlify) e cache do navegador podem servir versões antigas.
- **Solução**: 
  - Limpar cache do CDN após deploy
  - Usar versionamento de assets
  - Headers de cache apropriados

## ✅ Checklist Antes de Fazer Deploy

- [ ] Limpar cache local: `rm -rf .next`
- [ ] Rodar build de produção: `npm run build`
- [ ] Testar localmente: `npm run start`
- [ ] Verificar se está idêntico ao `npm run dev`
- [ ] Verificar variáveis de ambiente
- [ ] Verificar nomes de arquivos (case-sensitive)
- [ ] Verificar se `package-lock.json` está commitado
- [ ] Testar em modo anônimo do navegador (sem cache)

## 🛠️ Scripts de Teste

Adicione ao `package.json`:
```json
{
  "scripts": {
    "preview": "npm run build && npm run start",
    "test:build": "rm -rf .next && npm run build",
    "test:production": "npm run test:build && npm run start"
  }
}
```

## 📝 Comandos Recomendados

### Teste Completo Antes de Deploy
```bash
# 1. Limpar tudo
rm -rf .next node_modules package-lock.json

# 2. Reinstalar dependências
npm install

# 3. Build de produção
npm run build

# 4. Testar localmente
npm run start

# 5. Comparar com dev
# Em outro terminal: npm run dev
# Comparar http://localhost:3000 vs http://localhost:3002
```

### Verificar Diferenças
```bash
# Verificar tamanho do bundle
npm run build | grep "First Load JS"

# Verificar se há erros
npm run build 2>&1 | grep -i error

# Verificar variáveis de ambiente
cat .env.local
```

## 🚨 Problemas Comuns e Soluções

### Problema: Layout diferente no deploy
**Causa**: CSS não está sendo aplicado corretamente ou cache
**Solução**: 
- Verificar se Tailwind está compilando corretamente
- Limpar cache do navegador
- Verificar se `globals.css` está importado

### Problema: Imagens não carregam
**Causa**: Caminhos incorretos ou assets não commitados
**Solução**:
- Verificar se arquivos em `public/` estão commitados
- Verificar caminhos (case-sensitive)
- Verificar configuração de `next.config.js` para imagens

### Problema: Variáveis de ambiente não funcionam
**Causa**: Variáveis não configuradas no deploy
**Solução**:
- Verificar variáveis no painel do Vercel/Netlify
- Garantir que variáveis `NEXT_PUBLIC_*` estão configuradas
- Fazer novo deploy após adicionar variáveis

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Deployment](https://vercel.com/docs)

