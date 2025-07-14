# 🛠️ Comandos de Debugging - StudyingFlash

## 🚀 Comandos de Inicio Rápido

```bash
# Iniciar servidor
python3 -m http.server 8000

# Verificar estado general
./dev-helper.sh check

# Monitoreo en tiempo real
./dev-helper.sh monitor
```

## 🔍 Comandos de DevTools (F12 Console)

### Verificación de Navegación
```javascript
// Estado general de navegación
debugNav()

// Verificación de salud completa
checkHealth()

// Reporte detallado del sistema
healthReport()

// Estado de la aplicación
console.table(window.appState)
```

### Debugging de Navegación
```javascript
// Forzar reset de navegación
forceNavigationReset()

// Verificar elementos críticos
console.log('Secciones:', document.querySelectorAll('.section').length)
console.log('Enlaces nav:', document.querySelectorAll('[data-section]').length)
console.log('Sección activa:', document.querySelector('.section.active')?.id)
```

### Navegación Manual de Emergencia
```javascript
// Si la navegación no funciona, usar esto:
function emergencyNav(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(section).classList.add('active');
  document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-section="${section}"]`).classList.add('active');
}

// Ejemplos:
emergencyNav('dashboard')
emergencyNav('estudiar')
emergencyNav('crear')
```

### Limpieza de Cache
```javascript
// Limpiar localStorage
localStorage.clear()

// Recargar sin cache
location.reload(true)

// Forzar recarga de scripts
bustCache()
```

## 🔧 Comandos del Sistema

### Verificaciones Rápidas
```bash
# Estado del servidor
curl -I http://localhost:8000

# Archivos modificados recientemente
find . -name "*.js" -o -name "*.html" -o -name "*.css" | xargs ls -lt | head -10

# Buscar errores en JavaScript
grep -n "console.error\|console.warn" *.js
```

### Backup y Restauración
```bash
# Crear backup automático
./dev-helper.sh backup

# Listar backups
ls -la backup_*

# Restaurar desde backup
cp backup_YYYYMMDD_HHMMSS/* .
```

### Limpiar Cache de Archivos
```bash
# Actualizar timestamps para forzar recarga
./dev-helper.sh cache

# O manualmente:
touch index.html app-functional.js dashboard-enhanced.js
```

## 🚨 Resolución de Problemas Comunes

### Problema: "La navegación no funciona"
```javascript
// 1. Verificar estado
debugNav()

// 2. Si hay problemas, resetear
forceNavigationReset()

// 3. Si persiste, usar navegación de emergencia
emergencyNav('dashboard')
```

### Problema: "Los decks no aparecen"
```javascript
// Verificar datos en localStorage
console.log(localStorage.getItem('studyingflash_decks'))

// Verificar función de actualización
if (typeof app !== 'undefined' && app.updateDashboardDecks) {
  app.updateDashboardDecks()
}
```

### Problema: "Cambios no se reflejan"
```bash
# 1. Limpiar cache del servidor
./dev-helper.sh cache

# 2. En el navegador: Ctrl+Shift+R
# 3. Si persiste, verificar servidor
./dev-helper.sh server
```

### Problema: "Error de JavaScript"
```javascript
// 1. Verificar errores en consola
console.log('Errores:', window.errors || 'ninguno')

// 2. Verificar salud del sistema
healthReport()

// 3. Reinicializar si es necesario
if (window.healthMonitor) {
  window.healthMonitor.attemptRecovery('navigation', {})
}
```

## 📊 Monitoreo en Tiempo Real

### Configurar Debug Mode
```javascript
// Activar modo debug
window.appState.debugMode = true

// Ver logs detallados en tiempo real
window.healthMonitor.checkInterval = 5000 // cada 5 segundos
```

### Dashboard de Sistema
```javascript
// Función para mostrar estado completo
function systemDashboard() {
  const nav = debugNav() || {}
  const health = checkHealth() || {}
  const state = window.appState || {}
  
  console.group('🎯 Sistema StudyingFlash')
  console.table({ nav, health, state })
  console.groupEnd()
}

// Ejecutar cada 30 segundos
setInterval(systemDashboard, 30000)
```

## 🔄 Comandos de Recuperación

### Reset Completo
```javascript
// Reset total del sistema (úsalo como último recurso)
function totalReset() {
  localStorage.clear()
  window.appState = {
    currentSection: 'dashboard',
    navigationReady: false,
    lastUpdate: Date.now()
  }
  forceNavigationReset()
  location.reload()
}
```

### Backup de Estado
```javascript
// Guardar estado actual
function backupState() {
  const backup = {
    appState: window.appState,
    localStorage: {...localStorage},
    timestamp: Date.now()
  }
  console.log('Backup creado:', backup)
  return backup
}

// Restaurar estado
function restoreState(backup) {
  window.appState = backup.appState
  Object.keys(backup.localStorage).forEach(key => {
    localStorage.setItem(key, backup.localStorage[key])
  })
}
```

## 📝 Checklist de Desarrollo

Antes de hacer cambios importantes:
- [ ] `./dev-helper.sh check` - Todo OK
- [ ] `checkHealth()` - Sistema saludable  
- [ ] `debugNav()` - Navegación funcionando
- [ ] `./dev-helper.sh backup` - Backup creado

Después de hacer cambios:
- [ ] Probar navegación entre secciones
- [ ] `checkHealth()` - Verificar estado
- [ ] `./dev-helper.sh cache` si es necesario
- [ ] Confirmar en diferentes navegadores

---

💡 **Tip**: Agrega estos comandos a tus marcadores para acceso rápido:
- `javascript:debugNav()`
- `javascript:checkHealth()`
- `javascript:healthReport()`
