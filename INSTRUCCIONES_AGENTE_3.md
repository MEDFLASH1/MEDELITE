# INSTRUCCIONES ESPECÍFICAS - AGENTE 3
## ESPECIALISTA EN BACKEND/API - SISTEMA UNIFICADO

**Asignado por:** AGENTE 1 (Coordinador Maestro)  
**Fecha:** 8 de Julio, 2025  
**Prioridad:** ALTA  
**Sistema de Coordinación:** [A/a] - ACTIVO/EN ESPERA  

---

## 🎯 **TU MISIÓN ESPECÍFICA**

Como **AGENTE 3 - ESPECIALISTA EN BACKEND/API**, tu responsabilidad es **optimizar APIs y servicios backend** siguiendo el sistema de coordinación unificado.

### **ESTADOS DE TRABAJO:**
- **[A] ACTIVO:** Ejecutando, modificando o creando código
- **[a] EN ESPERA:** No ejecutando, esperando prerrequisitos

### **DEPENDENCIAS CON OTROS AGENTES:**
- **Depende de:** Agente 2 (Frontend/HTML) - Necesita estructura HTML lista
- **Prerrequisito para:** Agente 4 (JavaScript/Logic) y Agente 5 (CSS/Styling)
- **Coordinación con:** Agente 1 (Coordinador) y otros agentes

---

## 📅 **METODOLOGÍA DE 5 SEMANAS - COORDINACIÓN SECUENCIAL**

### **SEMANA 1: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Esperando trabajo del Agente 2
**Dependencias:** Estructura HTML del Agente 2

### **SEMANA 2: [A] ACTIVO - OPTIMIZACIÓN DE APIS**
**Tarea:** Optimización de APIs y servicios backend
**Dependencias:** Estructura HTML de Semana 1

### **SEMANA 3: [a] EN ESPERA - ESPERANDO PRERREQUISITOS**
**Estado:** Completado en Semana 2
**Dependencias:** Trabajo de Agente 4

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
- ✅ **`INSTRUCCIONES_AGENTE_3.md`** - Protocolo específico del agente

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
- [x] Leíste completamente `INSTRUCCIONES_AGENTE_3.md`
- [x] Entiendes las convenciones de nomenclatura
- [x] Entiendes las reglas de unificación
- [x] Entiendes el sistema [A/a] de coordinación

### **PASO 1: VERIFICACIÓN PREVIA Y DEPENDENCIAS**
```bash
# NUEVO: Verificar dependencias antes de comenzar
./scripts/verify_agent_dependencies.sh 3 [WEEK_NUMBER]

# Solo continuar si retorna "AUTORIZADO"
# Si retorna "BLOQUEADO", DEBE ESPERAR

# Verificar que no hay locks activos
ls -la *.lock 2>/dev/null || echo "No hay locks activos"
```

### **PASO 1.5: NOTIFICACIÓN DE COMPLETACIÓN (NUEVO - OBLIGATORIO)**
```bash
# AL COMPLETAR CUALQUIER SEMANA, EJECUTAR OBLIGATORIAMENTE:
node scripts/notify_dependent_agents.cjs 3 [WEEK_NUMBER]

# Esto desbloqueará automáticamente a los agentes dependientes
# Ejemplo: Al completar Semana 1, desbloquea Agente 4 para Semana 1
```

**Debes confirmar:**
- ✅ Que leíste y entendiste los 4 archivos base
- ✅ Que entiendes el sistema [A/a] de coordinación
- ✅ Que el Agente 2 reportó trabajo completado
- ✅ Que tienes permisos para modificar archivos backend
- ✅ Que no hay locks activos de otros agentes

### **PASO 2: TAREAS ESPECÍFICAS POR SEMANA**

#### **SEMANA 2 - [A] ACTIVO:**
1. **Optimizar `flashcards.service.js`** para mejor rendimiento
2. **Implementar mejoras** en algoritmos de repetición espaciada
3. **Optimizar manejo** de multimedia en APIs
4. **Mejorar sistema** de cache y storage

#### **SEMANA 4 - [A] ACTIVO:**
1. **Integrar con trabajo** de Agentes 2 y 4
2. **Verificar compatibilidad** entre APIs y frontend
3. **Optimizar rendimiento** general de servicios
4. **Validar funcionalidad** completa de APIs

#### **SEMANA 5 - [A] ACTIVO:**
1. **Optimización final** de APIs y servicios
2. **Validación completa** de funcionalidad
3. **Reporte final** de optimizaciones

### **PASO 3: VERIFICACIÓN OBLIGATORIA**

**Después de cada semana:**
```bash
# Verificar que no hay errores de sintaxis
node -c flashcards.service.js

# Verificar que las APIs funcionan
echo "✅ Verificación completada"
```

---

## 🔄 **SISTEMA DE COMUNICACIÓN CON OTROS AGENTES**

### **COMUNICACIÓN CON AGENTE 1 (COORDINADOR):**
```javascript
// Reportar estado de trabajo
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-3', 
        action: 'STATUS_UPDATE', 
        data: { 
            status: '[A] ACTIVO', 
            week: 2, 
            progress: '75%' 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 2 (FRONTEND):**
```javascript
// Notificar cuando APIs están listas para frontend
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-3', 
        action: 'APIS_READY', 
        data: { 
            services: ['flashcards', 'decks', 'study'], 
            endpoints: ['/api/flashcards', '/api/decks', '/api/study'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 4 (JAVASCRIPT):**
```javascript
// Notificar cuando servicios están listos para JavaScript
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-3', 
        action: 'SERVICES_READY', 
        data: { 
            services: ['FlashcardService', 'DeckService', 'StudyService'], 
            algorithms: ['SM2', 'FSRS'] 
        } 
    }
}));
```

### **COMUNICACIÓN CON AGENTE 5 (CSS):**
```javascript
// Notificar cuando APIs están listas para estilos
window.dispatchEvent(new CustomEvent('agent-communication', {
    detail: { 
        from: 'AGENT-3', 
        action: 'APIS_READY_FOR_STYLING', 
        data: { 
            dataStructures: ['flashcard', 'deck', 'study'], 
            formats: ['front_content', 'back_content'] 
        } 
    }
}));
```

---

## 📊 **REPORTES Y SEGUIMIENTO**

### **REPORTE SEMANAL OBLIGATORIO:**
```javascript
const weeklyReport = {
    agent: 'AGENT-3',
    week: 2,
    status: '[A] ACTIVO',
    tasksCompleted: [
        'APIs optimizadas',
        'Algoritmos mejorados',
        'Cache implementado'
    ],
    nextWeek: '[a] EN ESPERA',
    dependencies: 'Esperando Agente 4',
    issues: [],
    recommendations: []
};
```

### **ENTREGABLES POR SEMANA:**
- **Semana 2:** APIs optimizadas y mejoradas
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
# Verificar APIs
curl -f http://localhost:5000/api/flashcards

# Verificar estado actual
cat final_test_results.md

# Validar nomenclatura
grep -r "front_content\|back_content" --include="*.js" .
```

---

## ✅ **CRITERIOS DE ÉXITO**

### **AL FINALIZAR CADA SEMANA:**
- ✅ APIs funcionando correctamente
- ✅ Servicios optimizados
- ✅ Algoritmos mejorados
- ✅ Compatibilidad con otros agentes
- ✅ Documentación actualizada

### **AL FINALIZAR EL PROYECTO:**
- ✅ APIs completamente optimizadas
- ✅ Integración perfecta con otros agentes
- ✅ Rendimiento optimizado
- ✅ Código limpio sin duplicados
- ✅ Documentación completa

---

**¿Estás listo para comenzar con la Semana 2 como [A] ACTIVO?**

