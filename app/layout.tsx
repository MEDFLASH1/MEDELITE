import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyingFlash - Flashcards Inteligentes',
  description: 'Plataforma de flashcards con algoritmos de repetición espaciada para optimizar tu aprendizaje',
  keywords: 'flashcards, estudio, aprendizaje, repetición espaciada, educación',
  authors: [{ name: 'StudyingFlash Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1a1a1a',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-gray-900 text-white min-h-screen">
        <div id="root">
          {children}
        </div>
        {/* Scripts de migración gradual */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Configuración global para compatibilidad con código existente
              window.NEXT_JS_MIGRATION = true;
              window.APP_VERSION = '2.0.0-nextjs';
            `,
          }}
        />
      </body>
    </html>
  )
}

