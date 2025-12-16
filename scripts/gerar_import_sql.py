#!/usr/bin/env python3
"""
Script para gerar SQL de importação de produtos e categorias
Use este script para facilitar a criação do SQL de importação
"""

# ============================================
# CONFIGURAÇÃO - EDITE AQUI
# ============================================

CATEGORIAS_E_PRODUTOS = [
    {
        "nome": "Pizzas",
        "ordem": 1,
        "produtos": [
            {"nome": "Pizza Calabresa", "descricao": "Deliciosa pizza de calabresa com queijo", "preco": 35.00},
            {"nome": "Pizza Margherita", "descricao": "Pizza tradicional com tomate, queijo e manjericão", "preco": 32.00},
            {"nome": "Pizza 4 Queijos", "descricao": "Pizza com 4 tipos de queijo selecionados", "preco": 38.00},
            {"nome": "Pizza Portuguesa", "descricao": "Pizza com presunto, ovos, cebola e azeitonas", "preco": 36.00},
        ]
    },
    {
        "nome": "Bebidas",
        "ordem": 2,
        "produtos": [
            {"nome": "Refrigerante 350ml", "descricao": "Coca-Cola, Pepsi, Guaraná, Fanta", "preco": 5.00},
            {"nome": "Refrigerante 2L", "descricao": "Coca-Cola, Pepsi, Guaraná, Fanta", "preco": 8.00},
            {"nome": "Suco Natural", "descricao": "Laranja, Maracujá, Limão", "preco": 6.00},
        ]
    },
    # Adicione mais categorias aqui:
    # {
    #     "nome": "Nome da Categoria",
    #     "ordem": 3,
    #     "produtos": [
    #         {"nome": "Produto 1", "descricao": "Descrição", "preco": 10.00},
    #         {"nome": "Produto 2", "descricao": "Descrição", "preco": 15.00},
    #     ]
    # },
]

# ============================================
# GERAÇÃO DO SQL
# ============================================

def gerar_sql():
    sql_parts = []
    sql_parts.append("-- Script gerado automaticamente")
    sql_parts.append("-- Edite os dados acima e execute este script")
    sql_parts.append("")
    
    sql_parts.append("DO $$")
    sql_parts.append("DECLARE")
    sql_parts.append("    uuid_tomjerry UUID;")
    sql_parts.append("    cat_id UUID;")
    sql_parts.append("    categoria_order INTEGER := 0;")
    sql_parts.append("BEGIN")
    sql_parts.append("    SELECT id INTO uuid_tomjerry")
    sql_parts.append("    FROM auth.users")
    sql_parts.append("    WHERE email = 'tomjerry@gmail.com';")
    sql_parts.append("    ")
    sql_parts.append("    IF uuid_tomjerry IS NULL THEN")
    sql_parts.append("        RAISE EXCEPTION 'Usuário não encontrado!';")
    sql_parts.append("    END IF;")
    sql_parts.append("")
    
    for categoria in CATEGORIAS_E_PRODUTOS:
        sql_parts.append(f"    -- Categoria: {categoria['nome']}")
        sql_parts.append(f"    categoria_order := categoria_order + 1;")
        sql_parts.append(f"    INSERT INTO categories (restaurant_id, name, image, \"order\")")
        sql_parts.append(f"    VALUES (uuid_tomjerry, '{categoria['nome'].replace("'", "''")}', NULL, categoria_order)")
        sql_parts.append("    ON CONFLICT DO NOTHING")
        sql_parts.append("    RETURNING id INTO cat_id;")
        sql_parts.append("    ")
        sql_parts.append("    IF cat_id IS NOT NULL THEN")
        sql_parts.append(f"        RAISE NOTICE 'Categoria criada: {categoria['nome']}';")
        sql_parts.append("        ")
        sql_parts.append("        INSERT INTO products (restaurant_id, category_id, name, description, price, image, available)")
        sql_parts.append("        VALUES")
        
        produtos_sql = []
        for i, produto in enumerate(categoria['produtos']):
            nome = produto['nome'].replace("'", "''")
            desc = produto['descricao'].replace("'", "''")
            preco = produto['preco']
            comma = "," if i < len(categoria['produtos']) - 1 else ";"
            produtos_sql.append(f"            (uuid_tomjerry, cat_id, '{nome}', '{desc}', {preco:.2f}, NULL, true){comma}")
        
        sql_parts.append("\n".join(produtos_sql))
        sql_parts.append("        ")
        sql_parts.append(f"        RAISE NOTICE '   Produtos adicionados: {len(categoria['produtos'])}';")
        sql_parts.append("    END IF;")
        sql_parts.append("")
    
    sql_parts.append("END $$;")
    
    return "\n".join(sql_parts)

if __name__ == "__main__":
    sql = gerar_sql()
    print(sql)
    print("\n-- Cole o SQL acima no Supabase SQL Editor e execute")



