# 📐 Schemas do Banco de Dados

Schemas principais do banco de dados.

## Ordem de Execução

Execute os scripts nesta ordem:

1. `schema.sql` ou `COMPLETO.sql` - Schema base
2. `MULTI_TENANT.sql` - Sistema multi-tenant (adiciona restaurant_id)
3. `PRODUTO_OPCOES.sql` - Sistema de opções/adicionais
4. `ORDER_STATUS_HISTORY.sql` - Histórico de status
5. `CRIAR_TABELA_RESTAURANT_SETTINGS.sql` - Configurações por restaurante

## Descrição dos Arquivos

- **schema.sql**: Schema inicial básico
- **COMPLETO.sql**: Schema completo com comentários detalhados
- **COMPLETO_SEM_COMENTARIOS.sql**: Versão sem comentários
- **MULTI_TENANT.sql**: Adiciona sistema multi-tenant (restaurant_id)
- **PRODUTO_OPCOES.sql**: Cria tabelas para opções/adicionais de produtos
- **PRODUTO_OPCOES_SEM_COMENTARIOS.sql**: Versão sem comentários
- **ORDER_STATUS_HISTORY.sql**: Tabela para histórico de status de pedidos
- **CRIAR_TABELA_RESTAURANT_SETTINGS.sql**: Tabela para configurações personalizadas por restaurante

