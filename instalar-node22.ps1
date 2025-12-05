# Script para instalar Node.js 22 automaticamente
# Execute como Administrador: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser (se necessário)

Write-Host "=== Instalando Node.js 22.11.0 ===" -ForegroundColor Cyan
Write-Host ""

$nodeVersion = "22.11.0"
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$installerPath = "$env:TEMP\nodejs-$nodeVersion-x64.msi"

# Verificar se já está instalado
$currentVersion = node --version 2>$null
if ($currentVersion -and $currentVersion -match "v22") {
    Write-Host "✓ Node.js 22 já está instalado: $currentVersion" -ForegroundColor Green
    exit 0
}

Write-Host "Baixando Node.js $nodeVersion..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✓ Download concluído" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao baixar: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando Node.js $nodeVersion..." -ForegroundColor Yellow
Write-Host "Aguarde, isso pode levar alguns minutos..." -ForegroundColor Yellow

try {
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✓ Instalação concluída!" -ForegroundColor Green
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
        exit 1
    }
} catch {
    Write-Host "✗ Erro ao instalar: $_" -ForegroundColor Red
    exit 1
} finally {
    # Limpar arquivo temporário
    if (Test-Path $installerPath) {
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    }
}



