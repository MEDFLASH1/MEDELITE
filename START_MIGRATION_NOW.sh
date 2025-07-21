#!/bin/bash
# START_MIGRATION_NOW.sh

# --- Bienvenida y explicación ---
echo "🚀 Iniciando la migración incremental a TypeScript para MEDELITE..."
echo "Este script preparará el entorno sin modificar el código de producción."
echo ""

# --- Paso 1: Instalar dependencias de desarrollo ---
echo "📦 Instalando TypeScript y los tipos de Node.js..."
if npm install --save-dev typescript @types/node; then
    echo "✅ Dependencias instaladas correctamente."
else
    echo "❌ Error al instalar las dependencias. Por favor, revisa los errores de npm."
    exit 1
fi
echo ""

# --- Paso 2: Crear archivo de configuración de TypeScript ---
echo "📝 Creando archivo tsconfig.json con configuración base..."
cat << EOF > tsconfig.json
{
  "compilerOptions": {
    /* Base Options */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ESNext",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,

    /* If NOT transpiling with TypeScript */
    "module": "preserve",
    "noEmit": true,

    /* If your code runs in the DOM */
    "lib": ["es2022", "dom", "dom.iterable"],

    /* Paths for Monorepo-style imports */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.js", "**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
echo "✅ tsconfig.json creado."
echo ""

# --- Paso 3: Crear estructura de carpetas para el código refactorizado ---
echo "📁 Creando estructura de carpetas recomendada en 'src/'..."
mkdir -p src/components src/lib src/types
echo "✅ Estructura de carpetas creada: src/components, src/lib, src/types."
echo ""

# --- Paso 4: Ejecutar la primera verificación de tipos ---
echo "🔍 Ejecutando la primera comprobación de tipos con 'npx tsc'..."
echo "Esto analizará tus archivos .js en busca de errores de tipo comunes."
echo "Es normal que aparezcan errores. Serán la guía para la refactorización."
echo ""
npx tsc

echo ""
echo "🎉 ¡Preparación finalizada!"
echo "--------------------------------------------------"
echo "Próximos pasos recomendados:"
echo "1. Revisa los errores mostrados arriba. Son tu punto de partida."
echo "2. Empieza añadiendo '// @ts-check' al inicio de tus archivos .js más críticos."
echo "3. Comienza a migrar archivos de a uno a .ts y corrige los errores."
echo "4. Considera configurar Next.js como se sugiere en el plan."
echo "--------------------------------------------------"
