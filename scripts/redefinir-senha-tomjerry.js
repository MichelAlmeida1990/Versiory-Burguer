/**
 * Script para redefinir a senha do admin Tom & Jerry
 * 
 * USO:
 * 1. Crie um arquivo .env na raiz do projeto com:
 *    SUPABASE_URL=sua_url_do_supabase
 *    SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
 * 
 * 2. Execute: node scripts/redefinir-senha-tomjerry.js
 * 
 * ⚠️ IMPORTANTE: 
 * - Use a SERVICE_ROLE_KEY (não a ANON_KEY)
 * - Esta chave tem acesso total - guarde com segurança
 * - Não commite este arquivo com a chave no código
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ID do usuário Tom & Jerry
const TOM_JERRY_USER_ID = 'cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa';
const TOM_JERRY_EMAIL = 'tomjerry@gmail.com';

async function redefinirSenha() {
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL não encontrado');
    console.log('💡 Adicione no arquivo .env.local:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrado');
    console.log('💡 Adicione no arquivo .env.local:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key');
    console.log('');
    console.log('⚠️  ATENÇÃO: Use a SERVICE_ROLE_KEY (não a ANON_KEY)');
    console.log('   Você encontra ela em: Supabase Dashboard > Settings > API > service_role (secret)');
    process.exit(1);
  }

  // Criar cliente admin
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Solicitar nova senha
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('');
  console.log('🔐 Redefinir Senha do Admin Tom & Jerry');
  console.log('========================================');
  console.log(`Email: ${TOM_JERRY_EMAIL}`);
  console.log(`ID: ${TOM_JERRY_USER_ID}`);
  console.log('');

  rl.question('Digite a nova senha: ', async (novaSenha) => {
    if (!novaSenha || novaSenha.length < 6) {
      console.error('❌ Erro: Senha deve ter pelo menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    rl.question('Confirme a nova senha: ', async (confirmacao) => {
      if (novaSenha !== confirmacao) {
        console.error('❌ Erro: As senhas não coincidem');
        rl.close();
        process.exit(1);
      }

      try {
        console.log('');
        console.log('⏳ Redefinindo senha...');

        // Redefinir senha usando Admin API
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          TOM_JERRY_USER_ID,
          { password: novaSenha }
        );

        if (error) {
          console.error('❌ Erro ao redefinir senha:', error.message);
          rl.close();
          process.exit(1);
        }

        console.log('');
        console.log('✅ Senha redefinida com sucesso!');
        console.log('');
        console.log('📝 Próximos passos:');
        console.log('   1. Acesse: http://seu-dominio.com/admin/login');
        console.log(`   2. Email: ${TOM_JERRY_EMAIL}`);
        console.log('   3. Senha: (a senha que você acabou de definir)');
        console.log('');

        rl.close();
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
        rl.close();
        process.exit(1);
      }
    });
  });
}

// Executar
redefinirSenha().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

