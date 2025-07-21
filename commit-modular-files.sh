#!/bin/bash

# Script para subir los archivos modulares restantes
echo "🚀 Subiendo archivos modulares de StudyingFlash..."

# Verificar que estamos en la rama correcta
echo "📍 Rama actual: $(git branch --show-current)"

# Crear los archivos si no existen (backup)
echo "📁 Verificando archivos..."

# Forzar adición de todos los archivos modulares
echo "📋 Agregando archivos al staging..."
git add -f components/
git add -f sections/  
git add -f index-modular.html
git add -f README-modular.md

# Verificar que se agregaron
echo "📊 Estado de Git:"
git status

# Hacer commit de los componentes HTML
echo "💾 Creando commit de componentes HTML..."
git commit -m "feat: add modular HTML components and sections

- Add independent navigation component (components/navigation.html)
- Create modular sections: dashboard, estudiar, crear, gestionar, ranking  
- Add new modular index page (index-modular.html)
- Include complete documentation (README-modular.md)

Features:
- Independent section editing
- Reusable navigation component
- Improved maintainability
- Dynamic component loading
- Enhanced user experience

Architecture:
- Modular SPA structure
- Component-based design
- Lazy loading capabilities
- Debug utilities included"

# Push al repositorio
echo "🚀 Subiendo a repositorio..."
git push origin cursor/dividir-frontend-en-secciones-editables-4b43

echo "✅ ¡Listo! Archivos modulares subidos al repositorio"
echo "🔗 Revisa tu repositorio: https://github.com/MEDFLASH1/MEDELITE"