'use client'

export function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* StudyingFlash */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">StudyingFlash</h3>
            <p className="text-gray-400 mb-4">
              Plataforma de flashcards inteligentes con algoritmos de repetición espaciada 
              para optimizar tu aprendizaje. Ahora migrado a Next.js para mejor rendimiento.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-green-600 text-white px-2 py-1 rounded">Next.js</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded">TypeScript</span>
              <span className="bg-purple-600 text-white px-2 py-1 rounded">React</span>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Explorar</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Estudiar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ranking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gestionar</a></li>
            </ul>
          </div>

          {/* Acerca de */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Acerca de</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Migración Next.js</a></li>
            </ul>
          </div>
        </div>

        {/* Síguenos */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">Síguenos:</span>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-xl">💼</span>
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2025 StudyingFlash. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Migrado a Next.js 13+ - Semana 1 completada por Agente 4
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

