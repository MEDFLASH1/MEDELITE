#!/bin/bash

# Script para iniciar la migración a TypeScript + Next.js

echo "🚀 Iniciando migración a TypeScript..."

# Paso 1: Instalar TypeScript
echo "📦 Instalando TypeScript..."
npm install -D typescript @types/node

# Paso 2: Crear tsconfig.json
echo "⚙️ Creando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["**/*.js", "**/*.ts"],
  "exclude": ["node_modules", "dist", "build"]
}
EOF

# Paso 3: Agregar @ts-check al archivo principal
echo "✅ Agregando verificación de tipos a app-functional.js..."
if [ -f "app-functional.js" ]; then
    # Agregar @ts-check al inicio del archivo
    echo '// @ts-check' | cat - app-functional.js > temp && mv temp app-functional.js
    echo "✅ @ts-check agregado a app-functional.js"
fi

# Paso 4: Crear carpeta de tipos
echo "📁 Creando estructura de tipos..."
mkdir -p types
cat > types/index.d.ts << 'EOF'
// Tipos básicos para StudyingFlash

export interface Deck {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
}
EOF

# Paso 5: Agregar scripts a package.json
echo "📝 Actualizando package.json..."
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.typecheck:watch="tsc --noEmit --watch"

# Paso 6: Crear estructura de carpetas para modularización
echo "📂 Creando estructura modular..."
mkdir -p src/{services,utils,components,hooks}

# Paso 7: Ejecutar verificación de tipos
echo "🔍 Ejecutando verificación de tipos inicial..."
npm run typecheck

echo "
✅ ¡Migración iniciada exitosamente!

📋 Próximos pasos:
1. Revisa los errores de tipo en la terminal
2. Comienza a agregar tipos JSDoc a tus funciones
3. Modulariza gradualmente tu código en src/
4. Cuando estés listo, crea el proyecto Next.js

🎯 Comandos útiles:
- npm run typecheck       # Verificar tipos
- npm run typecheck:watch # Verificar tipos en tiempo real

📚 Guía completa: FRONTEND_MIGRATION_STEP_BY_STEP.md
"