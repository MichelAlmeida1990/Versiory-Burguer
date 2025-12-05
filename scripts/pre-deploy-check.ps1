# Script de verificação pré-deploy (PowerShell)
# Verifica se o build de produção está funcionando corretamente

Write-Host "`n🔍 Verificando build de produção...`n" -ForegroundColor Cyan

# 1. Limpar cache
Write-Host "1. Limpando cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Cache limpo" -ForegroundColor Green
} else {
    Write-Host "✓ Nenhum cache encontrado" -ForegroundColor Green
}

# 2. Verificar variáveis de ambiente
Write-Host "`n2. Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Arquivo .env.local não encontrado" -ForegroundColor Red
    exit 1
}

# 3. Rodar build
Write-Host "`n3. Rodando build de produção..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build falhou!" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build concluído com sucesso" -ForegroundColor Green

# 4. Verificar tamanho do bundle
Write-Host "`n4. Verificando tamanho do bundle..." -ForegroundColor Yellow
$buildResult | Select-String -Pattern "First Load JS" | Select-Object -First 1

# 5. Verificar erros
Write-Host "`n5. Verificando erros..." -ForegroundColor Yellow
$errors = $buildResult | Select-String -Pattern "error|Error|failed|Failed" -CaseSensitive:$false
if ($errors) {
    Write-Host "✗ Encontrados erros:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
}

Write-Host "✓ Nenhum erro encontrado" -ForegroundColor Green

# 6. Resumo
Write-Host "`n✅ Verificação concluída!`n" -ForegroundColor Green
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Rode: npm run start" -ForegroundColor White
Write-Host "  2. Teste em: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Compare com: npm run dev (http://localhost:3002)" -ForegroundColor White
Write-Host "  4. Se estiver tudo ok, faça o deploy!`n" -ForegroundColor White

