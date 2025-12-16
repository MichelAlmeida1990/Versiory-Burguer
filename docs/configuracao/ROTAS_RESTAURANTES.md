# 🌐 Rotas Personalizadas por Restaurante

Sistema permite que cada restaurante tenha sua própria URL amigável.

## 📋 Configuração

### 1. Permitir leitura pública das configurações

**IMPORTANTE:** Execute este script PRIMEIRO para permitir que as páginas públicas acessem as configurações:

```sql
supabase/policies/RESTAURANT_SETTINGS_PUBLIC_READ.sql
```

### 2. Adicionar campo slug na tabela

Execute o script SQL:
```sql
supabase/migrations/ADICIONAR_SLUG_RESTAURANT_SETTINGS.sql
```

### 3. Definir slug para cada restaurante

Execute scripts específicos ou defina manualmente:

```sql
-- Para Tom & Jerry
UPDATE restaurant_settings
SET slug = 'tomjerry'
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- Para Batata Maria
UPDATE restaurant_settings
SET slug = 'batatamaria'
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com');
```

Ou execute:
```sql
supabase/migrations/DEFINIR_SLUG_TOM_JERRY.sql
```

**Ordem de execução:**
1. `RESTAURANT_SETTINGS_PUBLIC_READ.sql` (permitir leitura pública)
2. `ADICIONAR_SLUG_RESTAURANT_SETTINGS.sql` (adicionar campo slug)
3. `DEFINIR_SLUG_TOM_JERRY.sql` (definir slugs específicos)

## 🚀 Como Usar

### URL do Cliente

Cada restaurante terá sua URL própria:
- **Tom & Jerry**: `http://localhost:3000/restaurante/tomjerry`
- **Batata Maria**: `http://localhost:3000/restaurante/batatamaria`

### Acesso ao Admin

Na página do restaurante, o cliente pode acessar o admin através do link "Admin" no header, que redireciona para `/admin/login`.

### Funcionalidades

1. **Página personalizada**: Mostra o conteúdo específico do restaurante
2. **Layout personalizado**: Logo, cores e textos configurados
3. **Cardápio específico**: Apenas produtos e categorias do restaurante
4. **Link para admin**: Disponível no header

## 📝 Exemplo de Slug

Slug recomendado: converter o nome do restaurante para minúsculas, sem espaços e caracteres especiais.

Exemplos:
- "Tom & Jerry" → `tomjerry`
- "Batata Maria" → `batatamaria`
- "Botecomario" → `botecomario`

## ⚠️ Importante

- O slug deve ser único
- Use apenas letras minúsculas, números e hífens
- Não use espaços ou caracteres especiais
- Configure o slug ANTES de divulgar a URL

