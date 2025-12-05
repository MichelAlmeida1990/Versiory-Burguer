#!/bin/bash

# Script de verificação pré-deploy
# Verifica se o build de produção está funcionando corretamente

echo "🔍 Verificando build de produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Limpar cache
echo -e "${YELLOW}1. Limpando cache...${NC}"
rm -rf .next
echo -e "${GREEN}✓ Cache limpo${NC}"

# 2. Verificar variáveis de ambiente
echo -e "${YELLOW}2. Verificando variáveis de ambiente...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ Arquivo .env.local não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.local encontrado${NC}"

# 3. Rodar build
echo -e "${YELLOW}3. Rodando build de produção...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build concluído com sucesso${NC}"

# 4. Verificar tamanho do bundle
echo -e "${YELLOW}4. Verificando tamanho do bundle...${NC}"
npm run build 2>&1 | grep "First Load JS" | head -1

# 5. Verificar erros
echo -e "${YELLOW}5. Verificando erros...${NC}"
ERRORS=$(npm run build 2>&1 | grep -i "error\|failed" | wc -l)
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Encontrados $ERRORS erros${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Nenhum erro encontrado${NC}"

# 6. Resumo
echo -e "\n${GREEN}✅ Verificação concluída!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "  1. Rode: npm run start"
echo "  2. Teste em: http://localhost:3000"
echo "  3. Compare com: npm run dev (http://localhost:3002)"
echo "  4. Se estiver tudo ok, faça o deploy!"

