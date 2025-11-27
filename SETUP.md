# 🚀 Guia de Configuração - Restaurante Demonstração

## Passo a Passo para Configurar o Projeto

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase (Gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o script `supabase/schema.sql`
4. Copie a URL do projeto e a chave anônima (anon key)
5. Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Organizar Imagens

As imagens já foram organizadas automaticamente pelo script. Elas estão em:
- `public/images/produtos/` - Imagens dos produtos
- `public/images/categorias/` - Imagens das categorias
- `public/images/banners/` - Banners promocionais
- `public/images/logos/` - Logos (adicione aqui se necessário)

**Dica**: Renomeie as imagens para nomes mais descritivos conforme necessário.

### 4. Inserir Dados de Exemplo

No Supabase, vá em **Table Editor** e adicione:

#### Categorias:
- Entradas
- Pratos Principais
- Bebidas
- Sobremesas
- Combos

#### Produtos:
Adicione produtos com:
- Nome
- Descrição
- Preço
- Categoria
- URL da imagem (ex: `/images/produtos/nome-da-imagem.jpg`)

### 5. Iniciar o Servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Páginas Disponíveis

- `/` - Home
- `/cardapio` - Cardápio completo
- `/carrinho` - Carrinho de compras
- `/checkout` - Finalização do pedido
- `/pedidos` - Lista de pedidos
- `/pedidos/[id]` - Detalhes do pedido
- `/admin` - Painel administrativo
- `/cozinha` - Tela da cozinha (KDS)

## 🎨 Personalização

### Cores
As cores estão definidas em `tailwind.config.ts`. Você pode personalizar:
- `primary-blue`: #031f5f
- `primary-azure`: #00afee
- `primary-pink`: #ca00ca
- `primary-brown`: #c2af00
- `primary-yellow`: #ccff00 (botões)

### Logo
Adicione seu logo em `public/images/logos/` e atualize o componente `Header`.

## 🔧 Funcionalidades Implementadas

✅ Sistema completo de pedidos
✅ Carrinho persistente
✅ Painel administrativo
✅ Tela de cozinha em tempo real
✅ Acompanhamento de pedidos
✅ Cupons de desconto
✅ Múltiplos métodos de pagamento
✅ Taxa de entrega

## 📝 Próximos Passos (Opcional)

- [ ] Configurar autenticação real (WhatsApp/Google)
- [ ] Integrar gateway de pagamento (Mercado Pago, Stripe)
- [ ] Adicionar notificações push
- [ ] Implementar QR Code de mesa
- [ ] Criar PWA instalável
- [ ] Adicionar sistema de avaliações

## 🆘 Problemas Comuns

### Erro ao conectar com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se de que o projeto Supabase está ativo
- Verifique se executou o schema.sql

### Imagens não aparecem
- Verifique se os caminhos estão corretos
- Certifique-se de que as imagens estão em `public/images/`
- Use caminhos relativos começando com `/images/`

### Pedidos não aparecem
- Verifique se a tabela `orders` foi criada
- Confirme que os dados estão sendo inseridos corretamente
- Verifique os logs do console do navegador

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Next.js e Supabase.

