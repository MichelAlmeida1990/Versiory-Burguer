/**
 * Script para adicionar imagens do Pixabay aos produtos do Tom & Jerry
 * 
 * IMPORTANTE: Este script requer:
 * 1. Node.js instalado
 * 2. Executar: npm install node-fetch form-data @supabase/supabase-js
 * 3. Configurar variáveis de ambiente no arquivo .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    - SUPABASE_SERVICE_ROLE_KEY (para acesso ao storage)
 * 
 * Como usar:
 * node scripts/adicionar-imagens-pixabay.js
 */

// URLs de imagens do Pixabay (gratuitas, uso comercial permitido)
// Estas são URLs diretas que funcionam bem para hotlinking
const imagensProdutos = {
  'Alho e oleo': 'https://cdn.pixabay.com/photo/2017/12/05/20/09/pizza-3000285_640.jpg',
  'Americana 1': 'https://cdn.pixabay.com/photo/2017/09/22/19/15/pizza-2776188_640.jpg',
  'Americana 2': 'https://cdn.pixabay.com/photo/2016/04/21/22/50/pizza-1344720_640.jpg',
  'Atum': 'https://cdn.pixabay.com/photo/2017/02/15/10/57/pizza-2068272_640.jpg',
  'Atumcatu': 'https://cdn.pixabay.com/photo/2018/03/06/13/47/food-3203445_640.jpg',
  'Atumssarela': 'https://cdn.pixabay.com/photo/2016/02/19/11/25/pizza-1209748_640.jpg',
  'Atum solido': 'https://cdn.pixabay.com/photo/2017/11/12/16/50/pizza-2944044_640.jpg',
  'Bacon': 'https://cdn.pixabay.com/photo/2015/04/07/19/49/pizza-712667_640.jpg',
  'Bahiana': 'https://cdn.pixabay.com/photo/2018/03/07/18/42/pizza-3205235_640.jpg',
  'Bahiacatu': 'https://cdn.pixabay.com/photo/2016/03/05/19/02/pizza-1239077_640.jpg',
};

console.log('📸 Script para adicionar imagens do Pixabay aos produtos');
console.log('');
console.log('⚠️  NOTA: Este script usa URLs diretas do Pixabay.');
console.log('   As imagens serão carregadas diretamente do CDN do Pixabay.');
console.log('   Se preferir fazer upload para o Supabase Storage, use o script SQL.');
console.log('');
console.log('💡 Execute o script SQL: supabase/ADICIONAR_IMAGENS_PIXABAY_TOM_JERRY.sql');
console.log('   Ele é mais simples e atualiza diretamente no banco de dados.');
console.log('');

