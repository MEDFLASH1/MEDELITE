'use client'

import { useEffect, useState } from 'react'
import { StudyingFlashApp } from '@/components/StudyingFlashApp'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Inicialización de la aplicación
    setIsLoaded(true)
    
    // Configuración global para compatibilidad
    if (typeof window !== 'undefined') {
      window.NEXT_JS_MIGRATION = true
      console.log('🚀 StudyingFlash Next.js App iniciada')
    }
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Cargando StudyingFlash...</h2>
          <p className="text-gray-400 mt-2">Preparando tu experiencia de aprendizaje</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <StudyingFlashApp />
    </main>
  )
}

