'use client'

export function CreateSection() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Crear</h1>
        <p className="text-gray-400">Crea nuevos decks y flashcards</p>
      </div>

      <div className="card text-center py-16">
        <div className="text-6xl mb-4">➕</div>
        <h3 className="text-2xl font-semibold text-white mb-4">Sección de Creación</h3>
        <p className="text-gray-400 mb-6">
          Esta sección será desarrollada en la Semana 5 del plan de migración
        </p>
        <div className="inline-flex items-center space-x-2 bg-yellow-900/20 border border-yellow-700 rounded-lg px-4 py-2">
          <span className="text-yellow-400">⏳</span>
          <span className="text-yellow-400 text-sm">Próximamente - Semana 5</span>
        </div>
      </div>
    </div>
  )
}

