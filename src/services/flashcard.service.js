/**
 * FlashcardService - Servicio de gestión de flashcards
 * Extraído de app-functional.js para modularización
 */

import { StorageService } from './storage.service.js';

/**
 * @typedef {object} Flashcard
 * @property {string} id
 * @property {string} deckId
 * @property {string} question
 * @property {string} answer
 * @property {number} interval
 * @property {number} repetitions
 * @property {number} easeFactor
 * @property {string} dueDate
 * @property {string} createdAt
 * @property {string} lastReviewed
 */

export const FlashcardService = {
    /**
     * Obtiene todas las flashcards
     * @returns {Flashcard[]} Array de flashcards
     */
    getAll() {
        const flashcards = StorageService.get('flashcards') || [];
        console.log(`🃏 [FlashcardService] Retrieved ${flashcards.length} flashcards`);
        return flashcards;
    },

    /**
     * Obtiene flashcards por deck ID
     * @param {string} deckId - ID del deck
     * @returns {Flashcard[]} Array de flashcards del deck
     */
    getByDeck(deckId) {
        const flashcards = this.getAll();
        const deckCards = flashcards.filter(card => card.deckId === deckId);
        
        console.log(`📖 [FlashcardService] Found ${deckCards.length} cards for deck ${deckId}`);
        return deckCards;
    },

    /**
     * Obtiene una flashcard por ID
     * @param {string} id - ID de la flashcard
     * @returns {Flashcard|null} La flashcard encontrada o null
     */
    getById(id) {
        const flashcards = this.getAll();
        const card = flashcards.find(c => c.id === id);
        
        if (card) {
            console.log(`🎯 [FlashcardService] Found flashcard: ${id}`);
        } else {
            console.warn(`⚠️ [FlashcardService] Flashcard not found: ${id}`);
        }
        
        return card || null;
    },

    /**
     * Crea una nueva flashcard
     * @param {object} cardData - Datos de la flashcard a crear
     * @returns {Flashcard} La flashcard creada
     */
    create(cardData) {
        try {
            const flashcards = this.getAll();
            
            const newCard = {
                id: this.generateId(),
                deckId: cardData.deckId || '',
                question: cardData.question || cardData.front || '',
                answer: cardData.answer || cardData.back || '',
                interval: 1,
                repetitions: 0,
                easeFactor: 2.5,
                dueDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                lastReviewed: null
            };

            // Validar datos requeridos
            if (!newCard.deckId) {
                throw new Error('El ID del deck es requerido');
            }
            if (!newCard.question.trim()) {
                throw new Error('La pregunta/frente de la tarjeta es requerida');
            }
            if (!newCard.answer.trim()) {
                throw new Error('La respuesta/reverso de la tarjeta es requerida');
            }

            flashcards.push(newCard);
            StorageService.set('flashcards', flashcards);
            
            console.log(`✅ [FlashcardService] Created flashcard: ${newCard.id} for deck ${newCard.deckId}`);
            return newCard;
            
        } catch (error) {
            console.error(`❌ [FlashcardService] Error creating flashcard:`, error);
            throw error;
        }
    },

    /**
     * Actualiza una flashcard existente
     * @param {string} id - ID de la flashcard a actualizar
     * @param {object} updates - Datos a actualizar
     * @returns {Flashcard|null} La flashcard actualizada o null si no se encuentra
     */
    update(id, updates) {
        try {
            const flashcards = this.getAll();
            const index = flashcards.findIndex(c => c.id === id);
            
            if (index === -1) {
                console.warn(`⚠️ [FlashcardService] Cannot update: flashcard not found (${id})`);
                return null;
            }

            // Actualizar flashcard preservando campos importantes
            flashcards[index] = {
                ...flashcards[index],
                ...updates,
                id // Preservar ID original
            };

            StorageService.set('flashcards', flashcards);
            
            console.log(`📝 [FlashcardService] Updated flashcard: ${id}`);
            return flashcards[index];
            
        } catch (error) {
            console.error(`❌ [FlashcardService] Error updating flashcard (${id}):`, error);
            throw error;
        }
    },

    /**
     * Elimina una flashcard
     * @param {string} id - ID de la flashcard a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    delete(id) {
        try {
            const flashcards = this.getAll();
            const initialLength = flashcards.length;
            const filtered = flashcards.filter(c => c.id !== id);
            
            if (filtered.length === initialLength) {
                console.warn(`⚠️ [FlashcardService] Cannot delete: flashcard not found (${id})`);
                return false;
            }

            StorageService.set('flashcards', filtered);
            
            console.log(`🗑️ [FlashcardService] Deleted flashcard: ${id}`);
            return true;
            
        } catch (error) {
            console.error(`❌ [FlashcardService] Error deleting flashcard (${id}):`, error);
            throw error;
        }
    },

    /**
     * Obtiene flashcards que necesitan revisión
     * @param {string} deckId - ID del deck (opcional)
     * @param {number} limit - Límite de tarjetas a retornar
     * @returns {Flashcard[]} Array de flashcards para revisar
     */
    getNextReviewCards(deckId = null, limit = 10) {
        let flashcards = this.getAll();
        
        // Filtrar por deck si se especifica
        if (deckId) {
            flashcards = flashcards.filter(card => card.deckId === deckId);
        }

        const now = new Date();
        
        // Obtener tarjetas que están listas para revisar
        const dueCards = flashcards.filter(card => {
            const dueDate = new Date(card.dueDate);
            return dueDate <= now;
        });

        // Ordenar por fecha de vencimiento (más antiguas primero)
        dueCards.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const result = dueCards.slice(0, limit);
        console.log(`📅 [FlashcardService] Found ${result.length} cards due for review${deckId ? ` in deck ${deckId}` : ''}`);
        
        return result;
    },

    /**
     * Actualiza el progreso de una flashcard después de ser revisada
     * @param {string} id - ID de la flashcard
     * @param {number} quality - Calidad de la respuesta (0-5)
     * @returns {Flashcard|null} La flashcard actualizada
     */
    updateReviewProgress(id, quality) {
        const card = this.getById(id);
        if (!card) {
            return null;
        }

        // Algoritmo SuperMemo 2 simplificado
        const now = new Date();
        let { interval, repetitions, easeFactor } = card;

        if (quality >= 3) {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions++;
        } else {
            repetitions = 0;
            interval = 1;
        }

        // Actualizar ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        easeFactor = Math.max(1.3, easeFactor);

        const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

        const updates = {
            interval,
            repetitions,
            easeFactor: Math.round(easeFactor * 100) / 100,
            dueDate: nextReview.toISOString(),
            lastReviewed: now.toISOString()
        };

        console.log(`🎯 [FlashcardService] Updated review progress for ${id}: next review in ${interval} days`);
        return this.update(id, updates);
    },

    /**
     * Busca flashcards por contenido
     * @param {string} query - Texto a buscar
     * @param {string} deckId - ID del deck (opcional)
     * @returns {Flashcard[]} Array de flashcards que coinciden
     */
    search(query, deckId = null) {
        let flashcards = this.getAll();
        
        if (deckId) {
            flashcards = flashcards.filter(card => card.deckId === deckId);
        }

        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            return flashcards;
        }

        const results = flashcards.filter(card => 
            card.question.toLowerCase().includes(searchTerm) ||
            card.answer.toLowerCase().includes(searchTerm)
        );

        console.log(`🔍 [FlashcardService] Search "${query}" found ${results.length} results`);
        return results;
    },

    /**
     * Obtiene estadísticas de flashcards
     * @param {string} deckId - ID del deck (opcional)
     * @returns {object} Estadísticas de flashcards
     */
    getStats(deckId = null) {
        let flashcards = this.getAll();
        
        if (deckId) {
            flashcards = flashcards.filter(card => card.deckId === deckId);
        }

        const now = new Date();
        const dueCards = flashcards.filter(card => new Date(card.dueDate) <= now);
        const masteredCards = flashcards.filter(card => card.repetitions >= 5);
        const newCards = flashcards.filter(card => card.repetitions === 0);

        const stats = {
            total: flashcards.length,
            due: dueCards.length,
            mastered: masteredCards.length,
            new: newCards.length,
            averageEaseFactor: flashcards.length > 0 
                ? Math.round((flashcards.reduce((sum, card) => sum + card.easeFactor, 0) / flashcards.length) * 100) / 100
                : 0
        };

        console.log(`📊 [FlashcardService] Stats${deckId ? ` for deck ${deckId}` : ''}:`, stats);
        return stats;
    },

    /**
     * Genera un ID único para una flashcard
     * @returns {string} ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
};

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlashcardService };
}