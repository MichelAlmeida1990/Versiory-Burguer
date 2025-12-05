# Sistema de Cálculo de Frete - Versiory Delivery

## 📋 Resumo do Sistema

Sistema de cálculo de frete inteligente baseado em:
- **Regiões/Zonas** por CEP
- **Frete grátis** para pedidos acima de um valor mínimo
- **Frete manual** para casos especiais
- **Busca automática** de CEP via ViaCEP

## ✅ O que já está implementado:

### 1. **Schema do Banco de Dados**
- ✅ Tabela `delivery_zones` - Zonas de entrega por CEP
- ✅ Tabela `delivery_settings` - Configurações gerais de frete
- ✅ RLS Policies configuradas

### 2. **Biblioteca de Cálculo** (`lib/delivery-fee.ts`)
- ✅ Função `calculateDeliveryFee()` - Calcula frete baseado em CEP e valor do pedido
- ✅ Busca de zonas por prefixo de CEP
- ✅ Suporte a frete grátis por valor mínimo
- ✅ Suporte a frete manual

### 3. **Busca de CEP** (`lib/cep-utils.ts`)
- ✅ Função `fetchAddressByCep()` - Busca endereço via ViaCEP API
- ✅ Formatação de CEP

### 4. **Checkout** (parcialmente implementado)
- ✅ Cálculo automático de frete quando CEP é preenchido
- ✅ Estado para frete manual
- ⏳ Busca automática de CEP (precisa ser adicionada)
- ⏳ Interface de frete manual (precisa ser adicionada)

## 🔧 Como funciona:

### Cálculo de Frete:
1. Cliente preenche CEP no checkout
2. Sistema busca a zona correspondente ao CEP
3. Verifica se há frete grátis (valor mínimo)
4. Calcula frete baseado na zona ou valor padrão
5. Permite frete manual se habilitado

### Estrutura de Zonas:
- Cada zona pode ter:
  - Prefixos de CEP (ex: ["01310", "01311"])
  - Valor base de frete
  - Valor mínimo para frete grátis
  - Ativação/desativação

## 📝 Próximos Passos:

1. **Interface Admin** para configurar zonas de frete
2. **Busca automática de CEP** no checkout
3. **Opção de frete manual** no checkout/admin
4. **Exibição de informações** sobre frete calculado

## 🚀 Como usar:

### 1. Executar o SQL:
Execute o arquivo `supabase/DELIVERY_FEE_CONFIG.sql` no Supabase SQL Editor.

### 2. Configurar Zonas (via SQL ou Admin):
```sql
-- Exemplo: Zona Centro com frete R$ 5,00
INSERT INTO delivery_zones (name, base_fee, cep_prefixes, free_delivery_threshold)
VALUES (
  'Centro',
  5.00,
  ARRAY['01310', '01311', '01312'],
  50.00
);
```

### 3. Configurar Frete Grátis:
```sql
UPDATE delivery_settings 
SET free_delivery_min_amount = 50.00 
WHERE id = (SELECT id FROM delivery_settings LIMIT 1);
```

## 💡 Funcionalidades Futuras:

- [ ] Cálculo por distância real (coordenadas GPS)
- [ ] Diferentes valores por horário
- [ ] Desconto progressivo por valor
- [ ] Integração com APIs de geolocalização

