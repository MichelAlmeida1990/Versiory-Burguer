# Script para instalar Node.js 22 e fazer o build
# Execute este script como Administrador

Write-Host "=== Instalador Node.js 22 e Build do Projeto ===" -ForegroundColor Cyan
Write-Host ""

# Verificar versão atual do Node
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "Versão atual do Node: $nodeVersion" -ForegroundColor Yellow
    if ($nodeVersion -match "v22") {
        Write-Host "✓ Node.js 22 já está instalado!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Node.js 22 não está instalado. Versão atual: $nodeVersion" -ForegroundColor Red
        Write-Host ""
        Write-Host "Por favor, instale o Node.js 22:" -ForegroundColor Yellow
        Write-Host "1. Baixe: https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi" -ForegroundColor Cyan
        Write-Host "2. Execute o instalador" -ForegroundColor Cyan
        Write-Host "3. Reinicie o terminal e execute este script novamente" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "Node.js não encontrado. Por favor, instale o Node.js 22." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Limpando projeto ===" -ForegroundColor Cyan
cd C:\projetos\restaurante
Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue
Write-Host "✓ Limpeza concluída" -ForegroundColor Green

Write-Host ""
Write-Host "=== Instalando dependências ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green

Write-Host ""
Write-Host "=== Executando build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓✓✓ BUILD CONCLUÍDO COM SUCESSO! ✓✓✓" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Erro no build" -ForegroundColor Red
    exit 1
}



