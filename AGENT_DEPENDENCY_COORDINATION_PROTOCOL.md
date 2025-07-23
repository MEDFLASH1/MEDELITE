# 🔄 PROTOCOLO DE COORDINACIÓN DE DEPENDENCIAS
## SISTEMA MEJORADO PARA EVITAR TRABAJO SIN PRERREQUISITOS

**Fecha:** 23 Julio 2025  
**Versión:** 2.0 - Coordinación por Dependencias  
**Problema Resuelto:** Agentes trabajando sin completar dependencias críticas  

---

## 🚨 PROBLEMA IDENTIFICADO

**❌ SITUACIÓN ACTUAL:**
- **Agente 4** comenzó migración Next.js sin esperar análisis del **Agente 3**
- **Dependencias críticas ignoradas:** Discrepancia de estructura de datos (question/answer vs front_content/back_content)
- **Riesgo de retrabajos:** Incompatibilidades futuras por falta de coordinación

**🎯 DEPENDENCIAS CRÍTICAS:**
```
Agente 3 (Análisis datos) → Agente 4 (Implementación)
Agente 2 (Estructura HTML) → Agente 4 (Componentes React)
Agente 4 (Componentes base) → Agente 5 (Testing)
```

---

## 💡 SOLUCIONES EVALUADAS

### **OPCIÓN 1: COORDINACIÓN EN TIEMPO REAL**
**Concepto:** Agentes esperan commits de aviso en tiempo real

**✅ VENTAJAS:**
- Coordinación inmediata
- Flexibilidad de trabajo
- Respuesta rápida a cambios

**❌ DESVENTAJAS:**
- Complejidad de implementación
- Dependencia de monitoreo constante
- Posibles bloqueos por fallos técnicos

### **OPCIÓN 2: SEPARACIÓN TEMPORAL (1 SEMANA)**
**Concepto:** Distancia mínima de 1 semana entre agentes dependientes

**✅ VENTAJAS:**
- Simplicidad de implementación
- Tiempo suficiente para análisis completo
- Menor riesgo de errores de coordinación

**❌ DESVENTAJAS:**
- Menor flexibilidad
- Posible lentitud en proyectos urgentes
- Rigidez en cronogramas

---

## 🎯 SOLUCIÓN HÍBRIDA RECOMENDADA

### **SISTEMA DE COORDINACIÓN POR FASES CON VERIFICACIÓN AUTOMÁTICA**

#### **FASE 1: VERIFICACIÓN DE PRERREQUISITOS**
```bash
# Script de verificación automática
./scripts/verify_agent_dependencies.sh [AGENT_ID] [WEEK]

# Ejemplo para Agente 4 en Semana 1
./scripts/verify_agent_dependencies.sh 4 1
```

**Verificaciones automáticas:**
- ✅ Commits específicos de agentes prerrequisito
- ✅ Archivos de reporte generados
- ✅ Tags de completación en repositorio
- ✅ Validación de entregables específicos

#### **FASE 2: SISTEMA DE LOCKS Y RELEASES**
```javascript
// Sistema de locks por dependencias
const AGENT_DEPENDENCIES = {
  "4": {
    "week_1": ["3_analysis_complete", "2_structure_ready"],
    "week_2": ["3_data_migration", "2_components_base"],
    "week_3": ["3_api_integration", "2_ui_complete"]
  },
  "5": {
    "week_1": ["4_components_base"],
    "week_2": ["4_hooks_ready", "2_integration_complete"],
    "week_3": ["4_testing_setup", "3_data_stable"]
  }
}
```

#### **FASE 3: NOTIFICACIÓN AUTOMÁTICA**
```javascript
// Sistema de notificaciones automáticas
function notifyDependentAgents(completedAgent, week) {
  const dependents = findDependentAgents(completedAgent, week);
  dependents.forEach(agent => {
    sendNotification(agent, `Prerrequisito completado: ${completedAgent} - Semana ${week}`);
    unlockAgentWork(agent, week);
  });
}
```

---

## 📋 PROTOCOLO ACTUALIZADO DE TRABAJO

### **PASO 0: VERIFICACIÓN AUTOMÁTICA DE DEPENDENCIAS**

**🔍 ANTES DE COMENZAR CUALQUIER TRABAJO:**
```bash
# Comando obligatorio antes de iniciar
node scripts/check_agent_prerequisites.js --agent=[ID] --week=[N]

# Ejemplo para Agente 4, Semana 1
node scripts/check_agent_prerequisites.js --agent=4 --week=1
```

**Respuestas posibles:**
- ✅ `DEPENDENCIES_MET` - Puede proceder
- ⏳ `WAITING_FOR: [AGENT_3_ANALYSIS]` - Debe esperar
- ❌ `BLOCKED: [MISSING_REPORTS]` - No puede proceder

### **PASO 1: SISTEMA DE COMMITS ESTRUCTURADOS**

**📤 COMMITS DE COMPLETACIÓN OBLIGATORIOS:**
```bash
# Formato obligatorio para commits de completación
git commit -m "AGENT_[ID]_WEEK_[N]_COMPLETE: [Descripción]

DELIVERABLES:
- ✅ [Entregable 1]
- ✅ [Entregable 2]
- ✅ [Entregable 3]

DEPENDENCIES_RELEASED:
- AGENT_[ID]_WEEK_[N]_READY

NEXT_AGENTS_UNLOCKED:
- Agent [ID] can proceed with Week [N]"

# Ejemplo del Agente 3
git commit -m "AGENT_3_WEEK_1_COMPLETE: Análisis de dependencias de datos

DELIVERABLES:
- ✅ AGENTE3_ANALISIS_DEPENDENCIAS_DATOS.md
- ✅ Identificación discrepancia question/answer vs front_content/back_content
- ✅ Plan de migración de estructura de datos

DEPENDENCIES_RELEASED:
- AGENT_3_DATA_ANALYSIS_READY

NEXT_AGENTS_UNLOCKED:
- Agent 4 can proceed with Week 1 Next.js migration"
```

### **PASO 2: TAGS DE DEPENDENCIAS**

**🏷️ SISTEMA DE TAGS AUTOMÁTICO:**
```bash
# Tags automáticos por completación
git tag "AGENT_3_WEEK_1_COMPLETE" -m "Data analysis ready for Agent 4"
git tag "DEPENDENCIES_RELEASED_FOR_AGENT_4_WEEK_1"

# Push obligatorio de tags
git push origin --tags
```

### **PASO 3: ARCHIVOS DE ESTADO**

**📄 ARCHIVOS DE ESTADO AUTOMÁTICOS:**
```json
// .agent_status/agent_3_week_1.json
{
  "agent_id": 3,
  "week": 1,
  "status": "COMPLETE",
  "completion_timestamp": "2025-07-23T10:30:00Z",
  "deliverables": [
    "AGENTE3_ANALISIS_DEPENDENCIAS_DATOS.md",
    "data_structure_analysis.json",
    "migration_plan.md"
  ],
  "dependencies_released": [
    "AGENT_3_DATA_ANALYSIS_READY"
  ],
  "next_agents_unlocked": [
    {"agent": 4, "week": 1, "task": "Next.js migration"}
  ],
  "critical_findings": [
    "question/answer vs front_content/back_content discrepancy"
  ]
}
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **SCRIPT DE VERIFICACIÓN DE DEPENDENCIAS**

```bash
#!/bin/bash
# scripts/verify_agent_dependencies.sh

AGENT_ID=$1
WEEK=$2

echo "🔍 Verificando dependencias para Agente $AGENT_ID, Semana $WEEK..."

# Verificar tags de dependencias
check_dependency_tags() {
    case "$AGENT_ID-$WEEK" in
        "4-1")
            if git tag -l | grep -q "AGENT_3_WEEK_1_COMPLETE"; then
                echo "✅ Agente 3 análisis completo"
            else
                echo "❌ BLOQUEADO: Esperando análisis del Agente 3"
                exit 1
            fi
            ;;
        "5-1")
            if git tag -l | grep -q "AGENT_4_WEEK_1_COMPLETE"; then
                echo "✅ Agente 4 componentes base completos"
            else
                echo "❌ BLOQUEADO: Esperando componentes del Agente 4"
                exit 1
            fi
            ;;
    esac
}

# Verificar archivos de estado
check_status_files() {
    local status_file=".agent_status/agent_${AGENT_ID}_week_${WEEK}_prerequisites.json"
    if [[ -f "$status_file" ]]; then
        local status=$(jq -r '.all_dependencies_met' "$status_file")
        if [[ "$status" == "true" ]]; then
            echo "✅ Todas las dependencias verificadas"
        else
            echo "❌ BLOQUEADO: Dependencias pendientes"
            jq -r '.pending_dependencies[]' "$status_file"
            exit 1
        fi
    else
        echo "❌ BLOQUEADO: Archivo de estado no encontrado"
        exit 1
    fi
}

check_dependency_tags
check_status_files

echo "🚀 AUTORIZADO: Agente $AGENT_ID puede proceder con Semana $WEEK"
```

### **SCRIPT DE NOTIFICACIÓN AUTOMÁTICA**

```javascript
// scripts/notify_dependent_agents.js
const fs = require('fs');
const { execSync } = require('child_process');

const DEPENDENCY_MATRIX = {
  "3": {
    "1": [{"agent": 4, "week": 1, "task": "Next.js migration"}]
  },
  "4": {
    "1": [{"agent": 5, "week": 1, "task": "Testing setup"}]
  }
};

function notifyCompletion(agentId, week) {
  console.log(`📢 Agente ${agentId} completó Semana ${week}`);
  
  // Crear archivo de estado
  const statusFile = `.agent_status/agent_${agentId}_week_${week}_complete.json`;
  const status = {
    agent_id: parseInt(agentId),
    week: parseInt(week),
    status: "COMPLETE",
    completion_timestamp: new Date().toISOString(),
    dependencies_released: [`AGENT_${agentId}_WEEK_${week}_READY`]
  };
  
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  
  // Notificar agentes dependientes
  const dependents = DEPENDENCY_MATRIX[agentId]?.[week] || [];
  dependents.forEach(dep => {
    console.log(`🔓 Desbloqueando Agente ${dep.agent} para ${dep.task}`);
    createPrerequisiteFile(dep.agent, dep.week, agentId, week);
  });
  
  // Crear tag automático
  execSync(`git tag "AGENT_${agentId}_WEEK_${week}_COMPLETE" -m "Dependencies released for dependent agents"`);
  console.log(`🏷️ Tag creado: AGENT_${agentId}_WEEK_${week}_COMPLETE`);
}

function createPrerequisiteFile(dependentAgent, dependentWeek, completedAgent, completedWeek) {
  const prereqFile = `.agent_status/agent_${dependentAgent}_week_${dependentWeek}_prerequisites.json`;
  
  let prereqs = { pending_dependencies: [], completed_dependencies: [] };
  if (fs.existsSync(prereqFile)) {
    prereqs = JSON.parse(fs.readFileSync(prereqFile, 'utf8'));
  }
  
  prereqs.completed_dependencies.push(`AGENT_${completedAgent}_WEEK_${completedWeek}_COMPLETE`);
  prereqs.pending_dependencies = prereqs.pending_dependencies.filter(
    dep => dep !== `AGENT_${completedAgent}_WEEK_${completedWeek}_COMPLETE`
  );
  
  prereqs.all_dependencies_met = prereqs.pending_dependencies.length === 0;
  prereqs.last_updated = new Date().toISOString();
  
  fs.writeFileSync(prereqFile, JSON.stringify(prereqs, null, 2));
  console.log(`📄 Actualizado archivo de prerrequisitos para Agente ${dependentAgent}`);
}

// Uso: node notify_dependent_agents.js 3 1
const [,, agentId, week] = process.argv;
notifyCompletion(agentId, week);
```

---

## 📊 MATRIZ DE DEPENDENCIAS ACTUALIZADA

### **DEPENDENCIAS POR AGENTE Y SEMANA**

```javascript
const DEPENDENCY_MATRIX_COMPLETE = {
  // Agente 2 - Frontend/HTML
  "2": {
    "1": [], // Sin dependencias
    "2": ["1_coordination_complete"],
    "3": ["3_data_structure_ready"]
  },
  
  // Agente 3 - Backend/API  
  "3": {
    "1": [], // Sin dependencias
    "2": ["2_html_structure_ready"],
    "3": ["4_logic_integration_ready"]
  },
  
  // Agente 4 - JavaScript/Logic
  "4": {
    "1": ["3_data_analysis_complete"], // CRÍTICO: Debe esperar análisis
    "2": ["2_components_ready", "3_api_structure_ready"],
    "3": ["2_ui_complete", "3_backend_ready"]
  },
  
  // Agente 5 - CSS/Styling
  "5": {
    "1": ["4_components_base_ready"], // CRÍTICO: Debe esperar componentes
    "2": ["4_hooks_ready", "2_integration_complete"],
    "3": ["4_testing_setup", "3_data_stable"]
  }
};
```

### **CRONOGRAMA CON DEPENDENCIAS VERIFICADAS**

```
SEMANA 1:
├─ Agente 3: [A] Análisis de datos (SIN DEPENDENCIAS)
├─ Agente 2: [A] Estructura HTML (SIN DEPENDENCIAS)  
├─ Agente 4: [a] ESPERA → Análisis Agente 3
└─ Agente 5: [a] ESPERA → Componentes Agente 4

SEMANA 2:
├─ Agente 3: [A] APIs y migración datos
├─ Agente 2: [A] Componentes base
├─ Agente 4: [A] DESBLOQUEADO → Migración Next.js
└─ Agente 5: [A] DESBLOQUEADO → Testing setup

SEMANA 3:
├─ Todos: [A] COLABORACIÓN COMPLETA
```

---

## 🎯 INSTRUCCIONES ACTUALIZADAS POR AGENTE

### **AGENTE 3 - ACTUALIZACIÓN CRÍTICA**

**NUEVAS RESPONSABILIDADES:**
```markdown
## PASO 0: NOTIFICACIÓN DE COMPLETACIÓN OBLIGATORIA

Al completar CUALQUIER semana, DEBE ejecutar:

```bash
# Notificar completación y desbloquear agentes dependientes
node scripts/notify_dependent_agents.js 3 [WEEK_NUMBER]

# Crear commit estructurado
git commit -m "AGENT_3_WEEK_[N]_COMPLETE: [Descripción]

DELIVERABLES:
- ✅ [Lista de entregables]

DEPENDENCIES_RELEASED:
- AGENT_3_WEEK_[N]_READY

CRITICAL_FINDINGS:
- [Hallazgos críticos para otros agentes]"

# Push con tags
git push origin main --tags
```
```

### **AGENTE 4 - ACTUALIZACIÓN CRÍTICA**

**NUEVAS VERIFICACIONES OBLIGATORIAS:**
```markdown
## PASO 0: VERIFICACIÓN DE DEPENDENCIAS OBLIGATORIA

ANTES de comenzar CUALQUIER trabajo, DEBE ejecutar:

```bash
# Verificar que puede proceder
./scripts/verify_agent_dependencies.sh 4 [WEEK_NUMBER]

# Solo si retorna "AUTORIZADO" puede continuar
# Si retorna "BLOQUEADO", DEBE ESPERAR
```

**EJEMPLO SEMANA 1:**
```bash
./scripts/verify_agent_dependencies.sh 4 1

# Respuesta esperada:
# ✅ Agente 3 análisis completo
# ✅ Todas las dependencias verificadas  
# 🚀 AUTORIZADO: Agente 4 puede proceder con Semana 1
```
```

### **AGENTE 5 - ACTUALIZACIÓN CRÍTICA**

**NUEVAS VERIFICACIONES OBLIGATORIAS:**
```markdown
## PASO 0: VERIFICACIÓN DE DEPENDENCIAS OBLIGATORIA

ANTES de comenzar CUALQUIER trabajo, DEBE ejecutar:

```bash
# Verificar que puede proceder
./scripts/verify_agent_dependencies.sh 5 [WEEK_NUMBER]

# Solo si retorna "AUTORIZADO" puede continuar
```

**EJEMPLO SEMANA 1:**
```bash
./scripts/verify_agent_dependencies.sh 5 1

# Debe verificar que Agente 4 completó componentes base
```
```

---

## 🚀 IMPLEMENTACIÓN INMEDIATA

### **ARCHIVOS A CREAR:**

1. **`scripts/verify_agent_dependencies.sh`** - Script de verificación
2. **`scripts/notify_dependent_agents.js`** - Sistema de notificaciones
3. **`.agent_status/`** - Directorio de archivos de estado
4. **`DEPENDENCY_MATRIX.json`** - Matriz de dependencias

### **COMANDOS DE SETUP:**

```bash
# Crear estructura de directorios
mkdir -p .agent_status scripts

# Hacer scripts ejecutables
chmod +x scripts/verify_agent_dependencies.sh

# Crear matriz de dependencias
echo '{
  "dependencies": {
    "4": {
      "1": ["AGENT_3_WEEK_1_COMPLETE"]
    },
    "5": {
      "1": ["AGENT_4_WEEK_1_COMPLETE"]
    }
  }
}' > DEPENDENCY_MATRIX.json

# Commit inicial
git add .
git commit -m "feat: Implementar sistema de coordinación por dependencias

- ✅ Scripts de verificación automática
- ✅ Sistema de notificaciones
- ✅ Matriz de dependencias
- ✅ Archivos de estado automáticos"
```

---

## ✅ VALIDACIÓN DEL SISTEMA

### **PRUEBA DEL SISTEMA:**

```bash
# 1. Agente 3 completa análisis
node scripts/notify_dependent_agents.js 3 1

# 2. Agente 4 verifica dependencias
./scripts/verify_agent_dependencies.sh 4 1
# Resultado: ✅ AUTORIZADO

# 3. Agente 4 completa trabajo
node scripts/notify_dependent_agents.js 4 1

# 4. Agente 5 verifica dependencias  
./scripts/verify_agent_dependencies.sh 5 1
# Resultado: ✅ AUTORIZADO
```

---

**🎯 RESULTADO ESPERADO:** Sistema que previene automáticamente que los agentes trabajen sin completar dependencias críticas, eliminando el problema identificado en la migración Next.js.

**📋 Protocolo generado por:** Sistema de Coordinación Mejorado  
**📅 Fecha:** 23 Julio 2025  
**🔄 Estado:** Listo para implementación inmediata

