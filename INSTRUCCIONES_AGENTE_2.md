# INSTRUCCIONES ESPECÍFICAS - AGENTE 2
## ESPECIALISTA EN FRONTEND/HTML - SISTEMA UNIFICADO

**Asignado por:** AGENTE 1 (Coordinador Maestro)  
**Fecha:** 8 de Julio, 2025  
**Prioridad:** CRÍTICA  
**Sistema de Coordinación:** [A/a] - ACTIVO/EN ESPERA  

---

## 🎯 **TU MISIÓN ESPECÍFICA**

Como **AGENTE 2 - ESPECIALISTA EN FRONTEND/HTML**, tu responsabilidad es **optimizar la estructura HTML y componentes principales** siguiendo el sistema de coordinación unificado.

### **ESTADOS DE TRABAJO:**
- **[A] ACTIVO:** Ejecutando, modificando o creando código
- **[a] EN ESPERA:** No ejecutando, esperando prerrequisitos

### **DEPENDENCIAS CON OTROS AGENTES:**
- **Independiente:** Puede trabajar sin depender de otros agentes
- **Prerrequisito para:** Agente 3 (Backend/API) y Agente 4 (JavaScript/Logic)
- **Coordinación con:** Agente 1 (Coordinador) y Agente 5 (CSS/Styling)

---

## 📅 **METODOLOGÍA DE 5 SEMANAS - COORDINACIÓN SECUENCIAL**

### **SEMANA 1: [A] ACTIVO - FUNDAMENTOS HTML**
**Tarea:** Optimización de estructura HTML y componentes principales
**Dependencias:** Ninguna (puede trabajar independientemente)

### **SEMANA 2: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Completado en Semana 1
**Dependencias:** Trabajo de Agentes 3 y 4

### **SEMANA 3: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Completado en Semana 1
**Dependencias:** Trabajo de Agentes 3 y 4

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
- ✅ **`AI_AGENT_HTML_GUIDELINES.md`** - Guías específicas HTML
- ✅ **`DOCUMENTACION_NOMENCLATURA_UNIFICADA.md`** - Estructura de datos

**⚠️ CRÍTICO:** NO puedes empezar a trabajar sin leer estos 4 archivos. Contienen:
- Convenciones de nombres que DEBES seguir
- Reglas para evitar crear nuevas duplicaciones
- Protocolos de comunicación entre archivos
- Estándares de sintaxis unificada

**🔍 VERIFICACIÓN OBLIGATORIA:**
Antes de proceder con tu trabajo específico, confirma que:
- [x] Leíste completamente `AGENT_CODING_STANDARDS.md`
- [x] Leíste completamente `MANUAL_5_AGENTES_UNIFICADO.md`
- [x] Leíste completamente `AI_AGENT_HTML_GUIDELINES.md`
- [x] Leíste completamente `DOCUMENTACION_NOMENCLATURA_UNIFICADA.md`
- [x] Entiendes las convenciones de nomenclatura
- [x] Entiendes las reglas de unificación
- [x] Entiendes el sistema [A/a] de coordinación

### **PASO 1: VERIFICACIÓN PREVIA**
```bash
# Ejecutar DESPUÉS de leer los archivos base
node scripts/enhanced_agent1_coordinator_fixed.cjs

# Validar estructura HTML
node scripts/html-validator.js
```

**Debes confirmar:**
- ✅ Que leíste y entendiste los 4 archivos base
- ✅ Que entiendes el sistema [A/a] de coordinación
- ✅ Que tienes permisos para modificar archivos HTML
- ✅ Que no hay otros agentes trabajando simultáneamente
- ✅ Que la estructura HTML es válida

### **PASO 2: TAREAS ESPECÍFICAS POR SEMANA**

#### **SEMANA 1 - [A] ACTIVO:**
1. **Validar estructura HTML** en `index.html`
2. **Optimizar componentes** de flashcards para soporte multimedia
3. **Implementar mejoras** en la interfaz de usuario
4. **Asegurar responsividad** completa en dispositivos móviles

#### **SEMANA 4 - [A] ACTIVO:**
1. **Integrar con trabajo** de Agentes 3 y 4
2. **Verificar compatibilidad** entre componentes
3. **Optimizar rendimiento** general
4. **Validar funcionalidad** completa

#### **SEMANA 5 - [A] ACTIVO:**
1. **Optimización final** de estructura HTML
2. **Validación completa** de componentes
3. **Reporte final** de mejoras implementadas

### **PASO 3: VERIFICACIÓN OBLIGATORIA**

**Después de cada semana:**
```bash
# Verificar que no hay errores de sintaxis
node -c index.html

# Validar estructura HTML
node scripts/html-validator.js

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
        from: 'AGENT-2', 
        action: 'STATUS_UPDATE', 
        data: { 
            status: '[A] ACTIVO', 
            week: 1, 
            progress: '50%' 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 3 (BACKEND):**
```javascript
// Notificar cuando HTML está listo para APIs
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-2', 
        action: 'HTML_READY', 
        data: { 
            components: ['flashcards', 'forms', 'navigation'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 4 (JAVASCRIPT):**
```javascript
// Notificar cuando estructura HTML está lista para JavaScript
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-2', 
        action: 'HTML_STRUCTURE_READY', 
        data: { 
            selectors: ['#flashcard-container', '.deck-grid', '.study-section'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 5 (CSS):**
```javascript
// Notificar cuando HTML está listo para estilos
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-2', 
        action: 'HTML_READY_FOR_STYLING', 
        data: { 
            classes: ['flashcard', 'deck', 'study'], 
            ids: ['main-container', 'navigation'] 
        } 
    }
}));
```

---

## 📊 **REPORTES Y SEGUIMIENTO**

### **REPORTE SEMANAL OBLIGATORIO:**
```javascript
const weeklyReport = {
    agent: 'AGENT-2',
    week: 1,
    status: '[A] ACTIVO',
    tasksCompleted: [
        'Validación HTML completada',
        'Componentes optimizados',
        'Responsividad implementada'
    ],
    nextWeek: '[a] EN ESPERA',
    dependencies: 'Esperando Agentes 3 y 4',
    issues: [],
    recommendations: []
};
```

### **ENTREGABLES POR SEMANA:**
- **Semana 1:** HTML optimizado y validado
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
# Validar estructura HTML
node scripts/html-validator.js

# Verificar estado actual
cat final_test_results.md

# Validar nomenclatura
grep -r "front_content\|back_content" --include="*.html" .
```

---

## ✅ **CRITERIOS DE ÉXITO**

### **AL FINALIZAR CADA SEMANA:**
- ✅ HTML válido y sin errores
- ✅ Componentes optimizados
- ✅ Responsividad completa
- ✅ Compatibilidad con otros agentes
- ✅ Documentación actualizada

### **AL FINALIZAR EL PROYECTO:**
- ✅ Estructura HTML completamente optimizada
- ✅ Integración perfecta con otros agentes
- ✅ Rendimiento optimizado
- ✅ Código limpio sin duplicados
- ✅ Documentación completa

---

**¿Estás listo para comenzar con la Semana 1 como [A] ACTIVO?**

