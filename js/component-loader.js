/**
 * Sistema de Carga de Componentes Modular
 * Permite cargar secciones HTML de forma dinámica y organizada
 */

class ComponentLoader {
  constructor() {
    this.components = new Map();
    this.loadedComponents = new Set();
    this.initialized = false;
    
    // Definir los componentes disponibles
    this.registerComponents();
  }

  /**
   * Registra todos los componentes disponibles
   */
  registerComponents() {
    this.components.set('navigation', {
      path: './components/navigation.html',
      target: '#navigation-container',
      dependencies: []
    });

    this.components.set('dashboard', {
      path: './sections/dashboard.html',
      target: '#main-content',
      dependencies: ['navigation']
    });

    this.components.set('estudiar', {
      path: './sections/estudiar.html',
      target: '#main-content',
      dependencies: ['navigation']
    });

    this.components.set('crear', {
      path: './sections/crear.html',
      target: '#main-content',
      dependencies: ['navigation']
    });

    this.components.set('gestionar', {
      path: './sections/gestionar.html',
      target: '#main-content',
      dependencies: ['navigation']
    });

    this.components.set('ranking', {
      path: './sections/ranking.html',
      target: '#main-content',
      dependencies: ['navigation']
    });
  }

  /**
   * Inicializa el sistema de componentes
   */
  async init() {
    try {
      console.log('🚀 Inicializando sistema de componentes...');
      
      // Cargar navegación primero
      await this.loadComponent('navigation');
      
      // Cargar dashboard por defecto
      await this.loadComponent('dashboard');
      
      this.initialized = true;
      console.log('✅ Sistema de componentes inicializado');
      
      // Disparar evento de inicialización
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
      
    } catch (error) {
      console.error('❌ Error inicializando componentes:', error);
      this.fallbackInit();
    }
  }

  /**
   * Carga un componente específico
   */
  async loadComponent(componentName, force = false) {
    if (this.loadedComponents.has(componentName) && !force) {
      console.log(`📋 Componente '${componentName}' ya cargado`);
      return true;
    }

    const component = this.components.get(componentName);
    if (!component) {
      console.warn(`⚠️ Componente '${componentName}' no registrado`);
      return false;
    }

    try {
      // Cargar dependencias primero
      for (const dependency of component.dependencies) {
        await this.loadComponent(dependency);
      }

      // Cargar el HTML del componente
      const html = await this.fetchComponent(component.path);
      
      // Insertar en el DOM
      this.insertComponent(html, component.target, componentName);
      
      // Marcar como cargado
      this.loadedComponents.add(componentName);
      
      console.log(`✅ Componente '${componentName}' cargado exitosamente`);
      return true;

    } catch (error) {
      console.error(`❌ Error cargando componente '${componentName}':`, error);
      return false;
    }
  }

  /**
   * Obtiene el HTML de un componente
   */
  async fetchComponent(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  }

  /**
   * Inserta un componente en el DOM
   */
  insertComponent(html, target, componentName) {
    const targetElement = document.querySelector(target);
    if (!targetElement) {
      throw new Error(`Target element '${target}' not found`);
    }

    // Si es una sección, reemplazar contenido
    if (componentName !== 'navigation') {
      targetElement.innerHTML = html;
    } else {
      // Para navegación, agregar al contenedor
      targetElement.innerHTML = html;
    }

    // Ejecutar scripts embebidos
    this.executeScripts(targetElement);
  }

  /**
   * Ejecuta scripts embebidos en componentes
   */
  executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      document.head.appendChild(newScript);
      document.head.removeChild(newScript);
    });
  }

  /**
   * Cambia a una sección específica
   */
  async showSection(sectionName) {
    console.log(`🧭 Cambiando a sección: ${sectionName}`);
    
    try {
      // Cargar el componente si no está cargado
      const loaded = await this.loadComponent(sectionName);
      if (!loaded) {
        console.error(`No se pudo cargar la sección: ${sectionName}`);
        return false;
      }

      // Ocultar todas las secciones
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });

      // Mostrar la sección objetivo
      const targetSection = document.getElementById(sectionName);
      if (targetSection) {
        targetSection.classList.add('active');
        
        // Actualizar navegación
        this.updateNavigation(sectionName);
        
        // Disparar evento de cambio de sección
        document.dispatchEvent(new CustomEvent('sectionChanged', {
          detail: { section: sectionName }
        }));
        
        return true;
      }

      return false;

    } catch (error) {
      console.error(`Error cambiando a sección ${sectionName}:`, error);
      return false;
    }
  }

  /**
   * Actualiza la navegación activa
   */
  updateNavigation(activeSectionName) {
    // Actualizar enlaces de navegación
    document.querySelectorAll('[data-section]').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === activeSectionName) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Recarga un componente
   */
  async reloadComponent(componentName) {
    console.log(`🔄 Recargando componente: ${componentName}`);
    this.loadedComponents.delete(componentName);
    return await this.loadComponent(componentName, true);
  }

  /**
   * Inicialización de respaldo sin componentes dinámicos
   */
  fallbackInit() {
    console.log('🆘 Iniciando modo de respaldo sin carga dinámica');
    
    // Mantener el HTML estático existente
    this.initialized = true;
    
    // Configurar navegación básica
    document.addEventListener('click', (e) => {
      const navElement = e.target.closest('[data-section]');
      if (navElement) {
        e.preventDefault();
        const section = navElement.getAttribute('data-section');
        this.showSectionFallback(section);
      }
    });
  }

  /**
   * Navegación de respaldo
   */
  showSectionFallback(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
      this.updateNavigation(sectionName);
    }
  }

  /**
   * Obtiene el estado del sistema
   */
  getStatus() {
    return {
      initialized: this.initialized,
      loadedComponents: Array.from(this.loadedComponents),
      registeredComponents: Array.from(this.components.keys())
    };
  }
}

// Crear instancia global
window.componentLoader = new ComponentLoader();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.componentLoader.init();
  });
} else {
  window.componentLoader.init();
}

// Funciones globales para compatibilidad
window.showSection = (sectionName) => {
  return window.componentLoader.showSection(sectionName);
};

window.reloadComponent = (componentName) => {
  return window.componentLoader.reloadComponent(componentName);
};

// Debug functions
window.debugComponents = () => {
  console.table(window.componentLoader.getStatus());
};

console.log('📦 Sistema de componentes cargado');