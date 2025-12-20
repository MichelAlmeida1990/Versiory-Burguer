# 💳 Sistema de Pagamento

Sistema preparado para receber pagamentos via link de pagamento (cartão) e PIX com QR Code.

## 📋 Estrutura Criada

### 1. Tabelas no Banco de Dados

#### `payment_configurations`
Armazena as configurações de pagamento por restaurante:
- `gateway`: Gateway utilizado (mercadopago, pagarme, asaas, etc)
- `api_key`: Chave API do gateway
- `api_secret`: Secret do gateway
- `public_key`: Chave pública
- `pix_key`: Chave PIX do restaurante
- `pix_key_type`: Tipo da chave (CPF, CNPJ, EMAIL, RANDOM)
- `webhook_url`: URL para receber notificações
- `enabled`: Se o pagamento online está habilitado

#### `payment_transactions`
Armazena as transações de pagamento:
- `order_id`: ID do pedido
- `amount`: Valor do pagamento
- `payment_method`: Método (pix, card, cash)
- `payment_type`: Tipo (link, qrcode)
- `gateway_transaction_id`: ID da transação no gateway
- `payment_link`: Link para pagamento
- `qr_code`: QR Code em base64 ou URL
- `qr_code_pix`: Código PIX copia e cola (EMV)
- `status`: Status (pending, paid, failed, cancelled, expired)

### 2. API Routes

#### `POST /api/payments/generate`
Gera link de pagamento e QR Code PIX para um pedido.

**Request:**
```json
{
  "orderId": "uuid",
  "amount": 100.00,
  "paymentMethod": "pix" | "card",
  "restaurantId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "payment_link": "https://...",
    "qr_code": "data:image/png;base64,...",
    "qr_code_pix": "00020126...",
    "expires_at": "2024-...",
    "status": "pending"
  }
}
```

### 3. Componentes

#### `PaymentModal`
Modal que exibe:
- QR Code PIX (para pagamento PIX)
- Código PIX copia e cola
- Link de pagamento (para cartão)

## ⚙️ Como Configurar

### Passo 1: Executar Script SQL

Execute o script SQL para criar as tabelas:

```sql
supabase/schema/PAGAMENTO.sql
```

### Passo 2: Configurar Gateway de Pagamento

No Supabase, insira as configurações do restaurante:

```sql
INSERT INTO payment_configurations (
  restaurant_id,
  gateway,
  api_key,
  api_secret,
  public_key,
  pix_key,
  pix_key_type,
  enabled
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com'),
  'mercadopago', -- ou outro gateway
  'SUA_API_KEY',
  'SUA_API_SECRET',
  'SUA_PUBLIC_KEY',
  'SUA_CHAVE_PIX',
  'CPF', -- ou CNPJ, EMAIL, RANDOM
  true
);
```

### Passo 3: Integrar API do Gateway

Edite `app/api/payments/generate/route.ts` e implemente a integração com o gateway escolhido.

**Exemplo para MercadoPago:**

```typescript
if (paymentConfig.gateway === 'mercadopago') {
  const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paymentConfig.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transaction_amount: amount,
      payment_method_id: paymentMethod === 'pix' ? 'pix' : null,
      payer: {
        email: 'cliente@example.com'
      },
      // ... outros campos
    })
  });
  
  const mpData = await mpResponse.json();
  paymentLink = mpData.point_of_interaction?.transaction_data?.ticket_url;
  qrCode = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
  gatewayTransactionId = mpData.id.toString();
}
```

## 🎯 Fluxo de Pagamento

1. **Cliente finaliza pedido** no checkout
2. **Sistema cria pedido** no banco de dados
3. **Se método for PIX ou Cartão:**
   - Modal de pagamento é exibido
   - Sistema chama `/api/payments/generate`
   - QR Code ou Link é gerado
   - Cliente paga
4. **Webhook do gateway** notifica sobre pagamento
5. **Sistema atualiza** status do pedido

## 📝 Próximos Passos

1. Implementar webhook para receber notificações do gateway
2. Atualizar status do pedido automaticamente quando pagamento for confirmado
3. Adicionar página de status de pagamento
4. Implementar polling para verificar status (fallback)

## 🔒 Segurança

- **Nunca** exponha chaves API no frontend
- Use variáveis de ambiente para credenciais
- Valide webhooks assinados pelo gateway
- Use HTTPS em produção
- Criptografe dados sensíveis no banco




