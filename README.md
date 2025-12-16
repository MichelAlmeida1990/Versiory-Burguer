# 🍽️ Versiory Delivery - Sistema Completo de Pedidos Online

Sistema completo de cardápio digital e gestão de pedidos para restaurantes, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## ✨ Funcionalidades

### 👥 Cliente (Web/PWA)
- ✅ Home com banner e categorias
- ✅ Cardápio digital com fotos, descrição e preços
- ✅ Carrinho persistente (localStorage + sincronizado)
- ✅ Sistema de checkout completo
- ✅ Acompanhamento de pedidos em tempo real
- ✅ Cupons de desconto
- ✅ Taxa de entrega por bairro
- ✅ Múltiplos métodos de pagamento (PIX, Cartão, Dinheiro)

### 🛠️ Painel Admin
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de produtos e categorias
- ✅ Gerenciamento de pedidos
- ✅ Controle de status dos pedidos
- ✅ Ativação/desativação de produtos

### 👨‍🍳 Cozinha (KDS)
- ✅ Tela de cozinha em tempo real
- ✅ Notificações visuais de novos pedidos
- ✅ Controle de status de preparo
- ✅ Visualização de observações dos pedidos

## 🚀 Tecnologias

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Notificações**: React Hot Toast
- **Ícones**: Lucide React

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd Restaurante
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto e adicione:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Configure o banco de dados no Supabase:

Execute os scripts em `supabase/schema/` no SQL Editor do Supabase (veja [supabase/schema/README.md](supabase/schema/README.md) para ordem de execução).

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

- `categories` - Categorias de produtos
- `products` - Produtos do cardápio
- `orders` - Pedidos
- `order_items` - Itens dos pedidos

Veja os scripts em `supabase/schema/` para o schema completo e `supabase/README.md` para documentação dos scripts SQL.

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── admin/             # Painel administrativo
│   ├── cardapio/          # Página do cardápio
│   ├── carrinho/          # Carrinho de compras
│   ├── checkout/          # Finalização de pedido
│   ├── cozinha/           # Tela da cozinha
│   └── pedidos/           # Acompanhamento de pedidos
├── components/            # Componentes React
│   ├── cart/              # Componentes do carrinho
│   ├── layout/            # Componentes de layout
│   └── ui/                # Componentes UI reutilizáveis
├── lib/                   # Utilitários e configurações
├── store/                 # Zustand stores
├── public/                # Arquivos estáticos
│   └── images/            # Imagens organizadas
│       ├── produtos/      # Imagens de produtos
│       ├── categorias/    # Imagens de categorias
│       ├── banners/       # Banners promocionais
│       └── logos/         # Logos e marca
├── supabase/             # Scripts SQL do banco de dados
│   ├── schema/           # Schemas principais
│   ├── policies/         # Políticas RLS
│   ├── migrations/       # Scripts de migração
│   ├── clientes/         # Scripts por cliente
│   └── docs/             # Documentação do banco
└── docs/                 # Documentação do projeto
    ├── guia/             # Guias e tutoriais
    ├── configuracao/     # Configurações
    ├── solucoes/         # Soluções de problemas
    ├── analises/         # Análises técnicas
    └── clientes/         # Docs específicas de clientes
```

## 🎨 Cores do Tema

- **Azul**: `#031f5f`
- **Azure Vívido**: `#00afee`
- **Rosa Neon**: `#ca00ca`
- **Marrom**: `#c2af00`
- **Verde Amarelado**: `#ccff00` (botões)
- **Fundo**: `#000000`

## 📚 Documentação

A documentação completa está organizada em `docs/`:

- **[Guia](docs/guia/)** - Tutoriais e guias passo a passo
- **[Configuração](docs/configuracao/)** - Configurações do sistema
- **[Soluções](docs/solucoes/)** - Soluções para problemas comuns
- **[Análises](docs/analises/)** - Análises técnicas
- **[Clientes](docs/clientes/)** - Documentação específica de clientes

Veja [docs/README.md](docs/README.md) para mais informações.

## 📝 Próximos Passos

- [ ] Implementar autenticação completa (WhatsApp OTP / Google)
- [ ] Integração com gateway de pagamento
- [ ] Sistema de avaliação de pedidos
- [ ] QR Code de mesa
- [ ] App mobile (PWA)
- [ ] Notificações push
- [ ] Programa de fidelidade avançado

## 📄 Licença

Este projeto é para demonstração e portfólio.

## 👤 Autor

Desenvolvido para demonstração de habilidades em desenvolvimento full-stack.

