// ===== MÓDULO DE MELHORIAS DE ACESSIBILIDADE =====
// Implementa funcionalidades para tornar a aplicação mais acessível

const AccessibilityEnhancer = {
    // Configurações de acessibilidade
    settings: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReaderMode: false,
        keyboardNavigation: true
    },
    
    // Elementos focáveis para navegação por teclado
    focusableElements: [],
    currentFocusIndex: -1,
    
    /**
     * Inicializa todas as melhorias de acessibilidade
     */
    init() {
        this.loadSettings();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
        this.setupTextSizeControls();
        this.setupMotionControls();
        this.addAccessibilityToolbar();
        this.setupFocusManagement();
        console.log('♿ Accessibility Enhancer inicializado');
    },
    
    /**
     * Carrega configurações salvas do usuário
     */
    loadSettings() {
        const saved = localStorage.getItem('studyingflash_accessibility');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    },
    
    /**
     * Salva configurações de acessibilidade
     */
    saveSettings() {
        localStorage.setItem('studyingflash_accessibility', JSON.stringify(this.settings));
    },
    
    /**
     * Aplica todas as configurações ativas
     */
    applySettings() {
        if (this.settings.highContrast) this.enableHighContrast();
        if (this.settings.largeText) this.enableLargeText();
        if (this.settings.reducedMotion) this.enableReducedMotion();
        if (this.settings.screenReaderMode) this.enableScreenReaderMode();
    },
    
    /**
     * Configura navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e);
                    break;
                case 'Escape':
                    this.handleEscape(e);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
                case 'Home':
                case 'End':
                    this.handleHomeEnd(e);
                    break;
            }
        });
        
        // Atualizar lista de elementos focáveis
        this.updateFocusableElements();
    },
    
    /**
     * Atualiza lista de elementos focáveis
     */
    updateFocusableElements() {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
    },
    
    /**
     * Gerencia navegação por Tab
     */
    handleTabNavigation(e) {
        this.updateFocusableElements();
        
        if (this.focusableElements.length === 0) return;
        
        const currentElement = document.activeElement;
        const currentIndex = this.focusableElements.indexOf(currentElement);
        
        if (e.shiftKey) {
            // Tab + Shift (voltar)
            const prevIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
            this.focusableElements[prevIndex].focus();
        } else {
            // Tab (avançar)
            const nextIndex = currentIndex >= this.focusableElements.length - 1 ? 0 : currentIndex + 1;
            this.focusableElements[nextIndex].focus();
        }
        
        e.preventDefault();
    },
    
    /**
     * Gerencia ativação por Enter/Espaço
     */
    handleActivation(e) {
        const activeElement = document.activeElement;
        
        if (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button') {
            activeElement.click();
            e.preventDefault();
        }
    },
    
    /**
     * Gerencia tecla Escape
     */
    handleEscape(e) {
        // Fechar modais ou menus abertos
        const openModal = document.querySelector('.modal[style*="display: flex"], .modal.active');
        if (openModal) {
            this.closeModal(openModal);
            e.preventDefault();
        }
        
        // Fechar menu móvel
        const mobileMenu = document.querySelector('.mobile-menu.active');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            e.preventDefault();
        }
    },
    
    /**
     * Gerencia navegação por setas
     */
    handleArrowNavigation(e) {
        const activeElement = document.activeElement;
        const parent = activeElement.closest('[role="menu"], [role="tablist"], .navigation');
        
        if (parent) {
            const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="tab"], .nav-item'));
            const currentIndex = items.indexOf(activeElement);
            
            let nextIndex;
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    break;
            }
            
            if (nextIndex !== undefined && items[nextIndex]) {
                items[nextIndex].focus();
                e.preventDefault();
            }
        }
    },
    
    /**
     * Gerencia teclas Home/End
     */
    handleHomeEnd(e) {
        const activeElement = document.activeElement;
        const parent = activeElement.closest('[role="menu"], [role="tablist"], .navigation');
        
        if (parent) {
            const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="tab"], .nav-item'));
            
            if (e.key === 'Home' && items[0]) {
                items[0].focus();
                e.preventDefault();
            } else if (e.key === 'End' && items[items.length - 1]) {
                items[items.length - 1].focus();
                e.preventDefault();
            }
        }
    },
    
    /**
     * Configura suporte para leitores de tela
     */
    setupScreenReaderSupport() {
        // Adicionar landmarks ARIA
        this.addARIALandmarks();
        
        // Adicionar live regions para notificações
        this.setupLiveRegions();
        
        // Melhorar labels e descrições
        this.enhanceLabels();
        
        // Configurar anúncios de mudanças de página
        this.setupPageAnnouncements();
    },
    
    /**
     * Adiciona landmarks ARIA
     */
    addARIALandmarks() {
        const nav = document.querySelector('nav, .navigation');
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegação principal');
        }
        
        const main = document.querySelector('main, .main-content');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    },
    
    /**
     * Configura regiões live para anúncios
     */
    setupLiveRegions() {
        // Região para notificações
        let announcer = document.getElementById('aria-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'aria-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        // Região para alertas urgentes
        let alerter = document.getElementById('aria-alerter');
        if (!alerter) {
            alerter = document.createElement('div');
            alerter.id = 'aria-alerter';
            alerter.setAttribute('aria-live', 'assertive');
            alerter.setAttribute('aria-atomic', 'true');
            alerter.className = 'sr-only';
            document.body.appendChild(alerter);
        }
    },
    
    /**
     * Anuncia mensagem para leitores de tela
     */
    announce(message, urgent = false) {
        const announcer = document.getElementById(urgent ? 'aria-alerter' : 'aria-announcer');
        if (announcer) {
            announcer.textContent = message;
            
            // Limpar após um tempo
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    },
    
    /**
     * Melhora labels e descrições
     */
    enhanceLabels() {
        // Adicionar labels para inputs sem label
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                input.setAttribute('aria-label', placeholder);
            }
        });
        
        // Adicionar descrições para botões com apenas ícones
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            if (button.textContent.trim() === '' || /^[^\w\s]+$/.test(button.textContent.trim())) {
                const title = button.getAttribute('title');
                const className = button.className;
                
                if (title) {
                    button.setAttribute('aria-label', title);
                } else if (className.includes('edit')) {
                    button.setAttribute('aria-label', 'Editar');
                } else if (className.includes('delete')) {
                    button.setAttribute('aria-label', 'Eliminar');
                } else if (className.includes('close')) {
                    button.setAttribute('aria-label', 'Cerrar');
                }
            }
        });
    },
    
    /**
     * Configura anúncios de mudanças de página
     */
    setupPageAnnouncements() {
        // Escutar mudanças de seção
        document.addEventListener('sectionChanged', (e) => {
            const sectionName = e.detail.sectionName;
            this.announce(`Navegando para ${sectionName}`);
        });
        
        // Anunciar carregamento de conteúdo
        document.addEventListener('sectionLoaded', (e) => {
            const sectionName = e.detail.sectionName;
            this.announce(`${sectionName} carregado`);
        });
    },
    
    /**
     * Habilita modo de alto contraste
     */
    enableHighContrast() {
        document.body.classList.add('high-contrast');
        this.settings.highContrast = true;
        this.saveSettings();
        this.announce('Modo de alto contraste ativado');
    },
    
    /**
     * Desabilita modo de alto contraste
     */
    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        this.settings.highContrast = false;
        this.saveSettings();
        this.announce('Modo de alto contraste desativado');
    },
    
    /**
     * Habilita texto grande
     */
    enableLargeText() {
        document.body.classList.add('large-text');
        this.settings.largeText = true;
        this.saveSettings();
        this.announce('Texto grande ativado');
    },
    
    /**
     * Desabilita texto grande
     */
    disableLargeText() {
        document.body.classList.remove('large-text');
        this.settings.largeText = false;
        this.saveSettings();
        this.announce('Texto grande desativado');
    },
    
    /**
     * Habilita movimento reduzido
     */
    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
        this.settings.reducedMotion = true;
        this.saveSettings();
        this.announce('Movimento reduzido ativado');
    },
    
    /**
     * Desabilita movimento reduzido
     */
    disableReducedMotion() {
        document.body.classList.remove('reduced-motion');
        this.settings.reducedMotion = false;
        this.saveSettings();
        this.announce('Movimento reduzido desativado');
    },
    
    /**
     * Habilita modo leitor de tela
     */
    enableScreenReaderMode() {
        document.body.classList.add('screen-reader-mode');
        this.settings.screenReaderMode = true;
        this.saveSettings();
        this.announce('Modo leitor de tela ativado');
    },
    
    /**
     * Adiciona barra de ferramentas de acessibilidade
     */
    addAccessibilityToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'accessibility-toolbar';
        toolbar.className = 'accessibility-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Ferramentas de acessibilidade');
        
        toolbar.innerHTML = `
            <button type="button" class="a11y-btn" onclick="AccessibilityEnhancer.toggleHighContrast()" 
                    aria-label="Alternar alto contraste">
                🎨 Contraste
            </button>
            <button type="button" class="a11y-btn" onclick="AccessibilityEnhancer.toggleLargeText()" 
                    aria-label="Alternar texto grande">
                🔍 Texto
            </button>
            <button type="button" class="a11y-btn" onclick="AccessibilityEnhancer.toggleReducedMotion()" 
                    aria-label="Alternar movimento reduzido">
                ⏸️ Movimento
            </button>
            <button type="button" class="a11y-btn" onclick="AccessibilityEnhancer.showKeyboardHelp()" 
                    aria-label="Mostrar ajuda de teclado">
                ⌨️ Ajuda
            </button>
        `;
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-toolbar {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px;
                border-radius: 8px;
                display: flex;
                gap: 8px;
                z-index: 10000;
                font-size: 12px;
            }
            
            .a11y-btn {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .a11y-btn:hover, .a11y-btn:focus {
                background: rgba(255, 255, 255, 0.2);
                outline: 2px solid #fff;
            }
            
            .high-contrast {
                filter: contrast(150%) brightness(120%);
            }
            
            .large-text {
                font-size: 120% !important;
            }
            
            .large-text * {
                font-size: inherit !important;
            }
            
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .screen-reader-mode .accessibility-toolbar {
                display: none;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(toolbar);
    },
    
    /**
     * Alterna modo de alto contraste
     */
    toggleHighContrast() {
        if (this.settings.highContrast) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
    },
    
    /**
     * Alterna texto grande
     */
    toggleLargeText() {
        if (this.settings.largeText) {
            this.disableLargeText();
        } else {
            this.enableLargeText();
        }
    },
    
    /**
     * Alterna movimento reduzido
     */
    toggleReducedMotion() {
        if (this.settings.reducedMotion) {
            this.disableReducedMotion();
        } else {
            this.enableReducedMotion();
        }
    },
    
    /**
     * Mostra ajuda de navegação por teclado
     */
    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal keyboard-help-modal';
        helpModal.style.display = 'flex';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
        
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="keyboard-help-title">Atalhos de Teclado</h2>
                    <button type="button" class="close-btn" onclick="this.closest('.modal').remove()" 
                            aria-label="Fechar ajuda">×</button>
                </div>
                <div class="modal-body">
                    <dl class="keyboard-shortcuts">
                        <dt>Tab / Shift+Tab</dt>
                        <dd>Navegar entre elementos</dd>
                        
                        <dt>Enter / Espaço</dt>
                        <dd>Ativar botões e links</dd>
                        
                        <dt>Escape</dt>
                        <dd>Fechar modais e menus</dd>
                        
                        <dt>Setas</dt>
                        <dd>Navegar em menus e listas</dd>
                        
                        <dt>Home / End</dt>
                        <dd>Ir para início/fim de listas</dd>
                    </dl>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Focar no modal
        const closeBtn = helpModal.querySelector('.close-btn');
        if (closeBtn) closeBtn.focus();
        
        this.announce('Ajuda de teclado aberta');
    },
    
    /**
     * Configura gerenciamento de foco
     */
    setupFocusManagement() {
        // Indicador visual de foco melhorado
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 3px solid #4A90E2 !important;
                outline-offset: 2px !important;
            }
            
            .focus-trap {
                position: relative;
            }
            
            .focus-trap::before,
            .focus-trap::after {
                content: '';
                position: absolute;
                width: 1px;
                height: 1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
            }
        `;
        document.head.appendChild(style);
    },
    
    /**
     * Fecha modal com gerenciamento de foco
     */
    closeModal(modal) {
        const previousFocus = modal.dataset.previousFocus;
        modal.style.display = 'none';
        
        if (previousFocus) {
            const element = document.querySelector(previousFocus);
            if (element) element.focus();
        }
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccessibilityEnhancer.init());
} else {
    AccessibilityEnhancer.init();
}

// Expor globalmente
window.AccessibilityEnhancer = AccessibilityEnhancer;

export default AccessibilityEnhancer;

