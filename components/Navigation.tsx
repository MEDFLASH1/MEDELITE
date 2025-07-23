'use client'

import { useState } from 'react'

type SectionType = 'dashboard' | 'estudiar' | 'crear' | 'gestionar' | 'ranking'

interface NavigationProps {
  currentSection: SectionType
  onSectionChange: (section: SectionType) => void
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'estudiar', label: 'Estudiar', icon: '📚' },
  { id: 'crear', label: 'Crear', icon: '➕' },
  { id: 'gestionar', label: 'Gestionar', icon: '⚙️' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
] as const

export function Navigation({ currentSection, onSectionChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSectionClick = (sectionId: SectionType) => {
    onSectionChange(sectionId)
    setIsMobileMenuOpen(false)
    
    // Compatibilidad con código existente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('section-change', {
        detail: { section: sectionId }
      }))
    }
  }

  return (
    <nav className="flex items-center space-x-1">
      {/* Navegación desktop */}
      <div className="hidden md:flex space-x-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSectionClick(item.id as SectionType)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${currentSection === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Botón menú móvil */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Menú móvil desplegable */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 right-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id as SectionType)}
                className={`
                  flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium transition-colors duration-200
                  ${currentSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Indicador de usuario (placeholder) */}
      <div className="ml-4 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-sm">👤</span>
        </div>
        <span className="hidden sm:block text-sm text-gray-300">Usuario</span>
      </div>
    </nav>
  )
}

