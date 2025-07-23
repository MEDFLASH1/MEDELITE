# 🎯 GUÍA PRÁCTICA PARA AGENTE 1 - COORDINACIÓN CON DEPENDENCIAS
## CÓMO USAR EL NUEVO SISTEMA DE COORDINACIÓN AUTOMÁTICA

**Fecha:** 23 Julio 2025  
**Versión:** 2.0 - Sistema de Dependencias  
**Para:** AGENTE 1 - COORDINADOR MAESTRO  
**Propósito:** Evitar que agentes trabajen sin prerrequisitos completados  

---

## 🚨 PROBLEMA QUE ESTE SISTEMA RESUELVE

**❌ LO QUE PASÓ ANTES:**
- Agente 4 comenzó migración Next.js sin esperar análisis del Agente 3
- Dependencias críticas ignoradas (discrepancia question/answer vs front_content/back_content)
- Riesgo de retrabajos por coordinación deficiente

**✅ LO QUE ESTE SISTEMA PREVIENE:**
- Trabajo sin prerrequisitos completados
- Incompatibilidades por falta de información crítica
- Retrabajos costosos por mala coordinación

---

## 📋 COMANDOS ESENCIALES PARA AGENTE 1

### **1. VERIFICAR ESTADO ACTUAL DE TODOS LOS AGENTES**

```bash
# Comando principal para ver qué agentes pueden trabajar
echo "🔍 VERIFICANDO ESTADO DE TODOS LOS AGENTES..."

for agent in 2 3 4 5; do
  for week in 1 2 3; do
    echo "--- Agente $agent, Semana $week ---"
    ./scripts/verify_agent_dependencies.sh $agent $week 2>/dev/null | grep -E "(AUTORIZADO|BLOQUEADO)" || echo "Sin dependencias específicas"
  done
  echo ""
done
```

### **2. VER MATRIZ DE DEPENDENCIAS**

```bash
# Ver todas las dependencias definidas
cat DEPENDENCY_MATRIX.json | jq '.dependencies' 2>/dev/null || cat DEPENDENCY_MATRIX.json

# Ver dependencias específicas de un agente
cat DEPENDENCY_MATRIX.json | grep -A 10 "agent_4"
```

### **3. REVISAR COMPLETACIONES RECIENTES**

```bash
# Ver qué agentes han completado trabajo recientemente
git tag -l | grep "AGENT_.*_WEEK_.*_COMPLETE" | sort

# Ver archivos de estado de completación
ls -la .agent_status/*_complete.json 2>/dev/null || echo "No hay completaciones registradas"

# Ver últimos commits de completación
git log --oneline --grep="AGENT_.*_WEEK_.*_COMPLETE" | head -5
```

### **4. VERIFICAR DESBLOQUEOS DISPONIBLES**

```bash
# Ver qué agentes están listos para ser desbloqueados
find .agent_status -name "*_prerequisites.json" -exec echo "Revisando: {}" \; -exec cat {} \; 2>/dev/null

# Comando rápido para ver agentes listos
grep -l "all_dependencies_met.*true" .agent_status/*_prerequisites.json 2>/dev/null || echo "No hay agentes listos para desbloquear"
```

---

## 🎯 PROCESO PASO A PASO PARA COORDINACIÓN

### **PASO 1: ANÁLISIS INICIAL DE LA TAREA**

```bash
# Cuando recibas una nueva tarea, SIEMPRE ejecutar:

echo "📋 ANÁLISIS DE TAREA NUEVA"
echo "=========================="

# 1. Ver estado actual del proyecto
git status
git log --oneline | head -3

# 2. Verificar qué agentes pueden trabajar AHORA
echo "🔍 Verificando disponibilidad de agentes..."
./scripts/verify_agent_dependencies.sh 2 1
./scripts/verify_agent_dependencies.sh 3 1  
./scripts/verify_agent_dependencies.sh 4 1
./scripts/verify_agent_dependencies.sh 5 1

# 3. Revisar dependencias críticas
echo "📊 Dependencias críticas definidas:"
cat DEPENDENCY_MATRIX.json | grep -A 5 -B 5 "critical"
```

### **PASO 2: TOMA DE DECISIÓN INTELIGENTE**

**🧠 LÓGICA DE DECISIÓN:**

```bash
# Para cada agente que quieras asignar [A], VERIFICAR:

check_agent_availability() {
  local agent=$1
  local week=$2
  
  echo "Verificando Agente $agent, Semana $week..."
  
  result=$(./scripts/verify_agent_dependencies.sh $agent $week 2>/dev/null)
  
  if echo "$result" | grep -q "AUTORIZADO"; then
    echo "✅ Agente $agent PUEDE trabajar en Semana $week"
    return 0
  elif echo "$result" | grep -q "BLOQUEADO"; then
    echo "❌ Agente $agent BLOQUEADO para Semana $week"
    echo "$result" | grep -A 3 "BLOQUEADO"
    return 1
  else
    echo "⚠️  Agente $agent - Sin dependencias específicas"
    return 0
  fi
}

# Uso:
# check_agent_availability 4 1
# check_agent_availability 5 1
```

### **PASO 3: COMUNICACIÓN CLARA AL USUARIO**

**📢 FORMATO OBLIGATORIO:**

```bash
# Crear reporte de asignación
create_assignment_report() {
  local week=$1
  
  echo "🎯 ASIGNACIÓN SEMANA $week - COORDINADOR AGENTE 1"
  echo "================================================"
  echo ""
  
  echo "AGENTES ACTIVOS [A]:"
  # Para cada agente que asignes [A]:
  # - Agente X: [TAREA]
  #   ✅ Dependencias: SATISFECHAS  
  #   📋 Prerrequisitos: [LISTA]
  
  echo ""
  echo "AGENTES EN ESPERA [a]:"
  # Para cada agente que asignes [a]:
  # - Agente X: BLOQUEADO
  #   ❌ Esperando: [DEPENDENCIA ESPECÍFICA]
  #   ⏳ Se desbloqueará cuando: [CONDICIÓN]
  #   🔄 Verificar con: ./scripts/verify_agent_dependencies.sh X $week
  
  echo ""
  echo "DEPENDENCIAS CRÍTICAS IDENTIFICADAS:"
  cat DEPENDENCY_MATRIX.json | grep -A 3 "critical_paths" 2>/dev/null || echo "Ver DEPENDENCY_MATRIX.json"
  
  echo ""
  echo "PRÓXIMOS DESBLOQUEOS ESPERADOS:"
  echo "- Al completar Agente X: Se desbloqueará Agente Y"
}

# Uso:
# create_assignment_report 1
```

### **PASO 4: MONITOREO CONTINUO**

```bash
# Script de monitoreo para ejecutar periódicamente
monitor_agents() {
  echo "📊 MONITOREO DE AGENTES - $(date)"
  echo "=================================="
  
  # 1. Verificar progreso
  echo "🔄 Últimas completaciones:"
  git log --oneline --grep="AGENT_.*_WEEK_.*_COMPLETE" | head -3
  
  # 2. Ver archivos de estado nuevos
  echo ""
  echo "📄 Archivos de estado recientes:"
  find .agent_status -name "*.json" -mtime -1 2>/dev/null | head -5
  
  # 3. Verificar nuevos desbloqueos
  echo ""
  echo "🔓 Agentes que pueden desbloquearse:"
  for agent in 2 3 4 5; do
    for week in 1 2 3; do
      if ./scripts/verify_agent_dependencies.sh $agent $week 2>/dev/null | grep -q "AUTORIZADO"; then
        echo "  - Agente $agent puede proceder con Semana $week"
      fi
    done
  done
}

# Ejecutar cada vez que quieras ver el estado
# monitor_agents
```

### **PASO 5: GESTIÓN DE COMPLETACIONES**

```bash
# Cuando un agente reporte completación
handle_agent_completion() {
  local agent=$1
  local week=$2
  
  echo "📢 Agente $agent reporta completación de Semana $week"
  
  # 1. Verificar que realmente completó
  completion_file=".agent_status/agent_${agent}_week_${week}_complete.json"
  if [[ -f "$completion_file" ]]; then
    echo "✅ Archivo de completación encontrado: $completion_file"
    cat "$completion_file" | jq '.status' 2>/dev/null || echo "Archivo válido"
  else
    echo "❌ ADVERTENCIA: No se encontró archivo de completación"
    echo "   El agente debe ejecutar: node scripts/notify_dependent_agents.cjs $agent $week"
    return 1
  fi
  
  # 2. Verificar tag de completación
  tag="AGENT_${agent}_WEEK_${week}_COMPLETE"
  if git tag -l | grep -q "$tag"; then
    echo "✅ Tag de completación encontrado: $tag"
  else
    echo "❌ ADVERTENCIA: No se encontró tag de completación"
  fi
  
  # 3. Ver qué agentes se desbloquearon
  echo ""
  echo "🔓 Verificando agentes desbloqueados:"
  for dep_agent in 2 3 4 5; do
    if [[ $dep_agent -ne $agent ]]; then
      for dep_week in 1 2 3; do
        if ./scripts/verify_agent_dependencies.sh $dep_agent $dep_week 2>/dev/null | grep -q "AUTORIZADO"; then
          echo "  ✅ Agente $dep_agent ahora puede proceder con Semana $dep_week"
        fi
      done
    fi
  done
}

# Uso cuando un agente reporte completación:
# handle_agent_completion 3 1
# handle_agent_completion 4 1
```

---

## 📊 EJEMPLOS PRÁCTICOS DE COORDINACIÓN

### **EJEMPLO 1: MIGRACIÓN NEXT.JS (CASO REAL)**

```bash
# Situación: Usuario pide migración Frontend-First a Next.js

echo "🎯 COORDINACIÓN: Migración Frontend-First Next.js"
echo "=============================================="

# PASO 1: Verificar estado inicial
./scripts/verify_agent_dependencies.sh 3 1  # Agente 3 - Análisis datos
./scripts/verify_agent_dependencies.sh 4 1  # Agente 4 - Migración Next.js

# RESULTADO ESPERADO:
# - Agente 3: AUTORIZADO (sin dependencias)
# - Agente 4: BLOQUEADO (esperando Agente 3)

# PASO 2: Asignación correcta
echo "SEMANA 1:"
echo "- Agente 3 [A] - Análisis de estructura de datos (AUTORIZADO)"
echo "- Agente 4 [a] - BLOQUEADO: Esperando análisis del Agente 3"
echo "- Agente 5 [a] - BLOQUEADO: Esperando componentes del Agente 4"

# PASO 3: Monitoreo
echo ""
echo "⏳ Esperando que Agente 3 complete análisis..."
echo "📋 Agente 3 debe ejecutar al completar:"
echo "   node scripts/notify_dependent_agents.cjs 3 1"

# PASO 4: Después de completación del Agente 3
echo ""
echo "🔄 Después de que Agente 3 complete:"
echo "- Agente 4 se desbloqueará automáticamente"
echo "- Verificar con: ./scripts/verify_agent_dependencies.sh 4 1"
```

### **EJEMPLO 2: DETECCIÓN DE ERROR DE COORDINACIÓN**

```bash
# Si detectas que un agente está trabajando sin prerrequisitos:

detect_coordination_error() {
  echo "🚨 DETECTANDO ERRORES DE COORDINACIÓN"
  echo "===================================="
  
  # Verificar si hay agentes trabajando sin dependencias satisfechas
  for agent in 2 3 4 5; do
    for week in 1 2 3; do
      if ./scripts/verify_agent_dependencies.sh $agent $week 2>/dev/null | grep -q "BLOQUEADO"; then
        echo "⚠️  ADVERTENCIA: Agente $agent NO debería trabajar en Semana $week"
        echo "   Dependencias no satisfechas detectadas"
        ./scripts/verify_agent_dependencies.sh $agent $week | grep -A 5 "BLOQUEADO"
      fi
    done
  done
}

# Ejecutar para detectar problemas:
# detect_coordination_error
```

---

## 🔧 COMANDOS DE EMERGENCIA

### **RESETEAR ESTADO DE DEPENDENCIAS**

```bash
# Si necesitas resetear el sistema de dependencias:
reset_dependency_system() {
  echo "🔄 RESETEANDO SISTEMA DE DEPENDENCIAS"
  echo "===================================="
  
  # Backup de archivos de estado
  if [[ -d ".agent_status" ]]; then
    cp -r .agent_status .agent_status_backup_$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup creado de archivos de estado"
  fi
  
  # Limpiar archivos de estado
  rm -rf .agent_status/*.json 2>/dev/null
  echo "🧹 Archivos de estado limpiados"
  
  # Recrear estructura
  mkdir -p .agent_status
  echo "📁 Estructura recreada"
  
  echo "⚠️  ADVERTENCIA: Todos los agentes ahora pueden trabajar sin restricciones"
  echo "   Usar solo en emergencias"
}

# USAR SOLO EN EMERGENCIAS:
# reset_dependency_system
```

### **FORZAR DESBLOQUEO DE AGENTE**

```bash
# Si necesitas forzar que un agente pueda trabajar:
force_unlock_agent() {
  local agent=$1
  local week=$2
  
  echo "🔓 FORZANDO DESBLOQUEO: Agente $agent, Semana $week"
  
  # Crear archivo de prerrequisitos satisfechos
  prereq_file=".agent_status/agent_${agent}_week_${week}_prerequisites.json"
  cat > "$prereq_file" << EOF
{
  "agent_id": $agent,
  "week": $week,
  "pending_dependencies": [],
  "completed_dependencies": ["FORCE_UNLOCKED"],
  "all_dependencies_met": true,
  "critical_information": [
    {
      "message": "FORZADO POR COORDINADOR AGENTE 1",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
    }
  ],
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF
  
  echo "✅ Agente $agent forzadamente desbloqueado para Semana $week"
  echo "⚠️  ADVERTENCIA: Usar solo cuando estés seguro de que es seguro"
}

# USAR CON PRECAUCIÓN:
# force_unlock_agent 4 1
```

---

## 📋 CHECKLIST PARA COORDINACIÓN PERFECTA

### **ANTES DE ASIGNAR TRABAJO:**

- [ ] ✅ Ejecuté verificación de estado de todos los agentes
- [ ] ✅ Revisé la matriz de dependencias
- [ ] ✅ Identifiqué dependencias críticas para la tarea
- [ ] ✅ Verifiqué qué agentes están REALMENTE disponibles
- [ ] ✅ Entiendo por qué ciertos agentes están bloqueados

### **AL ASIGNAR TRABAJO:**

- [ ] ✅ Solo asigné [A] a agentes AUTORIZADOS
- [ ] ✅ Asigné [a] a agentes BLOQUEADOS con explicación
- [ ] ✅ Comuniqué claramente las dependencias al usuario
- [ ] ✅ Expliqué cuándo se desbloquearán los agentes en espera
- [ ] ✅ Documenté mi decisión de coordinación

### **DURANTE EL TRABAJO:**

- [ ] ✅ Monitoreo progreso de agentes activos
- [ ] ✅ Verifico completaciones reportadas
- [ ] ✅ Identifico nuevos desbloqueos disponibles
- [ ] ✅ Comunico cambios de estado al usuario

### **AL RECIBIR COMPLETACIONES:**

- [ ] ✅ Verifiqué archivo de completación
- [ ] ✅ Verifiqué tag de completación
- [ ] ✅ Identifiqué agentes desbloqueados
- [ ] ✅ Comuniqué nuevos desbloqueos al usuario
- [ ] ✅ Actualicé plan de coordinación

---

## 🎯 RESULTADO ESPERADO

**Con este sistema, como Agente 1 Coordinador:**

✅ **NUNCA asignaré trabajo a agentes sin prerrequisitos**  
✅ **SIEMPRE verificaré dependencias antes de asignar**  
✅ **COMUNICARÉ claramente por qué ciertos agentes esperan**  
✅ **MONITOREARÉ y gestionaré desbloqueos automáticamente**  
✅ **PREVENDRÉ retrabajos por mala coordinación**  

**El resultado será coordinación perfecta sin errores de dependencias.**

---

**📋 Guía creada para:** AGENTE 1 - COORDINADOR MAESTRO  
**📅 Fecha:** 23 Julio 2025  
**🎯 Propósito:** Coordinación inteligente con sistema de dependencias  
**🔄 Estado:** Lista para uso inmediato

