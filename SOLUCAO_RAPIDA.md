# 🚀 Solução Rápida para o Erro de Build

## ❌ Problema
O erro `TypeError: generate is not a function` ocorre porque **Node.js 24.1.0 é incompatível com Next.js**.

## ✅ Solução (5 minutos)

### Opção 1: Instalar Node.js 22 (Recomendado)

1. **Baixe o Node.js 22:**
   - Link direto: https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi
   - Ou acesse: https://nodejs.org/ e baixe a versão LTS (22.x)

2. **Instale o Node.js 22:**
   - Execute o instalador `.msi` baixado
   - Siga as instruções (Next, Next, Install)
   - **IMPORTANTE:** Marque a opção "Automatically install the necessary tools" se aparecer

3. **Reinicie o terminal/PowerShell**

4. **Execute o build:**
   ```powershell
   cd C:\projetos\restaurante
   Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue
   npm install
   npm run build
   ```

### Opção 2: Usar o Script Automatizado

1. Instale o Node.js 22 (passo 1 e 2 acima)
2. Reinicie o terminal
3. Execute:
   ```powershell
   cd C:\projetos\restaurante
   .\instalar-node22-e-build.ps1
   ```

## ✅ Verificação

Após instalar, verifique a versão:
```powershell
node --version
```
Deve mostrar: `v22.11.0` ou similar (qualquer v22.x.x)

## 📝 Nota

O projeto foi copiado para `C:\projetos\restaurante` (fora do OneDrive) para evitar problemas de sincronização.



