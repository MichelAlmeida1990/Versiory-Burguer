# 🔧 Versões Compatíveis - Node.js e Next.js

## ❌ Problema Identificado

O erro `TypeError: generate is not a function` ocorre devido a incompatibilidade entre:
- **Node.js 22.11.0** (atual)
- **Next.js 14.2.x**

## ✅ Soluções Recomendadas

### Opção 1: Usar Node.js 20 LTS (RECOMENDADO)

**Node.js 20** é a versão LTS estável e totalmente compatível com Next.js 14:

1. **Baixar Node.js 20:**
   - Link: https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi
   - Ou acesse: https://nodejs.org/ e baixe a versão LTS (20.x)

2. **Instalar Node.js 20:**
   - Execute o instalador
   - Reinicie o terminal

3. **Verificar versão:**
   ```powershell
   node --version
   # Deve mostrar: v20.18.0 ou similar
   ```

4. **Limpar e reinstalar:**
   ```powershell
   cd C:\Projetos\restaurante
   Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue
   npm install
   npm run build
   ```

### Opção 2: Atualizar para Next.js 15

Next.js 15 tem melhor suporte para Node.js 22:

```powershell
cd C:\Projetos\restaurante
npm install next@latest react@latest react-dom@latest
npm run build
```

### Opção 3: Usar Next.js 14.1.x (Versão Estável Anterior)

```powershell
cd C:\Projetos\restaurante
npm install next@14.1.4 react@18.3.1 react-dom@18.3.1
npm run build
```

## 📊 Matriz de Compatibilidade

| Node.js | Next.js 14.2.x | Next.js 14.1.x | Next.js 15.x |
|---------|----------------|----------------|--------------|
| 18.x LTS | ✅ Funciona | ✅ Funciona | ✅ Funciona |
| 20.x LTS | ✅ Funciona | ✅ Funciona | ✅ Funciona |
| 22.x | ❌ Problemas | ⚠️ Pode funcionar | ✅ Funciona |

## 🎯 Recomendação Final

**Use Node.js 20 LTS** - É a versão mais estável e recomendada para Next.js 14.


