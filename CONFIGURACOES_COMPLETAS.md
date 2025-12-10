# Configurações Completas dos Arquivos

Este documento contém o conteúdo completo dos 4 arquivos de configuração principais do projeto.

---

## 1. postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 2. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#031f5f",
          azure: "#00afee",
          pink: "#ca00ca",
          brown: "#c2af00",
          yellow: "#ccff00",
        },
      },
    },
  },
  plugins: [],
}
```

---

## 3. app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #000000;
  --foreground: #ffffff;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background-color: var(--background);
  color: var(--foreground);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  line-height: 1.5;
}

a {
  color: inherit;
  text-decoration: none;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(50px) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.15) translateY(-15px) rotate(5deg);
  }
  70% {
    transform: scale(0.95) translateY(5px) rotate(-2deg);
  }
  100% {
    transform: scale(1) translateY(0) rotate(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes rotate-in {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.8s ease-out forwards;
}

.animate-slide-in-left {
  animation: slide-in-left 0.5s ease-out forwards;
}

.animate-rotate-in {
  animation: rotate-in 0.6s ease-out forwards;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
```

---

## 4. next.config.js

```javascript
// Bundle Analyzer temporariamente desabilitado para resolver erro "generate is not a function"
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix para erro "generate is not a function" no build local
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Isso resolve 99% dos erros de tailwindcss com Turbopack
  transpilePackages: ["tailwindcss"],
  // Garantir que CSS seja compilado corretamente em produção
  swcMinify: true,
  // Otimizações de produção
  compress: true,
  // Garantir que font-size seja consistente entre dev e produção
  // experimental: {
  //   optimizeCss: true, // Removido temporariamente para resolver erro de build
  // },
  // Otimizações de bundle
  productionBrowserSourceMaps: false,
  // Garantir que CSS seja consistente
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Reduzir tamanho do bundle
  // webpack config comentado temporariamente para resolver erro do PostCSS
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // Otimizações para cliente
  //     config.optimization = {
  //       ...config.optimization,
  //       moduleIds: 'deterministic',
  //       runtimeChunk: 'single',
  //       splitChunks: {
  //         chunks: 'all',
  //         cacheGroups: {
  //           default: false,
  //           vendors: false,
  //           // Vendor chunk separado
  //           vendor: {
  //             name: 'vendor',
  //             chunks: 'all',
  //             test: /node_modules/,
  //             priority: 20,
  //           },
  //           // Common chunk
  //           common: {
  //             name: 'common',
  //             minChunks: 2,
  //             chunks: 'async',
  //             priority: 10,
  //             reuseExistingChunk: true,
  //             enforce: true,
  //           },
  //         },
  //       };
  //     }
  //   }
  //   return config;
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
// module.exports = withBundleAnalyzer(nextConfig)
```

---

## Observações Importantes

⚠️ **ATENÇÃO**: O arquivo `tailwind.config.js` pode ter conflitos de merge do Git. Se você ver marcadores como `<<<<<<< HEAD`, `=======`, `>>>>>>>`, remova-os manualmente e mantenha apenas o conteúdo correto mostrado acima.

---

**Data de criação**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

