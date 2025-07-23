#!/bin/bash
# scripts/verify_agent_dependencies.sh
# Sistema de verificación de dependencias entre agentes

AGENT_ID=$1
WEEK=$2

if [[ -z "$AGENT_ID" || -z "$WEEK" ]]; then
    echo "❌ ERROR: Uso: $0 [AGENT_ID] [WEEK]"
    echo "   Ejemplo: $0 4 1"
    exit 1
fi

echo "🔍 Verificando dependencias para Agente $AGENT_ID, Semana $WEEK..."

# Función para verificar tags de dependencias
check_dependency_tags() {
    local required_tags=()
    
    case "$AGENT_ID-$WEEK" in
        "4-1")
            required_tags=("AGENT_3_WEEK_1_COMPLETE")
            echo "📋 Agente 4, Semana 1 requiere: Análisis completo del Agente 3"
            ;;
        "5-1")
            required_tags=("AGENT_4_WEEK_1_COMPLETE")
            echo "📋 Agente 5, Semana 1 requiere: Componentes base del Agente 4"
            ;;
        "4-2")
            required_tags=("AGENT_2_WEEK_2_COMPLETE" "AGENT_3_WEEK_2_COMPLETE")
            echo "📋 Agente 4, Semana 2 requiere: Estructura HTML y APIs"
            ;;
        "5-2")
            required_tags=("AGENT_4_WEEK_2_COMPLETE" "AGENT_2_WEEK_2_COMPLETE")
            echo "📋 Agente 5, Semana 2 requiere: Hooks y componentes"
            ;;
        *)
            echo "✅ Sin dependencias específicas definidas para Agente $AGENT_ID, Semana $WEEK"
            return 0
            ;;
    esac
    
    local missing_deps=()
    for tag in "${required_tags[@]}"; do
        if git tag -l | grep -q "^$tag$"; then
            echo "✅ Dependencia satisfecha: $tag"
        else
            echo "❌ Dependencia faltante: $tag"
            missing_deps+=("$tag")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        echo ""
        echo "🚫 BLOQUEADO: Faltan las siguientes dependencias:"
        for dep in "${missing_deps[@]}"; do
            echo "   - $dep"
        done
        echo ""
        echo "💡 Para desbloquear, los agentes prerrequisito deben:"
        echo "   1. Completar su trabajo"
        echo "   2. Ejecutar: node scripts/notify_dependent_agents.js [AGENT] [WEEK]"
        echo "   3. Hacer commit con formato estructurado"
        echo "   4. Push con tags: git push origin main --tags"
        return 1
    fi
    
    return 0
}

# Función para verificar archivos de estado
check_status_files() {
    local status_file=".agent_status/agent_${AGENT_ID}_week_${WEEK}_prerequisites.json"
    
    if [[ -f "$status_file" ]]; then
        echo "📄 Verificando archivo de estado: $status_file"
        
        if command -v jq >/dev/null 2>&1; then
            local all_met=$(jq -r '.all_dependencies_met // false' "$status_file" 2>/dev/null)
            if [[ "$all_met" == "true" ]]; then
                echo "✅ Archivo de estado confirma: Todas las dependencias satisfechas"
                return 0
            else
                echo "❌ Archivo de estado indica dependencias pendientes:"
                jq -r '.pending_dependencies[]? // "No hay dependencias pendientes listadas"' "$status_file" 2>/dev/null
                return 1
            fi
        else
            echo "⚠️  jq no disponible, saltando verificación de archivo de estado"
            return 0
        fi
    else
        echo "📄 No se encontró archivo de estado específico (normal para primeras ejecuciones)"
        return 0
    fi
}

# Función para verificar commits estructurados
check_structured_commits() {
    local required_patterns=()
    
    case "$AGENT_ID-$WEEK" in
        "4-1")
            required_patterns=("AGENT_3_WEEK_1_COMPLETE")
            ;;
        "5-1")
            required_patterns=("AGENT_4_WEEK_1_COMPLETE")
            ;;
    esac
    
    for pattern in "${required_patterns[@]}"; do
        if git log --oneline --grep="$pattern" | head -1 | grep -q "$pattern"; then
            echo "✅ Commit estructurado encontrado: $pattern"
        else
            echo "⚠️  Commit estructurado no encontrado para: $pattern"
        fi
    done
}

# Ejecutar verificaciones
echo "==========================================="

# Verificación principal por tags
if check_dependency_tags; then
    echo "✅ Verificación de tags: PASADA"
    tags_passed=true
else
    echo "❌ Verificación de tags: FALLIDA"
    tags_passed=false
fi

# Verificación de archivos de estado
if check_status_files; then
    echo "✅ Verificación de archivos de estado: PASADA"
    status_passed=true
else
    echo "❌ Verificación de archivos de estado: FALLIDA"
    status_passed=false
fi

# Verificación de commits estructurados
echo "📝 Verificando commits estructurados..."
check_structured_commits

echo "==========================================="

# Decisión final
if [[ "$tags_passed" == true ]]; then
    echo ""
    echo "🚀 ✅ AUTORIZADO: Agente $AGENT_ID puede proceder con Semana $WEEK"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Leer archivos base obligatorios"
    echo "   2. Ejecutar trabajo asignado"
    echo "   3. Al completar, ejecutar: node scripts/notify_dependent_agents.js $AGENT_ID $WEEK"
    echo "   4. Hacer commit estructurado y push con tags"
    echo ""
    exit 0
else
    echo ""
    echo "🚫 ❌ BLOQUEADO: Agente $AGENT_ID NO puede proceder con Semana $WEEK"
    echo ""
    echo "🔄 Estado actual: ESPERANDO DEPENDENCIAS"
    echo "⏳ Acción requerida: Esperar a que los agentes prerrequisito completen su trabajo"
    echo ""
    exit 1
fi

