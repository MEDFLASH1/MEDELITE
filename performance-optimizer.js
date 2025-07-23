// ===== MÓDULO DE OTIMIZAÇÃO DE PERFORMANCE =====
// Otimizações para melhorar a velocidade e responsividade da aplicação

const PerformanceOptimizer = {
    // Cache para elementos DOM frequentemente acessados
    domCache: new Map(),
    
    // Debounce para eventos de scroll e resize
    debounceTimers: new Map(),
    
    // Observer para lazy loading
    intersectionObserver: null,
    
    /**
     * Inicializa todas as otimizações de performance
     */
    init() {
        this.setupLazyLoading();
        this.optimizeScrollEvents();
        this.preloadCriticalResources();
        this.setupServiceWorker();
        this.optimizeLocalStorage();
        console.log('✅ Performance Optimizer inicializado');
    },
    
    /**
     * Cache inteligente para elementos DOM
     */
    getCachedElement(selector) {
        if (!this.domCache.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.domCache.set(selector, element);
            }
        }
        return this.domCache.get(selector);
    },
    
    /**
     * Limpa o cache DOM quando necessário
     */
    clearDOMCache() {
        this.domCache.clear();
    },
    
    /**
     * Debounce otimizado para eventos frequentes
     */
    debounce(key, func, delay = 250) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    },
    
    /**
     * Lazy loading para imagens e conteúdo
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Lazy load para imagens
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                        
                        // Lazy load para seções
                        if (element.dataset.lazySection) {
                            this.loadSectionContent(element.dataset.lazySection);
                            element.removeAttribute('data-lazy-section');
                        }
                        
                        this.intersectionObserver.unobserve(element);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            // Observar elementos com lazy loading
            document.querySelectorAll('[data-src], [data-lazy-section]').forEach(el => {
                this.intersectionObserver.observe(el);
            });
        }
    },
    
    /**
     * Otimiza eventos de scroll para melhor performance
     */
    optimizeScrollEvents() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    },
    
    /**
     * Atualiza posição do scroll de forma otimizada
     */
    updateScrollPosition() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Atualizar indicador de progresso se existir
        const progressBar = this.getCachedElement('.scroll-progress');
        if (progressBar) {
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const progress = (scrollY / documentHeight) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Mostrar/ocultar botão de voltar ao topo
        const backToTop = this.getCachedElement('.back-to-top');
        if (backToTop) {
            backToTop.style.display = scrollY > 300 ? 'block' : 'none';
        }
    },
    
    /**
     * Precarrega recursos críticos
     */
    preloadCriticalResources() {
        const criticalResources = [
            './main.css',
            './app-functional.js',
            './icons/favicon-32x32.png'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            } else if (resource.match(/\.(png|jpg|jpeg|webp)$/)) {
                link.as = 'image';
            }
            
            document.head.appendChild(link);
        });
    },
    
    /**
     * Configura Service Worker para cache offline
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('❌ Erro ao registrar Service Worker:', error);
                });
        }
    },
    
    /**
     * Otimiza o uso do localStorage
     */
    optimizeLocalStorage() {
        // Comprimir dados grandes antes de salvar
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            try {
                // Se o valor é muito grande, comprimir
                if (value.length > 10000) {
                    console.log(`📦 Comprimindo dados para ${key}`);
                    // Implementar compressão se necessário
                }
                originalSetItem.call(this, key, value);
            } catch (error) {
                console.error('❌ Erro ao salvar no localStorage:', error);
                // Limpar dados antigos se necessário
                this.clearOldData();
            }
        };
    },
    
    /**
     * Limpa dados antigos do localStorage
     */
    clearOldData() {
        const keys = Object.keys(localStorage);
        const studyingFlashKeys = keys.filter(key => key.startsWith('studyingflash_'));
        
        // Manter apenas os dados mais recentes
        if (studyingFlashKeys.length > 10) {
            const oldKeys = studyingFlashKeys.slice(0, -5);
            oldKeys.forEach(key => {
                if (!key.includes('decks') && !key.includes('flashcards')) {
                    localStorage.removeItem(key);
                }
            });
        }
    },
    
    /**
     * Carrega conteúdo de seção de forma lazy
     */
    loadSectionContent(sectionName) {
        console.log(`🔄 Carregando seção lazy: ${sectionName}`);
        
        // Simular carregamento de conteúdo dinâmico
        const section = document.getElementById(sectionName);
        if (section && !section.dataset.loaded) {
            // Marcar como carregado
            section.dataset.loaded = 'true';
            
            // Disparar evento personalizado
            const event = new CustomEvent('sectionLoaded', {
                detail: { sectionName }
            });
            document.dispatchEvent(event);
        }
    },
    
    /**
     * Monitora métricas de performance
     */
    monitorPerformance() {
        if ('performance' in window) {
            // Medir tempo de carregamento
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
                
                // Enviar métricas se necessário
                this.reportPerformanceMetrics({
                    loadTime,
                    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
                });
            });
        }
    },
    
    /**
     * Reporta métricas de performance
     */
    reportPerformanceMetrics(metrics) {
        // Salvar métricas localmente para análise
        const performanceData = JSON.parse(localStorage.getItem('studyingflash_performance') || '[]');
        performanceData.push({
            ...metrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // Manter apenas os últimos 50 registros
        if (performanceData.length > 50) {
            performanceData.splice(0, performanceData.length - 50);
        }
        
        localStorage.setItem('studyingflash_performance', JSON.stringify(performanceData));
    },
    
    /**
     * Otimiza animações usando requestAnimationFrame
     */
    animateElement(element, properties, duration = 300) {
        const start = performance.now();
        const startValues = {};
        
        // Capturar valores iniciais
        Object.keys(properties).forEach(prop => {
            startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
        });
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Aplicar easing
            const easeProgress = this.easeInOutCubic(progress);
            
            Object.keys(properties).forEach(prop => {
                const startValue = startValues[prop];
                const endValue = properties[prop];
                const currentValue = startValue + (endValue - startValue) * easeProgress;
                
                element.style[prop] = `${currentValue}px`;
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Função de easing para animações suaves
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
} else {
    PerformanceOptimizer.init();
}

// Expor globalmente
window.PerformanceOptimizer = PerformanceOptimizer;

export default PerformanceOptimizer;

