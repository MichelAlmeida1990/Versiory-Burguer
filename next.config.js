/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isso resolve 99% dos erros de tailwindcss com Turbopack
  transpilePackages: ["tailwindcss"],
  // Otimiza imports de pacotes grandes (reduz bundle)
  optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
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