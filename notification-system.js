// ===== SISTEMA DE NOTIFICAÇÕES AVANÇADO =====
// Sistema completo de notificações com suporte a push notifications e lembretes

const NotificationSystem = {
    // Configurações
    settings: {
        enabled: true,
        pushEnabled: false,
        soundEnabled: true,
        studyReminders: true,
        achievementNotifications: true,
        dailyGoalReminders: true
    },
    
    // Queue de notificações
    notificationQueue: [],
    
    // Tipos de notificação
    types: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
        ACHIEVEMENT: 'achievement',
        REMINDER: 'reminder'
    },
    
    // Sons de notificação
    sounds: {
        success: null,
        error: null,
        achievement: null,
        reminder: null
    },
    
    /**
     * Inicializa o sistema de notificações
     */
    init() {
        this.loadSettings();
        this.setupPushNotifications();
        this.setupSounds();
        this.setupDailyReminders();
        this.createNotificationContainer();
        console.log('🔔 Notification System inicializado');
    },
    
    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        const saved = localStorage.getItem('studyingflash_notification_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    },
    
    /**
     * Salva configurações
     */
    saveSettings() {
        localStorage.setItem('studyingflash_notification_settings', JSON.stringify(this.settings));
    },
    
    /**
     * Cria container para notificações
     */
    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        
        // Estilos
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 100%;
                word-wrap: break-word;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.success {
                border-left-color: #10b981;
            }
            
            .notification.error {
                border-left-color: #ef4444;
            }
            
            .notification.warning {
                border-left-color: #f59e0b;
            }
            
            .notification.achievement {
                border-left-color: #8b5cf6;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            }
            
            .notification.reminder {
                border-left-color: #06b6d4;
            }
            
            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #1f2937;
            }
            
            .notification-message {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            .notification-btn {
                padding: 4px 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .notification-btn:hover {
                background: #f3f4f6;
            }
            
            .notification-btn.primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .notification-btn.primary:hover {
                background: #2563eb;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #9ca3af;
                padding: 4px;
                line-height: 1;
            }
            
            .notification-close:hover {
                color: #6b7280;
            }
            
            @media (max-width: 480px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
    },
    
    /**
     * Mostra notificação
     */
    show(message, type = 'info', options = {}) {
        if (!this.settings.enabled) return;
        
        const notification = this.createNotification(message, type, options);
        const container = document.getElementById('notification-container');
        
        if (container) {
            container.appendChild(notification);
            
            // Animar entrada
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Auto-remover
            const duration = options.duration || this.getDefaultDuration(type);
            if (duration > 0) {
                setTimeout(() => {
                    this.remove(notification);
                }, duration);
            }
            
            // Tocar som
            if (this.settings.soundEnabled) {
                this.playSound(type);
            }
            
            // Anunciar para leitores de tela
            if (window.AccessibilityEnhancer) {
                window.AccessibilityEnhancer.announce(message, type === 'error');
            }
        }
        
        return notification;
    },
    
    /**
     * Cria elemento de notificação
     */
    createNotification(message, type, options) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getIcon(type);
        const title = options.title || this.getDefaultTitle(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
                ${options.actions ? this.createActions(options.actions) : ''}
            </div>
            <button class="notification-close" onclick="NotificationSystem.remove(this.parentElement)">×</button>
        `;
        
        return notification;
    },
    
    /**
     * Cria botões de ação
     */
    createActions(actions) {
        const actionsHtml = actions.map(action => `
            <button class="notification-btn ${action.primary ? 'primary' : ''}" 
                    onclick="${action.onclick}">
                ${action.text}
            </button>
        `).join('');
        
        return `<div class="notification-actions">${actionsHtml}</div>`;
    },
    
    /**
     * Remove notificação
     */
    remove(notification) {
        if (notification && notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    },
    
    /**
     * Obtém ícone para tipo de notificação
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            achievement: '🏆',
            reminder: '⏰'
        };
        return icons[type] || icons.info;
    },
    
    /**
     * Obtém título padrão
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação',
            achievement: 'Conquista Desbloqueada!',
            reminder: 'Lembrete'
        };
        return titles[type];
    },
    
    /**
     * Obtém duração padrão
     */
    getDefaultDuration(type) {
        const durations = {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000,
            achievement: 6000,
            reminder: 0 // Não remove automaticamente
        };
        return durations[type] || 3000;
    },
    
    /**
     * Configura push notifications
     */
    setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Verificar permissão
            if (Notification.permission === 'granted') {
                this.settings.pushEnabled = true;
            } else if (Notification.permission !== 'denied') {
                // Solicitar permissão quando necessário
                this.requestNotificationPermission();
            }
        }
    },
    
    /**
     * Solicita permissão para notificações
     */
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            this.settings.pushEnabled = permission === 'granted';
            this.saveSettings();
            
            if (permission === 'granted') {
                this.show('Notificações ativadas com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error);
        }
    },
    
    /**
     * Envia push notification
     */
    sendPushNotification(title, message, options = {}) {
        if (!this.settings.pushEnabled || Notification.permission !== 'granted') {
            return;
        }
        
        const notification = new Notification(title, {
            body: message,
            icon: './icons/icon-192x192.png',
            badge: './icons/icon-144x144.png',
            tag: options.tag || 'studyingflash',
            requireInteraction: options.requireInteraction || false,
            ...options
        });
        
        notification.onclick = () => {
            window.focus();
            if (options.onclick) {
                options.onclick();
            }
            notification.close();
        };
        
        return notification;
    },
    
    /**
     * Configura sons de notificação
     */
    setupSounds() {
        // Criar sons usando Web Audio API ou elementos de áudio
        this.sounds = {
            success: this.createSound(800, 0.1, 'sine'),
            error: this.createSound(300, 0.2, 'sawtooth'),
            achievement: this.createSound([523, 659, 784], 0.3, 'sine'),
            reminder: this.createSound(440, 0.1, 'triangle')
        };
    },
    
    /**
     * Cria som usando Web Audio API
     */
    createSound(frequency, duration, type = 'sine') {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return null;
        }
        
        return {
            play: () => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    if (Array.isArray(frequency)) {
                        // Acorde
                        frequency.forEach((freq, index) => {
                            setTimeout(() => {
                                this.playTone(audioContext, freq, duration / frequency.length, type);
                            }, index * (duration * 1000 / frequency.length));
                        });
                    } else {
                        this.playTone(audioContext, frequency, duration, type);
                    }
                } catch (error) {
                    console.warn('Erro ao reproduzir som:', error);
                }
            }
        };
    },
    
    /**
     * Reproduz tom
     */
    playTone(audioContext, frequency, duration, type) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    },
    
    /**
     * Reproduz som
     */
    playSound(type) {
        if (this.sounds[type] && this.settings.soundEnabled) {
            this.sounds[type].play();
        }
    },
    
    /**
     * Configura lembretes diários
     */
    setupDailyReminders() {
        if (!this.settings.studyReminders) return;
        
        // Verificar se já estudou hoje
        const lastStudy = localStorage.getItem('studyingflash_last_study_date');
        const today = new Date().toDateString();
        
        if (lastStudy !== today) {
            // Agendar lembrete para estudar
            setTimeout(() => {
                this.showStudyReminder();
            }, 30000); // 30 segundos após carregar
        }
        
        // Agendar lembretes futuros
        this.scheduleRecurringReminders();
    },
    
    /**
     * Mostra lembrete de estudo
     */
    showStudyReminder() {
        const actions = [
            {
                text: 'Estudar Agora',
                primary: true,
                onclick: 'app.showSection("estudiar"); NotificationSystem.remove(this.closest(".notification"));'
            },
            {
                text: 'Mais Tarde',
                onclick: 'NotificationSystem.snoozeReminder(); NotificationSystem.remove(this.closest(".notification"));'
            }
        ];
        
        this.show(
            'Que tal estudar um pouco hoje? Manter a consistência é fundamental para o aprendizado!',
            'reminder',
            {
                title: 'Hora de Estudar! 📚',
                actions: actions,
                duration: 0
            }
        );
        
        // Push notification se disponível
        if (this.settings.pushEnabled) {
            this.sendPushNotification(
                'StudyingFlash - Hora de Estudar!',
                'Que tal revisar algumas flashcards hoje?',
                {
                    tag: 'study-reminder',
                    onclick: () => {
                        if (window.app) {
                            window.app.showSection('estudiar');
                        }
                    }
                }
            );
        }
    },
    
    /**
     * Adia lembrete
     */
    snoozeReminder() {
        // Agendar novo lembrete em 2 horas
        setTimeout(() => {
            this.showStudyReminder();
        }, 2 * 60 * 60 * 1000);
        
        this.show('Lembrete adiado por 2 horas', 'info');
    },
    
    /**
     * Agenda lembretes recorrentes
     */
    scheduleRecurringReminders() {
        // Lembrete diário às 19h
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(19, 0, 0, 0);
        
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showStudyReminder();
            // Reagendar para o próximo dia
            this.scheduleRecurringReminders();
        }, timeUntilReminder);
    },
    
    /**
     * Mostra notificação de conquista
     */
    showAchievement(achievement) {
        if (!this.settings.achievementNotifications) return;
        
        const actions = [
            {
                text: 'Ver Conquistas',
                primary: true,
                onclick: 'app.showSection("ranking"); NotificationSystem.remove(this.closest(".notification"));'
            }
        ];
        
        this.show(
            achievement.description,
            'achievement',
            {
                title: achievement.title,
                actions: actions,
                duration: 6000
            }
        );
        
        // Push notification
        if (this.settings.pushEnabled) {
            this.sendPushNotification(
                `🏆 ${achievement.title}`,
                achievement.description,
                { tag: 'achievement' }
            );
        }
    },
    
    /**
     * Métodos de conveniência
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },
    
    error(message, options = {}) {
        return this.show(message, 'error', options);
    },
    
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },
    
    info(message, options = {}) {
        return this.show(message, 'info', options);
    },
    
    /**
     * Limpa todas as notificações
     */
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    },
    
    /**
     * Configura notificações
     */
    configure(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        if (newSettings.pushEnabled && !this.settings.pushEnabled) {
            this.requestNotificationPermission();
        }
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationSystem.init());
} else {
    NotificationSystem.init();
}

// Expor globalmente
window.NotificationSystem = NotificationSystem;

export default NotificationSystem;

