'use client'

export function StudySection() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Estudiar</h1>
        <p className="text-gray-400">Sesiones de estudio con repetición espaciada</p>
      </div>

      <div className="card text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-semibold text-white mb-4">Sección de Estudio</h3>
        <p className="text-gray-400 mb-6">
          Esta sección será desarrollada en la Semana 4 del plan de migración
        </p>
        <div className="inline-flex items-center space-x-2 bg-yellow-900/20 border border-yellow-700 rounded-lg px-4 py-2">
          <span className="text-yellow-400">⏳</span>
          <span className="text-yellow-400 text-sm">Próximamente - Semana 4</span>
        </div>
      </div>
    </div>
  )
}

