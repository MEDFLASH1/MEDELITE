/**
 * StudyService - Servicio de gestión de sesiones de estudio
 * Extraído de app-functional.js para modularización
 */

import { StorageService } from './storage.service.js';
import { FlashcardService } from './flashcard.service.js';

/**
 * @typedef {object} StudySession
 * @property {string} id
 * @property {string} deckId
 * @property {string} userId
 * @property {string} startedAt
 * @property {string} completedAt
 * @property {Flashcard[]} cards
 * @property {number} currentIndex
 * @property {string} algorithm
 * @property {object} stats
 */

export const StudyService = {
    /**
     * Inicia una nueva sesión de estudio
     * @param {string} deckId - ID del deck a estudiar
     * @param {string} algorithm - Algoritmo de repetición espaciada
     * @returns {StudySession} Nueva sesión de estudio
     */
    startSession(deckId, algorithm = 'sm2') {
        try {
            const cards = FlashcardService.getNextReviewCards(deckId, 20);
            
            if (cards.length === 0) {
                throw new Error('No hay tarjetas disponibles para estudiar en este deck');
            }

            const session = {
                id: this.generateSessionId(),
                deckId,
                userId: this.getCurrentUserId(),
                startedAt: new Date().toISOString(),
                completedAt: null,
                cards: this.shuffleCards(cards),
                currentIndex: 0,
                algorithm,
                stats: {
                    totalCards: cards.length,
                    correctAnswers: 0,
                    incorrectAnswers: 0,
                    averageResponseTime: 0,
                    startTime: Date.now()
                }
            };

            this.saveSession(session);
            console.log(`🎓 [StudyService] Started study session: ${session.id} with ${cards.length} cards`);
            
            return session;
            
        } catch (error) {
            console.error(`❌ [StudyService] Error starting study session:`, error);
            throw error;
        }
    },

    /**
     * Obtiene la sesión de estudio actual
     * @returns {StudySession|null} Sesión actual o null si no hay ninguna
     */
    getCurrentSession() {
        const session = StorageService.get('current_study_session');
        
        if (session && !session.completedAt) {
            console.log(`📖 [StudyService] Retrieved current session: ${session.id}`);
            return session;
        }
        
        return null;
    },

    /**
     * Procesa la respuesta a una tarjeta en la sesión actual
     * @param {number} quality - Calidad de la respuesta (0-5)
     * @param {number} responseTime - Tiempo de respuesta en ms
     * @returns {StudySession|null} Sesión actualizada
     */
    processAnswer(quality, responseTime = 0) {
        const session = this.getCurrentSession();
        if (!session) {
            console.warn(`⚠️ [StudyService] No active study session found`);
            return null;
        }

        try {
            const currentCard = session.cards[session.currentIndex];
            if (!currentCard) {
                console.warn(`⚠️ [StudyService] No current card found in session`);
                return session;
            }

            // Actualizar el progreso de la tarjeta
            FlashcardService.updateReviewProgress(currentCard.id, quality);

            // Actualizar estadísticas de la sesión
            if (quality >= 3) {
                session.stats.correctAnswers++;
            } else {
                session.stats.incorrectAnswers++;
            }

            // Actualizar tiempo promedio de respuesta
            const totalAnswers = session.stats.correctAnswers + session.stats.incorrectAnswers;
            if (responseTime > 0) {
                session.stats.averageResponseTime = 
                    (session.stats.averageResponseTime * (totalAnswers - 1) + responseTime) / totalAnswers;
            }

            // Avanzar a la siguiente tarjeta
            session.currentIndex++;

            // Verificar si la sesión está completa
            if (session.currentIndex >= session.cards.length) {
                session.completedAt = new Date().toISOString();
                session.stats.endTime = Date.now();
                session.stats.totalDuration = session.stats.endTime - session.stats.startTime;
                
                console.log(`🎉 [StudyService] Session completed: ${session.id}`);
                this.saveSessionHistory(session);
            }

            this.saveSession(session);
            console.log(`📝 [StudyService] Processed answer (quality: ${quality}) for card ${session.currentIndex - 1}`);
            
            return session;
            
        } catch (error) {
            console.error(`❌ [StudyService] Error processing answer:`, error);
            throw error;
        }
    },

    /**
     * Obtiene la tarjeta actual de la sesión
     * @returns {object|null} Tarjeta actual o null
     */
    getCurrentCard() {
        const session = this.getCurrentSession();
        if (!session) {
            return null;
        }

        const currentCard = session.cards[session.currentIndex];
        if (currentCard) {
            console.log(`📄 [StudyService] Current card: ${session.currentIndex + 1}/${session.cards.length}`);
        }
        
        return currentCard || null;
    },

    /**
     * Pausa la sesión actual
     * @returns {boolean} True si se pausó correctamente
     */
    pauseSession() {
        const session = this.getCurrentSession();
        if (!session) {
            return false;
        }

        session.pausedAt = new Date().toISOString();
        this.saveSession(session);
        
        console.log(`⏸️ [StudyService] Session paused: ${session.id}`);
        return true;
    },

    /**
     * Reanuda la sesión pausada
     * @returns {boolean} True si se reanudó correctamente
     */
    resumeSession() {
        const session = this.getCurrentSession();
        if (!session || !session.pausedAt) {
            return false;
        }

        delete session.pausedAt;
        this.saveSession(session);
        
        console.log(`▶️ [StudyService] Session resumed: ${session.id}`);
        return true;
    },

    /**
     * Termina la sesión actual prematuramente
     * @returns {StudySession|null} Sesión terminada
     */
    endSession() {
        const session = this.getCurrentSession();
        if (!session) {
            return null;
        }

        session.completedAt = new Date().toISOString();
        session.stats.endTime = Date.now();
        session.stats.totalDuration = session.stats.endTime - session.stats.startTime;
        session.endedEarly = true;

        this.saveSession(session);
        this.saveSessionHistory(session);
        
        console.log(`🛑 [StudyService] Session ended early: ${session.id}`);
        return session;
    },

    /**
     * Obtiene el historial de sesiones de estudio
     * @param {number} limit - Límite de sesiones a retornar
     * @returns {StudySession[]} Array de sesiones históricas
     */
    getSessionHistory(limit = 10) {
        const history = StorageService.get('study_session_history') || [];
        const sorted = history.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
        
        console.log(`📚 [StudyService] Retrieved ${Math.min(limit, sorted.length)} sessions from history`);
        return sorted.slice(0, limit);
    },

    /**
     * Obtiene estadísticas de estudio
     * @param {number} days - Número de días a considerar
     * @returns {object} Estadísticas de estudio
     */
    getStudyStats(days = 30) {
        const history = this.getSessionHistory(100);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentSessions = history.filter(session => 
            new Date(session.startedAt) >= cutoffDate && session.completedAt
        );

        const stats = {
            totalSessions: recentSessions.length,
            totalCardsStudied: recentSessions.reduce((sum, session) => 
                sum + (session.stats.correctAnswers + session.stats.incorrectAnswers), 0),
            averageAccuracy: recentSessions.length > 0 
                ? Math.round((recentSessions.reduce((sum, session) => 
                    sum + (session.stats.correctAnswers / (session.stats.correctAnswers + session.stats.incorrectAnswers) * 100), 0
                  ) / recentSessions.length) * 100) / 100
                : 0,
            totalStudyTime: recentSessions.reduce((sum, session) => 
                sum + (session.stats.totalDuration || 0), 0),
            averageSessionLength: recentSessions.length > 0
                ? Math.round((recentSessions.reduce((sum, session) => 
                    sum + (session.stats.totalDuration || 0), 0) / recentSessions.length) / 1000)
                : 0,
            studyStreak: this.calculateStudyStreak()
        };

        console.log(`📊 [StudyService] Study stats for last ${days} days:`, stats);
        return stats;
    },

    /**
     * Calcula la racha de estudio actual
     * @returns {number} Días consecutivos de estudio
     */
    calculateStudyStreak() {
        const history = this.getSessionHistory(365);
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const hasStudied = history.some(session => {
                const sessionDate = new Date(session.startedAt);
                return sessionDate.toDateString() === checkDate.toDateString() && session.completedAt;
            });
            
            if (hasStudied) {
                streak++;
            } else if (i > 0) { // No contar el día actual si no ha estudiado
                break;
            }
        }
        
        return streak;
    },

    /**
     * Mezcla aleatoriamente las tarjetas
     * @param {Array} cards - Array de tarjetas
     * @returns {Array} Array mezclado
     */
    shuffleCards(cards) {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Guarda la sesión actual
     * @param {StudySession} session - Sesión a guardar
     */
    saveSession(session) {
        StorageService.set('current_study_session', session);
    },

    /**
     * Guarda la sesión en el historial
     * @param {StudySession} session - Sesión a guardar en historial
     */
    saveSessionHistory(session) {
        const history = StorageService.get('study_session_history') || [];
        history.push(session);
        
        // Mantener solo las últimas 100 sesiones
        if (history.length > 100) {
            history.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
            history.splice(100);
        }
        
        StorageService.set('study_session_history', history);
        
        // Limpiar sesión actual
        StorageService.remove('current_study_session');
    },

    /**
     * Genera un ID único para la sesión
     * @returns {string} ID único
     */
    generateSessionId() {
        return 'session_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    /**
     * Obtiene el ID del usuario actual
     * @returns {string} ID del usuario
     */
    getCurrentUserId() {
        const user = StorageService.get('user');
        return user?.id || 'anonymous';
    }
};

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudyService };
}