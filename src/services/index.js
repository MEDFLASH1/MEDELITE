/**
 * Servicios modulares de StudyingFlash
 * Punto de entrada unificado para todos los servicios
 * 
 * Extraídos de app-functional.js como parte de la modularización
 * Agente 3 - Especialista en Modularización
 */

// Importar todos los servicios
import { StorageService } from './storage.service.js';
import { DeckService } from './deck.service.js';
import { FlashcardService } from './flashcard.service.js';
import { StudyService } from './study.service.js';
import { NotificationService } from './notification.service.js';

// Exportar servicios individuales
export {
    StorageService,
    DeckService,
    FlashcardService,
    StudyService,
    NotificationService
};

// Exportar objeto con todos los servicios para compatibilidad
export const Services = {
    Storage: StorageService,
    Deck: DeckService,
    Flashcard: FlashcardService,
    Study: StudyService,
    Notification: NotificationService
};

// Función de inicialización de servicios
export function initializeServices() {
    console.log('🚀 [Services] Initializing StudyingFlash services...');
    
    try {
        // Verificar que localStorage esté disponible
        if (typeof localStorage === 'undefined') {
            throw new Error('localStorage is not available');
        }

        // Verificar configuración inicial de StorageService
        const storageStats = StorageService.getStorageStats();
        console.log('💾 [Services] Storage statistics:', storageStats);

        // Verificar que los servicios estén funcionando
        const deckCount = DeckService.getAll().length;
        const flashcardCount = FlashcardService.getAll().length;
        
        console.log(`📚 [Services] Found ${deckCount} decks and ${flashcardCount} flashcards`);

        // Verificar si hay una sesión de estudio activa
        const currentSession = StudyService.getCurrentSession();
        if (currentSession) {
            console.log(`🎓 [Services] Active study session found: ${currentSession.id}`);
        }

        console.log('✅ [Services] All services initialized successfully');
        
        return {
            success: true,
            stats: {
                storage: storageStats,
                decks: deckCount,
                flashcards: flashcardCount,
                hasActiveSession: !!currentSession
            }
        };
        
    } catch (error) {
        console.error('❌ [Services] Error initializing services:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para obtener información de estado de todos los servicios
export function getServicesStatus() {
    const status = {
        timestamp: new Date().toISOString(),
        services: {
            storage: {
                available: typeof localStorage !== 'undefined',
                stats: StorageService.getStorageStats()
            },
            deck: {
                total: DeckService.getAll().length,
                stats: DeckService.getStats()
            },
            flashcard: {
                total: FlashcardService.getAll().length,
                stats: FlashcardService.getStats()
            },
            study: {
                activeSession: !!StudyService.getCurrentSession(),
                stats: StudyService.getStudyStats(7) // Últimos 7 días
            },
            notification: {
                historyCount: NotificationService.getHistory(1).length
            }
        }
    };

    console.log('📊 [Services] Current status:', status);
    return status;
}

// Función para limpiar todos los datos (útil para testing/reset)
export function resetAllServices() {
    console.warn('🗑️ [Services] Resetting all services data...');
    
    try {
        // Limpiar almacenamiento
        StorageService.clear();
        
        // Limpiar historial de notificaciones
        NotificationService.clearHistory();
        
        // Cerrar notificaciones activas
        NotificationService.closeAll();
        
        console.log('✅ [Services] All services reset successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ [Services] Error resetting services:', error);
        return { success: false, error: error.message };
    }
}

// Auto-inicialización si estamos en un navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeServices();
    });
}

console.log('📦 [Services] Services module loaded successfully');

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageService,
        DeckService,
        FlashcardService,
        StudyService,
        NotificationService,
        Services,
        initializeServices,
        getServicesStatus,
        resetAllServices
    };
}