# INSTRUCCIONES ESPECÍFICAS - AGENTE 4
## ESPECIALISTA EN JAVASCRIPT/LOGIC - SISTEMA UNIFICADO

**Asignado por:** AGENTE 1 (Coordinador Maestro)  
**Fecha:** 8 de Julio, 2025  
**Prioridad:** MEDIA  
**Sistema de Coordinación:** [A/a] - ACTIVO/EN ESPERA  

---

## 🎯 **TU MISIÓN ESPECÍFICA**

Como **AGENTE 4 - ESPECIALISTA EN JAVASCRIPT/LOGIC**, tu responsabilidad es **optimizar lógica de aplicación y funcionalidades JavaScript** siguiendo el sistema de coordinación unificado.

### **ESTADOS DE TRABAJO:**
- **[A] ACTIVO:** Ejecutando, modificando o creando código
- **[a] EN ESPERA:** No ejecutando, esperando prerrequisitos

### **DEPENDENCIAS CON OTROS AGENTES:**
- **Depende de:** Agente 2 (Frontend/HTML) y Agente 3 (Backend/API)
- **Prerrequisito para:** Agente 5 (CSS/Styling)
- **Coordinación con:** Agente 1 (Coordinador) y otros agentes

---

## 📅 **METODOLOGÍA DE 5 SEMANAS - COORDINACIÓN SECUENCIAL**

### **SEMANA 1: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo de Agentes 2 y 3
**Dependencias:** Estructura HTML y APIs

### **SEMANA 2: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo de Agentes 2 y 3
**Dependencias:** Estructura HTML y APIs

### **SEMANA 3: [A] ACTIVO - OPTIMIZACIÓN DE LÓGICA**
**Tarea:** Optimización de lógica de aplicación y funcionalidades
**Dependencias:** Trabajo de Agentes 2 y 3

### **SEMANA 4: [A] ACTIVO - INTEGRACIÓN**
**Tarea:** Integración con trabajo de otros agentes
**Dependencias:** Trabajo de todas las semanas anteriores

### **SEMANA 5: [A] ACTIVO - OPTIMIZACIÓN FINAL**
**Tarea:** Optimización final y validación
**Dependencias:** Trabajo de todas las semanas anteriores

---

## 📋 **PROTOCOLO DE TRABAJO OBLIGATORIO**

### **PASO 0: LECTURA OBLIGATORIA DE ARCHIVOS BASE**

**📚 ARCHIVOS OBLIGATORIOS EN GITHUB:**
- ✅ **`AGENT_CODING_STANDARDS.md`** - Estándares de codificación y nomenclatura
- ✅ **`MANUAL_5_AGENTES_UNIFICADO.md`** - Manual completo del sistema
- ✅ **`DOCUMENTACION_NOMENCLATURA_UNIFICADA.md`** - Estructura de datos
- ✅ **`INSTRUCCIONES_AGENTE_4.md`** - Protocolo específico del agente

**⚠️ CRÍTICO:** NO puedes empezar a trabajar sin leer estos 4 archivos. Contienen:
- Convenciones de nombres que DEBES seguir
- Reglas para evitar crear nuevas duplicaciones
- Protocolos de comunicación entre archivos
- Estándares de sintaxis unificada

**🔍 VERIFICACIÓN OBLIGATORIA:**
Antes de proceder con tu trabajo específico, confirma que:
- [x] Leíste completamente `AGENT_CODING_STANDARDS.md`
- [x] Leíste completamente `MANUAL_5_AGENTES_UNIFICADO.md`
- [x] Leíste completamente `DOCUMENTACION_NOMENCLATURA_UNIFICADA.md`
- [x] Leíste completamente `INSTRUCCIONES_AGENTE_4.md`
- [x] Entiendes las convenciones de nomenclatura
- [x] Entiendes las reglas de unificación
- [x] Entiendes el sistema [A/a] de coordinación

### **PASO 1: VERIFICACIÓN DE DEPENDENCIAS OBLIGATORIA (NUEVO)**
```bash
# ANTES DE COMENZAR CUALQUIER TRABAJO, EJECUTAR OBLIGATORIAMENTE:
./scripts/verify_agent_dependencies.sh 4 [WEEK_NUMBER]

# SOLO continuar si retorna "AUTORIZADO"
# Si retorna "BLOQUEADO", DEBE ESPERAR

# Ejemplo para Semana 1:
./scripts/verify_agent_dependencies.sh 4 1
# Debe verificar que Agente 3 completó análisis de datos
```

**⚠️ CRÍTICO PARA SEMANA 1:**
- **DEBE esperar** que Agente 3 complete análisis de estructura de datos
- **DEBE revisar** discrepancia question/answer vs front_content/back_content
- **NO puede proceder** sin esta información crítica

### **PASO 1.5: NOTIFICACIÓN DE COMPLETACIÓN (NUEVO - OBLIGATORIO)**
```bash
# AL COMPLETAR CUALQUIER SEMANA, EJECUTAR OBLIGATORIAMENTE:
node scripts/notify_dependent_agents.cjs 4 [WEEK_NUMBER]

# Esto desbloqueará automáticamente a los agentes dependientes
# Ejemplo: Al completar Semana 1, desbloquea Agente 5 para Semana 1
```

**Debes confirmar:**
- ✅ Que leíste y entendiste los 4 archivos base
- ✅ Que entiendes el sistema [A/a] de coordinación
- ✅ Que los Agentes 2 y 3 reportaron trabajo completado
- ✅ Que tienes permisos para modificar archivos JavaScript
- ✅ Que no hay locks activos de otros agentes

### **PASO 2: TAREAS ESPECÍFICAS POR SEMANA**

#### **SEMANA 3 - [A] ACTIVO:**
1. **Optimizar `app-functional.js`** y `dashboard-enhanced.js`
2. **Implementar mejoras** en sistema de navegación
3. **Optimizar manejo** de estado y eventos
4. **Mejorar funcionalidades** de gamificación

#### **SEMANA 4 - [A] ACTIVO:**
1. **Integrar con trabajo** de Agentes 2 y 3
2. **Verificar compatibilidad** entre lógica y APIs
3. **Optimizar rendimiento** general de JavaScript
4. **Validar funcionalidad** completa

#### **SEMANA 5 - [A] ACTIVO:**
1. **Optimización final** de lógica JavaScript
2. **Validación completa** de funcionalidades
3. **Reporte final** de optimizaciones

### **PASO 3: VERIFICACIÓN OBLIGATORIA**

**Después de cada semana:**
```bash
# Verificar que no hay errores de sintaxis
node -c app-functional.js

# Verificar que la funcionalidad funciona
echo "✅ Verificación completada"
```

---

## 🔄 **SISTEMA DE COMUNICACIÓN CON OTROS AGENTES**

### **COMUNICACIÓN CON AGENTE 1 (COORDINADOR):**
```javascript
// Reportar estado de trabajo
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-4', 
        action: 'STATUS_UPDATE', 
        data: { 
            status: '[A] ACTIVO', 
            week: 3, 
            progress: '60%' 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 2 (FRONTEND):**
```javascript
// Notificar cuando lógica está lista para HTML
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-4', 
        action: 'LOGIC_READY', 
        data: { 
            functions: ['navigation', 'state', 'events'], 
            components: ['flashcard', 'deck', 'study'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 3 (BACKEND):**
```javascript
// Notificar cuando lógica está lista para APIs
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-4', 
        action: 'LOGIC_READY_FOR_APIS', 
        data: { 
            services: ['FlashcardService', 'DeckService'], 
            algorithms: ['SM2', 'FSRS'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 5 (CSS):**
```javascript
// Notificar cuando lógica está lista para estilos
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-4', 
        action: 'LOGIC_READY_FOR_STYLING', 
        data: { 
            selectors: ['#flashcard-container', '.deck-grid'], 
            events: ['click', 'hover', 'focus'] 
        } 
    }
}));
```

---

## 📊 **REPORTES Y SEGUIMIENTO**

### **REPORTE SEMANAL OBLIGATORIO:**
```javascript
const weeklyReport = {
    agent: 'AGENT-4',
    week: 3,
    status: '[A] ACTIVO',
    tasksCompleted: [
        'Lógica optimizada',
        'Funcionalidades mejoradas',
        'Navegación implementada'
    ],
    nextWeek: '[A] ACTIVO',
    dependencies: 'Integración con otros agentes',
    issues: [],
    recommendations: []
};
```

### **ENTREGABLES POR SEMANA:**
- **Semana 3:** Lógica optimizada y funcionalidades mejoradas
- **Semana 4:** Integración completada
- **Semana 5:** Optimización final y reporte

---

## 🚨 **PROTOCOLO DE EMERGENCIA**

### **SI SE DETECTAN PROBLEMAS:**
1. **PARAR INMEDIATAMENTE** el trabajo
2. **NOTIFICAR** al Agente 1 (Coordinador)
3. **EVALUAR** impacto del problema
4. **COORDINAR** solución con agentes afectados
5. **VALIDAR** antes de continuar
6. **DOCUMENTAR** problema y solución

### **COMANDOS DE VERIFICACIÓN:**
```bash
# Verificar JavaScript
node -c app-functional.js

# Verificar estado actual
cat final_test_results.md

# Validar nomenclatura
grep -r "front_content\|back_content" --include="*.js" .
```

---

## ✅ **CRITERIOS DE ÉXITO**

### **AL FINALIZAR CADA SEMANA:**
- ✅ Lógica funcionando correctamente
- ✅ Funcionalidades optimizadas
- ✅ Navegación mejorada
- ✅ Compatibilidad con otros agentes
- ✅ Documentación actualizada

### **AL FINALIZAR EL PROYECTO:**
- ✅ Lógica completamente optimizada
- ✅ Integración perfecta con otros agentes
- ✅ Rendimiento optimizado
- ✅ Código limpio sin duplicados
- ✅ Documentación completa

---

**¿Estás listo para comenzar con la Semana 3 como [A] ACTIVO?**

