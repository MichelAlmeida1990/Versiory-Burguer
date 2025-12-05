/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix para Node.js 22 + Next.js 14.2.18
  generateBuildId: async () => {
    return null; // Usa o buildId padrão do Next.js
  },
  experimental: {
    // Força o Turbopack a resolver corretamente os módulos do PostCSS
    turbotrace: {
      logLevel: "bug",
    },
  },
  // Isso resolve 99% dos erros de tailwindcss com Turbopack
  transpilePackages: ["tailwindcss"],
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
