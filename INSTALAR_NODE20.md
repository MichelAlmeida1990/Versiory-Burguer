# 📥 Como Instalar Node.js 20 Manualmente

## ⚠️ Instalação Automática Falhou

A instalação automática falhou (erro 1603). Siga estes passos manuais:

## 📋 Passo a Passo

### 1. Baixar Node.js 20

**Link direto:** https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi

Ou acesse: https://nodejs.org/ e baixe a versão **LTS (20.x)**

### 2. Fechar Todos os Terminais

- Feche todos os terminais PowerShell/CMD abertos
- Feche o VS Code/Cursor se estiver aberto

### 3. Executar o Instalador

1. Localize o arquivo `node-v20.18.0-x64.msi` baixado
2. **Clique com botão direito** no arquivo
3. Selecione **"Executar como Administrador"**
4. Siga as instruções do instalador:
   - Clique em **Next**
   - Aceite os termos (I accept)
   - Clique em **Next**
   - Clique em **Install**
   - Aguarde a instalação
   - Clique em **Finish**

### 4. Desinstalar Node.js 22 (Opcional, mas Recomendado)

Se você quiser remover o Node.js 22 para evitar conflitos:

1. Abra **Painel de Controle** → **Programas e Recursos**
2. Procure por "Node.js"
3. Desinstale todas as versões do Node.js encontradas
4. Reinicie o computador
5. Instale o Node.js 20 seguindo o passo 3 acima

### 5. Verificar Instalação

Abra um **NOVO** terminal PowerShell e execute:

```powershell
node --version
```

**Deve mostrar:** `v20.18.0` ou similar (qualquer v20.x.x)

Se ainda mostrar v22.x.x:
- Reinicie o computador
- Abra um novo terminal
- Verifique novamente: `node --version`

### 6. Limpar e Reinstalar o Projeto

```powershell
cd C:\Projetos\restaurante

# Limpar tudo
Remove-Item -Recurse -Force node_modules,.next,package-lock.json -ErrorAction SilentlyContinue

# Limpar cache
npm cache clean --force

# Reinstalar dependências
npm install

# Testar build
npm run build
```

### 7. Rodar o Projeto

```powershell
npm run dev
```

**Acesse:** http://localhost:3000

## 🔄 Alternativa: Usar nvm-windows (Gerenciador de Versões)

Se você precisar manter Node.js 22 para outros projetos, use o **nvm-windows**:

1. **Baixar nvm-windows:**
   - Link: https://github.com/coreybutler/nvm-windows/releases
   - Baixe o arquivo `nvm-setup.exe`

2. **Instalar nvm-windows:**
   - Execute o instalador
   - Siga as instruções

3. **Instalar Node.js 20:**
   ```powershell
   nvm install 20.18.0
   nvm use 20.18.0
   ```

4. **Verificar:**
   ```powershell
   node --version
   ```

5. **Alternar entre versões quando necessário:**
   ```powershell
   nvm use 20.18.0  # Para o projeto restaurante
   nvm use 22.11.0  # Para outros projetos
   ```

## ✅ Após Instalar Node.js 20

O build deve funcionar normalmente! O erro `generate is not a function` será resolvido.


