/**
 * DeckService - Servicio de gestión de decks
 * Extraído de app-functional.js para modularización
 */

import { StorageService } from './storage.service.js';

/**
 * @typedef {object} Deck
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} isPublic
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} cardCount
 * @property {Array} flashcards
 * @property {object} stats
 */

export const DeckService = {
    /**
     * Obtiene todos los decks
     * @returns {Deck[]} Array de decks
     */
    getAll() {
        const decks = StorageService.get('decks') || [];
        console.log(`📚 [DeckService] Retrieved ${decks.length} decks`);
        return decks;
    },

    /**
     * Obtiene un deck por ID
     * @param {string} id - ID del deck
     * @returns {Deck|null} El deck encontrado o null
     */
    getById(id) {
        const decks = this.getAll();
        const deck = decks.find(d => d.id === id);
        
        if (deck) {
            console.log(`📖 [DeckService] Found deck: ${deck.name}`);
        } else {
            console.warn(`⚠️ [DeckService] Deck not found: ${id}`);
        }
        
        return deck || null;
    },

    /**
     * Crea un nuevo deck
     * @param {object} deckData - Datos del deck a crear
     * @returns {Deck} El deck creado
     */
    create(deckData) {
        try {
            const decks = this.getAll();
            
            const newDeck = {
                id: this.generateId(),
                name: deckData.name || '',
                description: deckData.description || '',
                isPublic: deckData.isPublic || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                cardCount: 0,
                flashcards: [],
                stats: {
                    total: 0,
                    studied: 0,
                    mastered: 0
                }
            };

            // Validar datos requeridos
            if (!newDeck.name.trim()) {
                throw new Error('El nombre del deck es requerido');
            }

            decks.push(newDeck);
            StorageService.set('decks', decks);
            
            console.log(`✅ [DeckService] Created deck: ${newDeck.name} (${newDeck.id})`);
            return newDeck;
            
        } catch (error) {
            console.error(`❌ [DeckService] Error creating deck:`, error);
            throw error;
        }
    },

    /**
     * Actualiza un deck existente
     * @param {string} id - ID del deck a actualizar
     * @param {object} updates - Datos a actualizar
     * @returns {Deck|null} El deck actualizado o null si no se encuentra
     */
    update(id, updates) {
        try {
            const decks = this.getAll();
            const index = decks.findIndex(d => d.id === id);
            
            if (index === -1) {
                console.warn(`⚠️ [DeckService] Cannot update: deck not found (${id})`);
                return null;
            }

            // Actualizar deck preservando campos importantes
            decks[index] = {
                ...decks[index],
                ...updates,
                id, // Preservar ID original
                updatedAt: new Date().toISOString()
            };

            StorageService.set('decks', decks);
            
            console.log(`📝 [DeckService] Updated deck: ${decks[index].name} (${id})`);
            return decks[index];
            
        } catch (error) {
            console.error(`❌ [DeckService] Error updating deck (${id}):`, error);
            throw error;
        }
    },

    /**
     * Elimina un deck
     * @param {string} id - ID del deck a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    delete(id) {
        try {
            const decks = this.getAll();
            const initialLength = decks.length;
            const filtered = decks.filter(d => d.id !== id);
            
            if (filtered.length === initialLength) {
                console.warn(`⚠️ [DeckService] Cannot delete: deck not found (${id})`);
                return false;
            }

            StorageService.set('decks', filtered);
            
            // También eliminar flashcards asociadas
            const flashcards = StorageService.get('flashcards') || [];
            const filteredFlashcards = flashcards.filter(card => card.deckId !== id);
            StorageService.set('flashcards', filteredFlashcards);
            
            const deletedCards = flashcards.length - filteredFlashcards.length;
            console.log(`🗑️ [DeckService] Deleted deck (${id}) and ${deletedCards} associated flashcards`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ [DeckService] Error deleting deck (${id}):`, error);
            throw error;
        }
    },

    /**
     * Busca decks por nombre o descripción
     * @param {string} query - Texto a buscar
     * @returns {Deck[]} Array de decks que coinciden
     */
    search(query) {
        const decks = this.getAll();
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            return decks;
        }

        const results = decks.filter(deck => 
            deck.name.toLowerCase().includes(searchTerm) ||
            deck.description.toLowerCase().includes(searchTerm)
        );

        console.log(`🔍 [DeckService] Search "${query}" found ${results.length} results`);
        return results;
    },

    /**
     * Obtiene decks públicos
     * @returns {Deck[]} Array de decks públicos
     */
    getPublicDecks() {
        const decks = this.getAll();
        const publicDecks = decks.filter(deck => deck.isPublic);
        
        console.log(`🌐 [DeckService] Found ${publicDecks.length} public decks`);
        return publicDecks;
    },

    /**
     * Actualiza el contador de tarjetas de un deck
     * @param {string} deckId - ID del deck
     */
    updateCardCount(deckId) {
        const flashcards = StorageService.get('flashcards') || [];
        const deckCards = flashcards.filter(card => card.deckId === deckId);
        
        this.update(deckId, { 
            cardCount: deckCards.length,
            updatedAt: new Date().toISOString()
        });
        
        console.log(`🔢 [DeckService] Updated card count for deck ${deckId}: ${deckCards.length} cards`);
    },

    /**
     * Genera un ID único para un deck
     * @returns {string} ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    /**
     * Obtiene estadísticas de todos los decks
     * @returns {object} Estadísticas generales
     */
    getStats() {
        const decks = this.getAll();
        const flashcards = StorageService.get('flashcards') || [];
        
        const stats = {
            totalDecks: decks.length,
            totalFlashcards: flashcards.length,
            publicDecks: decks.filter(d => d.isPublic).length,
            privateDecks: decks.filter(d => !d.isPublic).length,
            averageCardsPerDeck: decks.length > 0 ? Math.round(flashcards.length / decks.length) : 0
        };

        console.log(`📊 [DeckService] Stats:`, stats);
        return stats;
    }
};

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DeckService };
}