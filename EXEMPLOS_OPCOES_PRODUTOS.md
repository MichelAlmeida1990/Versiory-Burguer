# 📝 Exemplos Práticos de Opções para Produtos

## 🍕 Exemplo 1: Pizza Margherita

**Produto Base**: Pizza Margherita - R$ 25,00

### Configuração no Admin:

#### Opção 1: Tamanho (Obrigatória, Escolha Única)
- **Nome**: "Tamanho"
- **Tipo**: `single` (escolha única)
- **Obrigatória**: Sim
- **Valores**:
  - Pequena (4 fatias): +R$ 0,00
  - Média (6 fatias): +R$ 5,00
  - Grande (8 fatias): +R$ 10,00

#### Opção 2: Borda (Opcional, Escolha Única)
- **Nome**: "Borda"
- **Tipo**: `single`
- **Obrigatória**: Não
- **Valores**:
  - Normal: +R$ 0,00
  - Recheada (Catupiry): +R$ 3,00
  - Recheada (Cheddar): +R$ 3,50

#### Opção 3: Ingredientes Extras (Opcional, Múltipla Escolha)
- **Nome**: "Ingredientes Extras"
- **Tipo**: `multiple` (múltipla escolha)
- **Obrigatória**: Não
- **Valores**:
  - Queijo Extra: +R$ 2,00
  - Bacon: +R$ 3,00
  - Azeitona: +R$ 1,50
  - Cebola: +R$ 1,00
  - Pimentão: +R$ 1,00
  - Champignon: +R$ 2,50

### Exemplo de Pedido:
**Cliente seleciona**:
- Tamanho: Média (+R$ 5,00)
- Borda: Recheada Catupiry (+R$ 3,00)
- Ingredientes Extras: Queijo Extra (+R$ 2,00) + Bacon (+R$ 3,00)

**Preço Final**: R$ 25,00 + R$ 5,00 + R$ 3,00 + R$ 2,00 + R$ 3,00 = **R$ 38,00**

---

## 🍔 Exemplo 2: Hambúrguer Artesanal

**Produto Base**: Hambúrguer Artesanal - R$ 15,00

### Configuração no Admin:

#### Opção 1: Tamanho (Obrigatória, Escolha Única)
- **Nome**: "Tamanho"
- **Tipo**: `single`
- **Obrigatória**: Sim
- **Valores**:
  - Simples (1 hambúrguer): +R$ 0,00
  - Duplo (2 hambúrgueres): +R$ 8,00
  - Triplo (3 hambúrgueres): +R$ 15,00

#### Opção 2: Adicionais (Opcional, Múltipla Escolha)
- **Nome**: "Adicionais"
- **Tipo**: `multiple`
- **Obrigatória**: Não
- **Valores**:
  - Bacon: +R$ 3,00
  - Ovo: +R$ 2,00
  - Queijo Extra: +R$ 2,50
  - Cebola Caramelizada: +R$ 1,50
  - Picles: +R$ 0,50
  - Alface: +R$ 0,00
  - Tomate: +R$ 0,00

#### Opção 3: Pão (Opcional, Escolha Única)
- **Nome**: "Tipo de Pão"
- **Tipo**: `single`
- **Obrigatória**: Não
- **Valores**:
  - Pão Brioche (padrão): +R$ 0,00
  - Pão Australiano: +R$ 1,00
  - Pão Integral: +R$ 0,50

### Exemplo de Pedido:
**Cliente seleciona**:
- Tamanho: Duplo (+R$ 8,00)
- Adicionais: Bacon (+R$ 3,00) + Ovo (+R$ 2,00) + Queijo Extra (+R$ 2,50)
- Pão: Pão Australiano (+R$ 1,00)

**Preço Final**: R$ 15,00 + R$ 8,00 + R$ 3,00 + R$ 2,00 + R$ 2,50 + R$ 1,00 = **R$ 31,50**

---

## 🥤 Exemplo 3: Refrigerante

**Produto Base**: Refrigerante - R$ 5,00

### Configuração no Admin:

#### Opção 1: Tamanho (Obrigatória, Escolha Única)
- **Nome**: "Tamanho"
- **Tipo**: `single`
- **Obrigatória**: Sim
- **Valores**:
  - 300ml (lata): +R$ 0,00
  - 500ml (garrafa): +R$ 2,00
  - 1L (garrafa): +R$ 4,00
  - 2L (garrafa): +R$ 6,00

#### Opção 2: Gelo (Opcional, Escolha Única)
- **Nome**: "Gelo"
- **Tipo**: `single`
- **Obrigatória**: Não
- **Valores**:
  - Com Gelo: +R$ 0,00
  - Sem Gelo: +R$ 0,00

### Exemplo de Pedido:
**Cliente seleciona**:
- Tamanho: 1L (+R$ 4,00)
- Gelo: Com Gelo

**Preço Final**: R$ 5,00 + R$ 4,00 = **R$ 9,00**

---

## 🍦 Exemplo 4: Açaí

**Produto Base**: Açaí - R$ 12,00

### Configuração no Admin:

#### Opção 1: Tamanho (Obrigatória, Escolha Única)
- **Nome**: "Tamanho"
- **Tipo**: `single`
- **Obrigatória**: Sim
- **Valores**:
  - 300ml: +R$ 0,00
  - 500ml: +R$ 3,00
  - 700ml: +R$ 6,00

#### Opção 2: Complementos (Opcional, Múltipla Escolha)
- **Nome**: "Complementos"
- **Tipo**: `multiple`
- **Obrigatória**: Não
- **Valores**:
  - Granola: +R$ 1,50
  - Banana: +R$ 1,00
  - Leite Condensado: +R$ 1,50
  - Morango: +R$ 2,00
  - Paçoca: +R$ 1,00
  - Leite em Pó: +R$ 1,00

#### Opção 3: Açúcar (Opcional, Escolha Única)
- **Nome**: "Açúcar"
- **Tipo**: `single`
- **Obrigatória**: Não
- **Valores**:
  - Sem Açúcar: +R$ 0,00
  - Pouco Açúcar: +R$ 0,00
  - Normal: +R$ 0,00
  - Muito Açúcar: +R$ 0,00

### Exemplo de Pedido:
**Cliente seleciona**:
- Tamanho: 500ml (+R$ 3,00)
- Complementos: Granola (+R$ 1,50) + Banana (+R$ 1,00) + Leite Condensado (+R$ 1,50)
- Açúcar: Normal

**Preço Final**: R$ 12,00 + R$ 3,00 + R$ 1,50 + R$ 1,00 + R$ 1,50 = **R$ 19,00**

---

## 🍗 Exemplo 5: Frango Frito

**Produto Base**: Frango Frito (6 unidades) - R$ 18,00

### Configuração no Admin:

#### Opção 1: Quantidade (Obrigatória, Escolha Única)
- **Nome**: "Quantidade"
- **Tipo**: `single`
- **Obrigatória**: Sim
- **Valores**:
  - 6 unidades: +R$ 0,00
  - 12 unidades: +R$ 15,00
  - 18 unidades: +R$ 28,00

#### Opção 2: Molhos (Opcional, Múltipla Escolha)
- **Nome**: "Molhos"
- **Tipo**: `multiple`
- **Obrigatória**: Não
- **Valores**:
  - Barbecue: +R$ 1,00
  - Mostarda e Mel: +R$ 1,00
  - Picante: +R$ 1,00
  - Agridoce: +R$ 1,00

#### Opção 3: Acompanhamentos (Opcional, Múltipla Escolha)
- **Nome**: "Acompanhamentos"
- **Tipo**: `multiple`
- **Obrigatória**: Não
- **Valores**:
  - Batata Frita: +R$ 4,00
  - Anéis de Cebola: +R$ 3,50
  - Salada: +R$ 2,00

### Exemplo de Pedido:
**Cliente seleciona**:
- Quantidade: 12 unidades (+R$ 15,00)
- Molhos: Barbecue (+R$ 1,00) + Picante (+R$ 1,00)
- Acompanhamentos: Batata Frita (+R$ 4,00)

**Preço Final**: R$ 18,00 + R$ 15,00 + R$ 1,00 + R$ 1,00 + R$ 4,00 = **R$ 39,00**

---

## 💡 Dicas de Implementação

### Boas Práticas:

1. **Nomes Claros**: Use nomes descritivos para opções e valores
   - ✅ "Tamanho" → "Pequena", "Média", "Grande"
   - ❌ "Opção 1" → "Valor A", "Valor B"

2. **Preços Justos**: Defina preços adicionais que façam sentido
   - Ingredientes extras: R$ 1,00 - R$ 3,00
   - Tamanhos maiores: proporcional ao aumento

3. **Obrigatoriedade**: Marque como obrigatória apenas opções essenciais
   - ✅ Tamanho de pizza/hambúrguer
   - ❌ Molhos ou complementos

4. **Ordem de Exibição**: Organize opções por importância
   - Tamanho primeiro
   - Opções principais depois
   - Extras por último

5. **Disponibilidade**: Use o campo `available` para desativar temporariamente valores
   - Ex: "Bacon" temporariamente sem estoque

### Casos Especiais:

- **Preços Negativos**: Use para descontos (ex: "Sem queijo" = -R$ 2,00)
- **Valores Grátis**: Use R$ 0,00 para opções sem custo adicional
- **Múltiplas Opções**: Permita várias escolhas quando fizer sentido (ingredientes extras)




