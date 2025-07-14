/**
 * Health Monitor System - Detecta y previene problemas comunes
 */

class HealthMonitor {
  constructor() {
    this.checks = [];
    this.isRunning = false;
    this.checkInterval = 10000; // 10 seconds
    this.issues = new Set();
    this.init();
  }

  init() {
    console.log('🏥 Inicializando Health Monitor...');
    
    // Register health checks
    this.registerChecks();
    
    // Start monitoring
    this.start();
    
    // Setup error handlers
    this.setupErrorHandlers();
  }

  registerChecks() {
    // Navigation Health Check
    this.addCheck('navigation', () => {
      const sections = document.querySelectorAll('.section');
      const navLinks = document.querySelectorAll('[data-section]');
      const activeSection = document.querySelector('.section.active');
      
      return {
        status: sections.length > 0 && navLinks.length > 0 && activeSection ? 'healthy' : 'error',
        details: {
          sections: sections.length,
          navLinks: navLinks.length,
          activeSection: activeSection?.id || 'none'
        },
        message: sections.length === 0 ? 'No sections found' : 
                navLinks.length === 0 ? 'No nav links found' :
                !activeSection ? 'No active section' : 'Navigation OK'
      };
    });

    // App State Check
    this.addCheck('appState', () => {
      const hasApp = typeof window.app !== 'undefined';
      const hasAppState = typeof window.appState !== 'undefined';
      
      return {
        status: hasApp && hasAppState ? 'healthy' : 'warning',
        details: {
          hasApp,
          hasAppState,
          currentSection: window.appState?.currentSection || 'unknown'
        },
        message: !hasApp ? 'App not initialized' :
                !hasAppState ? 'App state missing' : 'App state OK'
      };
    });

    // DOM Integrity Check
    this.addCheck('domIntegrity', () => {
      const criticalElements = [
        '#dashboard',
        '#estudiar', 
        '#crear',
        '#gestionar',
        '#ranking',
        '.nav-menu'
      ];
      
      const missing = criticalElements.filter(selector => !document.querySelector(selector));
      
      return {
        status: missing.length === 0 ? 'healthy' : 'error',
        details: {
          total: criticalElements.length,
          missing: missing.length,
          missingElements: missing
        },
        message: missing.length === 0 ? 'All critical elements present' : 
                `Missing elements: ${missing.join(', ')}`
      };
    });

    // Event Listeners Check
    this.addCheck('eventListeners', () => {
      const navLinks = document.querySelectorAll('[data-section]');
      let workingLinks = 0;
      
      navLinks.forEach(link => {
        if (link.onclick || this.hasEventListener(link, 'click')) {
          workingLinks++;
        }
      });
      
      return {
        status: workingLinks === navLinks.length ? 'healthy' : 'warning',
        details: {
          totalLinks: navLinks.length,
          workingLinks
        },
        message: workingLinks === navLinks.length ? 'All nav links functional' :
                `${navLinks.length - workingLinks} links without handlers`
      };
    });

    // Performance Check
    this.addCheck('performance', () => {
      const now = performance.now();
      const memoryInfo = performance.memory;
      
      return {
        status: memoryInfo && memoryInfo.usedJSHeapSize < 50000000 ? 'healthy' : 'warning',
        details: {
          uptime: Math.round(now / 1000),
          memory: memoryInfo ? {
            used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
          } : 'unavailable'
        },
        message: 'Performance metrics collected'
      };
    });
  }

  addCheck(name, checkFunction) {
    this.checks.push({
      name,
      check: checkFunction,
      lastRun: null,
      lastResult: null
    });
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🏃 Health Monitor iniciado');
    
    // Run initial check
    this.runChecks();
    
    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runChecks();
    }, this.checkInterval);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('⏹️ Health Monitor detenido');
  }

  runChecks() {
    const results = {};
    let healthyCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    this.checks.forEach(check => {
      try {
        const result = check.check();
        check.lastRun = Date.now();
        check.lastResult = result;
        results[check.name] = result;

        // Count status types
        switch (result.status) {
          case 'healthy': healthyCount++; break;
          case 'warning': warningCount++; break;
          case 'error': errorCount++; break;
        }

        // Handle issues
        if (result.status === 'error') {
          this.handleIssue(check.name, result);
        } else {
          this.resolveIssue(check.name);
        }

      } catch (error) {
        console.error(`❌ Error en check ${check.name}:`, error);
        results[check.name] = {
          status: 'error',
          message: `Check failed: ${error.message}`,
          details: { error: error.toString() }
        };
        errorCount++;
      }
    });

    // Log summary
    const totalChecks = this.checks.length;
    if (errorCount > 0) {
      console.warn(`🚨 Health Check: ${errorCount}/${totalChecks} errores, ${warningCount} advertencias`);
    } else if (warningCount > 0) {
      console.log(`⚠️ Health Check: ${warningCount}/${totalChecks} advertencias`);
    } else {
      console.log(`✅ Health Check: ${healthyCount}/${totalChecks} sistemas saludables`);
    }

    // Store results
    this.lastResults = results;
    this.lastCheck = Date.now();

    return results;
  }

  handleIssue(checkName, result) {
    const issueKey = `${checkName}:${result.message}`;
    
    if (!this.issues.has(issueKey)) {
      this.issues.add(issueKey);
      console.error(`🚨 Nuevo problema detectado en ${checkName}: ${result.message}`);
      
      // Auto-recovery attempts
      this.attemptRecovery(checkName, result);
    }
  }

  resolveIssue(checkName) {
    // Remove resolved issues
    Array.from(this.issues).forEach(issueKey => {
      if (issueKey.startsWith(`${checkName}:`)) {
        this.issues.delete(issueKey);
        console.log(`✅ Problema resuelto en ${checkName}`);
      }
    });
  }

  attemptRecovery(checkName, result) {
    console.log(`🔧 Intentando recuperación automática para ${checkName}...`);

    switch (checkName) {
      case 'navigation':
        if (window.navManager) {
          setTimeout(() => window.navManager.setup(), 1000);
        }
        break;
        
      case 'appState':
        if (!window.appState) {
          window.appState = {
            currentSection: 'dashboard',
            navigationReady: false,
            lastUpdate: Date.now()
          };
        }
        break;
        
      case 'eventListeners':
        if (window.forceNavigationReset) {
          setTimeout(() => window.forceNavigationReset(), 500);
        }
        break;
    }
  }

  hasEventListener(element, eventType) {
    // This is a simplified check - in reality, detecting event listeners is complex
    return element.onclick !== null || 
           element.getAttribute('onclick') !== null ||
           element.hasAttribute('data-section');
  }

  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('🚨 Error global capturado:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Promise rejection no manejada:', event.reason);
    });
  }

  // Public API
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      checksCount: this.checks.length,
      issuesCount: this.issues.size,
      issues: Array.from(this.issues),
      lastResults: this.lastResults
    };
  }

  forceCheck() {
    console.log('🔍 Ejecutando verificación manual...');
    return this.runChecks();
  }

  getDetailedReport() {
    const status = this.getStatus();
    const report = {
      timestamp: new Date().toISOString(),
      summary: status,
      checks: this.checks.map(check => ({
        name: check.name,
        lastRun: check.lastRun ? new Date(check.lastRun).toISOString() : null,
        result: check.lastResult
      }))
    };

    console.table(report.checks);
    return report;
  }
}

// Initialize health monitor
const healthMonitor = new HealthMonitor();

// Global access for debugging
window.healthMonitor = healthMonitor;
window.checkHealth = () => healthMonitor.forceCheck();
window.healthReport = () => healthMonitor.getDetailedReport();

console.log('🏥 Health Monitor cargado. Usa checkHealth() o healthReport() para verificar el estado.');
