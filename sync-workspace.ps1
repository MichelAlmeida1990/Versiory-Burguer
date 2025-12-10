# Script para sincronizar arquivos do servidor para o workspace (OneDrive)
# Execute este script sempre que fizer mudanças no servidor

$serverPath = "C:\Projetos\restaurante"
$workspacePath = "C:\Users\miche\OneDrive\Documentos\Restaurante"

Write-Host "=== SINCRONIZAÇÃO SERVIDOR -> WORKSPACE ===" -ForegroundColor Cyan
Write-Host ""

# Arquivos importantes para sincronizar
$filesToSync = @(
    "app\carrinho\page.tsx",
    "components\products\product-options-modal.tsx",
    "app\globals.css",
    "tailwind.config.js",
    "postcss.config.js",
    "next.config.js",
    "package.json"
)

$synced = 0
$errors = 0

foreach ($file in $filesToSync) {
    $serverFile = Join-Path $serverPath $file
    $workspaceFile = Join-Path $workspacePath $file
    
    if (Test-Path $serverFile) {
        try {
            # Criar diretório se não existir
            $workspaceDir = Split-Path $workspaceFile -Parent
            if (-not (Test-Path $workspaceDir)) {
                New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
            }
            
            # Copiar arquivo
            Copy-Item -Path $serverFile -Destination $workspaceFile -Force
            $synced++
            Write-Host "✅ $file" -ForegroundColor Green
        } catch {
            $errors++
            Write-Host "❌ Erro ao copiar $file : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Arquivo não encontrado: $serverFile" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host "✅ Sincronizados: $synced" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "❌ Erros: $errors" -ForegroundColor Red
}
Write-Host ""
Write-Host "💡 DICA: Para evitar problemas, abra o Cursor com workspace em:" -ForegroundColor Yellow
Write-Host "   $serverPath" -ForegroundColor White

