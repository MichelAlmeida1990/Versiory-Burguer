const fs = require('fs');
const path = require('path');

// Mapeamento de imagens (você pode ajustar conforme necessário)
// Este script organiza as imagens em pastas apropriadas
const imageMapping = {
  // Produtos (exemplos - ajuste conforme suas imagens)
  produtos: [
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_3b71f701.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_4ab1b542.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_5cff64d0.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_66a61847.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_9559e521.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_970c1913.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_9a319a20.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_a4c49307.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_bfb80ad5.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_c68c2d26.jpg',
    'Imagem do WhatsApp de 2025-22 à(s) 18.37.30_cb690340.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_cefb6531.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_e4c3a3ae.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_e9600334.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_ec9d9f9d.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_f3ba7e99.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_9c9eb711.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_b17dd369.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_d3c8433c.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_ea199d35.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_f24ded21.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_f4d7d328.jpg',
  ],
  // Categorias
  categorias: [
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.29_3f3b11f1.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_049befce.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_0a041da7.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_35366cce.jpg',
  ],
  // Banners
  banners: [
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.52_12725434.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.52_ff444b45.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 18.42.53_29835af0.jpg',
    'Imagem do WhatsApp de 2025-10-22 à(s) 19.02.54_7f00e9e2.jpg',
  ],
};

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public', 'images');

// Criar diretórios se não existirem
Object.keys(imageMapping).forEach(folder => {
  const folderPath = path.join(publicDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// Mover imagens
let movedCount = 0;
Object.entries(imageMapping).forEach(([folder, files]) => {
  files.forEach((file, index) => {
    const sourcePath = path.join(rootDir, file);
    const destPath = path.join(publicDir, folder, file);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.renameSync(sourcePath, destPath);
        movedCount++;
        console.log(`✓ Movido: ${file} → ${folder}/`);
      } catch (error) {
        console.error(`✗ Erro ao mover ${file}:`, error.message);
      }
    } else {
      console.warn(`⚠ Arquivo não encontrado: ${file}`);
    }
  });
});

console.log(`\n✅ Organização concluída! ${movedCount} imagens movidas.`);
console.log('\n📝 Próximos passos:');
console.log('1. Revise as imagens nas pastas e renomeie conforme necessário');
console.log('2. Atualize os nomes dos arquivos para serem mais descritivos');
console.log('3. Configure as URLs das imagens no banco de dados');

