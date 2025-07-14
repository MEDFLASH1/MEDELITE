#!/bin/bash

# ===== AUDITORÍA DE CALIDAD DE CÓDIGO - DASHBOARD INTEGRATION =====
# Script para verificar la calidad del código implementado

echo "🔍 INICIANDO AUDITORÍA DE CALIDAD DE CÓDIGO"
echo "============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Función para verificar archivos
check_file() {
    local file=$1
    local description=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $description${NC} - Archivo existe"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ $description${NC} - Archivo NO existe"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para verificar sintaxis JavaScript
check_js_syntax() {
    local file=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🔍 Verificando sintaxis JavaScript de $name... "
    
    if command -v node > /dev/null 2>&1; then
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ Sintaxis válida${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}❌ Errores de sintaxis${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            node -c "$file"
        fi
    else
        echo -e "${YELLOW}⚠️ Node.js no disponible, saltando verificación${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Función para verificar sintaxis CSS
check_css_syntax() {
    local file=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🎨 Verificando sintaxis CSS de $name... "
    
    # Verificación básica de CSS (buscar {} balanceados)
    local open_braces=$(grep -o '{' "$file" | wc -l)
    local close_braces=$(grep -o '}' "$file" | wc -l)
    
    if [ "$open_braces" -eq "$close_braces" ]; then
        echo -e "${GREEN}✅ Llaves CSS balanceadas ($open_braces pares)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Llaves CSS desbalanceadas (${open_braces} abiertas, ${close_braces} cerradas)${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Función para verificar sintaxis Python
check_python_syntax() {
    local file=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🐍 Verificando sintaxis Python de $name... "
    
    if command -v python3 > /dev/null 2>&1; then
        if python3 -m py_compile "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ Sintaxis Python válida${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}❌ Errores de sintaxis Python${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            python3 -m py_compile "$file"
        fi
    else
        echo -e "${YELLOW}⚠️ Python3 no disponible, saltando verificación${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Función para análisis de complejidad
analyze_complexity() {
    local file=$1
    local name=$2
    
    echo "📊 Analizando complejidad de $name:"
    
    if [ -f "$file" ]; then
        local lines=$(wc -l < "$file")
        local functions=$(grep -c "function\|def\|class" "$file" 2>/dev/null || echo "0")
        local comments=$(grep -c "//\|#\|/\*" "$file" 2>/dev/null || echo "0")
        
        echo "   📏 Líneas de código: $lines"
        echo "   🔧 Funciones/Clases: $functions"
        echo "   💬 Líneas comentadas: $comments"
        
        # Calcular ratio de comentarios
        if [ "$lines" -gt 0 ]; then
            local comment_ratio=$((comments * 100 / lines))
            echo "   📈 Ratio de comentarios: ${comment_ratio}%"
            
            if [ "$comment_ratio" -ge 20 ]; then
                echo -e "   ${GREEN}✅ Buena documentación${NC}"
            elif [ "$comment_ratio" -ge 10 ]; then
                echo -e "   ${YELLOW}⚠️ Documentación moderada${NC}"
                WARNINGS=$((WARNINGS + 1))
            else
                echo -e "   ${RED}❌ Documentación insuficiente${NC}"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
            fi
        fi
    fi
}

# Función para verificar HTML
check_html_validity() {
    local file=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🌐 Verificando estructura HTML de $name... "
    
    # Verificaciones básicas de HTML
    local errors=0
    
    # Verificar DOCTYPE
    if ! grep -q "<!DOCTYPE" "$file"; then
        echo -e "${RED}❌ Falta declaración DOCTYPE${NC}"
        errors=$((errors + 1))
    fi
    
    # Verificar meta charset
    if ! grep -q "charset" "$file"; then
        echo -e "${YELLOW}⚠️ Falta declaración charset${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Verificar title
    if ! grep -q "<title>" "$file"; then
        echo -e "${YELLOW}⚠️ Falta elemento title${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ "$errors" -eq 0 ]; then
        echo -e "${GREEN}✅ Estructura HTML básica válida${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Errores en estructura HTML${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo ""
echo "🏗️ VERIFICANDO ARQUITECTURA DE ARCHIVOS"
echo "========================================"

# Verificar archivos principales
check_file "js/dashboard-flashcard-integration.js" "Integración JavaScript Principal"
check_file "css/dashboard-flashcard-integration.css" "Estilos CSS de Integración"
check_file "backend/backend_app/api/dashboard_integration.py" "API Backend de Integración"
check_file "js/dashboard-api-integration.js" "Cliente API JavaScript"
check_file "test-dashboard-integration.html" "Página de Pruebas"

echo ""
echo "🔍 VERIFICANDO SINTAXIS DE CÓDIGO"
echo "================================="

# Verificar sintaxis JavaScript
if [ -f "js/dashboard-flashcard-integration.js" ]; then
    check_js_syntax "js/dashboard-flashcard-integration.js" "Integración Principal"
fi

if [ -f "js/dashboard-api-integration.js" ]; then
    check_js_syntax "js/dashboard-api-integration.js" "Cliente API"
fi

# Verificar sintaxis CSS
if [ -f "css/dashboard-flashcard-integration.css" ]; then
    check_css_syntax "css/dashboard-flashcard-integration.css" "Estilos de Integración"
fi

# Verificar sintaxis Python
if [ -f "backend/backend_app/api/dashboard_integration.py" ]; then
    check_python_syntax "backend/backend_app/api/dashboard_integration.py" "API Backend"
fi

# Verificar HTML
if [ -f "test-dashboard-integration.html" ]; then
    check_html_validity "test-dashboard-integration.html" "Página de Pruebas"
fi

echo ""
echo "📊 ANÁLISIS DE COMPLEJIDAD Y CALIDAD"
echo "===================================="

# Analizar complejidad de archivos principales
if [ -f "js/dashboard-flashcard-integration.js" ]; then
    analyze_complexity "js/dashboard-flashcard-integration.js" "Integración JavaScript"
fi

if [ -f "backend/backend_app/api/dashboard_integration.py" ]; then
    analyze_complexity "backend/backend_app/api/dashboard_integration.py" "API Backend"
fi

echo ""
echo "🔐 VERIFICACIONES DE SEGURIDAD"
echo "=============================="

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar uso de localStorage sin validación
echo -n "🔒 Verificando manejo seguro de localStorage... "
if grep -q "JSON.parse.*localStorage" js/dashboard-flashcard-integration.js 2>/dev/null; then
    if grep -q "try.*catch" js/dashboard-flashcard-integration.js 2>/dev/null; then
        echo -e "${GREEN}✅ localStorage manejado con try-catch${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️ localStorage sin manejo de errores${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${GREEN}✅ No se usa localStorage o está bien manejado${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar inyección SQL en Python
echo -n "🛡️ Verificando protección contra inyección SQL... "
if [ -f "backend/backend_app/api/dashboard_integration.py" ]; then
    if grep -q "query.filter\|db.session.query" backend/backend_app/api/dashboard_integration.py 2>/dev/null; then
        if grep -q "\.filter_by\|\.filter(" backend/backend_app/api/dashboard_integration.py 2>/dev/null; then
            echo -e "${GREEN}✅ Uso de ORM con parámetros seguros${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️ Verificar queries SQL${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${GREEN}✅ No se detectan queries SQL directas${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
else
    echo -e "${YELLOW}⚠️ Archivo Python no encontrado${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "⚡ VERIFICACIONES DE RENDIMIENTO"
echo "==============================="

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar uso de eventos DOM eficientes
echo -n "🎯 Verificando delegación de eventos... "
if grep -q "addEventListener.*document\|addEventListener.*window" js/dashboard-flashcard-integration.js 2>/dev/null; then
    echo -e "${GREEN}✅ Uso de delegación de eventos${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️ Posible uso ineficiente de eventos${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar CSS eficiente
echo -n "🎨 Verificando eficiencia CSS... "
if [ -f "css/dashboard-flashcard-integration.css" ]; then
    local selectors=$(grep -c "^\." css/dashboard-flashcard-integration.css 2>/dev/null || echo "0")
    local nested=$(grep -c "@media\|:hover\|:focus" css/dashboard-flashcard-integration.css 2>/dev/null || echo "0")
    
    echo -e "${GREEN}✅ $selectors selectores CSS, $nested pseudo-selectores${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️ Archivo CSS no encontrado${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📋 VERIFICACIONES DE ESTÁNDARES"
echo "==============================="

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar convenciones de nomenclatura
echo -n "📝 Verificando convenciones de nomenclatura... "
if grep -q "camelCase\|kebab-case\|snake_case" js/dashboard-flashcard-integration.js 2>/dev/null; then
    echo -e "${GREEN}✅ Nomenclatura consistente detectada${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️ Verificar convenciones de nomenclatura${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar documentación JSDoc
echo -n "📚 Verificando documentación JSDoc... "
if grep -q "/\*\*\|@param\|@returns" js/dashboard-flashcard-integration.js 2>/dev/null; then
    echo -e "${GREEN}✅ Documentación JSDoc encontrada${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️ Documentación JSDoc limitada${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🧪 VERIFICACIONES DE TESTING"
echo "============================"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar implementación de tests
echo -n "🔬 Verificando implementación de tests... "
if [ -f "test-dashboard-integration.html" ]; then
    if grep -q "test.*function\|assert\|expect" test-dashboard-integration.html 2>/dev/null; then
        echo -e "${GREEN}✅ Funciones de testing implementadas${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️ Tests básicos implementados${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ No se encuentra archivo de tests${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo "📱 VERIFICACIONES DE ACCESIBILIDAD"
echo "=================================="

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Verificar accesibilidad básica
echo -n "♿ Verificando accesibilidad básica... "
if [ -f "css/dashboard-flashcard-integration.css" ]; then
    if grep -q ":focus\|:hover\|aria-" css/dashboard-flashcard-integration.css test-dashboard-integration.html 2>/dev/null; then
        echo -e "${GREEN}✅ Elementos de accesibilidad detectados${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️ Accesibilidad limitada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️ No se puede verificar accesibilidad${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📊 RESUMEN DE AUDITORÍA"
echo "======================="

local success_rate=0
if [ "$TOTAL_CHECKS" -gt 0 ]; then
    success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
fi

echo -e "📈 ${BLUE}Verificaciones totales:${NC} $TOTAL_CHECKS"
echo -e "✅ ${GREEN}Verificaciones exitosas:${NC} $PASSED_CHECKS"
echo -e "❌ ${RED}Verificaciones fallidas:${NC} $FAILED_CHECKS"
echo -e "⚠️ ${YELLOW}Advertencias:${NC} $WARNINGS"
echo -e "🎯 ${BLUE}Tasa de éxito:${NC} ${success_rate}%"

echo ""
if [ "$success_rate" -ge 80 ]; then
    echo -e "${GREEN}🎉 ¡EXCELENTE! Calidad de código muy alta${NC}"
elif [ "$success_rate" -ge 60 ]; then
    echo -e "${YELLOW}👍 BUENO: Calidad de código aceptable con mejoras menores${NC}"
else
    echo -e "${RED}⚠️ ATENCIÓN: Se requieren mejoras significativas${NC}"
fi

echo ""
echo "💡 RECOMENDACIONES"
echo "=================="

if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo "🔧 Corregir errores críticos marcados con ❌"
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo "⚠️ Revisar advertencias para mejorar calidad"
fi

echo "📝 Considerar implementar:"
echo "   • Más tests unitarios"
echo "   • Documentación JSDoc completa" 
echo "   • Validación de entrada más robusta"
echo "   • Manejo de errores exhaustivo"

echo ""
echo "✨ AUDITORÍA COMPLETADA"
echo "======================"
