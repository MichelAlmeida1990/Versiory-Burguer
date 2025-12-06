# ✅ SOLUÇÃO FINAL - Erro "generate is not a function"

## 🔍 Diagnóstico

O erro `TypeError: generate is not a function` é causado por **incompatibilidade entre Node.js 22.11.0 e Next.js**.

**Testado:**
- ❌ Next.js 14.2.15 + Node.js 22 = ERRO
- ❌ Next.js 14.2.18 + Node.js 22 = ERRO  
- ❌ Next.js 16.0.7 + Node.js 22 = ERRO

## ✅ SOLUÇÃO: Instalar Node.js 20 LTS

### Passo 1: Baixar Node.js 20

**Link direto:** https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi

Ou acesse: https://nodejs.org/ e baixe a versão **LTS (20.x)**

### Passo 2: Instalar Node.js 20

1. Execute o instalador `.msi` baixado
2. Siga as instruções (Next, Next, Install)
3. **IMPORTANTE:** Reinicie o terminal/PowerShell após instalar

### Passo 3: Verificar Instalação

```powershell
node --version
```

**Deve mostrar:** `v20.18.0` ou similar (qualquer v20.x.x)

### Passo 4: Limpar e Reinstalar Projeto

```powershell
cd C:\Projetos\restaurante

# Limpar tudo
Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue

# Limpar cache
npm cache clean --force

# Reinstalar dependências
npm install

# Testar build
npm run build
```

### Passo 5: Rodar o Projeto

```powershell
npm run dev
```

**Acesse:** http://localhost:3000

## 📝 Resumo

- **Problema:** Node.js 22 é incompatível com Next.js 14/16
- **Solução:** Usar Node.js 20 LTS (versão estável recomendada)
- **Status:** Após instalar Node.js 20, o projeto deve funcionar normalmente

## ⚠️ Nota

Se você precisar manter Node.js 22 para outros projetos, considere usar:
- **nvm-windows** (Node Version Manager) para gerenciar múltiplas versões
- Link: https://github.com/coreybutler/nvm-windows

Com nvm, você pode alternar entre Node.js 20 e 22 conforme necessário.


