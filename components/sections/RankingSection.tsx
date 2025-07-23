'use client'

export function RankingSection() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ranking</h1>
        <p className="text-gray-400">Compite con otros usuarios</p>
      </div>

      <div className="card text-center py-16">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-2xl font-semibold text-white mb-4">Sección de Ranking</h3>
        <p className="text-gray-400 mb-6">
          Esta sección será desarrollada en semanas posteriores del plan de migración
        </p>
        <div className="inline-flex items-center space-x-2 bg-yellow-900/20 border border-yellow-700 rounded-lg px-4 py-2">
          <span className="text-yellow-400">⏳</span>
          <span className="text-yellow-400 text-sm">Próximamente</span>
        </div>
      </div>
    </div>
  )
}

