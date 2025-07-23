// @ts-check
/**
 * Accessibility Enhancer - Sistema de melhorias de acessibilidade
 * Implementa navegação por teclado, ARIA labels, e suporte a screen readers
 */

/**
 * @typedef {Object} AccessibilityOptions
 * @property {boolean} enableKeyboardNavigation - Habilitar navegação por teclado
 * @property {boolean} enableFocusManagement - Habilitar gerenciamento de foco
 * @property {boolean} enableAriaEnhancements - Habilitar melhorias ARIA
 * @property {boolean} enableScreenReaderSupport - Habilitar suporte a screen readers
 */

class AccessibilityEnhancer {
    constructor(options = {}) {
        /** @type {AccessibilityOptions} */
        this.options = {
            enableKeyboardNavigation: true,
            enableFocusManagement: true,
            enableAriaEnhancements: true,
            enableScreenReaderSupport: true,
            ...options
        };

        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        this.currentFocusIndex = 0;
        this.focusableElementsList = [];
        this.announcements = [];

        this.init();
    }

    /**
     * Inicializa o sistema de acessibilidade
     */
    init() {
        if (this.options.enableKeyboardNavigation) {
            this.setupKeyboardNavigation();
        }

        if (this.options.enableFocusManagement) {
            this.setupFocusManagement();
        }

        if (this.options.enableAriaEnhancements) {
            this.setupAriaEnhancements();
        }

        if (this.options.enableScreenReaderSupport) {
            this.setupScreenReaderSupport();
        }

        this.setupSkipLinks();
        this.setupHighContrastMode();
        this.setupReducedMotion();
    }

    /**
     * Configuração da navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // Atualizar lista de elementos focáveis quando DOM mudar
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'tabindex', 'hidden']
        });
    }

    /**
     * Manipula eventos de teclado
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Tab':
                this.handleTabNavigation(event);
                break;
            case 'Escape':
                this.handleEscapeKey(event);
                break;
            case 'Enter':
            case ' ':
                this.handleActivation(event);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowNavigation(event);
                break;
            case 'Home':
            case 'End':
                this.handleHomeEndNavigation(event);
                break;
        }
    }

    /**
     * Manipula navegação com Tab
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleTabNavigation(event) {
        this.updateFocusableElements();
        
        if (this.focusableElementsList.length === 0) return;

        const currentElement = document.activeElement;
        const currentIndex = this.focusableElementsList.indexOf(currentElement);

        if (event.shiftKey) {
            // Shift + Tab (voltar)
            const nextIndex = currentIndex <= 0 ? this.focusableElementsList.length - 1 : currentIndex - 1;
            this.focusableElementsList[nextIndex].focus();
        } else {
            // Tab (avançar)
            const nextIndex = currentIndex >= this.focusableElementsList.length - 1 ? 0 : currentIndex + 1;
            this.focusableElementsList[nextIndex].focus();
        }

        event.preventDefault();
    }

    /**
     * Manipula tecla Escape
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleEscapeKey(event) {
        // Fechar modais, dropdowns, etc.
        const modal = document.querySelector('.modal.active, .dropdown.open, .popup.visible');
        if (modal) {
            this.closeModal(modal);
            event.preventDefault();
        }

        // Limpar seleções
        const selectedElements = document.querySelectorAll('.selected, .highlighted');
        selectedElements.forEach(el => {
            el.classList.remove('selected', 'highlighted');
        });
    }

    /**
     * Manipula ativação com Enter/Space
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleActivation(event) {
        const activeElement = document.activeElement;
        
        if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button')) {
            activeElement.click();
            event.preventDefault();
        }
    }

    /**
     * Manipula navegação com setas
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleArrowNavigation(event) {
        const activeElement = document.activeElement;
        const parent = activeElement?.closest('[role="menu"], [role="listbox"], [role="tablist"], .card-grid');
        
        if (!parent) return;

        const items = parent.querySelectorAll('[role="menuitem"], [role="option"], [role="tab"], .card');
        const currentIndex = Array.from(items).indexOf(activeElement);
        
        if (currentIndex === -1) return;

        let nextIndex;
        switch (event.key) {
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
        }

        if (nextIndex !== undefined && items[nextIndex]) {
            items[nextIndex].focus();
            event.preventDefault();
        }
    }

    /**
     * Manipula navegação Home/End
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleHomeEndNavigation(event) {
        this.updateFocusableElements();
        
        if (this.focusableElementsList.length === 0) return;

        if (event.key === 'Home') {
            this.focusableElementsList[0].focus();
        } else if (event.key === 'End') {
            this.focusableElementsList[this.focusableElementsList.length - 1].focus();
        }

        event.preventDefault();
    }

    /**
     * Atualiza lista de elementos focáveis
     */
    updateFocusableElements() {
        this.focusableElementsList = Array.from(document.querySelectorAll(this.focusableElements))
            .filter(el => {
                return el.offsetWidth > 0 && 
                       el.offsetHeight > 0 && 
                       !el.hasAttribute('hidden') &&
                       window.getComputedStyle(el).visibility !== 'hidden';
            });
    }

    /**
     * Configuração do gerenciamento de foco
     */
    setupFocusManagement() {
        // Indicador visual de foco
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid #0066cc !important;
                outline-offset: 2px !important;
            }
            
            .focus-visible:not(.focus-visible-added) {
                outline: none !important;
            }
        `;
        document.head.appendChild(style);

        // Gerenciar foco em mudanças de página
        document.addEventListener('routeChange', () => {
            this.manageFocusOnRouteChange();
        });
    }

    /**
     * Gerencia foco em mudanças de rota
     */
    manageFocusOnRouteChange() {
        // Focar no título principal da nova página
        const mainHeading = document.querySelector('h1, [role="heading"][aria-level="1"]');
        if (mainHeading) {
            mainHeading.setAttribute('tabindex', '-1');
            mainHeading.focus();
            this.announce(`Navegou para: ${mainHeading.textContent}`);
        }
    }

    /**
     * Configuração de melhorias ARIA
     */
    setupAriaEnhancements() {
        // Adicionar ARIA labels automaticamente
        this.enhanceButtons();
        this.enhanceInputs();
        this.enhanceNavigation();
        this.enhanceImages();
        this.enhanceRegions();
    }

    /**
     * Melhora botões com ARIA
     */
    enhanceButtons() {
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('.icon, svg, img');
                if (icon) {
                    const action = this.inferButtonAction(button);
                    button.setAttribute('aria-label', action);
                }
            }
        });
    }

    /**
     * Infere ação do botão baseado no contexto
     * @param {HTMLButtonElement} button - Elemento botão
     * @returns {string} Descrição da ação
     */
    inferButtonAction(button) {
        const classList = Array.from(button.classList);
        const parent = button.closest('[data-action], .card, .modal');
        
        if (classList.includes('close')) return 'Fechar';
        if (classList.includes('delete')) return 'Excluir';
        if (classList.includes('edit')) return 'Editar';
        if (classList.includes('save')) return 'Salvar';
        if (classList.includes('cancel')) return 'Cancelar';
        if (classList.includes('submit')) return 'Enviar';
        if (classList.includes('create')) return 'Criar';
        
        if (parent) {
            const action = parent.dataset.action;
            if (action) return action;
        }
        
        return 'Botão';
    }

    /**
     * Melhora inputs com ARIA
     */
    enhanceInputs() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Associar labels
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || this.generateId('label'));
                }
            }

            // Adicionar descrições de erro
            const errorElement = input.parentElement?.querySelector('.error-message');
            if (errorElement) {
                const errorId = errorElement.id || this.generateId('error');
                errorElement.id = errorId;
                input.setAttribute('aria-describedby', errorId);
                input.setAttribute('aria-invalid', 'true');
            }
        });
    }

    /**
     * Melhora navegação com ARIA
     */
    enhanceNavigation() {
        const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
        navs.forEach((nav, index) => {
            nav.setAttribute('aria-label', `Navegação ${index + 1}`);
        });

        // Marcar página atual
        const currentPageLinks = document.querySelectorAll('a[href]:not([aria-current])');
        currentPageLinks.forEach(link => {
            if (link.href === window.location.href) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Melhora imagens com ARIA
     */
    enhanceImages() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            // Imagens decorativas
            if (img.closest('.decoration, .background')) {
                img.setAttribute('alt', '');
                img.setAttribute('role', 'presentation');
            } else {
                // Tentar inferir descrição
                const caption = img.nextElementSibling?.tagName === 'FIGCAPTION' ? 
                    img.nextElementSibling.textContent : '';
                img.setAttribute('alt', caption || 'Imagem');
            }
        });
    }

    /**
     * Melhora regiões com ARIA landmarks
     */
    enhanceRegions() {
        // Header
        const header = document.querySelector('header:not([role])');
        if (header) header.setAttribute('role', 'banner');

        // Main
        const main = document.querySelector('main:not([role])');
        if (main) main.setAttribute('role', 'main');

        // Footer
        const footer = document.querySelector('footer:not([role])');
        if (footer) footer.setAttribute('role', 'contentinfo');

        // Navigation
        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => nav.setAttribute('role', 'navigation'));
    }

    /**
     * Configuração de suporte a screen readers
     */
    setupScreenReaderSupport() {
        // Criar região de anúncios
        this.createAnnouncementRegion();
        
        // Anunciar mudanças de conteúdo
        this.setupContentChangeAnnouncements();
    }

    /**
     * Cria região para anúncios de screen reader
     */
    createAnnouncementRegion() {
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcements';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
        `;
        document.body.appendChild(announcer);
    }

    /**
     * Anuncia mensagem para screen readers
     * @param {string} message - Mensagem a ser anunciada
     * @param {string} [priority='polite'] - Prioridade do anúncio
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('screen-reader-announcements');
        if (!announcer) return;

        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;

        // Limpar após 1 segundo
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    /**
     * Configuração de anúncios de mudanças de conteúdo
     */
    setupContentChangeAnnouncements() {
        // Observer para mudanças no DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.announceContentChange(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Anuncia mudanças de conteúdo
     * @param {Element} element - Elemento adicionado
     */
    announceContentChange(element) {
        if (element.classList.contains('notification')) {
            this.announce(element.textContent, 'assertive');
        } else if (element.classList.contains('error')) {
            this.announce(`Erro: ${element.textContent}`, 'assertive');
        } else if (element.classList.contains('success')) {
            this.announce(`Sucesso: ${element.textContent}`, 'polite');
        }
    }

    /**
     * Configuração de skip links
     */
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
            border-radius: 4px;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Garantir que existe um elemento main-content
        if (!document.getElementById('main-content')) {
            const main = document.querySelector('main, .main-content, .content');
            if (main) {
                main.id = 'main-content';
            }
        }
    }

    /**
     * Configuração de modo alto contraste
     */
    setupHighContrastMode() {
        // Detectar preferência do sistema
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) {
            document.body.classList.add('high-contrast');
        }

        // Botão para alternar alto contraste
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Alternar Alto Contraste';
        toggleButton.className = 'accessibility-toggle high-contrast-toggle';
        toggleButton.setAttribute('aria-pressed', 'false');
        
        toggleButton.addEventListener('click', () => {
            const isActive = document.body.classList.toggle('high-contrast');
            toggleButton.setAttribute('aria-pressed', isActive.toString());
            this.announce(isActive ? 'Alto contraste ativado' : 'Alto contraste desativado');
        });
    }

    /**
     * Configuração de movimento reduzido
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }

    /**
     * Fecha modal e gerencia foco
     * @param {Element} modal - Elemento modal
     */
    closeModal(modal) {
        modal.classList.remove('active', 'open', 'visible');
        
        // Retornar foco para o elemento que abriu o modal
        const trigger = modal.dataset.trigger;
        if (trigger) {
            const triggerElement = document.getElementById(trigger);
            if (triggerElement) {
                triggerElement.focus();
            }
        }
        
        this.announce('Modal fechado');
    }

    /**
     * Gera ID único
     * @param {string} prefix - Prefixo do ID
     * @returns {string} ID único
     */
    generateId(prefix = 'a11y') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtém estatísticas de acessibilidade
     * @returns {Object} Estatísticas
     */
    getAccessibilityStats() {
        return {
            focusableElements: this.focusableElementsList.length,
            imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
            buttonsWithoutLabel: document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').length,
            inputsWithoutLabel: document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length,
            headingStructure: this.analyzeHeadingStructure()
        };
    }

    /**
     * Analisa estrutura de cabeçalhos
     * @returns {Array} Estrutura de cabeçalhos
     */
    analyzeHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headings).map(heading => ({
            level: parseInt(heading.tagName.charAt(1)),
            text: heading.textContent.trim(),
            hasId: !!heading.id
        }));
    }
}

// Instância global
const accessibilityEnhancer = new AccessibilityEnhancer();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancer;
} else if (typeof window !== 'undefined') {
    window.AccessibilityEnhancer = AccessibilityEnhancer;
    window.accessibilityEnhancer = accessibilityEnhancer;
}

