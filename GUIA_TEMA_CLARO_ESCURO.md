# Guia de Tema Claro e Escuro

## ✅ Sistema Implementado

O projeto agora suporta **tema claro** (padrão) e **tema escuro**, com alternância automática.

## 🎨 Como Funciona

### 1. ThemeProvider
- Contexto React que gerencia o tema
- Salva preferência no `localStorage`
- Aplica classe `dark` no `<html>` quando necessário
- **Tema padrão: CLARO**

### 2. Variáveis CSS
Variáveis definidas em `globals.css`:

**Tema Claro (Padrão):**
- Background: `#ffffff`
- Texto: `#1a1a1a`
- Cards: `#ffffff`
- Bordas: `#e5e7eb`

**Tema Escuro:**
- Background: `#000000`
- Texto: `#ffffff`
- Cards: `#111827`
- Bordas: `#374151`

### 3. Classes Tailwind
Use classes com prefixo `dark:` para tema escuro:

```tsx
// Background
className="bg-white dark:bg-black"
className="bg-gray-100 dark:bg-gray-800"

// Texto
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-300"

// Bordas
className="border-gray-200 dark:border-gray-700"
```

### 4. Classes Utilitárias
Classes prontas em `globals.css`:

```tsx
.bg-theme              // bg-white dark:bg-black
.bg-theme-card         // bg-white dark:bg-gray-900
.text-theme            // text-gray-900 dark:text-white
.text-theme-secondary   // text-gray-600 dark:text-gray-300
.border-theme          // border-gray-200 dark:border-gray-700
```

## 🔄 Componente ThemeToggle

Botão para alternar entre temas:

```tsx
import { ThemeToggle } from "@/components/theme/theme-toggle";

<ThemeToggle />
```

## 📝 Migração de Componentes

### Antes (Tema Escuro Fixo):
```tsx
<div className="bg-black text-white">
  <p className="text-gray-300">Texto</p>
</div>
```

### Depois (Tema Claro/Escuro):
```tsx
<div className="bg-white dark:bg-black text-gray-900 dark:text-white">
  <p className="text-gray-700 dark:text-gray-300">Texto</p>
</div>
```

## 🎯 Padrões de Cores

### Backgrounds
- **Principal**: `bg-white dark:bg-black`
- **Cards**: `bg-white dark:bg-gray-900`
- **Cards Secundários**: `bg-gray-50 dark:bg-gray-800`
- **Hover**: `hover:bg-gray-50 dark:hover:bg-gray-800`

### Textos
- **Principal**: `text-gray-900 dark:text-white`
- **Secundário**: `text-gray-600 dark:text-gray-300`
- **Muted**: `text-gray-500 dark:text-gray-400`

### Bordas
- **Padrão**: `border-gray-200 dark:border-gray-700`
- **Cards**: `border-gray-300 dark:border-gray-600`

## ✅ Componentes Atualizados

- ✅ `app/layout.tsx` - ThemeProvider adicionado
- ✅ `components/layout/header.tsx` - Tema aplicado
- ✅ `components/layout/admin-header.tsx` - Tema aplicado
- ✅ `app/cozinha/page.tsx` - Tema aplicado
- ✅ `app/globals.css` - Variáveis e classes utilitárias
- ✅ `tailwind.config.ts` - Dark mode configurado

## 📋 Componentes Pendentes de Atualização

Os seguintes componentes ainda precisam ser atualizados:

- `app/admin/login/page.tsx`
- `app/admin/page.tsx`
- `app/cardapio/page.tsx`
- `app/carrinho/page.tsx`
- `app/checkout/page.tsx`
- `app/pedidos/page.tsx`
- `components/products/product-card.tsx`
- Outros componentes que usam `bg-black`, `text-white`, etc.

## 🔧 Como Atualizar um Componente

1. Substitua `bg-black` por `bg-white dark:bg-black`
2. Substitua `text-white` por `text-gray-900 dark:text-white`
3. Substitua `bg-gray-900` por `bg-white dark:bg-gray-900`
4. Substitua `bg-gray-800` por `bg-gray-100 dark:bg-gray-800`
5. Substitua `text-gray-300` por `text-gray-700 dark:text-gray-300`
6. Substitua `border-gray-700` por `border-gray-200 dark:border-gray-700`

## 🎨 Cores Primárias (Mantidas)

As cores primárias da Versiory permanecem as mesmas:
- Azul: `#031f5f`
- Azure: `#00afee`
- Rosa: `#ca00ca`
- Marrom: `#c2af00`
- Amarelo: `#ccff00`

Essas cores funcionam bem em ambos os temas.

