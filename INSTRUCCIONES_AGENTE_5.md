# INSTRUCCIONES ESPECÍFICAS - AGENTE 5
## ESPECIALISTA EN CSS/STYLING - SISTEMA UNIFICADO

**Asignado por:** AGENTE 1 (Coordinador Maestro)  
**Fecha:** 8 de Julio, 2025  
**Prioridad:** CRÍTICA  
**Sistema de Coordinación:** [A/a] - ACTIVO/EN ESPERA  

---

## 🎯 **TU MISIÓN ESPECÍFICA**

Como **AGENTE 5 - ESPECIALISTA EN CSS/STYLING**, tu responsabilidad es **optimizar estilos y presentación visual** siguiendo el sistema de coordinación unificado.

### **ESTADOS DE TRABAJO:**
- **[A] ACTIVO:** Ejecutando, modificando o creando código
- **[a] EN ESPERA:** No ejecutando, esperando prerrequisitos

### **DEPENDENCIAS CON OTROS AGENTES:**
- **Depende de:** Agente 2 (Frontend/HTML), Agente 3 (Backend/API) y Agente 4 (JavaScript/Logic)
- **Prerrequisito para:** Ninguno (último en la cadena)
- **Coordinación con:** Agente 1 (Coordinador) y otros agentes

---

## 📅 **METODOLOGÍA DE 5 SEMANAS - COORDINACIÓN SECUENCIAL**

### **SEMANA 1: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo de Agentes 2, 3 y 4
**Dependencias:** Estructura HTML, APIs y lógica JavaScript

### **SEMANA 2: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo de Agentes 2, 3 y 4
**Dependencias:** Estructura HTML, APIs y lógica JavaScript

### **SEMANA 3: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo de Agentes 2, 3 y 4
**Dependencias:** Estructura HTML, APIs y lógica JavaScript

### **SEMANA 4: [A] ACTIVO - OPTIMIZACIÓN DE ESTILOS**
**Tarea:** Optimización de estilos y presentación visual
**Dependencias:** Trabajo de Agentes 2, 3 y 4

### **SEMANA 5: [A] ACTIVO - OPTIMIZACIÓN FINAL**
**Tarea:** Optimización final y validación
**Dependencias:** Trabajo de todas las semanas anteriores

---

## 📋 **PROTOCOLO DE TRABAJO OBLIGATORIO**

### **PASO 0: LECTURA OBLIGATORIA DE ARCHIVOS BASE**

**📚 ARCHIVOS OBLIGATORIOS EN GITHUB:**
- ✅ **`AGENT_CODING_STANDARDS.md`** - Estándares de codificación y nomenclatura
- ✅ **`MANUAL_5_AGENTES_UNIFICADO.md`** - Manual completo del sistema
- ✅ **`INSTRUCCIONES_AGENTE_5.md`** - Protocolo específico del agente
- ✅ **`AI_AGENT_HTML_GUIDELINES.md`** - Guías específicas HTML

**⚠️ CRÍTICO:** NO puedes empezar a trabajar sin leer estos 4 archivos. Contienen:
- Convenciones de nombres que DEBES seguir
- Reglas para evitar crear nuevas duplicaciones
- Protocolos de comunicación entre archivos
- Estándares de sintaxis unificada

**🔍 VERIFICACIÓN OBLIGATORIA:**
Antes de proceder con tu trabajo específico, confirma que:
- [x] Leíste completamente `AGENT_CODING_STANDARDS.md`
- [x] Leíste completamente `MANUAL_5_AGENTES_UNIFICADO.md`
- [x] Leíste completamente `INSTRUCCIONES_AGENTE_5.md`
- [x] Leíste completamente `AI_AGENT_HTML_GUIDELINES.md`
- [x] Entiendes las convenciones de nomenclatura
- [x] Entiendes las reglas de unificación
- [x] Entiendes el sistema [A/a] de coordinación

### **PASO 1: VERIFICACIÓN DE DEPENDENCIAS OBLIGATORIA (NUEVO)**
```bash
# ANTES DE COMENZAR CUALQUIER TRABAJO, EJECUTAR OBLIGATORIAMENTE:
./scripts/verify_agent_dependencies.sh 5 [WEEK_NUMBER]

# SOLO continuar si retorna "AUTORIZADO"
# Si retorna "BLOQUEADO", DEBE ESPERAR

# Ejemplo para Semana 1:
./scripts/verify_agent_dependencies.sh 5 1
# Debe verificar que Agente 4 completó componentes base
```

**⚠️ CRÍTICO PARA SEMANA 1:**
- **DEBE esperar** que Agente 4 complete componentes React base
- **DEBE revisar** estructura de componentes para configurar testing
- **NO puede proceder** sin componentes listos para testing

### **PASO 1.5: NOTIFICACIÓN DE COMPLETACIÓN (NUEVO - OBLIGATORIO)**
```bash
# AL COMPLETAR CUALQUIER SEMANA, EJECUTAR OBLIGATORIAMENTE:
node scripts/notify_dependent_agents.cjs 5 [WEEK_NUMBER]

# Esto notificará la completación para coordinación general
```

**Debes confirmar:**
- ✅ Que leíste y entendiste los 4 archivos base
- ✅ Que entiendes el sistema [A/a] de coordinación
- ✅ Que los Agentes 2, 3 y 4 reportaron trabajo completado
- ✅ Que tienes permisos para modificar archivos CSS
- ✅ Que no hay locks activos de otros agentes

### **PASO 2: TAREAS ESPECÍFICAS POR SEMANA**

#### **SEMANA 4 - [A] ACTIVO:**
1. **Optimizar `main.css`**, `footer.css` y estilos responsivos
2. **Implementar mejoras** en tema oscuro
3. **Optimizar animaciones** y transiciones
4. **Mejorar accesibilidad** visual

#### **SEMANA 5 - [A] ACTIVO:**
1. **Integrar con trabajo** de todos los agentes
2. **Verificar compatibilidad** entre estilos y componentes
3. **Optimizar rendimiento** general de CSS
4. **Validar funcionalidad** completa

### **PASO 3: VERIFICACIÓN OBLIGATORIA**

**Después de cada semana:**
```bash
# Verificar que no hay errores de sintaxis CSS
node -e "const fs = require('fs'); fs.readFileSync('main.css', 'utf8'); console.log('✅ CSS válido');"

# Verificar que los estilos funcionan
echo "✅ Verificación completada"
```

---

## 🔄 **SISTEMA DE COMUNICACIÓN CON OTROS AGENTES**

### **COMUNICACIÓN CON AGENTE 1 (COORDINADOR):**
```javascript
// Reportar estado de trabajo
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-5', 
        action: 'STATUS_UPDATE', 
        data: { 
            status: '[A] ACTIVO', 
            week: 4, 
            progress: '80%' 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 2 (FRONTEND):**
```javascript
// Notificar cuando estilos están listos para HTML
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-5', 
        action: 'STYLES_READY', 
        data: { 
            classes: ['flashcard', 'deck', 'study'], 
            themes: ['light', 'dark'], 
            responsive: true 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 3 (BACKEND):**
```javascript
// Notificar cuando estilos están listos para APIs
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-5', 
        action: 'STYLES_READY_FOR_APIS', 
        data: { 
            dataStructures: ['flashcard', 'deck', 'study'], 
            formats: ['front_content', 'back_content'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 4 (JAVASCRIPT):**
```javascript
// Notificar cuando estilos están listos para JavaScript
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-5', 
        action: 'STYLES_READY_FOR_JS', 
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
    agent: 'AGENT-5',
    week: 4,
    status: '[A] ACTIVO',
    tasksCompleted: [
        'Estilos optimizados',
        'Tema oscuro mejorado',
        'Responsividad implementada'
    ],
    nextWeek: '[A] ACTIVO',
    dependencies: 'Optimización final',
    issues: [],
    recommendations: []
};
```

### **ENTREGABLES POR SEMANA:**
- **Semana 4:** Estilos optimizados y mejoras visuales
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
# Verificar CSS
node -e "const fs = require('fs'); fs.readFileSync('main.css', 'utf8'); console.log('✅ CSS válido');"

# Verificar estado actual
cat final_test_results.md

# Validar nomenclatura
grep -r "front_content\|back_content" --include="*.css" .
```

---

## ✅ **CRITERIOS DE ÉXITO**

### **AL FINALIZAR CADA SEMANA:**
- ✅ Estilos funcionando correctamente
- ✅ Responsividad completa
- ✅ Tema oscuro optimizado
- ✅ Compatibilidad con otros agentes
- ✅ Documentación actualizada

### **AL FINALIZAR EL PROYECTO:**
- ✅ Estilos completamente optimizados
- ✅ Integración perfecta con otros agentes
- ✅ Rendimiento optimizado
- ✅ Código limpio sin duplicados
- ✅ Documentación completa

---

**¿Estás listo para comenzar con la Semana 4 como [A] ACTIVO?**

