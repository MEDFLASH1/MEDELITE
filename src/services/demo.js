/**
 * DEMO - Uso de Servicios Modulares
 * Ejemplo de cómo usar los servicios extraídos de app-functional.js
 * 
 * Este archivo demuestra la nueva arquitectura modular implementada por el AGENTE 3
 */

import { 
    StorageService, 
    DeckService, 
    FlashcardService, 
    StudyService, 
    NotificationService,
    initializeServices,
    getServicesStatus
} from './index.js';

// ===== DEMOSTRACIÓN DE USO =====

async function demonstrateServices() {
    console.log('🎬 [DEMO] Iniciando demostración de servicios modulares...');
    
    // 1. Inicializar servicios
    const initResult = initializeServices();
    console.log('🚀 [DEMO] Inicialización:', initResult);
    
    // 2. Mostrar notificación de bienvenida
    NotificationService.success('¡Servicios modulares cargados exitosamente!');
    
    // 3. Crear un deck de demostración
    try {
        const demoDeck = DeckService.create({
            name: 'Deck de Demostración',
            description: 'Ejemplo de uso de DeckService',
            isPublic: false
        });
        
        console.log('📚 [DEMO] Deck creado:', demoDeck);
        NotificationService.info(`Deck "${demoDeck.name}" creado`);
        
        // 4. Crear algunas flashcards
        const flashcards = [
            {
                deckId: demoDeck.id,
                question: '¿Qué es la modularización?',
                answer: 'Es el proceso de dividir código monolítico en módulos especializados y reutilizables'
            },
            {
                deckId: demoDeck.id,
                question: '¿Cuáles son los beneficios de los servicios modulares?',
                answer: 'Mayor mantenibilidad, reutilización, escalabilidad y testabilidad'
            },
            {
                deckId: demoDeck.id,
                question: '¿Qué patrón arquitectónico se usa?',
                answer: 'Service Layer Pattern con separación de responsabilidades'
            }
        ];
        
        const createdCards = flashcards.map(cardData => {
            const card = FlashcardService.create(cardData);
            console.log('🃏 [DEMO] Flashcard creada:', card.question);
            return card;
        });
        
        // 5. Actualizar contador de tarjetas del deck
        DeckService.updateCardCount(demoDeck.id);
        
        // 6. Iniciar una sesión de estudio
        const studySession = StudyService.startSession(demoDeck.id);
        console.log('🎓 [DEMO] Sesión de estudio iniciada:', studySession);
        
        // 7. Simular respuestas a las tarjetas
        for (let i = 0; i < createdCards.length; i++) {
            const currentCard = StudyService.getCurrentCard();
            if (currentCard) {
                console.log(`📄 [DEMO] Estudiando: ${currentCard.question}`);
                
                // Simular respuesta (calidad aleatoria entre 3-5)
                const quality = Math.floor(Math.random() * 3) + 3;
                const responseTime = Math.floor(Math.random() * 5000) + 2000; // 2-7 segundos
                
                StudyService.processAnswer(quality, responseTime);
                console.log(`✅ [DEMO] Respuesta procesada (calidad: ${quality})`);
            }
        }
        
        // 8. Obtener estadísticas
        const deckStats = DeckService.getStats();
        const flashcardStats = FlashcardService.getStats();
        const studyStats = StudyService.getStudyStats();
        
        console.log('📊 [DEMO] Estadísticas:');
        console.log('  - Decks:', deckStats);
        console.log('  - Flashcards:', flashcardStats);
        console.log('  - Estudio:', studyStats);
        
        // 9. Buscar contenido
        const searchResults = FlashcardService.search('modularización');
        console.log('🔍 [DEMO] Resultados de búsqueda:', searchResults);
        
        // 10. Obtener status de todos los servicios
        const status = getServicesStatus();
        console.log('📋 [DEMO] Status de servicios:', status);
        
        // 11. Notificación final
        NotificationService.success('¡Demostración completada exitosamente!', {
            duration: 5000,
            sound: true
        });
        
        return {
            success: true,
            demo: {
                deck: demoDeck,
                flashcards: createdCards,
                session: studySession,
                stats: { deckStats, flashcardStats, studyStats }
            }
        };
        
    } catch (error) {
        console.error('❌ [DEMO] Error durante la demostración:', error);
        NotificationService.error(`Error en demo: ${error.message}`);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// ===== EJEMPLOS DE USO ESPECÍFICO =====

// Ejemplo 1: Gestión básica de decks
function deckManagementExample() {
    console.log('📚 [DEMO] Ejemplo de gestión de decks...');
    
    // Crear deck
    const deck = DeckService.create({
        name: 'JavaScript Básico',
        description: 'Conceptos fundamentales de JavaScript',
        isPublic: true
    });
    
    // Obtener todos los decks
    const allDecks = DeckService.getAll();
    console.log(`Total de decks: ${allDecks.length}`);
    
    // Buscar decks
    const searchResults = DeckService.search('JavaScript');
    console.log(`Decks encontrados: ${searchResults.length}`);
    
    // Actualizar deck
    const updatedDeck = DeckService.update(deck.id, {
        description: 'Conceptos fundamentales y avanzados de JavaScript'
    });
    
    return { deck, allDecks, searchResults, updatedDeck };
}

// Ejemplo 2: Gestión de flashcards con algoritmo SM2
function flashcardAlgorithmExample() {
    console.log('🃏 [DEMO] Ejemplo de algoritmo de repetición espaciada...');
    
    // Crear deck para el ejemplo
    const deck = DeckService.create({
        name: 'Algoritmo SM2 Demo',
        description: 'Demostración del algoritmo SuperMemo 2'
    });
    
    // Crear flashcard
    const card = FlashcardService.create({
        deckId: deck.id,
        question: '¿Qué significa SM2?',
        answer: 'SuperMemo 2 - Algoritmo de repetición espaciada'
    });
    
    console.log('Estado inicial de la tarjeta:', {
        interval: card.interval,
        repetitions: card.repetitions,
        easeFactor: card.easeFactor
    });
    
    // Simular varias revisiones
    const reviews = [5, 4, 3, 5, 4]; // Calidades de respuesta
    
    reviews.forEach((quality, index) => {
        const updatedCard = FlashcardService.updateReviewProgress(card.id, quality);
        console.log(`Revisión ${index + 1} (calidad ${quality}):`, {
            interval: updatedCard.interval,
            repetitions: updatedCard.repetitions,
            easeFactor: updatedCard.easeFactor,
            nextReview: new Date(updatedCard.dueDate).toLocaleDateString()
        });
    });
    
    return { deck, card };
}

// Ejemplo 3: Sistema de notificaciones avanzado
function notificationSystemExample() {
    console.log('🔔 [DEMO] Ejemplo de sistema de notificaciones...');
    
    // Configurar notificaciones con sonido
    NotificationService.updateDefaultConfig({
        duration: 4000,
        position: 'top-center',
        sound: true
    });
    
    // Mostrar diferentes tipos de notificaciones
    setTimeout(() => NotificationService.info('Información: Sistema cargado'), 1000);
    setTimeout(() => NotificationService.warning('Advertencia: Memoria baja'), 2000);
    setTimeout(() => NotificationService.success('Éxito: Datos guardados'), 3000);
    setTimeout(() => NotificationService.error('Error: Conexión perdida'), 4000);
    
    // Obtener historial
    setTimeout(() => {
        const history = NotificationService.getHistory(10);
        console.log('Historial de notificaciones:', history);
    }, 5000);
}

// ===== EXPORTAR FUNCIONES DE DEMO =====

export {
    demonstrateServices,
    deckManagementExample,
    flashcardAlgorithmExample,
    notificationSystemExample
};

// Auto-ejecutar demo si estamos en un navegador
if (typeof window !== 'undefined') {
    window.StudyingFlashDemo = {
        demonstrateServices,
        deckManagementExample,
        flashcardAlgorithmExample,
        notificationSystemExample
    };
    
    console.log('🎭 [DEMO] Funciones de demostración disponibles en window.StudyingFlashDemo');
    console.log('💡 [DEMO] Ejecuta: StudyingFlashDemo.demonstrateServices()');
}

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        demonstrateServices,
        deckManagementExample,
        flashcardAlgorithmExample,
        notificationSystemExample
    };
}