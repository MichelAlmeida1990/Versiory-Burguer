# 💳 Implementação de TEF (Transferência Eletrônica de Fundos) + Nota Fiscal

## 📋 O que é TEF?

**TEF (Transferência Eletrônica de Fundos)** é um sistema de pagamento eletrônico usado no Brasil que permite a comunicação direta entre o sistema de vendas e as operadoras de cartão (bandeiras). O TEF elimina a necessidade de digitar valores manualmente na maquininha, pois o valor é enviado automaticamente do sistema para o pinpad/maquininha.

## 🎯 Objetivo da Implementação

**Caso de Uso Principal**: Quando o cliente faz um pedido online, o sistema deve gerar automaticamente a **Nota Fiscal Eletrônica (NF-e)** na maquininha TEF, mesmo que o pagamento já tenha sido feito online (PIX, cartão online) ou será feito presencialmente.

### Fluxo Desejado

1. **Cliente faz pedido online** → escolhe produtos, endereço, método de pagamento
2. **Sistema cria pedido** no banco de dados
3. **Sistema gera Nota Fiscal** automaticamente
4. **Nota Fiscal é enviada para maquininha TEF** (via integração)
5. **Maquininha imprime/armazena nota fiscal** automaticamente
6. **Se pagamento for presencial**: Cliente paga na maquininha
7. **Se pagamento for online**: Nota já está registrada na maquininha

## ✅ É Possível Implementar TEF + NF-e no Sistema?

**SIM, é totalmente possível**, mas requer integração com:
1. **Sistema TEF**: Para comunicação com maquininha
2. **Emissor de NF-e**: Para gerar notas fiscais eletrônicas
3. **Integração entre ambos**: Para enviar NF-e para maquininha via TEF

### Vantagens da Implementação

1. **Segurança nas transações**: Reduz risco de fraudes ao eliminar digitação manual de valores
2. **Agilidade no atendimento**: Acelera o processo de pagamento
3. **Controle financeiro centralizado**: Registra automaticamente todas as transações
4. **Redução de erros**: Minimiza erros humanos durante o pagamento
5. **Melhor experiência do cliente**: Atendimento mais rápido e seguro

### Desafios e Considerações

1. **Hardware necessário**: Requer maquininha/pinpad compatível com TEF
2. **Integração física**: Necessário conectar o sistema com o dispositivo físico
3. **Ambiente de execução**: TEF geralmente funciona melhor em aplicações desktop ou com acesso direto ao hardware
4. **Conformidade legal**: Alguns estados exigem integração entre pagamento e nota fiscal

## 🏗️ Arquitetura Atual do Sistema

### Sistema de Pagamento Atual

O sistema atual suporta:
- **PIX**: QR Code e código copia e cola
- **Cartão de Crédito/Débito**: Link de pagamento online
- **Dinheiro na Entrega**: Pagamento presencial

**Estrutura:**
- Tabela `payment_configurations`: Configurações por restaurante
- Tabela `payment_transactions`: Transações de pagamento
- API Route `/api/payments/generate`: Gera pagamentos online
- Componente `PaymentModal`: Exibe QR Code e links

## 🔧 Como Implementar TEF

### Opção 1: TEF para Delivery/Retirada (Presencial)

**Cenário**: Cliente faz pedido online, mas paga na entrega ou retirada usando maquininha TEF.

**Fluxo:**
1. Cliente faz pedido online → escolhe "Cartão na Entrega"
2. Pedido é criado com status "pending_payment"
3. Na entrega/retirada, entregador/atendente:
   - Abre o pedido no sistema (app mobile ou tablet)
   - Clica em "Pagar com TEF"
   - Sistema envia valor para maquininha via TEF
   - Cliente insere cartão na maquininha
   - Transação é processada
   - Sistema atualiza status do pedido automaticamente

**Tecnologias necessárias:**
- SDK TEF (Sitef, Elgin, Connect TEF, etc.)
- Maquininha compatível (Ingenico, Gertec, etc.)
- App mobile ou tablet para entregador/atendente

### Opção 2: TEF Integrado no Checkout Online

**Cenário**: Cliente paga online usando TEF através de dispositivo conectado.

**Fluxo:**
1. Cliente finaliza pedido no checkout
2. Escolhe "Cartão via TEF"
3. Sistema solicita conexão com maquininha
4. Cliente conecta maquininha (via USB, Bluetooth, ou WiFi)
5. Sistema envia valor para maquininha
6. Cliente insere cartão
7. Transação é processada
8. Status atualizado automaticamente

**Limitações:**
- Requer que o cliente tenha maquininha conectada (não é comum)
- Mais complexo para implementar
- Melhor para ambientes controlados (balcão do restaurante)

### Opção 3: TEF Híbrido (Recomendado)

**Cenário**: Sistema oferece múltiplas opções de pagamento, incluindo TEF para pagamentos presenciais.

**Fluxo:**
- **Online**: PIX, Cartão (link), Dinheiro na Entrega
- **Presencial (Retirada)**: TEF, Dinheiro, PIX
- **Presencial (Entrega)**: TEF, Dinheiro, PIX

## 🛠️ Tecnologias e SDKs Disponíveis

### 1. **Emissores de NF-e (Nota Fiscal Eletrônica)**

#### **Focus NFe**
- **Tipo**: API REST para emissão de NF-e
- **Documentação**: https://focusnfe.com.br
- **Custo**: Planos variados (consulte)
- **Uso**: Web, qualquer plataforma
- **Vantagem**: API REST simples
- **Integração**: Envia XML da NF-e para maquininha via TEF

#### **Bling**
- **Tipo**: ERP com emissão de NF-e
- **Documentação**: https://developers.bling.com.br
- **Custo**: Planos variados
- **Uso**: Web, API REST
- **Vantagem**: Sistema completo (ERP + NF-e)

#### **NFe.io**
- **Tipo**: API para emissão de NF-e
- **Documentação**: https://nfe.io
- **Custo**: Consulte
- **Uso**: Web, API REST

### 2. **SDKs TEF (Para Enviar NF-e para Maquininha)**

#### **Sitef (Software Express)**
- **Tipo**: SDK TEF padrão do mercado
- **Compatibilidade**: Maquininhas Ingenico, Gertec, etc.
- **Documentação**: https://www.softwareexpress.com.br
- **Custo**: Geralmente pago (licenciamento)
- **Uso**: Desktop, aplicações Windows/Linux
- **Funcionalidade**: Permite enviar NF-e para maquininha via TEF

#### **Elgin TEF**
- **Tipo**: SDK próprio da Elgin
- **Compatibilidade**: Maquininhas Elgin
- **Documentação**: Fornecida pela Elgin
- **Custo**: Depende do contrato
- **Uso**: Desktop, aplicações Windows

#### **Connect TEF**
- **Tipo**: Solução de integração TEF
- **Compatibilidade**: Compatível com sistemas que já usam TEF padrão
- **Documentação**: https://www.connecttef.com.br
- **Custo**: Verificar com fornecedor
- **Uso**: Desktop, aplicações Windows/Linux

#### **TEF API (Alguns fornecedores)**
- **Tipo**: API REST para TEF
- **Compatibilidade**: Depende do fornecedor
- **Uso**: Web, mobile, qualquer plataforma
- **Vantagem**: Não requer instalação de SDK local
- **Funcionalidade**: Permite enviar NF-e via API REST

## 📐 Arquitetura Proposta para Implementação

### Estrutura de Banco de Dados

```sql
-- Adicionar campos à tabela payment_configurations
ALTER TABLE payment_configurations ADD COLUMN IF NOT EXISTS tef_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE payment_configurations ADD COLUMN IF NOT EXISTS tef_provider VARCHAR(50); -- 'sitef', 'elgin', 'connect_tef', etc.
ALTER TABLE payment_configurations ADD COLUMN IF NOT EXISTS tef_config JSONB; -- Configurações específicas do TEF

-- Tabela para Notas Fiscais Eletrônicas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da NF-e
  nfe_key VARCHAR(44) UNIQUE, -- Chave de acesso da NF-e (44 caracteres)
  nfe_number VARCHAR(20), -- Número da NF-e
  nfe_series VARCHAR(5), -- Série da NF-e
  nfe_xml TEXT, -- XML completo da NF-e
  nfe_pdf_url TEXT, -- URL do PDF da NF-e
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, issued, cancelled, error
  issue_date TIMESTAMP WITH TIME ZONE,
  
  -- Integração TEF
  tef_sent BOOLEAN DEFAULT FALSE, -- Se foi enviada para maquininha TEF
  tef_sent_at TIMESTAMP WITH TIME ZONE,
  tef_response JSONB, -- Resposta da maquininha ao receber NF-e
  
  -- Metadata
  metadata JSONB DEFAULT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_id ON invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_nfe_key ON invoices(nfe_key);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Adicionar campo à tabela payment_transactions
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS tef_transaction_id VARCHAR(255);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS tef_response JSONB; -- Resposta completa do TEF
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS payment_location VARCHAR(50); -- 'online', 'delivery', 'pickup'
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id); -- Relação com nota fiscal

-- Adicionar campo invoice_id na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);
```

### API Routes Necessárias

#### 1. `POST /api/invoices/generate`
Gera Nota Fiscal Eletrônica para um pedido e envia para maquininha TEF.

**Request:**
```json
{
  "orderId": "uuid",
  "restaurantId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "uuid",
    "nfe_key": "35200112345678901234567890123456789012345678",
    "nfe_number": "123456",
    "nfe_series": "1",
    "status": "issued",
    "pdf_url": "https://...",
    "tef_sent": true,
    "tef_sent_at": "2024-01-01T12:00:00Z"
  }
}
```

**Fluxo Interno:**
1. Busca dados do pedido
2. Chama API do emissor de NF-e (Focus NFe, Bling, etc.)
3. Gera XML da NF-e
4. Envia NF-e para maquininha via TEF
5. Salva no banco de dados

#### 2. `POST /api/payments/tef/send-invoice`
Envia nota fiscal já gerada para maquininha TEF.

**Request:**
```json
{
  "invoiceId": "uuid",
  "deviceInfo": {
    "type": "pinpad",
    "model": "ingenico_iwl250",
    "connection": "usb" | "bluetooth" | "wifi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nota fiscal enviada para maquininha com sucesso",
  "tef_response": {
    "status": "received",
    "device_id": "device_123"
  }
}
```

#### 3. `POST /api/payments/tef/initiate`
Inicia transação TEF para um pedido (se pagamento for presencial).

**Request:**
```json
{
  "orderId": "uuid",
  "amount": 100.00,
  "restaurantId": "uuid",
  "paymentLocation": "pickup" | "delivery",
  "deviceInfo": {
    "type": "pinpad",
    "model": "ingenico_iwl250",
    "connection": "usb" | "bluetooth" | "wifi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "uuid",
  "status": "waiting_card",
  "message": "Aguardando inserção do cartão na maquininha",
  "invoice": {
    "nfe_key": "35200112345678901234567890123456789012345678",
    "already_sent": true
  }
}
```

#### 4. `GET /api/invoices/:orderId`
Busca nota fiscal de um pedido.

**Response:**
```json
{
  "invoice": {
    "id": "uuid",
    "nfe_key": "35200112345678901234567890123456789012345678",
    "nfe_number": "123456",
    "status": "issued",
    "pdf_url": "https://...",
    "tef_sent": true
  }
}
```

#### 5. `GET /api/payments/tef/status/:transactionId`
Verifica status da transação TEF.

**Response:**
```json
{
  "status": "approved" | "declined" | "waiting_card" | "processing",
  "transactionId": "uuid",
  "amount": 100.00,
  "cardInfo": {
    "last4": "1234",
    "brand": "VISA",
    "holder": "NOME DO PORTADOR"
  },
  "receipt": {
    "merchant": "base64_receipt",
    "customer": "base64_receipt"
  },
  "invoice": {
    "nfe_key": "35200112345678901234567890123456789012345678",
    "printed": true
  }
}
```

### Componentes Frontend

#### 1. `TEFPaymentModal`
Modal para pagamento via TEF (similar ao `PaymentModal`).

**Funcionalidades:**
- Exibe status da transação em tempo real
- Mostra instruções para o cliente/atendente
- Exibe comprovante após aprovação
- Permite cancelamento se necessário

#### 2. `TEFDeviceConnector`
Componente para conectar e configurar maquininha TEF.

**Funcionalidades:**
- Detectar maquininhas disponíveis
- Conectar via USB/Bluetooth/WiFi
- Testar conexão
- Configurar parâmetros

### Serviço Backend

#### `lib/tef/tef-service.ts`
Serviço para comunicação com SDK TEF.

**Métodos:**
- `initiateTransaction()`: Inicia transação
- `checkStatus()`: Verifica status
- `cancelTransaction()`: Cancela transação
- `getReceipt()`: Obtém comprovante

## 🔄 Fluxo de Implementação Recomendado

### Fluxo Principal: Pedido Online → NF-e Automática

#### **Cenário 1: Pagamento Online (PIX/Cartão Online) + NF-e na Maquininha**

1. Cliente faz pedido online → escolhe "PIX" ou "Cartão Online"
2. Sistema cria pedido no banco
3. Cliente paga online (PIX ou cartão)
4. **Sistema gera NF-e automaticamente** (chama API do emissor)
5. **Sistema envia NF-e para maquininha via TEF** (automaticamente)
6. Maquininha recebe e armazena nota fiscal
7. Maquininha pode imprimir nota fiscal (se configurado)
8. Pedido confirmado com nota fiscal já registrada

#### **Cenário 2: Pagamento Presencial (Cartão na Entrega/Retirada) + NF-e na Maquininha**

1. Cliente faz pedido online → escolhe "Cartão na Entrega" ou "Cartão na Retirada"
2. Sistema cria pedido no banco
3. **Sistema gera NF-e automaticamente** (chama API do emissor)
4. **Sistema envia NF-e para maquininha via TEF** (antes do pagamento)
5. Na entrega/retirada:
   - Atendente/entregador abre pedido no sistema
   - Sistema conecta com maquininha
   - **Nota fiscal já está na maquininha** (enviada anteriormente)
   - Sistema envia valor para maquininha via TEF
   - Cliente insere cartão
   - Transação processada
   - Maquininha imprime comprovante + nota fiscal
6. Status atualizado para "paid" ou "confirmed"

### Fase 1: Integração com Emissor de NF-e
1. Escolher emissor de NF-e (Focus NFe, Bling, etc.)
2. Criar conta e obter credenciais
3. Implementar API route `/api/invoices/generate`
4. Testar geração de NF-e
5. Armazenar NF-e no banco de dados

### Fase 2: Integração TEF para Enviar NF-e
1. Escolher SDK TEF (Sitef, Elgin, etc.)
2. Configurar maquininha
3. Implementar API route `/api/payments/tef/send-invoice`
4. Testar envio de NF-e para maquininha
5. Verificar se maquininha recebe e armazena NF-e

### Fase 3: Automação Completa
1. Integrar geração de NF-e no fluxo de criação de pedido
2. Integrar envio para maquininha automaticamente após gerar NF-e
3. Testar fluxo completo
4. Implementar tratamento de erros
5. Adicionar logs e auditoria

## 📱 Considerações para Mobile

### Desafios
- **SDK TEF**: A maioria dos SDKs TEF são para desktop (Windows/Linux)
- **Conexão Bluetooth**: Maquininhas móveis geralmente conectam via Bluetooth
- **Permissões**: App mobile precisa de permissões Bluetooth
- **Bateria**: Maquininhas móveis precisam de bateria carregada

### Soluções
- **TEF API**: Usar fornecedor que oferece API REST (não requer SDK local)
- **WebSocket**: Comunicação em tempo real entre app e servidor
- **App Híbrido**: React Native ou similar com plugins nativos para TEF
- **PWA**: Progressive Web App com acesso a APIs do dispositivo

## 💰 Custos e Licenciamento

### Custos Típicos
1. **Licença SDK TEF**: Geralmente pago (anual ou mensal)
2. **Maquininha**: Hardware necessário (compra ou aluguel)
3. **Taxas de transação**: Dependem da operadora (Cielo, Rede, etc.)
4. **Suporte técnico**: Pode ter custo adicional

### Fornecedores Comuns
- **Cielo**: Maquininhas e TEF
- **Rede**: Maquininhas e TEF
- **GetNet**: Maquininhas e TEF
- **Stone**: Maquininhas e TEF
- **PagSeguro**: Maquininhas e TEF

## 🔒 Segurança

### Boas Práticas
1. **Criptografia**: Todas as comunicações devem ser criptografadas
2. **PCI DSS**: Seguir padrões de segurança para dados de cartão
3. **Validação**: Validar todas as transações no servidor
4. **Logs**: Registrar todas as operações TEF
5. **Auditoria**: Manter histórico completo de transações

### Dados Sensíveis
- **NUNCA** armazenar dados completos do cartão
- Armazenar apenas últimos 4 dígitos e bandeira
- Usar tokens quando possível
- Criptografar dados no banco de dados

## 📊 Integração com Sistema Atual

### Modificações Necessárias

1. **Tabela `payment_configurations`**:
   - Adicionar campos TEF
   - Configurar provedor TEF por restaurante

2. **Tabela `payment_transactions`**:
   - Adicionar campos TEF
   - Armazenar resposta completa do TEF

3. **API `/api/payments/generate`**:
   - Adicionar suporte para `paymentMethod: "tef"`
   - Chamar serviço TEF quando necessário

4. **Componente `PaymentModal`**:
   - Adicionar opção TEF
   - Criar `TEFPaymentModal` separado

5. **Checkout (`app/checkout/page.tsx`)**:
   - Adicionar opção "Cartão via TEF" (se aplicável)
   - Ou manter apenas para retirada/entrega

## 🎯 Recomendação Final

### Estratégia de Implementação

**Implementar em 3 fases:**

1. **Fase 1 - Emissão de NF-e**:
   - Integrar com emissor de NF-e (Focus NFe recomendado)
   - Gerar NF-e automaticamente ao criar pedido
   - Armazenar NF-e no banco de dados
   - Disponibilizar PDF da NF-e para cliente

2. **Fase 2 - Envio de NF-e para Maquininha via TEF**:
   - Integrar SDK TEF (Sitef ou Connect TEF)
   - Enviar NF-e para maquininha automaticamente após gerar
   - Verificar se maquininha recebe e armazena
   - Testar impressão de NF-e na maquininha

3. **Fase 3 - Pagamento Presencial via TEF (Opcional)**:
   - Se necessário, implementar pagamento presencial via TEF
   - Integrar com maquininha para processar pagamento
   - Associar pagamento com NF-e já gerada

### Tecnologia Recomendada

**Para Emissão de NF-e:**
- **Focus NFe**: API REST simples, boa documentação, planos acessíveis
- **Bling**: Se já usar Bling como ERP
- **NFe.io**: Alternativa moderna

**Para TEF (Envio de NF-e para Maquininha):**
- **Sitef**: Padrão do mercado, amplamente suportado
- **Connect TEF**: Solução moderna, API REST disponível
- **TEF API REST**: Se fornecedor oferecer (melhor para Next.js)

**Arquitetura:**
- **Backend (Next.js API Routes)**: Gerar NF-e e enviar para TEF
- **WebSocket/Server-Sent Events**: Para atualização em tempo real
- **App Mobile (Opcional)**: Para entregadores com maquininha móvel

## 📝 Próximos Passos (Quando Implementar)

### Passo 1: Escolher Emissor de NF-e
1. Avaliar fornecedores (Focus NFe, Bling, NFe.io)
2. Comparar custos e funcionalidades
3. Criar conta de teste
4. Obter credenciais (certificado digital, tokens)

### Passo 2: Implementar Geração de NF-e
1. Criar API route `/api/invoices/generate`
2. Integrar com API do emissor escolhido
3. Implementar geração de XML da NF-e
4. Testar geração de NF-e de teste
5. Armazenar NF-e no banco de dados

### Passo 3: Escolher Solução TEF
1. Avaliar fornecedores TEF (Sitef, Connect TEF, etc.)
2. Verificar compatibilidade com maquininhas disponíveis
3. Avaliar custos e licenciamento
4. Escolher entre SDK local ou API REST

### Passo 4: Implementar Envio de NF-e para Maquininha
1. Configurar SDK TEF ou API REST
2. Criar API route `/api/payments/tef/send-invoice`
3. Implementar envio de NF-e para maquininha
4. Testar recebimento na maquininha
5. Verificar impressão de NF-e

### Passo 5: Automação e Integração
1. Integrar geração de NF-e no fluxo de criação de pedido
2. Automatizar envio para maquininha após gerar NF-e
3. Implementar tratamento de erros
4. Adicionar logs e auditoria
5. Testar fluxo completo

### Passo 6: Testes e Validação
1. Testar geração de NF-e para diferentes tipos de pedido
2. Testar envio para maquininha
3. Validar impressão de NF-e
4. Testar com diferentes maquininhas
5. Validar conformidade legal

### Passo 7: Deploy e Treinamento
1. Deploy em ambiente de produção
2. Treinar equipe sobre o sistema
3. Documentar processos
4. Monitorar funcionamento
5. Ajustar conforme necessário

## 🔗 Recursos e Documentação

- **Sitef**: https://www.softwareexpress.com.br
- **Connect TEF**: https://www.connecttef.com.br
- **Cielo TEF**: Documentação da Cielo
- **PCI DSS**: https://www.pcisecuritystandards.org

---

## ⚠️ Importante

**Esta documentação é apenas informativa.** A implementação real de TEF + NF-e requer:

### Requisitos Legais
- **Certificado Digital A1 ou A3**: Necessário para emitir NF-e
- **Inscrição Estadual**: Para emissão de NF-e
- **Conformidade com SEFAZ**: Validação de NF-e pela Secretaria da Fazenda
- **Regulamentações Estaduais**: Alguns estados têm regras específicas

### Requisitos Técnicos
- **Contrato com emissor de NF-e**: Focus NFe, Bling, etc.
- **Contrato com fornecedor TEF**: Sitef, Connect TEF, etc.
- **Hardware (maquininhas)**: Compatível com TEF escolhido
- **Desenvolvimento específico**: Integração customizada
- **Testes extensivos**: Ambiente de homologação antes de produção
- **Certificado Digital**: Para assinar NF-e digitalmente

### Custos Estimados
- **Emissor de NF-e**: R$ 50-200/mês (depende do volume)
- **SDK TEF**: R$ 200-500/mês (depende do fornecedor)
- **Maquininha**: R$ 200-800 (compra) ou R$ 30-80/mês (aluguel)
- **Certificado Digital**: R$ 200-400/ano
- **Desenvolvimento**: Variável (depende da complexidade)

### Recomendações
1. **Consultar fornecedores**: Falar diretamente com Focus NFe, Sitef, etc.
2. **Testar em homologação**: Sempre testar antes de produção
3. **Validar com contador**: Garantir conformidade fiscal
4. **Começar simples**: Implementar geração de NF-e primeiro, depois TEF
5. **Documentar tudo**: Manter registro de todas as integrações

---

## 📌 Resumo do Objetivo

**O cliente quer que:**
- ✅ Cliente faz pedido online
- ✅ Sistema gera Nota Fiscal Eletrônica automaticamente
- ✅ Nota Fiscal é enviada para maquininha via TEF
- ✅ Nota Fiscal fica registrada na maquininha
- ✅ Maquininha pode imprimir nota fiscal
- ✅ Se pagamento for presencial, cliente paga na maquininha (com NF-e já registrada)
- ✅ Se pagamento for online, NF-e já está na maquininha (para impressão se necessário)

**Isso garante:**
- Conformidade legal (todas as vendas com NF-e)
- Rastreabilidade (notas registradas na maquininha)
- Automação (sem necessidade de digitar manualmente)
- Integração completa (sistema online + maquininha física)

