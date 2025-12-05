# 🗺️ ROADMAP: Sistema de Gestão de Estoque

## 📊 Análise da Viabilidade

**✅ É TOTALMENTE POSSÍVEL** implementar um sistema de gestão de estoque que calcule exatamente o que sair no pedido.

### Situação Atual
- ✅ Sistema de pedidos funcionando (`orders`, `order_items`)
- ✅ Sistema de opções de produtos funcionando (`product_options`, `product_option_values`, `order_item_options`)
- ❌ **NÃO existe** sistema de estoque/ingredientes
- ❌ **NÃO existe** mapeamento produto → ingredientes
- ❌ **NÃO existe** cálculo automático de consumo

---

## 🎯 Objetivo

Criar um sistema que:
1. **Cadastre ingredientes/matérias-primas** (ex: Queijo, Bacon, Massa, Molho)
2. **Mapeie quais ingredientes cada produto usa** (ex: Pizza Margherita = Massa + Molho + Queijo)
3. **Mapeie quais ingredientes cada opção adiciona** (ex: Opção "Queijo Extra" = +50g Queijo)
4. **Calcule automaticamente o consumo** quando um pedido é criado
5. **Atualize o estoque em tempo real**
6. **Alerte quando estoque estiver baixo**

---

## 📋 FASE 1: Estrutura do Banco de Dados

### 1.1 Tabela de Ingredientes
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,              -- Ex: "Queijo Mussarela"
  unit VARCHAR(50) NOT NULL,                -- Ex: "g", "ml", "unidade"
  current_stock DECIMAL(10, 3) DEFAULT 0,   -- Estoque atual (permite decimais)
  min_stock DECIMAL(10, 3) DEFAULT 0,       -- Estoque mínimo (alerta)
  cost_per_unit DECIMAL(10, 2) DEFAULT 0,   -- Custo por unidade (opcional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 Tabela de Receitas (Produto → Ingredientes)
```sql
CREATE TABLE product_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 3) NOT NULL,         -- Quantidade necessária (ex: 100g)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)         -- Um produto não pode ter o mesmo ingrediente duplicado
);
```

### 1.3 Tabela de Receitas de Opções (Opção → Ingredientes)
```sql
CREATE TABLE option_value_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_value_id UUID REFERENCES product_option_values(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 3) NOT NULL,         -- Quantidade adicional (ex: +50g)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(option_value_id, ingredient_id)
);
```

### 1.4 Tabela de Movimentações de Estoque
```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'waste')),
  quantity DECIMAL(10, 3) NOT NULL,         -- Quantidade (negativa para saída, positiva para entrada)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,  -- Se for venda, linkar ao pedido
  notes TEXT,                                -- Observações
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)                    -- Usuário que fez a movimentação
);
```

### 1.5 Índices para Performance
```sql
CREATE INDEX idx_product_recipes_product ON product_recipes(product_id);
CREATE INDEX idx_product_recipes_ingredient ON product_recipes(ingredient_id);
CREATE INDEX idx_option_value_recipes_option ON option_value_recipes(option_value_id);
CREATE INDEX idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX idx_stock_movements_order ON stock_movements(order_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at DESC);
```

---

## 📋 FASE 2: Lógica de Cálculo de Consumo

### 2.1 Função SQL para Calcular Consumo de um Pedido
```sql
CREATE OR REPLACE FUNCTION calculate_order_consumption(order_uuid UUID)
RETURNS TABLE (
  ingredient_id UUID,
  ingredient_name VARCHAR,
  total_quantity DECIMAL(10, 3),
  unit VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH order_consumption AS (
    -- Consumo base dos produtos
    SELECT 
      pr.ingredient_id,
      pr.quantity * oi.quantity as consumed_quantity
    FROM order_items oi
    JOIN product_recipes pr ON pr.product_id = oi.product_id
    WHERE oi.order_id = order_uuid
    
    UNION ALL
    
    -- Consumo adicional das opções selecionadas
    SELECT 
      ovr.ingredient_id,
      ovr.quantity * oi.quantity as consumed_quantity
    FROM order_items oi
    JOIN order_item_options oio ON oio.order_item_id = oi.id
    JOIN option_value_recipes ovr ON ovr.option_value_id = oio.option_value_id
    WHERE oi.order_id = order_uuid
  )
  SELECT 
    oc.ingredient_id,
    i.name as ingredient_name,
    SUM(oc.consumed_quantity) as total_quantity,
    i.unit
  FROM order_consumption oc
  JOIN ingredients i ON i.id = oc.ingredient_id
  GROUP BY oc.ingredient_id, i.name, i.unit;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Trigger para Atualizar Estoque ao Criar Pedido
```sql
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  consumption_record RECORD;
BEGIN
  -- Só processar quando o pedido for confirmado
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    
    -- Calcular consumo e criar movimentações
    FOR consumption_record IN 
      SELECT * FROM calculate_order_consumption(NEW.id)
    LOOP
      -- Criar movimentação de saída
      INSERT INTO stock_movements (
        ingredient_id,
        movement_type,
        quantity,
        order_id,
        notes
      ) VALUES (
        consumption_record.ingredient_id,
        'sale',
        -consumption_record.total_quantity,  -- Negativo = saída
        NEW.id,
        'Consumo automático do pedido #' || NEW.id
      );
      
      -- Atualizar estoque atual
      UPDATE ingredients
      SET current_stock = current_stock - consumption_record.total_quantity,
          updated_at = NOW()
      WHERE id = consumption_record.ingredient_id;
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_order();
```

### 2.3 Função para Reverter Estoque ao Cancelar Pedido
```sql
CREATE OR REPLACE FUNCTION revert_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  movement_record RECORD;
BEGIN
  -- Se o pedido foi cancelado, reverter o estoque
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    
    -- Buscar todas as movimentações deste pedido
    FOR movement_record IN 
      SELECT * FROM stock_movements
      WHERE order_id = NEW.id AND movement_type = 'sale'
    LOOP
      -- Criar movimentação de reversão (entrada)
      INSERT INTO stock_movements (
        ingredient_id,
        movement_type,
        quantity,
        order_id,
        notes
      ) VALUES (
        movement_record.ingredient_id,
        'adjustment',
        ABS(movement_record.quantity),  -- Positivo = entrada
        NEW.id,
        'Reversão de estoque - Pedido cancelado #' || NEW.id
      );
      
      -- Atualizar estoque atual
      UPDATE ingredients
      SET current_stock = current_stock + ABS(movement_record.quantity),
          updated_at = NOW()
      WHERE id = movement_record.ingredient_id;
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_revert_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION revert_stock_on_cancel();
```

---

## 📋 FASE 3: Interface de Administração

### 3.1 Página de Gestão de Ingredientes
**Rota:** `/admin/ingredients`
- Listar todos os ingredientes
- Mostrar estoque atual, mínimo, unidade
- Alertas de estoque baixo
- Botões: Adicionar, Editar, Ver Histórico

### 3.2 Página de Cadastro/Edição de Ingrediente
**Rota:** `/admin/ingredients/new` e `/admin/ingredients/[id]/edit`
- Campos: Nome, Unidade, Estoque Atual, Estoque Mínimo, Custo
- Histórico de movimentações

### 3.3 Página de Receitas de Produtos
**Rota:** `/admin/products/[id]/recipe`
- Listar ingredientes do produto
- Adicionar/remover ingredientes
- Definir quantidade de cada ingrediente
- Visualizar custo total do produto

### 3.4 Página de Receitas de Opções
**Rota:** `/admin/products/[id]/options/[optionId]/recipe`
- Listar ingredientes adicionais da opção
- Adicionar/remover ingredientes
- Definir quantidade adicional

### 3.5 Dashboard de Estoque
**Rota:** `/admin/inventory`
- Visão geral do estoque
- Gráficos de consumo
- Alertas de estoque baixo
- Produtos mais vendidos (por consumo de ingredientes)

---

## 📋 FASE 4: Validações e Alertas

### 4.1 Validação de Estoque ao Criar Pedido
```typescript
// Em app/api/orders/route.ts
async function validateStock(orderItems: any[]) {
  const stockIssues: string[] = [];
  
  for (const item of orderItems) {
    // Buscar receita do produto
    const { data: productRecipe } = await supabase
      .from('product_recipes')
      .select('*, ingredients(*)')
      .eq('product_id', item.product_id);
    
    // Verificar estoque de cada ingrediente
    for (const recipe of productRecipe || []) {
      const required = recipe.quantity * item.quantity;
      if (recipe.ingredients.current_stock < required) {
        stockIssues.push(
          `${recipe.ingredients.name}: necessário ${required}${recipe.ingredients.unit}, ` +
          `disponível ${recipe.ingredients.current_stock}${recipe.ingredients.unit}`
        );
      }
    }
    
    // Verificar opções selecionadas
    if (item.selectedOptions) {
      // Similar para opções...
    }
  }
  
  return stockIssues;
}
```

### 4.2 Alertas de Estoque Baixo
```sql
-- View para ingredientes com estoque baixo
CREATE VIEW low_stock_ingredients AS
SELECT 
  id,
  name,
  current_stock,
  min_stock,
  unit,
  (current_stock - min_stock) as difference
FROM ingredients
WHERE current_stock <= min_stock
ORDER BY difference ASC;
```

---

## 📋 FASE 5: Relatórios e Analytics

### 5.1 Relatório de Consumo por Período
- Consumo de cada ingrediente
- Comparação com períodos anteriores
- Previsão de reposição

### 5.2 Relatório de Custo de Produtos
- Custo real de cada produto (baseado em ingredientes)
- Margem de lucro
- Produtos mais/menos rentáveis

### 5.3 Relatório de Movimentações
- Entradas e saídas
- Ajustes manuais
- Perdas/desperdícios

---

## 🔄 Fluxo Completo de um Pedido

### Exemplo: Pedido de Pizza Margherita Média + Queijo Extra

1. **Cliente faz pedido:**
   - 1x Pizza Margherita (Média)
   - Opção: Queijo Extra

2. **Sistema calcula consumo:**
   ```
   Pizza Margherita (receita base):
   - Massa: 200g
   - Molho: 100ml
   - Queijo: 150g
   
   Opção "Queijo Extra":
   - Queijo: +50g
   
   TOTAL:
   - Massa: 200g
   - Molho: 100ml
   - Queijo: 200g (150g + 50g)
   ```

3. **Ao confirmar pedido:**
   - Trigger `update_stock_on_order()` é executado
   - Cria movimentações de saída
   - Atualiza `ingredients.current_stock`
   - Se estoque ficar abaixo do mínimo, gera alerta

4. **Se pedido for cancelado:**
   - Trigger `revert_stock_on_cancel()` reverte o consumo
   - Estoque volta ao valor anterior

---

## ⚠️ Considerações Importantes

### Complexidade
- **Média-Alta**: Requer mapeamento manual de receitas
- **Manutenção**: Receitas precisam ser atualizadas quando produtos mudam

### Dependências
- Sistema de opções já existe ✅
- Sistema de pedidos já existe ✅
- Precisa criar sistema de ingredientes ❌

### Desafios
1. **Mapeamento inicial**: Cadastrar receitas de todos os produtos
2. **Unidades diferentes**: Alguns ingredientes em gramas, outros em ml, outros em unidades
3. **Variações de tamanho**: Pizza P/M/G podem ter receitas diferentes
4. **Desperdícios**: Não contabilizados automaticamente (precisa ajuste manual)

### Vantagens
- ✅ Controle preciso de estoque
- ✅ Previsão de compras
- ✅ Cálculo de custos reais
- ✅ Alertas automáticos
- ✅ Histórico completo

---

## 📅 Estimativa de Implementação

| Fase | Complexidade | Tempo Estimado |
|------|--------------|----------------|
| Fase 1: Banco de Dados | Média | 2-3 horas |
| Fase 2: Lógica SQL | Alta | 4-6 horas |
| Fase 3: Interface Admin | Alta | 8-12 horas |
| Fase 4: Validações | Média | 3-4 horas |
| Fase 5: Relatórios | Média | 4-6 horas |
| **TOTAL** | | **21-31 horas** |

---

## 🚀 Próximos Passos (Ordem de Implementação)

1. ✅ **Criar estrutura do banco** (Fase 1)
2. ✅ **Implementar funções SQL** (Fase 2)
3. ✅ **Criar interface de ingredientes** (Fase 3.1, 3.2)
4. ✅ **Integrar cálculo no fluxo de pedidos** (Fase 2.2)
5. ✅ **Criar interface de receitas** (Fase 3.3, 3.4)
6. ✅ **Implementar validações** (Fase 4)
7. ✅ **Criar dashboard** (Fase 3.5)
8. ✅ **Implementar relatórios** (Fase 5)

---

## 💡 Exemplo Prático: Pizza Margherita

### Cadastro de Ingredientes
```
- Massa de Pizza (unidade: g)
- Molho de Tomate (unidade: ml)
- Queijo Mussarela (unidade: g)
```

### Receita do Produto "Pizza Margherita"
```
- Massa de Pizza: 200g
- Molho de Tomate: 100ml
- Queijo Mussarela: 150g
```

### Receita da Opção "Queijo Extra"
```
- Queijo Mussarela: +50g
```

### Resultado
Quando alguém pedir 1x Pizza Margherita + Queijo Extra:
- Consumo: 200g Massa + 100ml Molho + 200g Queijo
- Estoque é atualizado automaticamente ✅

---

## ✅ Conclusão

**SIM, é totalmente possível e viável!**

O sistema pode calcular exatamente o que sair no pedido, desde que:
1. As receitas dos produtos estejam cadastradas
2. As receitas das opções estejam cadastradas
3. O estoque inicial esteja configurado

A implementação é complexa, mas bem estruturada e escalável.

