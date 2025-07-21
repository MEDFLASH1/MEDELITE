/**
 * NotificationService - Servicio de gestión de notificaciones
 * Extraído de app-functional.js para modularización
 */

import { StorageService } from './storage.service.js';

/**
 * @typedef {object} NotificationConfig
 * @property {number} duration - Duración en ms
 * @property {string} position - Posición de la notificación
 * @property {boolean} closable - Si se puede cerrar manualmente
 * @property {boolean} sound - Si reproduce sonido
 */

export const NotificationService = {
    /**
     * Configuración por defecto de las notificaciones
     */
    defaultConfig: {
        duration: 3000,
        position: 'top-right',
        closable: true,
        sound: false
    },

    /**
     * Muestra una notificación de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {NotificationConfig} config - Configuración personalizada
     */
    success(message, config = {}) {
        this.show(message, 'success', config);
    },

    /**
     * Muestra una notificación de error
     * @param {string} message - Mensaje a mostrar
     * @param {NotificationConfig} config - Configuración personalizada
     */
    error(message, config = {}) {
        this.show(message, 'error', config);
    },

    /**
     * Muestra una notificación de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {NotificationConfig} config - Configuración personalizada
     */
    warning(message, config = {}) {
        this.show(message, 'warning', config);
    },

    /**
     * Muestra una notificación informativa
     * @param {string} message - Mensaje a mostrar
     * @param {NotificationConfig} config - Configuración personalizada
     */
    info(message, config = {}) {
        this.show(message, 'info', config);
    },

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     * @param {NotificationConfig} config - Configuración personalizada
     */
    show(message, type = 'info', config = {}) {
        try {
            const finalConfig = { ...this.defaultConfig, ...config };
            const notification = this.createNotificationElement(message, type, finalConfig);
            
            // Agregar al DOM
            document.body.appendChild(notification);
            
            // Animar entrada
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });

            // Auto-remover después del tiempo especificado
            if (finalConfig.duration > 0) {
                setTimeout(() => {
                    this.removeNotification(notification);
                }, finalConfig.duration);
            }

            // Reproducir sonido si está habilitado
            if (finalConfig.sound) {
                this.playNotificationSound(type);
            }

            // Guardar en historial
            this.saveToHistory(message, type);

            console.log(`🔔 [NotificationService] Showed ${type} notification: ${message}`);
            
        } catch (error) {
            console.error(`❌ [NotificationService] Error showing notification:`, error);
            // Fallback a alert nativo
            alert(`[${type.toUpperCase()}] ${message}`);
        }
    },

    /**
     * Crea el elemento DOM de la notificación
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación
     * @param {NotificationConfig} config - Configuración
     * @returns {HTMLElement} Elemento de notificación
     */
    createNotificationElement(message, type, config) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Definir iconos por tipo
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Definir colores por tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
                ${config.closable ? '<button class="notification-close" aria-label="Cerrar">×</button>' : ''}
            </div>
        `;

        // Aplicar estilos
        notification.style.cssText = `
            position: fixed;
            ${this.getPositionStyles(config.position)}
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        // Estilos para el contenido
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // Estilos para el mensaje
        const messageEl = notification.querySelector('.notification-message');
        messageEl.style.cssText = `
            flex: 1;
        `;

        // Configurar botón de cerrar si está habilitado
        if (config.closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                opacity: 0.8;
                transition: opacity 0.2s ease;
            `;
            
            closeBtn.addEventListener('click', () => {
                this.removeNotification(notification);
            });

            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.opacity = '1';
            });

            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.opacity = '0.8';
            });
        }

        // Clase para animación de entrada
        notification.classList.add('notification-enter');

        return notification;
    },

    /**
     * Obtiene los estilos CSS para la posición
     * @param {string} position - Posición de la notificación
     * @returns {string} Estilos CSS
     */
    getPositionStyles(position) {
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };

        return positions[position] || positions['top-right'];
    },

    /**
     * Remueve una notificación del DOM
     * @param {HTMLElement} notification - Elemento de notificación
     */
    removeNotification(notification) {
        if (!notification || !notification.parentElement) {
            return;
        }

        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    },

    /**
     * Reproduce un sonido de notificación
     * @param {string} type - Tipo de notificación
     */
    playNotificationSound(type) {
        try {
            // Crear audio context si no existe
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Frecuencias por tipo de notificación
            const frequencies = {
                success: [523.25, 659.25, 783.99], // Do, Mi, Sol
                error: [233.08, 207.65], // Sib, Lab
                warning: [369.99, 415.30], // Fa#, Lab
                info: [523.25, 523.25] // Do, Do
            };

            const freqs = frequencies[type] || frequencies.info;
            
            freqs.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.1, 150);
                }, index * 100);
            });

        } catch (error) {
            console.warn(`⚠️ [NotificationService] Could not play sound:`, error);
        }
    },

    /**
     * Reproduce un tono específico
     * @param {number} frequency - Frecuencia en Hz
     * @param {number} volume - Volumen (0-1)
     * @param {number} duration - Duración en ms
     */
    playTone(frequency, volume = 0.1, duration = 200) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    },

    /**
     * Guarda la notificación en el historial
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación
     */
    saveToHistory(message, type) {
        try {
            const history = StorageService.get('notification_history') || [];
            
            history.unshift({
                id: Date.now().toString(),
                message,
                type,
                timestamp: new Date().toISOString()
            });

            // Mantener solo las últimas 50 notificaciones
            if (history.length > 50) {
                history.splice(50);
            }

            StorageService.set('notification_history', history);
            
        } catch (error) {
            console.warn(`⚠️ [NotificationService] Could not save to history:`, error);
        }
    },

    /**
     * Obtiene el historial de notificaciones
     * @param {number} limit - Límite de notificaciones a retornar
     * @returns {Array} Array de notificaciones históricas
     */
    getHistory(limit = 20) {
        const history = StorageService.get('notification_history') || [];
        console.log(`📋 [NotificationService] Retrieved ${Math.min(limit, history.length)} notifications from history`);
        return history.slice(0, limit);
    },

    /**
     * Limpia el historial de notificaciones
     */
    clearHistory() {
        StorageService.remove('notification_history');
        console.log(`🧹 [NotificationService] Cleared notification history`);
    },

    /**
     * Actualiza la configuración por defecto
     * @param {NotificationConfig} newConfig - Nueva configuración
     */
    updateDefaultConfig(newConfig) {
        this.defaultConfig = { ...this.defaultConfig, ...newConfig };
        console.log(`⚙️ [NotificationService] Updated default config:`, this.defaultConfig);
    },

    /**
     * Cierra todas las notificaciones visibles
     */
    closeAll() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        console.log(`🔕 [NotificationService] Closed ${notifications.length} notifications`);
    }
};

// Agregar estilos CSS globales para las animaciones
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .notification.show {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
        
        .notification:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
}

// Para compatibilidad con CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationService };
}