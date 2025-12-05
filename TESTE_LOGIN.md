# Como Acessar a Página de Login

## Caminho da Página de Login

A página de login está localizada em:

**URL:** `http://localhost:3000/admin/login`

**Arquivo:** `app/admin/login/page.tsx`

## Como Testar

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse no navegador:
   ```
   http://localhost:3000/admin/login
   ```

3. Ou tente acessar qualquer rota admin (será redirecionado automaticamente):
   ```
   http://localhost:3000/admin
   ```

## Estrutura de Rotas

- `/admin/login` - Página de login (pública)
- `/admin` - Dashboard (protegido, requer login)
- `/admin/products/*` - Produtos (protegido)
- `/admin/orders` - Pedidos (protegido)
- `/admin/categories/*` - Categorias (protegido)

## Se não estiver aparecendo

1. Verifique se o servidor está rodando
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se há erros no console do navegador
4. Verifique se há erros no terminal onde o servidor está rodando

