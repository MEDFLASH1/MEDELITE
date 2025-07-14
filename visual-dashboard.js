/**
 * Visual Health Dashboard - Monitoreo visual en tiempo real
 */

class VisualHealthDashboard {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.updateInterval = null;
    this.init();
  }

  init() {
    this.createDashboard();
    this.setupKeyboardShortcut();
    console.log('🎯 Dashboard visual disponible - Presiona Ctrl+Shift+D para ver');
  }

  createDashboard() {
    // Create dashboard container
    this.container = document.createElement('div');
    this.container.id = 'health-dashboard';
    this.container.innerHTML = `
      <div class="health-dashboard-content">
        <div class="health-header">
          <h3>🏥 StudyingFlash Health Monitor</h3>
          <button class="health-close" onclick="visualDashboard.hide()">✕</button>
        </div>
        <div class="health-body">
          <div class="health-grid">
            <div class="health-card" id="nav-status">
              <div class="health-icon">🧭</div>
              <div class="health-info">
                <div class="health-title">Navegación</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
            
            <div class="health-card" id="app-status">
              <div class="health-icon">⚙️</div>
              <div class="health-info">
                <div class="health-title">App State</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
            
            <div class="health-card" id="dom-status">
              <div class="health-icon">🏗️</div>
              <div class="health-info">
                <div class="health-title">DOM Integrity</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
            
            <div class="health-card" id="events-status">
              <div class="health-icon">🔗</div>
              <div class="health-info">
                <div class="health-title">Event Listeners</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
            
            <div class="health-card" id="performance-status">
              <div class="health-icon">⚡</div>
              <div class="health-info">
                <div class="health-title">Performance</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
            
            <div class="health-card" id="server-status">
              <div class="health-icon">🌐</div>
              <div class="health-info">
                <div class="health-title">Servidor</div>
                <div class="health-status">Verificando...</div>
                <div class="health-details"></div>
              </div>
            </div>
          </div>
          
          <div class="health-logs">
            <h4>📋 Últimos Eventos</h4>
            <div class="health-log-container" id="health-logs"></div>
          </div>
          
          <div class="health-actions">
            <button onclick="visualDashboard.forceCheck()" class="health-btn primary">
              🔄 Verificar Ahora
            </button>
            <button onclick="visualDashboard.clearLogs()" class="health-btn secondary">
              🗑️ Limpiar Logs
            </button>
            <button onclick="window.forceNavigationReset?.()" class="health-btn warning">
              🔧 Reset Navegación
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();
    
    // Add to body but keep hidden
    document.body.appendChild(this.container);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #health-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: none;
        padding: 20px;
        box-sizing: border-box;
        font-family: 'Inter', monospace;
        color: white;
        overflow-y: auto;
      }

      .health-dashboard-content {
        max-width: 1200px;
        margin: 0 auto;
        background: #1a1a1a;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #333;
      }

      .health-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #333;
      }

      .health-header h3 {
        margin: 0;
        color: #6366f1;
        font-size: 1.5rem;
      }

      .health-close {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
      }

      .health-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
      }

      .health-card {
        background: #2a2a2a;
        border: 1px solid #404040;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;
      }

      .health-card.healthy {
        border-color: #10b981;
        background: #064e3b;
      }

      .health-card.warning {
        border-color: #f59e0b;
        background: #78350f;
      }

      .health-card.error {
        border-color: #ef4444;
        background: #7f1d1d;
      }

      .health-icon {
        font-size: 2rem;
        line-height: 1;
      }

      .health-info {
        flex: 1;
      }

      .health-title {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 4px;
        color: #e5e7eb;
      }

      .health-status {
        font-size: 0.8rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .health-status.healthy { color: #10b981; }
      .health-status.warning { color: #f59e0b; }
      .health-status.error { color: #ef4444; }

      .health-details {
        font-size: 0.75rem;
        color: #9ca3af;
        line-height: 1.3;
      }

      .health-logs {
        background: #111;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
      }

      .health-logs h4 {
        margin: 0 0 12px 0;
        color: #d1d5db;
        font-size: 1rem;
      }

      .health-log-container {
        max-height: 200px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .health-log-entry {
        padding: 4px 0;
        border-bottom: 1px solid #333;
      }

      .health-log-entry:last-child {
        border-bottom: none;
      }

      .health-log-time {
        color: #6b7280;
        margin-right: 8px;
      }

      .health-log-level {
        margin-right: 8px;
        font-weight: 600;
      }

      .health-log-level.info { color: #3b82f6; }
      .health-log-level.warn { color: #f59e0b; }
      .health-log-level.error { color: #ef4444; }
      .health-log-level.success { color: #10b981; }

      .health-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .health-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .health-btn.primary {
        background: #6366f1;
        color: white;
      }

      .health-btn.secondary {
        background: #6b7280;
        color: white;
      }

      .health-btn.warning {
        background: #f59e0b;
        color: white;
      }

      .health-btn:hover {
        transform: translateY(-1px);
        opacity: 0.9;
      }

      @media (max-width: 768px) {
        .health-grid {
          grid-template-columns: 1fr;
        }
        
        .health-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D to toggle dashboard
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
      // Escape to hide
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  show() {
    this.container.style.display = 'block';
    this.isVisible = true;
    this.startUpdating();
    this.log('info', 'Dashboard abierto');
  }

  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
    this.stopUpdating();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  startUpdating() {
    this.updateDashboard();
    this.updateInterval = setInterval(() => {
      this.updateDashboard();
    }, 2000); // Update every 2 seconds
  }

  stopUpdating() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateDashboard() {
    if (!this.isVisible) return;

    try {
      // Get health data
      const healthData = window.healthMonitor ? window.healthMonitor.forceCheck() : {};
      
      // Update each card
      Object.keys(healthData).forEach(checkName => {
        this.updateHealthCard(checkName, healthData[checkName]);
      });

      // Check server status
      this.checkServerStatus();

    } catch (error) {
      this.log('error', `Error actualizando dashboard: ${error.message}`);
    }
  }

  updateHealthCard(checkName, result) {
    const cardId = this.getCardId(checkName);
    const card = document.getElementById(cardId);
    
    if (!card || !result) return;

    const statusEl = card.querySelector('.health-status');
    const detailsEl = card.querySelector('.health-details');

    // Update status
    statusEl.textContent = this.getStatusText(result.status);
    statusEl.className = `health-status ${result.status}`;

    // Update details
    if (result.details) {
      detailsEl.textContent = this.formatDetails(result.details);
    }

    // Update card style
    card.className = `health-card ${result.status}`;
  }

  getCardId(checkName) {
    const mapping = {
      'navigation': 'nav-status',
      'appState': 'app-status',
      'domIntegrity': 'dom-status',
      'eventListeners': 'events-status',
      'performance': 'performance-status'
    };
    return mapping[checkName] || checkName + '-status';
  }

  getStatusText(status) {
    const texts = {
      'healthy': '✅ Saludable',
      'warning': '⚠️ Advertencia',
      'error': '❌ Error'
    };
    return texts[status] || status;
  }

  formatDetails(details) {
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
    }
    return String(details);
  }

  async checkServerStatus() {
    try {
      const response = await fetch('/', { method: 'HEAD' });
      const status = response.ok ? 'healthy' : 'error';
      const result = {
        status,
        details: { 
          responseTime: performance.now(),
          status: response.status 
        }
      };
      this.updateHealthCard('server', result);
    } catch (error) {
      this.updateHealthCard('server', {
        status: 'error',
        details: { error: error.message }
      });
    }
  }

  forceCheck() {
    this.log('info', 'Verificación manual ejecutada');
    this.updateDashboard();
    
    if (window.healthMonitor) {
      window.healthMonitor.forceCheck();
    }
  }

  clearLogs() {
    const logContainer = document.getElementById('health-logs');
    if (logContainer) {
      logContainer.innerHTML = '';
    }
  }

  log(level, message) {
    const logContainer = document.getElementById('health-logs');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = 'health-log-entry';
    
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `
      <span class="health-log-time">${time}</span>
      <span class="health-log-level ${level}">[${level.toUpperCase()}]</span>
      <span class="health-log-message">${message}</span>
    `;

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 50 entries
    while (logContainer.children.length > 50) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }
}

// Initialize visual dashboard
const visualDashboard = new VisualHealthDashboard();

// Global access
window.visualDashboard = visualDashboard;
window.showHealthDashboard = () => visualDashboard.show();

console.log('🎯 Dashboard visual cargado! Usa Ctrl+Shift+D para abrirlo o showHealthDashboard()');
