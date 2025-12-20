# Script para desativar ambiente virtual Python e evitar ativação automática

Write-Host "Desativando ambiente virtual..." -ForegroundColor Yellow

# Desativar ambiente virtual se estiver ativo
if ($env:VIRTUAL_ENV) {
    Write-Host "Ambiente virtual ativo: $env:VIRTUAL_ENV" -ForegroundColor Red
    deactivate 2>$null
    Remove-Item Env:\VIRTUAL_ENV -ErrorAction SilentlyContinue
    Remove-Item Env:\PYTHONPATH -ErrorAction SilentlyContinue
    Write-Host "✅ Ambiente virtual desativado" -ForegroundColor Green
} else {
    Write-Host "✅ Nenhum ambiente virtual ativo" -ForegroundColor Green
}

# Remover função de ativação automática se existir
if (Test-Path Function:\Activate) {
    Remove-Item Function:\Activate -ErrorAction SilentlyContinue
    Write-Host "✅ Função Activate removida" -ForegroundColor Green
}

# Limpar variáveis de ambiente relacionadas
$env:VIRTUAL_ENV = $null
$env:PYTHONPATH = $null

Write-Host ""
Write-Host "✅ Ambiente virtual desativado e limpo!" -ForegroundColor Green
Write-Host "💡 Para evitar ativação automática, feche e reabra o terminal" -ForegroundColor Cyan

