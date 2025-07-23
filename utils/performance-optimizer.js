// @ts-check
/**
 * Performance Optimizer - Sistema de otimização de performance
 * Implementa lazy loading, cache inteligente e otimizações de recursos
 */

/**
 * @typedef {Object} CacheItem
 * @property {any} value - Valor armazenado no cache
 * @property {number} expires - Timestamp de expiração
 * @property {number} hits - Número de acessos
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} loadTime - Tempo de carregamento
 * @property {number} renderTime - Tempo de renderização
 * @property {number} cacheHitRate - Taxa de acerto do cache
 * @property {number} memoryUsage - Uso de memória
 */

class PerformanceOptimizer {
    constructor() {
        /** @type {Map<string, CacheItem>} */
        this.cache = new Map();
        
        /** @type {PerformanceMetrics} */
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0
        };
        
        this.TTL = 5 * 60 * 1000; // 5 minutos
        this.maxCacheSize = 100;
        this.observers = new Map();
        
        this.init();
    }

    /**
     * Inicializa o otimizador de performance
     */
    init() {
        this.setupIntersectionObserver();
        this.setupPerformanceMonitoring();
        this.setupCacheCleanup();
        this.preloadCriticalResources();
    }

    /**
     * Sistema de cache inteligente com TTL e LRU
     * @param {string} key - Chave do cache
     * @param {any} value - Valor a ser armazenado
     * @param {number} [ttl] - Time to live em millisegundos
     */
    setCache(key, value, ttl = this.TTL) {
        // Limpar cache se exceder o tamanho máximo
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLeastRecentlyUsed();
        }

        this.cache.set(key, {
            value,
            expires: Date.now() + ttl,
            hits: 0
        });
    }

    /**
     * Recupera item do cache
     * @param {string} key - Chave do cache
     * @returns {any|null} Valor do cache ou null se não encontrado/expirado
     */
    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // Verificar se expirou
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        // Incrementar hits para LRU
        item.hits++;
        return item.value;
    }

    /**
     * Remove itens menos usados do cache (LRU)
     */
    evictLeastRecentlyUsed() {
        let leastUsedKey = null;
        let minHits = Infinity;

        for (const [key, item] of this.cache.entries()) {
            if (item.hits < minHits) {
                minHits = item.hits;
                leastUsedKey = key;
            }
        }

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
        }
    }

    /**
     * Lazy loading de componentes com Intersection Observer
     * @param {string} selector - Seletor CSS dos elementos
     * @param {Function} callback - Função a ser executada quando elemento for visível
     */
    setupLazyLoading(selector, callback) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });

        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });

        this.observers.set(selector, observer);
    }

    /**
     * Carregamento lazy de imagens
     */
    setupLazyImages() {
        this.setupLazyLoading('img[data-src]', (img) => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            }
        });
    }

    /**
     * Carregamento lazy de componentes JavaScript
     * @param {string} componentName - Nome do componente
     * @returns {Promise<any>} Componente carregado
     */
    async loadComponent(componentName) {
        const cacheKey = `component_${componentName}`;
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const startTime = performance.now();
            const module = await import(`../components/${componentName}.js`);
            const loadTime = performance.now() - startTime;
            
            this.updateMetrics('loadTime', loadTime);
            this.setCache(cacheKey, module.default);
            
            return module.default;
        } catch (error) {
            console.error(`Erro ao carregar componente ${componentName}:`, error);
            return null;
        }
    }

    /**
     * Pré-carregamento de recursos críticos
     */
    preloadCriticalResources() {
        const criticalResources = [
            './main.css',
            './app-functional.js',
            './services/NavigationService.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    /**
     * Configuração do Intersection Observer
     */
    setupIntersectionObserver() {
        // Lazy loading de seções
        this.setupLazyLoading('.lazy-section', (section) => {
            section.classList.add('loaded');
            const event = new CustomEvent('sectionVisible', { detail: { section } });
            document.dispatchEvent(event);
        });

        // Lazy loading de imagens
        this.setupLazyImages();
    }

    /**
     * Monitoramento de performance
     */
    setupPerformanceMonitoring() {
        // Performance Observer para métricas
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
                    } else if (entry.entryType === 'paint') {
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.renderTime = entry.startTime;
                        }
                    }
                });
            });

            observer.observe({ entryTypes: ['navigation', 'paint'] });
        }

        // Monitoramento de memória
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            }, 10000); // A cada 10 segundos
        }
    }

    /**
     * Limpeza automática do cache
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expires) {
                    this.cache.delete(key);
                }
            }
            this.updateCacheHitRate();
        }, 60000); // A cada minuto
    }

    /**
     * Atualiza métricas de performance
     * @param {keyof PerformanceMetrics} metric - Nome da métrica
     * @param {number} value - Valor da métrica
     */
    updateMetrics(metric, value) {
        this.metrics[metric] = value;
        
        // Emitir evento para monitoramento
        const event = new CustomEvent('performanceUpdate', {
            detail: { metric, value, allMetrics: this.metrics }
        });
        document.dispatchEvent(event);
    }

    /**
     * Calcula taxa de acerto do cache
     */
    updateCacheHitRate() {
        let totalHits = 0;
        let totalRequests = 0;

        for (const item of this.cache.values()) {
            totalHits += item.hits;
            totalRequests += item.hits > 0 ? item.hits : 1;
        }

        this.metrics.cacheHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    }

    /**
     * Otimização de imagens
     * @param {HTMLImageElement} img - Elemento de imagem
     */
    optimizeImage(img) {
        // Adicionar loading lazy nativo se suportado
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }

        // Adicionar decode async
        if ('decode' in img) {
            img.decode().catch(() => {
                // Fallback silencioso
            });
        }

        // Responsive images com srcset
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }
    }

    /**
     * Debounce para otimizar eventos frequentes
     * @param {Function} func - Função a ser executada
     * @param {number} delay - Delay em millisegundos
     * @returns {Function} Função com debounce
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle para limitar execução de funções
     * @param {Function} func - Função a ser executada
     * @param {number} limit - Limite em millisegundos
     * @returns {Function} Função com throttle
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Otimização de scroll
     */
    optimizeScroll() {
        let ticking = false;

        const updateScrollPosition = () => {
            // Lógica de scroll otimizada
            const scrollTop = window.pageYOffset;
            const event = new CustomEvent('optimizedScroll', { detail: { scrollTop } });
            document.dispatchEvent(event);
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * Obtém métricas atuais de performance
     * @returns {PerformanceMetrics} Métricas de performance
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Limpa todo o cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Obtém estatísticas do cache
     * @returns {Object} Estatísticas do cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate: this.metrics.cacheHitRate,
            items: Array.from(this.cache.keys())
        };
    }

    /**
     * Cleanup ao destruir o otimizador
     */
    destroy() {
        // Limpar observers
        for (const observer of this.observers.values()) {
            observer.disconnect();
        }
        this.observers.clear();
        
        // Limpar cache
        this.clearCache();
    }
}

// Instância global do otimizador
const performanceOptimizer = new PerformanceOptimizer();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
    window.performanceOptimizer = performanceOptimizer;
}

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceOptimizer.optimizeScroll();
    });
} else {
    performanceOptimizer.optimizeScroll();
}

