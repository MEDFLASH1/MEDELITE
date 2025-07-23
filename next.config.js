/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Durante la migración, permitir algunos errores de TypeScript
    ignoreBuildErrors: false,
  },
  eslint: {
    // Durante la migración, permitir algunos warnings de ESLint
    ignoreDuringBuilds: false,
  },
  // Configuración para PWA (preparación futura)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

