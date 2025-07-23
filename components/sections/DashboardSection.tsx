'use client'

import { useEffect, useState } from 'react'

interface DashboardStats {
  totalFlashcards: number
  studiedToday: number
  accuracy: number
  streak: number
  studyTime: number
  progress: number
}

export function DashboardSection() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFlashcards: 1249,
    studiedToday: 74,
    accuracy: 92,
    streak: 15,
    studyTime: 2,
    progress: 65
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false)
    }, 500)

    // Compatibilidad con código existente
    if (typeof window !== 'undefined') {
      console.log('📊 Dashboard cargado - Next.js')
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Resumen de tu progreso de aprendizaje</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Flashcards */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Flashcards</p>
              <p className="text-2xl font-bold text-white">{stats.totalFlashcards}</p>
              <p className="text-green-400 text-sm">+12 esta semana</p>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </div>

        {/* Estudiadas hoy */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Estudiadas hoy</p>
              <p className="text-2xl font-bold text-white">{stats.studiedToday}</p>
              <p className="text-blue-400 text-sm">Meta: 20</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>

        {/* Precisión */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Precisión</p>
              <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
              <p className="text-green-400 text-sm">+5% vs ayer</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>

        {/* Racha */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Racha de estudio</p>
              <p className="text-2xl font-bold text-white">{stats.streak} días</p>
              <p className="text-yellow-400 text-sm">¡Sigue así!</p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>

        {/* Tiempo de estudio */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tiempo de estudio</p>
              <p className="text-2xl font-bold text-white">{stats.studyTime}m</p>
              <p className="text-gray-400 text-sm">hoy</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>

        {/* Progreso total */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Progreso total</p>
              <p className="text-2xl font-bold text-white">{stats.progress}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Gráfico de actividad (placeholder) */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Actividad de Estudio</h3>
        <div className="h-48 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>Gráfico de actividad (próximamente)</p>
            <p className="text-sm mt-1">Migración a Next.js - Semana 1</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="btn-primary flex items-center justify-center space-x-2 py-4">
          <span className="text-xl">📚</span>
          <span>Estudiar Ahora</span>
        </button>
        
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <span className="text-xl">➕</span>
          <span>Crear Deck</span>
        </button>
        
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <span className="text-xl">📊</span>
          <span>Ver Estadísticas</span>
        </button>
        
        <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
          <span className="text-xl">⚙️</span>
          <span>Configuración</span>
        </button>
      </div>

      {/* Indicador de migración */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">🚀</span>
          <span className="text-blue-400 font-medium">Next.js Migration - Semana 1</span>
        </div>
        <p className="text-blue-300 text-sm mt-1">
          Dashboard migrado exitosamente a Next.js 13+ con App Router
        </p>
      </div>
    </div>
  )
}

