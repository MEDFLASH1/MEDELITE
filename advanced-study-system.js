// ===== SISTEMA DE ESTUDO AVANÇADO =====
// Implementa algoritmos de repetição espaciada mais sofisticados e analytics de aprendizado

const AdvancedStudySystem = {
    // Algoritmos disponíveis
    algorithms: {
        SM2: 'sm2',
        SM2_PLUS: 'sm2_plus',
        ANKI: 'anki',
        FSRS: 'fsrs'
    },
    
    // Configurações padrão
    defaultSettings: {
        algorithm: 'fsrs',
        maxInterval: 365, // dias
        minInterval: 1,
        graduatingInterval: 1,
        easyInterval: 4,
        startingEase: 2500,
        easyBonus: 1.3,
        intervalModifier: 1.0,
        hardInterval: 1.2,
        newInterval: 0.0
    },
    
    // Cache de cálculos
    calculationCache: new Map(),
    
    // Estatísticas de sessão
    sessionStats: {
        startTime: null,
        cardsStudied: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        difficultyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 }
    },
    
    /**
     * Inicializa o sistema de estudo avançado
     */
    init() {
        this.loadSettings();
        this.setupSessionTracking();
        this.initializeAnalytics();
        console.log('🧠 Advanced Study System inicializado');
    },
    
    /**
     * Carrega configurações do usuário
     */
    loadSettings() {
        const saved = localStorage.getItem('studyingflash_study_settings');
        if (saved) {
            this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
        } else {
            this.settings = { ...this.defaultSettings };
        }
    },
    
    /**
     * Salva configurações
     */
    saveSettings() {
        localStorage.setItem('studyingflash_study_settings', JSON.stringify(this.settings));
    },
    
    /**
     * Configura rastreamento de sessão
     */
    setupSessionTracking() {
        // Resetar estatísticas ao iniciar nova sessão
        this.sessionStats = {
            startTime: new Date(),
            cardsStudied: 0,
            correctAnswers: 0,
            averageResponseTime: 0,
            difficultyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
            responseTimeHistory: []
        };
    },
    
    /**
     * Calcula próxima revisão usando algoritmo FSRS (Free Spaced Repetition Scheduler)
     */
    calculateFSRS(card, rating, responseTime = null) {
        const data = card.algorithm_data || this.getDefaultAlgorithmData();
        
        // Parâmetros FSRS
        const w = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];
        
        let { stability, difficulty, retrievability } = data;
        
        // Calcular nova dificuldade
        difficulty = this.nextDifficulty(difficulty, rating, w);
        
        // Calcular nova estabilidade
        if (data.repetitions === 0) {
            stability = this.initStability(rating, w);
        } else {
            stability = this.nextStability(difficulty, stability, retrievability, rating, w);
        }
        
        // Calcular intervalo
        const interval = Math.max(1, Math.round(stability * Math.log(0.9) / Math.log(0.9)));
        
        // Calcular próxima revisão
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + Math.min(interval, this.settings.maxInterval));
        
        return {
            ...data,
            stability: Math.max(0.1, stability),
            difficulty: Math.max(1, Math.min(10, difficulty)),
            retrievability: Math.pow(0.9, interval / stability),
            interval: interval,
            repetitions: data.repetitions + 1,
            next_review: nextReview.toISOString(),
            last_review: new Date().toISOString(),
            algorithm_type: 'fsrs'
        };
    },
    
    /**
     * Calcula estabilidade inicial (FSRS)
     */
    initStability(rating, w) {
        return Math.max(w[rating - 1], 0.1);
    },
    
    /**
     * Calcula próxima dificuldade (FSRS)
     */
    nextDifficulty(difficulty, rating, w) {
        const deltaD = w[6] * (rating - 3);
        return Math.max(1, Math.min(10, difficulty + deltaD));
    },
    
    /**
     * Calcula próxima estabilidade (FSRS)
     */
    nextStability(difficulty, stability, retrievability, rating, w) {
        const hardPenalty = rating === 2 ? w[15] : 1;
        const easyBonus = rating === 4 ? w[16] : 1;
        
        return stability * (
            1 + Math.exp(w[8]) *
            (11 - difficulty) *
            Math.pow(stability, -w[9]) *
            (Math.exp((1 - retrievability) * w[10]) - 1) *
            hardPenalty *
            easyBonus
        );
    },
    
    /**
     * Algoritmo SM-2 melhorado
     */
    calculateSM2Plus(card, rating, responseTime = null) {
        const data = card.algorithm_data || this.getDefaultAlgorithmData();
        
        let { ease_factor, interval, repetitions } = data;
        
        // Ajuste baseado no tempo de resposta
        let timeBonus = 1.0;
        if (responseTime) {
            const avgTime = this.getAverageResponseTime(card.deckId);
            if (responseTime < avgTime * 0.5) {
                timeBonus = 1.1; // Resposta rápida
            } else if (responseTime > avgTime * 2) {
                timeBonus = 0.9; // Resposta lenta
            }
        }
        
        if (rating >= 3) {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * ease_factor * timeBonus);
            }
            
            repetitions++;
            ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
        } else {
            repetitions = 0;
            interval = 1;
            ease_factor = Math.max(1.3, ease_factor - 0.2);
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + Math.min(interval, this.settings.maxInterval));
        
        return {
            ...data,
            ease_factor: ease_factor,
            interval: interval,
            repetitions: repetitions,
            next_review: nextReview.toISOString(),
            last_review: new Date().toISOString(),
            algorithm_type: 'sm2_plus'
        };
    },
    
    /**
     * Algoritmo estilo Anki
     */
    calculateAnki(card, rating, responseTime = null) {
        const data = card.algorithm_data || this.getDefaultAlgorithmData();
        
        let { ease_factor, interval, repetitions } = data;
        const { graduatingInterval, easyInterval, hardInterval, newInterval } = this.settings;
        
        switch (rating) {
            case 1: // Again
                repetitions = 0;
                interval = 1;
                ease_factor = Math.max(1300, ease_factor - 200);
                break;
                
            case 2: // Hard
                if (repetitions === 0) {
                    interval = 1;
                } else {
                    interval = Math.max(1, Math.round(interval * hardInterval));
                }
                ease_factor = Math.max(1300, ease_factor - 150);
                repetitions++;
                break;
                
            case 3: // Good
                if (repetitions === 0) {
                    interval = graduatingInterval;
                } else if (repetitions === 1) {
                    interval = 6;
                } else {
                    interval = Math.round(interval * ease_factor / 1000);
                }
                repetitions++;
                break;
                
            case 4: // Easy
                if (repetitions === 0) {
                    interval = easyInterval;
                } else {
                    interval = Math.round(interval * ease_factor / 1000 * this.settings.easyBonus);
                }
                ease_factor = Math.min(2500, ease_factor + 150);
                repetitions++;
                break;
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + Math.min(interval, this.settings.maxInterval));
        
        return {
            ...data,
            ease_factor: ease_factor,
            interval: interval,
            repetitions: repetitions,
            next_review: nextReview.toISOString(),
            last_review: new Date().toISOString(),
            algorithm_type: 'anki'
        };
    },
    
    /**
     * Processa revisão de carta com algoritmo selecionado
     */
    processCardReview(card, rating, responseTime = null) {
        const startTime = performance.now();
        
        // Validar entrada
        if (!card || !rating || rating < 1 || rating > 4) {
            throw new Error('Dados de revisão inválidos');
        }
        
        // Usar cache se disponível
        const cacheKey = `${card.id}_${rating}_${responseTime}`;
        if (this.calculationCache.has(cacheKey)) {
            return this.calculationCache.get(cacheKey);
        }
        
        let newData;
        
        // Aplicar algoritmo selecionado
        switch (this.settings.algorithm) {
            case 'fsrs':
                newData = this.calculateFSRS(card, rating, responseTime);
                break;
            case 'sm2_plus':
                newData = this.calculateSM2Plus(card, rating, responseTime);
                break;
            case 'anki':
                newData = this.calculateAnki(card, rating, responseTime);
                break;
            default:
                newData = this.calculateSM2Plus(card, rating, responseTime);
        }
        
        // Atualizar estatísticas da sessão
        this.updateSessionStats(rating, responseTime);
        
        // Cache do resultado
        this.calculationCache.set(cacheKey, newData);
        
        // Limpar cache se ficar muito grande
        if (this.calculationCache.size > 1000) {
            const firstKey = this.calculationCache.keys().next().value;
            this.calculationCache.delete(firstKey);
        }
        
        const endTime = performance.now();
        console.log(`⏱️ Cálculo de revisão: ${endTime - startTime}ms`);
        
        return newData;
    },
    
    /**
     * Obtém dados padrão do algoritmo
     */
    getDefaultAlgorithmData() {
        return {
            algorithm_type: this.settings.algorithm,
            ease_factor: this.settings.startingEase,
            interval: 1,
            repetitions: 0,
            stability: 1.0,
            difficulty: 5.0,
            retrievability: 1.0,
            next_review: new Date().toISOString(),
            last_review: null
        };
    },
    
    /**
     * Atualiza estatísticas da sessão
     */
    updateSessionStats(rating, responseTime) {
        this.sessionStats.cardsStudied++;
        this.sessionStats.difficultyDistribution[rating]++;
        
        if (rating >= 3) {
            this.sessionStats.correctAnswers++;
        }
        
        if (responseTime) {
            this.sessionStats.responseTimeHistory.push(responseTime);
            this.sessionStats.averageResponseTime = 
                this.sessionStats.responseTimeHistory.reduce((a, b) => a + b, 0) / 
                this.sessionStats.responseTimeHistory.length;
        }
    },
    
    /**
     * Obtém tempo médio de resposta para um deck
     */
    getAverageResponseTime(deckId) {
        const history = JSON.parse(localStorage.getItem(`studyingflash_response_times_${deckId}`) || '[]');
        if (history.length === 0) return 5000; // 5 segundos padrão
        
        return history.reduce((a, b) => a + b, 0) / history.length;
    },
    
    /**
     * Salva tempo de resposta no histórico
     */
    saveResponseTime(deckId, responseTime) {
        const key = `studyingflash_response_times_${deckId}`;
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        
        history.push(responseTime);
        
        // Manter apenas os últimos 100 tempos
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem(key, JSON.stringify(history));
    },
    
    /**
     * Calcula cartas devido para revisão
     */
    getCardsForReview(cards, limit = 20) {
        const now = new Date();
        
        // Filtrar cartas que precisam de revisão
        const dueCards = cards.filter(card => {
            const nextReview = new Date(card.algorithm_data?.next_review || now);
            return nextReview <= now;
        });
        
        // Ordenar por prioridade
        dueCards.sort((a, b) => {
            const aData = a.algorithm_data || {};
            const bData = b.algorithm_data || {};
            
            // Priorizar cartas novas
            if (aData.repetitions === 0 && bData.repetitions > 0) return -1;
            if (bData.repetitions === 0 && aData.repetitions > 0) return 1;
            
            // Depois por data de revisão
            const aNext = new Date(aData.next_review || now);
            const bNext = new Date(bData.next_review || now);
            
            return aNext - bNext;
        });
        
        return dueCards.slice(0, limit);
    },
    
    /**
     * Gera relatório de sessão
     */
    generateSessionReport() {
        const duration = new Date() - this.sessionStats.startTime;
        const accuracy = this.sessionStats.cardsStudied > 0 ? 
            (this.sessionStats.correctAnswers / this.sessionStats.cardsStudied) * 100 : 0;
        
        return {
            duration: Math.round(duration / 1000), // segundos
            cardsStudied: this.sessionStats.cardsStudied,
            accuracy: Math.round(accuracy),
            averageResponseTime: Math.round(this.sessionStats.averageResponseTime),
            difficultyDistribution: this.sessionStats.difficultyDistribution,
            cardsPerMinute: this.sessionStats.cardsStudied / (duration / 60000)
        };
    },
    
    /**
     * Inicializa analytics
     */
    initializeAnalytics() {
        // Rastrear eventos de estudo
        this.analytics = {
            sessionsToday: 0,
            totalStudyTime: 0,
            streakDays: 0,
            lastStudyDate: null
        };
        
        this.loadAnalytics();
    },
    
    /**
     * Carrega dados de analytics
     */
    loadAnalytics() {
        const saved = localStorage.getItem('studyingflash_analytics');
        if (saved) {
            this.analytics = { ...this.analytics, ...JSON.parse(saved) };
        }
    },
    
    /**
     * Salva dados de analytics
     */
    saveAnalytics() {
        localStorage.setItem('studyingflash_analytics', JSON.stringify(this.analytics));
    },
    
    /**
     * Registra sessão de estudo
     */
    recordStudySession(sessionData) {
        const today = new Date().toDateString();
        const lastStudy = this.analytics.lastStudyDate;
        
        // Atualizar streak
        if (lastStudy === today) {
            // Mesma data, não alterar streak
        } else if (lastStudy === new Date(Date.now() - 86400000).toDateString()) {
            // Ontem, continuar streak
            this.analytics.streakDays++;
        } else if (lastStudy !== today) {
            // Quebrou o streak
            this.analytics.streakDays = 1;
        }
        
        // Atualizar estatísticas
        if (lastStudy !== today) {
            this.analytics.sessionsToday = 1;
        } else {
            this.analytics.sessionsToday++;
        }
        
        this.analytics.totalStudyTime += sessionData.duration;
        this.analytics.lastStudyDate = today;
        
        this.saveAnalytics();
    },
    
    /**
     * Obtém estatísticas de progresso
     */
    getProgressStats(cards) {
        const total = cards.length;
        const new_cards = cards.filter(c => !c.algorithm_data || c.algorithm_data.repetitions === 0).length;
        const learning = cards.filter(c => c.algorithm_data && c.algorithm_data.repetitions > 0 && c.algorithm_data.repetitions < 3).length;
        const mature = cards.filter(c => c.algorithm_data && c.algorithm_data.repetitions >= 3).length;
        
        return {
            total,
            new: new_cards,
            learning,
            mature,
            newPercentage: total > 0 ? Math.round((new_cards / total) * 100) : 0,
            learningPercentage: total > 0 ? Math.round((learning / total) * 100) : 0,
            maturePercentage: total > 0 ? Math.round((mature / total) * 100) : 0
        };
    },
    
    /**
     * Prediz performance futura
     */
    predictPerformance(cards, days = 7) {
        const predictions = [];
        const now = new Date();
        
        for (let i = 0; i < days; i++) {
            const targetDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
            const dueCards = cards.filter(card => {
                const nextReview = new Date(card.algorithm_data?.next_review || now);
                return nextReview.toDateString() === targetDate.toDateString();
            });
            
            predictions.push({
                date: targetDate.toDateString(),
                dueCards: dueCards.length,
                estimatedTime: dueCards.length * 30 // 30 segundos por carta
            });
        }
        
        return predictions;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdvancedStudySystem.init());
} else {
    AdvancedStudySystem.init();
}

// Expor globalmente
window.AdvancedStudySystem = AdvancedStudySystem;

export default AdvancedStudySystem;

