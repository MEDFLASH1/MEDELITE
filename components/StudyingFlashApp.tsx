'use client'

import { useEffect, useState } from 'react'
import { DashboardSection } from './sections/DashboardSection'
import { StudySection } from './sections/StudySection'
import { CreateSection } from './sections/CreateSection'
import { ManageSection } from './sections/ManageSection'
import { RankingSection } from './sections/RankingSection'
import { Navigation } from './Navigation'
import { Footer } from './Footer'

type SectionType = 'dashboard' | 'estudiar' | 'crear' | 'gestionar' | 'ranking'

export function StudyingFlashApp() {
  const [currentSection, setCurrentSection] = useState<SectionType>('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Inicialización de la aplicación
    console.log('🎯 StudyingFlash App - Inicializando...')
    
    // Configurar compatibilidad con código existente
    if (typeof window !== 'undefined') {
      // Exponer funciones globales para compatibilidad
      window.showSection = (sectionName: string) => {
        setCurrentSection(sectionName as SectionType)
      }
      
      // Configuración global
      window.NEXT_JS_MIGRATION = true
      window.APP_VERSION = '2.0.0-nextjs'
      
      // Simular carga de datos iniciales
      setTimeout(() => {
        setIsLoading(false)
        console.log('✅ StudyingFlash App - Inicialización completa')
      }, 1000)
    }
  }, [])

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'estudiar':
        return <StudySection />
      case 'crear':
        return <CreateSection />
      case 'gestionar':
        return <ManageSection />
      case 'ranking':
        return <RankingSection />
      default:
        return <DashboardSection />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Cargando StudyingFlash...</h2>
          <p className="text-gray-400 mt-2">Preparando tu experiencia de aprendizaje</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header con navegación */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-400">StudyingFlash</h1>
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                Next.js
              </span>
            </div>
            <Navigation 
              currentSection={currentSection} 
              onSectionChange={setCurrentSection} 
            />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <div className="animate-fade-in">
          {renderCurrentSection()}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Declaraciones globales para compatibilidad
declare global {
  interface Window {
    showSection: (sectionName: string) => void
    NEXT_JS_MIGRATION: boolean
    APP_VERSION: string
  }
}

