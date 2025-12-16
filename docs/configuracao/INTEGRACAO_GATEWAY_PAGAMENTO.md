# 💳 Integração com Gateway de Pagamento - Guia Completo

## 📋 Situação Atual do Projeto

Atualmente, o projeto tem:
- ✅ Seleção de método de pagamento (PIX, Cartão, Dinheiro)
- ✅ Desconto de 5% para PIX
- ✅ Armazenamento do método de pagamento no pedido
- ❌ **NÃO processa pagamentos reais** (apenas simula)

---

## 🎯 O que é um Gateway de Pagamento?

Um **Gateway de Pagamento** é um serviço intermediário que processa pagamentos online de forma segura. Ele:
- Recebe os dados do pagamento
- Valida e processa a transação
- Retorna confirmação de pagamento
- Gerencia segurança e compliance

---

## 🏆 Principais Gateways no Brasil

### 1. **Mercado Pago** ⭐ (Recomendado para começar)
- ✅ **Vantagens:**
  - Integração simples e rápida
  - SDK oficial para JavaScript/TypeScript
  - Documentação excelente em português
  - Suporte a PIX, Cartão, Boleto
  - Checkout transparente (pode integrar no seu site)
  - Taxas competitivas
  - Ambiente de teste (sandbox) completo

- ⚠️ **Desvantagens:**
  - Taxa: ~3,99% + R$ 0,40 por transação (cartão)
  - PIX: ~1,99% por transação

- 💰 **Custos:**
  - Cartão: 3,99% + R$ 0,40
  - PIX: 1,99%
  - Boleto: 1,99%

- 🔗 **Links:**
  - [Documentação](https://www.mercadopago.com.br/developers/pt/docs)
  - [SDK JavaScript](https://github.com/mercadopago/sdk-nodejs)

---

### 2. **Asaas** ⭐ (Melhor para PIX)
- ✅ **Vantagens:**
  - Focado em PIX e Boleto
  - Taxas muito baixas para PIX
  - API REST simples
  - Webhooks confiáveis
  - Dashboard completo

- ⚠️ **Desvantagens:**
  - Menos conhecido que Mercado Pago
  - Documentação menos detalhada

- 💰 **Custos:**
  - PIX: 0,99% (uma das menores do mercado!)
  - Cartão: 3,99% + R$ 0,40
  - Boleto: R$ 2,00 fixo

- 🔗 **Links:**
  - [Documentação](https://docs.asaas.com/)
  - [API Reference](https://docs.asaas.com/reference)

---

### 3. **PagSeguro** (UOL)
- ✅ **Vantagens:**
  - Muito conhecido no Brasil
  - Suporte completo
  - Integração com vários bancos

- ⚠️ **Desvantagens:**
  - Taxas mais altas
  - Integração mais complexa
  - Documentação menos atualizada

- 💰 **Custos:**
  - Cartão: 4,99% + R$ 0,40
  - PIX: 1,99%

---

### 4. **Stripe** (Internacional)
- ✅ **Vantagens:**
  - Muito robusto e confiável
  - Excelente documentação
  - Suporte internacional

- ⚠️ **Desvantagens:**
  - Mais caro no Brasil
  - Foco em cartão (PIX limitado)
  - Documentação em inglês

---

## 🚀 Como Funciona a Integração

### **Fluxo Básico:**

```
1. Cliente finaliza pedido
   ↓
2. Sistema cria pedido no banco (status: "pending")
   ↓
3. Sistema gera cobrança no gateway
   ↓
4. Gateway retorna link/QR Code de pagamento
   ↓
5. Cliente paga (PIX/Cartão)
   ↓
6. Gateway envia webhook confirmando pagamento
   ↓
7. Sistema atualiza pedido (status: "confirmed")
   ↓
8. Restaurante recebe notificação
```

---

## 📦 O que Precisaria Implementar

### **1. Backend (API Routes)**

#### **a) Criar cobrança no gateway**
```typescript
// app/api/payments/create/route.ts
POST /api/payments/create
{
  orderId: string,
  amount: number,
  paymentMethod: "pix" | "card",
  customer: { name, email, phone }
}

// Retorna:
{
  paymentId: string,
  qrCode: string,        // Para PIX
  paymentLink: string,   // Para cartão
  expiresAt: Date
}
```

#### **b) Receber webhook do gateway**
```typescript
// app/api/payments/webhook/route.ts
POST /api/payments/webhook
// Gateway envia notificação quando pagamento é confirmado
// Atualiza status do pedido automaticamente
```

#### **c) Consultar status do pagamento**
```typescript
// app/api/payments/[id]/status/route.ts
GET /api/payments/[id]/status
// Verifica status atual do pagamento
```

---

### **2. Frontend (Checkout)**

#### **a) Exibir QR Code PIX**
```tsx
// Componente para mostrar QR Code
<QRCodePix 
  qrCode={paymentData.qrCode}
  amount={total}
  expiresAt={paymentData.expiresAt}
/>
```

#### **b) Integrar checkout de cartão**
```tsx
// Opção 1: Checkout transparente (no seu site)
<CardPaymentForm 
  onSubmit={handleCardPayment}
/>

// Opção 2: Redirecionar para gateway
<button onClick={() => window.open(paymentLink)}>
  Pagar com Cartão
</button>
```

#### **c) Polling para verificar pagamento**
```tsx
// Verificar status do pagamento a cada 5 segundos
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await checkPaymentStatus(paymentId);
    if (status === 'paid') {
      // Redirecionar para página de sucesso
    }
  }, 5000);
  
  return () => clearInterval(interval);
}, [paymentId]);
```

---

### **3. Banco de Dados**

#### **Nova tabela: `payments`**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  gateway VARCHAR(50), -- 'mercadopago', 'asaas', etc
  gateway_payment_id VARCHAR(255), -- ID no gateway
  amount DECIMAL(10,2),
  payment_method VARCHAR(20), -- 'pix', 'card', 'cash'
  status VARCHAR(20), -- 'pending', 'paid', 'failed', 'expired'
  qr_code TEXT, -- Para PIX
  payment_link TEXT, -- Para cartão
  expires_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Atualizar tabela `orders`**
```sql
-- Adicionar campos relacionados a pagamento
ALTER TABLE orders ADD COLUMN payment_id UUID REFERENCES payments(id);
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20);
```

---

## 🛠️ Exemplo de Implementação: Mercado Pago

### **1. Instalar SDK**
```bash
npm install mercadopago
```

### **2. Configurar credenciais**
```typescript
// lib/mercadopago.ts
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

export const mercadoPago = new Payment(client);
```

### **3. Criar cobrança PIX**
```typescript
// app/api/payments/create/route.ts
import { mercadoPago } from '@/lib/mercadopago';

export async function POST(request: Request) {
  const { orderId, amount, customer } = await request.json();
  
  // Criar pagamento no Mercado Pago
  const payment = await mercadoPago.create({
    body: {
      transaction_amount: amount,
      description: `Pedido #${orderId}`,
      payment_method_id: 'pix',
      payer: {
        email: customer.email,
        first_name: customer.name.split(' ')[0],
        last_name: customer.name.split(' ').slice(1).join(' '),
      }
    }
  });
  
  // Salvar no banco
  const { data: paymentRecord } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      gateway: 'mercadopago',
      gateway_payment_id: payment.id,
      amount,
      payment_method: 'pix',
      status: 'pending',
      qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    })
    .select()
    .single();
  
  return Response.json({
    paymentId: paymentRecord.id,
    qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
    expiresAt: paymentRecord.expires_at
  });
}
```

### **4. Receber webhook**
```typescript
// app/api/payments/webhook/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  // Validar assinatura do webhook (importante para segurança!)
  if (data.type === 'payment') {
    const paymentId = data.data.id;
    
    // Buscar pagamento no Mercado Pago
    const payment = await mercadoPago.get({ id: paymentId });
    
    if (payment.status === 'approved') {
      // Atualizar pagamento no banco
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date()
        })
        .eq('gateway_payment_id', paymentId);
      
      // Atualizar pedido
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', payment.metadata.order_id);
    }
  }
  
  return Response.json({ received: true });
}
```

---

## 🛠️ Exemplo de Implementação: Asaas

### **1. Criar cobrança PIX**
```typescript
// app/api/payments/create/route.ts
export async function POST(request: Request) {
  const { orderId, amount, customer } = await request.json();
  
  // Criar cobrança no Asaas
  const response = await fetch('https://api.asaas.com/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': process.env.ASAAS_API_KEY!
    },
    body: JSON.stringify({
      customer: customer.email,
      billingType: 'PIX',
      value: amount,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Pedido #${orderId}`
    })
  });
  
  const payment = await response.json();
  
  // Buscar QR Code
  const qrCodeResponse = await fetch(
    `https://api.asaas.com/v3/payments/${payment.id}/pixQrCode`,
    {
      headers: {
        'access_token': process.env.ASAAS_API_KEY!
      }
    }
  );
  
  const qrCode = await qrCodeResponse.json();
  
  // Salvar no banco
  const { data: paymentRecord } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      gateway: 'asaas',
      gateway_payment_id: payment.id,
      amount,
      payment_method: 'pix',
      status: 'pending',
      qr_code: qrCode.encodedImage,
      expires_at: new Date(payment.dueDate)
    })
    .select()
    .single();
  
  return Response.json({
    paymentId: paymentRecord.id,
    qrCode: qrCode.encodedImage,
    expiresAt: paymentRecord.expires_at
  });
}
```

---

## 📊 Comparação Rápida

| Gateway | Facilidade | Taxa PIX | Taxa Cartão | Recomendação |
|---------|-----------|----------|-------------|--------------|
| **Mercado Pago** | ⭐⭐⭐⭐⭐ | 1,99% | 3,99% + R$0,40 | ⭐⭐⭐⭐⭐ Melhor para começar |
| **Asaas** | ⭐⭐⭐⭐ | 0,99% | 3,99% + R$0,40 | ⭐⭐⭐⭐ Melhor para PIX |
| **PagSeguro** | ⭐⭐⭐ | 1,99% | 4,99% + R$0,40 | ⭐⭐⭐ |
| **Stripe** | ⭐⭐⭐⭐ | Limitado | 3,99% | ⭐⭐⭐ |

---

## 🎯 Recomendação para Seu Projeto

### **Para começar: Mercado Pago**
- ✅ Integração mais simples
- ✅ Documentação excelente
- ✅ SDK oficial
- ✅ Ambiente de teste completo
- ✅ Suporte em português

### **Para otimizar custos: Asaas**
- ✅ Taxa PIX mais baixa (0,99%)
- ✅ Ideal se a maioria dos pagamentos for PIX
- ✅ API REST simples

---

## 📝 Próximos Passos (Se quiser implementar)

1. **Escolher gateway** (recomendo Mercado Pago para começar)
2. **Criar conta** no gateway (sandbox/teste primeiro)
3. **Obter credenciais** (Access Token, API Key)
4. **Criar tabela `payments`** no Supabase
5. **Implementar API de criação de pagamento**
6. **Implementar webhook**
7. **Atualizar frontend** para exibir QR Code
8. **Testar em ambiente sandbox**
9. **Fazer homologação** com gateway
10. **Ativar produção**

---

## ⚠️ Considerações Importantes

### **Segurança:**
- ✅ Nunca exponha credenciais no frontend
- ✅ Valide assinatura dos webhooks
- ✅ Use HTTPS sempre
- ✅ Armazene credenciais em variáveis de ambiente

### **Compliance:**
- ✅ LGPD (Lei Geral de Proteção de Dados)
- ✅ PCI DSS (para cartão)
- ✅ Termos de uso do gateway

### **Custos:**
- ✅ Taxas do gateway
- ✅ Taxa de transação
- ✅ Taxa de antecipação (se houver)

---

## 🔗 Links Úteis

- [Mercado Pago - Documentação](https://www.mercadopago.com.br/developers/pt/docs)
- [Asaas - Documentação](https://docs.asaas.com/)
- [PagSeguro - Documentação](https://dev.pagseguro.uol.com.br/)
- [Stripe - Documentação](https://stripe.com/docs)

---

**Quer que eu implemente alguma dessas integrações?** 🚀

