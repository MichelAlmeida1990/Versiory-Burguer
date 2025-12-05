# Comandos para Build Após Instalar Node.js 22

## Passo 1: Verificar versão do Node
```powershell
node --version
```
Deve mostrar: `v22.11.0` ou similar (qualquer 22.x.x)

## Passo 2: Limpar e Reinstalar
```powershell
cd C:\projetos\restaurante
Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue
npm install
```

## Passo 3: Build
```powershell
npm run build
```

## Se ainda der erro:
```powershell
# Limpar cache do npm também
npm cache clean --force
Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue
npm install
npm run build
```



