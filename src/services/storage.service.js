/**
 * StorageService - Servicio de almacenamiento unificado
 * Extraído de app-functional.js para modularización
 */

const STORAGE_PREFIX = "studyingflash_";

export const StorageService = {
    /**
     * Obtiene un valor del localStorage
     * @param {string} key - Clave del almacenamiento
     * @returns {any|null} El valor almacenado o null si no existe
     */
    get(key) {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`❌ [StorageService] Error reading from storage (${key}):`, error);
            return null;
        }
    },

    /**
     * Guarda un valor en localStorage
     * @param {string} key - Clave del almacenamiento
     * @param {any} value - Valor a guardar
     */
    set(key, value) {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
            console.log(`✅ [StorageService] Saved to storage: ${key}`);
        } catch (error) {
            console.error(`❌ [StorageService] Error writing to storage (${key}):`, error);
            throw error;
        }
    },

    /**
     * Elimina un valor del localStorage
     * @param {string} key - Clave a eliminar
     */
    remove(key) {
        try {
            localStorage.removeItem(STORAGE_PREFIX + key);
            console.log(`🗑️ [StorageService] Removed from storage: ${key}`);
        } catch (error) {
            console.error(`❌ [StorageService] Error removing from storage (${key}):`, error);
        }
    },

    /**
     * Limpia todo el almacenamiento de la aplicación
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            const appKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
            
            appKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`🧹 [StorageService] Cleared ${appKeys.length} items from storage`);
        } catch (error) {
            console.error(`❌ [StorageService] Error clearing storage:`, error);
        }
    },

    /**
     * Verifica si existe una clave en el almacenamiento
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si existe, false si no
     */
    exists(key) {
        return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    },

    /**
     * Obtiene todas las claves de la aplicación
     * @returns {string[]} Array de claves sin el prefijo
     */
    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .map(key => key.replace(STORAGE_PREFIX, ''));
    },

    /**
     * Obtiene estadísticas del almacenamiento
     * @returns {object} Estadísticas del almacenamiento
     */
    getStorageStats() {
        const keys = this.getAllKeys();
        let totalSize = 0;

        keys.forEach(key => {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            totalSize += item ? item.length : 0;
        });

        return {
            totalKeys: keys.length,
            totalSize: totalSize,
            sizeInKB: Math.round(totalSize / 1024 * 100) / 100,
            keys: keys
        };
    }
};

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageService };
}