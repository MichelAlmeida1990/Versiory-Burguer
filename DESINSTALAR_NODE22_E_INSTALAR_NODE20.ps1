# ================================================
# DESINSTALAR Node.js 22 e INSTALAR Node.js 20 LTS
# Executar como Administrador
# ================================================

# Mudar automaticamente para o diretório onde o script está (funciona de qualquer lugar)
Set-Location -Path $PSScriptRoot

Write-Host "=== Desinstalando Node.js 22 e instalando Node.js 20 LTS ===" -ForegroundColor Cyan

Write-Host ""

# Verifica se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "ERRO: Este script precisa ser executado como ADMINISTRADOR!" -ForegroundColor Red
    Write-Host "   → Feche esta janela, clique com o botão direito no PowerShell → Executar como administrador" -ForegroundColor Yellow
    Read-Host "Pressione ENTER para sair"
    exit 1
}

Write-Host "Executando como Administrador" -ForegroundColor Green
Write-Host ""

# 1. Desinstalar todas as versões do Node.js atuais (via winget e Programs and Features)
Write-Host "Procurando e removendo versões existentes do Node.js..." -ForegroundColor Yellow

# Remove via winget (método mais limpo e rápido)
winget uninstall --id OpenJS.NodeJS --silent --force
winget uninstall --id OpenJS.NodeJS.LTS --silent --force

# Remove também versões antigas instaladas pelo instalador .msi (caso existam)
$nodeUninstall = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*","HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction SilentlyContinue | 
                 Where-Object { $_.DisplayName -like "*Node.js*" }

foreach ($app in $nodeUninstall) {
    Write-Host "Desinstalando: $($app.DisplayName)"
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/x", "$($app.PSChildName)", "/quiet", "/norestart" -Wait
}

Write-Host "Node.js removido com sucesso!" -ForegroundColor Green
Write-Host ""

# 2. Baixar e instalar Node.js 20 LTS (versão mais recente da branch 20.x)
Write-Host "Baixando Node.js 20 LTS (64-bit)..." -ForegroundColor Yellow

$node20url = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi"   # versão mais recente da 20.x em dez/2025
$installer = "$env:TEMP\node-v20.msi"

Invoke-WebRequest -Uri $node20url -OutFile $installer -UseBasicParsing

Write-Host "Instalando Node.js 20 LTS..." -ForegroundColor Yellow

Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $installer, "/quiet", "/norestart" -Wait

Remove-Item $installer -Force

Write-Host "Node.js 20 LTS instalado com sucesso!" -ForegroundColor Green
Write-Host ""

# 3. Verificação final
Write-Host "Versão instalada:" -ForegroundColor Cyan
node -v
npm -v

Write-Host ""
Write-Host "Tudo pronto! Você agora está usando Node.js 20 LTS." -ForegroundColor Green
Write-Host "Pode fechar esta janela ou pressionar qualquer tecla para sair."
Read-Host
