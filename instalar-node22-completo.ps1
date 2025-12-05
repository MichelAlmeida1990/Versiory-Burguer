# Script completo para desinstalar Node.js 24 e instalar Node.js 22
# EXECUTE COMO ADMINISTRADOR: Clique com botão direito no PowerShell e escolha "Executar como Administrador"

Write-Host "=== Instalador Node.js 22 (Substituindo Node.js 24) ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "✗ ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Como executar:" -ForegroundColor Yellow
    Write-Host "1. Feche este terminal" -ForegroundColor White
    Write-Host "2. Clique com botão direito no PowerShell" -ForegroundColor White
    Write-Host "3. Escolha 'Executar como Administrador'" -ForegroundColor White
    Write-Host "4. Execute: cd C:\projetos\restaurante; .\instalar-node22-completo.ps1" -ForegroundColor White
    exit 1
}

Write-Host "✓ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# Verificar versão atual
$currentVersion = node --version 2>$null
if ($currentVersion) {
    Write-Host "Versão atual do Node.js: $currentVersion" -ForegroundColor Yellow
    if ($currentVersion -match "v22") {
        Write-Host "✓ Node.js 22 já está instalado!" -ForegroundColor Green
        exit 0
    }
    Write-Host "Será necessário desinstalar o Node.js 24 primeiro" -ForegroundColor Yellow
}

# Desinstalar Node.js existente
Write-Host ""
Write-Host "=== Passo 1: Desinstalando Node.js existente ===" -ForegroundColor Cyan
$uninstallKeys = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" | Where-Object { $_.DisplayName -like "*Node.js*" }
if ($uninstallKeys) {
    foreach ($key in $uninstallKeys) {
        Write-Host "Desinstalando: $($key.DisplayName)..." -ForegroundColor Yellow
        if ($key.UninstallString) {
            $uninstallPath = $key.UninstallString
            if ($uninstallPath -match 'msiexec') {
                $productCode = $key.PSChildName
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/x $productCode /quiet /norestart" -Wait -NoNewWindow
            } else {
                Start-Process -FilePath $uninstallPath -ArgumentList "/S" -Wait -NoNewWindow
            }
            Write-Host "✓ Desinstalação concluída" -ForegroundColor Green
        }
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "Nenhuma instalação do Node.js encontrada no registro" -ForegroundColor Yellow
}

# Baixar Node.js 22
Write-Host ""
Write-Host "=== Passo 2: Baixando Node.js 22.11.0 ===" -ForegroundColor Cyan
$nodeVersion = "22.11.0"
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$installerPath = "$env:TEMP\nodejs-$nodeVersion-x64.msi"

if (Test-Path $installerPath) {
    Write-Host "Arquivo já existe, usando cache..." -ForegroundColor Yellow
} else {
    Write-Host "Baixando de $nodeUrl..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✓ Download concluído" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao baixar: $_" -ForegroundColor Red
        exit 1
    }
}

# Instalar Node.js 22
Write-Host ""
Write-Host "=== Passo 3: Instalando Node.js 22.11.0 ===" -ForegroundColor Cyan
Write-Host "Aguarde, isso pode levar alguns minutos..." -ForegroundColor Yellow

try {
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-Host "✓ Instalação concluída!" -ForegroundColor Green
        
        # Atualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verificar instalação
        Start-Sleep -Seconds 2
        $nodePath = "C:\Program Files\nodejs\node.exe"
        if (Test-Path $nodePath) {
            $newVersion = & $nodePath --version
            Write-Host ""
            Write-Host "✓✓✓ Node.js instalado com sucesso: $newVersion ✓✓✓" -ForegroundColor Green
        }
        
        # Limpar arquivo temporário
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "IMPORTANTE: Reinicie o terminal/PowerShell para usar o Node.js 22" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Após reiniciar, execute:" -ForegroundColor Cyan
        Write-Host "  cd C:\projetos\restaurante" -ForegroundColor White
        Write-Host "  Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue" -ForegroundColor White
        Write-Host "  npm install" -ForegroundColor White
        Write-Host "  npm run build" -ForegroundColor White
    } else {
        Write-Host "✗ Erro na instalação. Código de saída: $($process.ExitCode)" -ForegroundColor Red
        Write-Host "Tente executar manualmente: msiexec /i `"$installerPath`"" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Erro ao instalar: $_" -ForegroundColor Red
    exit 1
}

