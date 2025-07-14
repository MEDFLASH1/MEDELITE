#!/bin/bash

# Development Helper Script
# Ayuda a detectar y prevenir problemas comunes durante el desarrollo

echo "🔧 StudyingFlash - Development Helper"
echo "===================================="

# Function to check file timestamps
check_file_changes() {
    echo "📁 Verificando archivos críticos..."
    
    critical_files=("index.html" "app-functional.js" "dashboard-enhanced.js" "health-monitor.js" "visual-dashboard.js")
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            timestamp=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
            human_time=$(date -d @"$timestamp" 2>/dev/null || date -r "$timestamp" 2>/dev/null)
            echo "  ✅ $file - Modificado: $human_time"
        else
            echo "  ❌ $file - No encontrado"
        fi
    done
}

# Function to check server status
check_server() {
    echo "🌐 Verificando servidor..."
    
    if curl -s http://localhost:8000 > /dev/null; then
        echo "  ✅ Servidor funcionando en http://localhost:8000"
    else
        echo "  ❌ Servidor no responde"
        echo "  💡 Ejecuta: python3 -m http.server 8000"
    fi
}

# Function to validate HTML syntax
validate_html() {
    echo "🔍 Validando sintaxis HTML..."
    
    if command -v tidy >/dev/null 2>&1; then
        if tidy -q -e index.html 2>/dev/null; then
            echo "  ✅ HTML válido"
        else
            echo "  ⚠️ Posibles problemas en HTML detectados"
        fi
    else
        echo "  ℹ️ tidy no instalado, saltando validación HTML"
    fi
}

# Function to check for common issues
check_common_issues() {
    echo "🕵️ Buscando problemas comunes..."
    
    # Check for console.log statements
    log_count=$(grep -r "console.log" *.js 2>/dev/null | wc -l)
    echo "  📊 Console.log statements: $log_count"
    
    # Check for event listener conflicts
    if grep -q "addEventListener.*click" *.js 2>/dev/null; then
        echo "  ⚠️ Múltiples event listeners detectados - verificar conflictos"
    fi
    
    # Check for missing data-section attributes
    if grep -q "data-section" index.html; then
        echo "  ✅ Atributos data-section encontrados"
    else
        echo "  ❌ No se encontraron atributos data-section"
    fi
}

# Function to bust cache
bust_cache() {
    echo "🔄 Limpiando cache..."
    
    # Update file timestamps to force browser refresh
    touch index.html app-functional.js dashboard-enhanced.js health-monitor.js visual-dashboard.js
    
    echo "  ✅ Timestamps actualizados"
    echo "  💡 Presiona Ctrl+Shift+R en el navegador para limpiar cache"
}

# Function to create backup
create_backup() {
    echo "💾 Creando backup..."
    
    backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    cp index.html app-functional.js dashboard-enhanced.js health-monitor.js visual-dashboard.js "$backup_dir/" 2>/dev/null
    
    echo "  ✅ Backup creado en: $backup_dir"
}

# Function to show help
show_help() {
    echo "Comandos disponibles:"
    echo "  check    - Verificar estado general"
    echo "  server   - Verificar servidor"
    echo "  html     - Validar HTML"
    echo "  issues   - Buscar problemas comunes"
    echo "  cache    - Limpiar cache"
    echo "  backup   - Crear backup"
    echo "  monitor  - Iniciar monitoreo en tiempo real"
    echo "  help     - Mostrar esta ayuda"
}

# Function to start monitoring
start_monitoring() {
    echo "👀 Iniciando monitoreo en tiempo real..."
    echo "Presiona Ctrl+C para detener"
    
    while true; do
        clear
        echo "🔄 Monitoreo activo - $(date)"
        echo "=========================="
        check_file_changes
        echo ""
        check_server
        echo ""
        check_common_issues
        echo ""
        echo "Próxima verificación en 10 segundos..."
        sleep 10
    done
}

# Main script logic
case "${1:-check}" in
    "check")
        check_file_changes
        echo ""
        check_server
        ;;
    "server")
        check_server
        ;;
    "html")
        validate_html
        ;;
    "issues")
        check_common_issues
        ;;
    "cache")
        bust_cache
        ;;
    "backup")
        create_backup
        ;;
    "monitor")
        start_monitoring
        ;;
    "help")
        show_help
        ;;
    *)
        echo "❓ Comando desconocido: $1"
        show_help
        ;;
esac

echo ""
echo "🎯 Tip: Usa './dev-helper.sh help' para ver todos los comandos"
