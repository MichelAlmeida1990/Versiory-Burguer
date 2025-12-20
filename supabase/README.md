# 🗄️ Scripts SQL - Supabase

Esta pasta contém todos os scripts SQL organizados por categoria.

## 📁 Estrutura

### 📐 [schema/](schema/)
Schemas principais do banco de dados:
- `schema.sql` - Schema completo inicial
- `COMPLETO.sql` - Schema completo com comentários
- `PRODUTO_OPCOES.sql` - Tabelas de opções/adicionais
- `MULTI_TENANT.sql` - Sistema multi-tenant
- `CRIAR_TABELA_RESTAURANT_SETTINGS.sql` - Configurações por restaurante

### 🔒 [policies/](policies/)
Políticas RLS (Row Level Security):
- `POLITICAS_PRODUTOS.sql` - Políticas para produtos
- `POLITICAS_CATEGORIAS.sql` - Políticas para categorias
- `POLITICAS_PEDIDOS.sql` - Políticas para pedidos
- `STORAGE_POLICIES.sql` - Políticas para storage

### 🔄 [migrations/](migrations/)
Scripts de migração, correção e diagnóstico:
- Scripts `CORRIGIR_*.sql` - Correções de dados
- Scripts `VERIFICAR_*.sql` - Verificações e diagnósticos
- Scripts `DIAGNOSTICO_*.sql` - Diagnósticos detalhados
- Scripts `ASSOCIAR_*.sql` - Associações de dados
- Scripts `INSERIR_OPCOES_*.sql` - Inserção de opções

### 👥 [clientes/](clientes/)
Scripts específicos de clientes:
- `CRIAR_PIZZARIA_TOM_JERRY.sql` - Setup Tom & Jerry
- `IMPORTAR_CATEGORIAS_PRODUTOS_TOM_JERRY.sql` - Importação de dados
- `ADICIONAR_IMAGENS_PIXABAY_TOM_JERRY.sql` - Adição de imagens
- `ASSOCIAR_PRODUTOS_BOTECOMARIO.sql` - Setup Botecomario

### 📚 [docs/](docs/)
Documentação relacionada ao banco de dados:
- Instruções de uso
- Soluções de problemas
- Análises técnicas

## 🚀 Uso

1. **Schemas**: Execute primeiro os scripts em `schema/` para criar as tabelas
2. **Policies**: Execute os scripts em `policies/` para configurar segurança
3. **Migrations**: Use quando precisar corrigir ou migrar dados
4. **Clientes**: Execute scripts específicos para cada cliente

## ⚠️ Importante

- Sempre faça backup antes de executar scripts de migração
- Execute os scripts na ordem correta (schemas → policies → migrations)
- Teste em ambiente de desenvolvimento antes de produção




