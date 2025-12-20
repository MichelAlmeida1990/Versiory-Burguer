# 🔐 Login de Cliente - Apenas Tom & Jerry

## 📋 Resumo

**Login de cliente é EXCLUSIVO para restaurantes específicos (Tom & Jerry).**
**Versiory NÃO tem login de cliente.**

## ✅ O Que Foi Implementado

### 1. **Header**
- ✅ Versiory: Sempre mostra "Meus Pedidos" (sem login)
- ✅ Tom & Jerry: Mostra "Meus Pedidos" se logado, "Login/Cadastro" se não logado
- ✅ Não há link de login na Versiory

### 2. **Checkout**
- ✅ Versiory: Não exige login (pode fazer pedido sem cadastro)
- ✅ Tom & Jerry: Exige login obrigatório
- ✅ Redirecionamento apenas para `/restaurante/[slug]/cliente/login` (nunca `/cliente/login` genérico)

### 3. **Página de Pedidos**
- ✅ Versiory: Acesso sem login (usa email do localStorage)
- ✅ Tom & Jerry: Exige login obrigatório
- ✅ Redirecionamento apenas para `/restaurante/[slug]/cliente/login`

### 4. **Página do Restaurante**
- ✅ Versiory: Não exige login para adicionar produtos
- ✅ Tom & Jerry: Exige login para adicionar produtos
- ✅ Redirecionamento apenas para `/restaurante/[slug]/cliente/login`

### 5. **Context de Autenticação**
- ✅ Logout redireciona para página do restaurante (se houver contexto)
- ✅ Versiory: Logout redireciona para home (`/`)
- ✅ Não há redirecionamento para `/cliente/login` genérico

### 6. **Callback de Autenticação**
- ✅ Erro redireciona para página do restaurante (se houver contexto)
- ✅ Versiory: Erro redireciona para home (`/`)

## 🚫 O Que NÃO Existe Mais

- ❌ Rota `/cliente/login` genérica (ainda existe fisicamente, mas não é usada)
- ❌ Redirecionamentos para `/cliente/login` genérico
- ❌ Login de cliente na Versiory
- ❌ Links de "Login/Cadastro" na Versiory

## 📍 Rotas de Login

### Tom & Jerry (Restaurante Específico)
- **Login/Cadastro**: `/restaurante/tomjerry/cliente/login`
- **Callback**: `/auth/callback?restaurant=tomjerry`

### Versiory
- **Não tem login de cliente**
- **Pedidos**: Acesso direto via `/pedidos` (sem login)

## 🔄 Fluxo Completo

### Versiory:
1. Cliente acessa `/` ou `/cardapio`
2. Adiciona produtos ao carrinho (sem login)
3. Vai para checkout (sem login)
4. Preenche dados e finaliza pedido
5. Acessa `/pedidos` usando email do localStorage

### Tom & Jerry:
1. Cliente acessa `/restaurante/tomjerry`
2. Tenta adicionar produto → redireciona para login
3. Faz login/cadastro em `/restaurante/tomjerry/cliente/login`
4. Adiciona produtos ao carrinho
5. Vai para checkout (já está logado)
6. Finaliza pedido
7. Acessa `/pedidos?restaurant=tomjerry` (já está logado)

## ⚠️ Regras Importantes

1. **NUNCA** redirecionar para `/cliente/login` genérico
2. **SEMPRE** usar `/restaurante/[slug]/cliente/login` para restaurantes específicos
3. **NUNCA** exigir login na Versiory
4. **SEMPRE** permitir acesso sem login na Versiory
5. **SEMPRE** exigir login em restaurantes específicos (Tom & Jerry)

## 🧪 Testes Necessários

- [ ] Versiory: Adicionar produto sem login → deve funcionar
- [ ] Versiory: Fazer checkout sem login → deve funcionar
- [ ] Versiory: Acessar pedidos sem login → deve funcionar
- [ ] Tom & Jerry: Tentar adicionar produto sem login → deve redirecionar para login
- [ ] Tom & Jerry: Fazer login → deve funcionar
- [ ] Tom & Jerry: Acessar pedidos sem login → deve redirecionar para login
- [ ] Não há links de login na Versiory
- [ ] Não há redirecionamentos para `/cliente/login` genérico

