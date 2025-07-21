#!/bin/bash

# Script para iniciar la migración a TypeScript + Next.js

echo "🚀 Iniciando migración a TypeScript para StudyingFlash..."
echo "Este script preparará el entorno sin modificar el código de producción."
echo ""

# Paso 1: Instalar TypeScript
echo "📦 Instalando TypeScript y tipos necesarios..."
if npm install -D typescript @types/node @types/react @types/react-dom; then
    echo "✅ Dependencias instaladas correctamente."
else
    echo "❌ Error al instalar las dependencias. Por favor, revisa los errores de npm."
    exit 1
fi

# Paso 2: Crear tsconfig.json
echo "⚙️ Creando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    /* Base Options */
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "checkJs": true,
    "jsx": "react-jsx",
    "noEmit": true,
    
    /* Module Resolution */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    
    /* Strictness - Empezar permisivo */
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.js", "**/*.ts", "**/*.tsx", "**/*.jsx"],
  "exclude": ["node_modules", "dist", "build"]
}
EOF
echo "✅ tsconfig.json creado con configuración permisiva inicial"

# Paso 3: Agregar @ts-check al archivo principal
echo "✅ Agregando verificación de tipos a app-functional.js..."
if [ -f "app-functional.js" ]; then
    # Solo agregar si no existe ya
    if ! grep -q "// @ts-check" app-functional.js; then
        echo '// @ts-check' | cat - app-functional.js > temp && mv temp app-functional.js
        echo "✅ @ts-check agregado a app-functional.js"
    else
        echo "✅ @ts-check ya existe en app-functional.js"
    fi
fi

# Paso 4: Crear carpeta de tipos
echo "📁 Creando estructura de tipos..."
mkdir -p types

# Paso 5: Agregar scripts a package.json
echo "📝 Actualizando package.json..."
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.typecheck:watch="tsc --noEmit --watch"

# Paso 6: Crear estructura de carpetas para modularización
echo "📂 Creando estructura modular..."
mkdir -p src/{services,utils,components,hooks,lib,types}

# Paso 7: Ejecutar verificación de tipos
echo "🔍 Ejecutando verificación de tipos inicial..."
echo "Es normal que aparezcan errores. Serán la guía para la refactorización."
echo ""
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

📚 Guías disponibles:
- FRONTEND_MIGRATION_STEP_BY_STEP.md
- MIGRATION_GUIDE_NEXTJS.md
"
