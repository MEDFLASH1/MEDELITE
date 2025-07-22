// @ts-check

// ===== DECLARACIONES GLOBALES =====
/** @type {StudyingFlashApp} */
let app;

// ===== IMPORTACIÓN DE TIPOS =====
/**
 * @typedef {import('./src/types/index.js').Deck} TypeDeck
 * @typedef {import('./src/types/index.js').Flashcard} TypeFlashcard
 * @typedef {import('./src/types/index.js').UserStats} UserStats
 * @typedef {import('./src/types/index.js').NotificationConfig} NotificationConfig
 * @typedef {import('./src/types/index.js').APIResponse} APIResponse
 * @typedef {import('./src/types/index.js').CreateDeckForm} CreateDeckForm
 * @typedef {import('./src/types/index.js').CreateFlashcardForm} CreateFlashcardForm
 * @typedef {import('./src/types/index.js').AlgorithmType} AlgorithmType
 * @typedef {import('./src/types/index.js').ReviewRating} ReviewRating
 */
// ===== CONFIGURACIÓN GLOBAL =====
/**
 * @typedef {object} AppConfig
 * @property {string} API_BASE_URL
 * @property {string} STORAGE_PREFIX
 * @property {boolean} DEBUG
 */
const CONFIG = {
    API_BASE_URL: "https://flashcard-u10n.onrender.com/api",
    STORAGE_PREFIX: "studyingflash_",
    DEBUG: true
};

// ===== UTILIDADES GLOBALES =====
const Utils = {
    /**
     * @param {string} message
     * @param {any} [data]
     */
    log: (message, data = null) => {
        if (CONFIG.DEBUG) {
            if (data) {
                console.log(`ℹ️ [StudyingFlash] ${message}`, data);
            } else {
                console.log(`ℹ️ [StudyingFlash] ${message}`);
            }
        }
    },
    
    /**
     * @param {string} message
     * @param {Error | null} [error]
     */
    error: (message, error = null) => {
        console.error(`❌ [StudyingFlash] ${message}`, error || "");
    },
    
    /**
     * @param {string} message
     * @param {'success' | 'error' | 'warning' | 'info'} [type]
     */
    showNotification: (message, type = "success") => {
        // Crear notificación visual
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        const colors = {
            success: "#10b981",
            error: "#ef4444", 
            warning: "#f59e0b",
            info: "#3b82f6"
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.success};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    },
    
    /**
     * @param {string | number | Date} date
     */
    formatDate: (date) => {
        return new Date(date).toLocaleDateString("es-ES");
    },

    /**
     * @param {Function} func
     * @param {number} delay
     */
    debounce: (func, delay) => {
        let timeout;
        return function(...args) {
            // @ts-ignore
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
};

// ===== API SERVICE =====
/**
 * @typedef {object} RequestOptions
 * @property {string} [method]
 * @property {Record<string, string>} [headers]
 * @property {string} [body]
 */

const ApiService = {
    /**
     * @param {string} endpoint
     * @param {RequestOptions} [options]
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        try {
            Utils.log(`API Request: ${options.method || "GET"} ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            Utils.log(`API Response:`, data);
            return data;
            
        } catch (error) {
            Utils.error(`API Error: ${endpoint}`, error instanceof Error ? error : new Error(String(error)));
            
            // Fallback a localStorage para desarrollo
            return this.fallbackToLocalStorage(endpoint, options);
        }
    },
    
    /**
     * @param {string} endpoint
     * @param {RequestOptions} options
     */
    fallbackToLocalStorage(endpoint, options) {
        Utils.log(`Using localStorage fallback for: ${endpoint}`);
        
        const method = options.method || "GET";
        const storageKey = `${CONFIG.STORAGE_PREFIX}${endpoint.replace(/\//g, "_")}`;
        
        switch (method) {
            case "GET":
                const stored = localStorage.getItem(storageKey);
                return stored ? JSON.parse(stored) : [];
                
            case "POST":
                if (!options.body) return null;
                const newData = JSON.parse(options.body);
                newData.id = Utils.generateId();
                newData.createdAt = new Date().toISOString();
                
                const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
                existing.push(newData);
                localStorage.setItem(storageKey, JSON.stringify(existing));
                
                return newData;
                
            case "PUT":
                if (!options.body) return null;
                // Actualizar elemento existente
                const updateData = JSON.parse(options.body);
                const allItems = JSON.parse(localStorage.getItem(storageKey) || "[]");
                const index = allItems.findIndex((item) => item.id === updateData.id);
                
                if (index !== -1) {
                    allItems[index] = { ...allItems[index], ...updateData };
                    localStorage.setItem(storageKey, JSON.stringify(allItems));
                    return allItems[index];
                }
                return null;
                
            case "DELETE":
                const deleteId = endpoint.split("/").pop();
                const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
                const filtered = items.filter((item) => item.id !== deleteId);
                localStorage.setItem(storageKey, JSON.stringify(filtered));
                return { success: true };
                
            default:
                return null;
        }
    },

    /**
     * @param {string} endpoint
     */
    async get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    },

    /**
     * @param {string} endpoint
     * @param {any} data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    /**
     * @param {string} endpoint
     * @param {any} data
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    /**
     * @param {string} endpoint
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }
};

// ===== TIPOS LOCALES (compatibilidad con código existente) =====
/**
 * @typedef {object} Stats
 * @property {number} totalDecks
 * @property {number} totalFlashcards
 * @property {number} studiedToday
 * @property {number} dueToday
 * @property {number} totalSessions
 * @property {number} totalCorrect
 * @property {number} totalAnswered
 * @property {string} lastStudyDate
 */


// ===== CLASE PRINCIPAL (MANTENIDA DE app-functional.js) =====
class StudyingFlashApp {
    constructor() {
        this.currentSection = 'dashboard';
        /** @type {TypeDeck[]} */
        this.decks = JSON.parse(localStorage.getItem('studyingflash_decks') || '[]');
        /** @type {TypeFlashcard[]} */
        this.flashcards = JSON.parse(localStorage.getItem('studyingflash_flashcards') || '[]');
        /** @type {Partial<Stats>} */
        this.stats = JSON.parse(localStorage.getItem('studyingflash_stats') || '{}');
        
        this.init();
    }

    init() {
        console.log('🚀 StudyingFlash App iniciando...');
        Utils.log('App inicializando con capacidades API');
        this.showSection('dashboard');
        this.updateStats();
        
        // Actualizar opciones de decks al inicializar
        this.updateDeckOptions();
        this.updateDecksList();
        
        // Navegación principal
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = /** @type {HTMLElement} */ (e.currentTarget).getAttribute('data-section');
                if (section) {
                    console.log('🔗 Navegación clickeada:', section);
                    this.showSection(section);
                }
            });
        });

        // Navegación Apple mobile
        document.querySelectorAll('.apple-nav-item[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = /** @type {HTMLElement} */ (e.currentTarget).getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    this.closeMobileMenu();
                }
            });
        });

        // Botón crear deck
        const createDeckBtn = document.getElementById('create-deck-btn');
        if (createDeckBtn) {
            createDeckBtn.addEventListener('click', () => this.createDeck());
        }

        // Botón crear flashcard
        const createFlashcardBtn = document.getElementById('create-flashcard-btn');
        if (createFlashcardBtn) {
            createFlashcardBtn.addEventListener('click', () => this.createFlashcard());
        }

        // Menú móvil
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const appleMenuBtn = document.getElementById('apple-menu-btn');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (appleMenuBtn) {
            appleMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Cerrar menú móvil al hacer clic fuera
        document.addEventListener('click', (e) => {
            const mobileMenu = document.querySelector('.mobile-menu');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (mobileMenu && menuBtn && mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(/** @type {Node} */ (e.target)) && !menuBtn.contains(/** @type {Node} */ (e.target))) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * @param {string} sectionName
     */
    showSection(sectionName) {
        console.log(`🎯 Mostrando sección: ${sectionName}`);
        Utils.log(`Navegando a sección: ${sectionName}`);
        
        // Ocultar todas las secciones removiendo la clase 'active'
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            console.log(`❌ Ocultando sección: ${section.id}`);
        });

        // Mostrar la sección solicitada añadiendo la clase 'active'
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`✅ Mostrando sección: ${sectionName}`);
            this.currentSection = sectionName;
            // Cargar contenido específico de la sección
            this.loadSectionContent(sectionName);
        } else {
            console.error(`❌ Sección ${sectionName} no encontrada`);
            Utils.error(`Sección ${sectionName} no encontrada`);
        }

        // Actualizar navegación activa
        document.querySelectorAll('[data-section]').forEach(link => {
            link.classList.remove('active');
        });
        // Marcar enlace activo
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            console.log(`🎯 Enlace activo actualizado: ${sectionName}`);
        }
    }

    /**
     * @param {string} sectionName
     */
    loadSectionContent(sectionName) {
        // Cargar contenido específico según la sección
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'estudiar':
                this.loadStudySection();
                break;
            case 'crear':
                this.loadCreateSection();
                break;
            case 'gestionar':
                this.loadManageSection();
                break;
            case 'ranking':
                this.loadRankingSection();
                break;
            case 'stats':
                this.loadStatsSection();
                break;
            case 'config':
                this.loadConfigSection();
                break;
            default:
                Utils.log(`Sección ${sectionName} no tiene carga específica`);
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    }

    loadDashboard() {
        Utils.log('Cargando dashboard');
        this.updateDecksList();
        this.updateStats();
        this.updateDashboardDecks();
        // Re-inicializar navegación para asegurar que funcione
        setTimeout(() => this.reinitializeNavigation(), 100);
    }

    loadCreateSection() {
        Utils.log('Cargando sección crear');
        this.updateDeckOptions();
    }

    loadStudySection() {
        Utils.log('Cargando sección estudiar');
        this.updateStudyDecks();
    }

    loadManageSection() {
        Utils.log('Cargando sección gestionar');
        this.updateDecksList();
    }

    loadRankingSection() {
        Utils.log('Cargando sección ranking');
        this.updateRankingSection();
    }

    loadStatsSection() {
        Utils.log('Cargando estadísticas');
        this.updateStatsSection();
    }

    loadConfigSection() {
        Utils.log('Cargando configuración');
        // Configuración específica si es necesaria
    }

    // ===== GESTIÓN DE DECKS (CON CAPACIDADES API) =====
    /**
     * Crea un nuevo deck y lo persiste en la API o en localStorage
     * @returns {Promise<void>}
     */
    async createDeck() {
        const nameInput = /** @type {HTMLInputElement} */ (document.getElementById('deck-name'));
        const descriptionInput = /** @type {HTMLInputElement} */ (document.getElementById('deck-description'));
        const publicCheckbox = /** @type {HTMLInputElement} */ (document.getElementById('deck-public'));
        
        if (!nameInput || !descriptionInput) {
            return;
        }

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const isPublic = publicCheckbox ? publicCheckbox.checked : false;

        if (!name) {
            Utils.showNotification('El nombre del deck es requerido', 'error');
            return;
        }

        const newDeck = {
            id: Utils.generateId(),
            name: name,
            description: description,
            isPublic: isPublic,
            createdAt: new Date().toISOString(),
            flashcards: [],
            stats: {
                total: 0,
                studied: 0,
                mastered: 0
            }
        };

        try {
            // PRIORIZAR LOCALSTORAGE - Guardar directamente en localStorage
            Utils.log('Guardando deck en localStorage (modo prioritario)');
            this.decks.push(newDeck);
            localStorage.setItem('studyingflash_decks', JSON.stringify(this.decks));
            
            Utils.showNotification('Deck creado exitosamente', 'success');
            Utils.log('Deck creado con éxito:', newDeck);
            
            // Intentar sincronizar con API en segundo plano (opcional)
            try {
                await ApiService.post('/decks', newDeck);
                Utils.log('Deck sincronizado con API');
            } catch (apiError) {
                Utils.log('API no disponible, deck guardado solo en localStorage');
            }
            
        } catch (error) {
            Utils.error('Error al crear deck:', error);
            Utils.showNotification('Error al crear deck', 'error');
            return;
        }

        // Limpiar formulario
        nameInput.value = '';
        descriptionInput.value = '';
        if (publicCheckbox) publicCheckbox.checked = false;

        // Actualizar UI
        this.updateDecksList();
        this.updateDeckOptions();
        this.updateDashboardDecks();
    }

    /**
     * Crea una nueva flashcard y la guarda usando la API o localStorage
     * @returns {Promise<void>}
     */
    async createFlashcard() {
        Utils.log('🔧 [StudyingFlash] Iniciando creación de flashcard');
        
        const deckSelect = /** @type {HTMLSelectElement} */ (document.getElementById('flashcard-deck'));
        const frontInput = /** @type {HTMLTextAreaElement} */ (document.querySelector('textarea#flashcard-front'));
        const backInput = /** @type {HTMLTextAreaElement} */ (document.querySelector('textarea#flashcard-back'));
        
        Utils.log('🔧 [StudyingFlash] Elementos encontrados:', {
            deckSelect: !!deckSelect,
            frontInput: !!frontInput,
            backInput: !!backInput
        });
        
        if (!deckSelect || !frontInput || !backInput) {
            Utils.error('Elementos de formulario no encontrados');
            Utils.showNotification('Error: Elementos del formulario no encontrados', 'error');
            return;
        }

        const deckId = deckSelect.value || '';
        const front_content = {
            text: frontInput.value.trim() || '',
            image_url: null,
            audio_url: null,
            video_url: null
        };
        const back_content = {
            text: backInput.value.trim() || '',
            image_url: null,
            audio_url: null,
            video_url: null
        };

        Utils.log('🔧 [StudyingFlash] Datos del formulario:', {
            deckId: deckId,
            frontText: front_content.text,
            backText: back_content.text
        });

        if (!deckId || !front_content.text || !back_content.text) {
            Utils.showNotification('Todos los campos son requeridos', 'error');
            Utils.log('🔧 [StudyingFlash] Validación fallida - campos requeridos');
            return;
        }

        const newFlashcard = {
            id: Utils.generateId(),
            deckId: deckId,
            front_content: front_content,
            back_content: back_content,
            createdAt: new Date().toISOString(),
            algorithm_data: {
                algorithm_type: 'sm2',
                ease_factor: 2.5,
                interval: 1,
                repetitions: 0,
                next_review: new Date().toISOString(),
                difficulty: 0
            }
        };

        try {
            // PRIORIZAR LOCALSTORAGE - Guardar directamente en localStorage
            Utils.log('🔧 [StudyingFlash] Guardando flashcard en localStorage (modo prioritario)');
            
            // Asegurar que this.flashcards existe
            if (!this.flashcards) {
                this.flashcards = [];
                Utils.log('🔧 [StudyingFlash] Inicializando array de flashcards');
            }
            
            this.flashcards.push(newFlashcard);
            localStorage.setItem('studyingflash_flashcards', JSON.stringify(this.flashcards));
            
            Utils.showNotification('Flashcard creado exitosamente', 'success');
            Utils.log('🔧 [StudyingFlash] Flashcard creado con éxito:', newFlashcard);
            
            // Intentar sincronizar con API en segundo plano (opcional)
            try {
                Utils.log('🔧 [StudyingFlash] Intentando sincronizar con API...');
                await ApiService.post('/flashcards', newFlashcard);
                Utils.log('🔧 [StudyingFlash] Flashcard sincronizado con API');
            } catch (apiError) {
                Utils.log('🔧 [StudyingFlash] API no disponible, flashcard guardado solo en localStorage');
            }
            
        } catch (error) {
            Utils.error('Error al crear flashcard:', error);
            Utils.showNotification('Error al crear flashcard', 'error');
            return;
        }

        // Limpiar formulario
        Utils.log('🔧 [StudyingFlash] Limpiando formulario');
        if (frontInput) frontInput.value = '';
        if (backInput) backInput.value = '';
        if (deckSelect) deckSelect.value = '';

        // Actualizar estadísticas del deck
        Utils.log('🔧 [StudyingFlash] Actualizando estadísticas del deck');
        this.updateDeckStats(deckId);
        
        Utils.log('🔧 [StudyingFlash] Creación de flashcard completada exitosamente');
    }

    /**
     * Actualiza la lista de decks mostrada en el panel de gestión
     */
    updateDecksList() {
        const decksList = document.getElementById('decks-list');
        if (!decksList) return;

        if (this.decks.length === 0) {
            decksList.innerHTML = '<p class="no-decks">No tienes decks creados aún. ¡Crea tu primer deck!</p>';
            return;
        }

        decksList.innerHTML = this.decks.map(deck => {
            const flashcardsCount = this.flashcards.filter(card => card.deckId === deck.id).length;
            return `
                <div class="deck-card" data-deck-id="${deck.id}">
                    <div class="deck-header">
                        <h3>${deck.name}</h3>
                        <div class="deck-actions">
                            <button onclick="app.editDeck('${deck.id}')" class="btn-edit">✏️</button>
                            <button onclick="app.deleteDeck('${deck.id}')" class="btn-delete">🗑️</button>
                        </div>
                    </div>
                    <p class="deck-description">${deck.description || 'Sin descripción'}</p>
                    <div class="deck-stats">
                        <span class="stat">📚 ${flashcardsCount} tarjetas</span>
                        <span class="stat">📅 ${Utils.formatDate(deck.createdAt)}</span>
                    </div>
                    <div class="deck-actions-bottom">
                        <button onclick="app.startStudySession('${deck.id}')" class="btn-study">Estudiar</button>
                        <button onclick="app.showSection('crear')" class="btn-add-card">+ Agregar tarjeta</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rellena el selector de decks disponible al crear una flashcard
     */
    updateDeckOptions() {
        const deckSelect = document.getElementById('flashcard-deck');
        if (!deckSelect) return;

        if (this.decks.length === 0) {
            deckSelect.innerHTML = '<option value="">Primero crea un deck</option>';
            deckSelect.disabled = true;
            return;
        }

        deckSelect.disabled = false;
        deckSelect.innerHTML = '<option value="">Selecciona un deck</option>' +
            this.decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('');
    }

    /**
     * Actualiza la vista de decks disponibles para estudiar
     */
    updateStudyDecks() {
        const studyDecks = document.getElementById('deck-selection');
        if (!studyDecks) return;

        if (this.decks.length === 0) {
            studyDecks.innerHTML = '<p class="no-decks">No tienes decks para estudiar. ¡Crea algunos primero!</p>';
            return;
        }

        studyDecks.innerHTML = this.decks.map(deck => {
            const deckFlashcards = this.flashcards.filter(card => card.deckId === deck.id);
            const readyToReview = deckFlashcards.filter(card => 
                new Date(card.algorithm_data.next_review) <= new Date()
            ).length;

            return `
                <div class="study-deck-card">
                    <h3>${deck.name}</h3>
                    <p>${deck.description || 'Sin descripción'}</p>
                    <div class="study-stats">
                        <span>📚 ${deckFlashcards.length} total</span>
                        <span>⏰ ${readyToReview} para revisar</span>
                    </div>
                    <button onclick="app.startStudySession('${deck.id}')" 
                            class="btn-study" 
                            ${deckFlashcards.length === 0 ? 'disabled' : ''}>
                        ${deckFlashcards.length === 0 ? 'Sin tarjetas' : 'Estudiar'}
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Actualiza la sección de decks en el dashboard con vista resumida
     */
    updateDashboardDecks() {
        const dashboardDecksList = document.getElementById('dashboard-decks-list');
        const emptyState = document.getElementById('dashboard-empty-state');
        
        if (!dashboardDecksList) {
            Utils.log('Elemento dashboard-decks-list no encontrado');
            return;
        }

        if (this.decks.length === 0) {
            dashboardDecksList.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        dashboardDecksList.classList.remove('hidden');

        // Mostrar máximo 6 decks más recientes en dashboard
        const recentDecks = this.decks.slice(0, 6);
        
        dashboardDecksList.innerHTML = recentDecks.map(deck => {
            const deckFlashcards = this.flashcards.filter(card => card.deckId === deck.id);
            const studiedCards = deckFlashcards.filter(card => 
                card.algorithm_data && card.algorithm_data.repetitions > 0
            ).length;
            
            const progress = deckFlashcards.length > 0 
                ? (studiedCards / deckFlashcards.length) * 100 
                : 0;
                
            const needsReview = deckFlashcards.filter(card => 
                card.algorithm_data && new Date(card.algorithm_data.next_review) <= new Date()
            ).length;

            return `
                <div class="dashboard-deck-card" onclick="app.openDeckActions('${deck.id}')">
                    <div class="deck-card-header">
                        <h4 class="deck-card-title">${deck.name}</h4>
                        <span class="deck-status ${needsReview > 0 ? 'has-reviews' : 'up-to-date'}">
                            ${needsReview > 0 ? '⏰' : '✅'}
                        </span>
                    </div>
                    
                    <div class="deck-card-stats">
                        <span>📚 ${deckFlashcards.length} tarjetas</span>
                        <span>📈 ${studiedCards} estudiadas</span>
                        ${needsReview > 0 ? `<span>⏰ ${needsReview} pendientes</span>` : ''}
                    </div>
                    
                    <div class="deck-card-progress">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    
                    <div class="deck-card-actions">
                        <button onclick="event.stopPropagation(); app.startStudySession('${deck.id}')" 
                                class="btn-primary-small"
                                ${deckFlashcards.length === 0 ? 'disabled' : ''}>
                            ${deckFlashcards.length === 0 ? 'Sin tarjetas' : 
                              needsReview > 0 ? 'Estudiar' : 'Repasar'}
                        </button>
                        <button onclick="event.stopPropagation(); app.showSection('crear')" 
                                class="btn-secondary-small">
                            + Tarjeta
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        Utils.log(`Dashboard actualizado con ${recentDecks.length} decks`);
    }

    /**
     * Abre opciones rápidas para un deck desde el dashboard
     */
    openDeckActions(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        const deckFlashcards = this.flashcards.filter(card => card.deckId === deckId);
        
        if (deckFlashcards.length === 0) {
            Utils.showNotification(`El deck "${deck.name}" no tiene tarjetas. ¡Agrega algunas!`, 'info');
            this.showSection('crear');
        } else {
            this.startStudySession(deckId);
        }
    }

    /**
     * Inicia una sesión de estudio para un deck específico
     * @param {string} deckId - Identificador del deck a estudiar
     */
    startStudySession(deckId) {
        Utils.log(`Iniciando sesión de estudio para deck: ${deckId}`);
        
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) {
            Utils.showNotification('Deck no encontrado', 'error');
            return;
        }

        const deckFlashcards = this.flashcards.filter(card => card.deckId === deckId);
        if (deckFlashcards.length === 0) {
            Utils.showNotification('Este deck no tiene tarjetas', 'error');
            return;
        }

        // Filtrar tarjetas que necesitan revisión
        const cardsToReview = deckFlashcards.filter(card => 
            new Date(card.algorithm_data.next_review) <= new Date()
        );

        if (cardsToReview.length === 0) {
            Utils.showNotification('No hay tarjetas para revisar en este momento', 'info');
            return;
        }

        // Inicializar sesión de estudio
        this.currentStudySession = {
            deckId: deckId,
            deckName: deck.name,
            cards: cardsToReview,
            currentCardIndex: 0,
            isFlipped: false,
            stats: {
                total: cardsToReview.length,
                correct: 0,
                incorrect: 0
            }
        };

        this.showStudyCard();
        
        // Mostrar interface de estudo dentro da sección estudiar
        const deckSelection = document.getElementById('deck-selection');
        const studyInterface = document.getElementById('study-interface');
        
        if (deckSelection) deckSelection.classList.add('hidden');
        if (studyInterface) studyInterface.classList.remove('hidden');
    }

    /**
     * Muestra la tarjeta actual de la sesión de estudio
     */
    showStudyCard() {
        if (!this.currentStudySession) return;

        const session = this.currentStudySession;
        const currentCard = session.cards[session.currentCardIndex];

        if (!currentCard) {
            this.endStudySession();
            return;
        }

        // Actualizar UI de la tarjeta
        const frontText = document.getElementById('card-front-text');
        const backText = document.getElementById('card-back-text');
        const deckName = document.getElementById('study-deck-name');
        const currentCardSpan = document.getElementById('current-card');
        const totalCardsSpan = document.getElementById('total-cards');
        const progressFill = document.getElementById('study-progress');
        const flashcard = document.getElementById('flashcard');

        if (frontText) frontText.textContent = currentCard.front_content.text;
        if (backText) backText.textContent = currentCard.back_content.text;
        if (deckName) deckName.textContent = session.deckName;
        if (currentCardSpan) currentCardSpan.textContent = String(session.currentCardIndex + 1);
        if (totalCardsSpan) totalCardsSpan.textContent = String(session.cards.length);
        
        // Actualizar barra de progreso
        if (progressFill) {
            const progress = ((session.currentCardIndex + 1) / session.cards.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        // Reset flip state
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }

        // Actualizar progreso
        const progressInfo = document.getElementById('study-progress');
        if (progressInfo) {
            progressInfo.innerHTML = `
                <span>Tarjeta ${session.currentCardIndex + 1} de ${session.total}</span>
                <span>Deck: ${session.deckName}</span>
            `;
        }
    }

    /**
     * Voltea la tarjeta actual mostrando la respuesta
     */
    flipCard() {
        if (!this.currentStudySession) return;
        
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.classList.add('flipped');
        }
        
        this.currentStudySession.isFlipped = true;
    }

    /**
     * Registra la evaluación del usuario sobre la tarjeta actual
     * @param {string|number} difficulty - Dificultad de 1 (otra vez) a 4 (fácil)
     */
    evaluateCard(difficulty) {
        // Convertir a número si es string
        const difficultyNum = typeof difficulty === 'string' ? parseInt(difficulty) : difficulty;
        if (!this.currentStudySession || !this.currentStudySession.isFlipped) return;

        const session = this.currentStudySession;
        const currentCard = session.cards[session.currentCardIndex];

        // Actualizar algoritmo de repetición espaciada
        this.updateSpacedRepetition(currentCard, difficultyNum);

        // Actualizar estadísticas de la sesión
        if (difficultyNum >= 3) {
            session.stats.correct++;
        } else {
            session.stats.incorrect++;
        }

        // Avanzar a la siguiente tarjeta
        session.currentCardIndex++;
        session.isFlipped = false;

        if (session.currentCardIndex >= session.cards.length) {
            this.endStudySession();
        } else {
            this.showStudyCard();
        }
    }

    updateSpacedRepetition(card, difficulty) {
        const algorithmData = card.algorithm_data;
        
        // Algoritmo SM-2 simplificado
        if (difficulty >= 3) {
            algorithmData.repetitions++;
            algorithmData.ease_factor = Math.max(1.3, 
                algorithmData.ease_factor + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02))
            );
            
            if (algorithmData.repetitions === 1) {
                algorithmData.interval = 1;
            } else if (algorithmData.repetitions === 2) {
                algorithmData.interval = 6;
            } else {
                algorithmData.interval = Math.round(algorithmData.interval * algorithmData.ease_factor);
            }
        } else {
            algorithmData.repetitions = 0;
            algorithmData.interval = 1;
        }

        // Calcular próxima revisión
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + algorithmData.interval);
        algorithmData.next_review = nextReview.toISOString();

        // Guardar cambios
        this.saveFlashcard(card);
    }

    /**
     * Guarda los cambios de una flashcard en la API o en localStorage
     * @param {Object} flashcard - Flashcard modificada a persistir
     * @returns {Promise<void>}
     */
    async saveFlashcard(flashcard) {
        try {
            // Intentar guardar en API
            await ApiService.put(`/flashcards/${flashcard.id}`, flashcard);
            Utils.log('Flashcard actualizado en API');
        } catch (error) {
            Utils.log('Usando fallback localStorage para actualizar flashcard');
        }

        // Actualizar localStorage
        const index = this.flashcards.findIndex(card => card.id === flashcard.id);
        if (index !== -1) {
            this.flashcards[index] = flashcard;
            localStorage.setItem('studyingflash_flashcards', JSON.stringify(this.flashcards));
        }
    }

    /**
     * Finaliza la sesión de estudio actual y muestra un resumen
     */
    endStudySession() {
        if (!this.currentStudySession) return;

        const session = this.currentStudySession;
        
        // Mostrar resumen de la sesión
        Utils.showNotification(
            `Sesión completada: ${session.stats.correct}/${session.stats.total} correctas`, 
            'success'
        );

        // Actualizar estadísticas globales
        this.updateGlobalStats(session.stats);

        // Limpiar sesión
        this.currentStudySession = null;

        // Volver a la selección de decks
        const deckSelection = document.getElementById('deck-selection');
        const studyInterface = document.getElementById('study-interface');
        
        if (studyInterface) studyInterface.classList.add('hidden');
        if (deckSelection) deckSelection.classList.remove('hidden');
    }

    // ===== ESTADÍSTICAS =====
    updateStats() {
        const totalDecks = this.decks.length;
        const totalFlashcards = this.flashcards.length;
        const studiedToday = this.getStudiedToday();

        // Actualizar elementos de estadísticas en el dashboard
        const statsElements = {
            'total-decks': totalDecks,
            'total-flashcards': totalFlashcards,
            'studied-today': studiedToday
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = String(value);
            }
        });
    }

    updateStatsSection() {
        // Implementar estadísticas detalladas
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const stats = this.calculateDetailedStats();
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Decks Totales</h3>
                    <div class="stat-number">${stats.totalDecks}</div>
                </div>
                <div class="stat-card">
                    <h3>Tarjetas Totales</h3>
                    <div class="stat-number">${stats.totalFlashcards}</div>
                </div>
                <div class="stat-card">
                    <h3>Estudiadas Hoy</h3>
                    <div class="stat-number">${stats.studiedToday}</div>
                </div>
                <div class="stat-card">
                    <h3>Racha Actual</h3>
                    <div class="stat-number">${stats.currentStreak} días</div>
                </div>
            </div>
        `;
    }

    updateRankingSection() {
        // Implementar ranking de usuarios/decks
        const rankingContainer = document.getElementById('ranking-container');
        if (!rankingContainer) return;

        const rankingStats = this.calculateRankingStats();
        
        rankingContainer.innerHTML = `
            <div class="ranking-grid">
                <div class="ranking-card">
                    <h3>🏆 Tu Posición</h3>
                    <div class="rank-number">#${rankingStats.userRank}</div>
                    <p>de ${rankingStats.totalUsers} usuarios</p>
                </div>
                <div class="ranking-card">
                    <h3>📚 Decks Completados</h3>
                    <div class="rank-number">${rankingStats.completedDecks}</div>
                    <p>decks dominados</p>
                </div>
                <div class="ranking-card">
                    <h3>🔥 Racha Máxima</h3>
                    <div class="rank-number">${rankingStats.maxStreak}</div>
                    <p>días consecutivos</p>
                </div>
                <div class="ranking-card">
                    <h3>⭐ Puntuación Total</h3>
                    <div class="rank-number">${rankingStats.totalScore}</div>
                    <p>puntos acumulados</p>
                </div>
            </div>
            <div class="leaderboard">
                <h3>🏅 Tabla de Líderes</h3>
                <div class="leaderboard-list">
                    ${rankingStats.topUsers.map((user, index) => `
                        <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}">
                            <span class="rank">#${index + 1}</span>
                            <span class="username">${user.username}</span>
                            <span class="score">${user.score} pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    calculateDetailedStats() {
        return {
            totalDecks: this.decks.length,
            totalFlashcards: this.flashcards.length,
            studiedToday: this.getStudiedToday(),
            currentStreak: this.getCurrentStreak()
        };
    }

    updateGlobalStats(sessionStats) {
        if (!this.stats.totalSessions) this.stats.totalSessions = 0;
        if (!this.stats.totalCorrect) this.stats.totalCorrect = 0;
        if (!this.stats.totalAnswered) this.stats.totalAnswered = 0;

        this.stats.totalSessions++;
        this.stats.totalCorrect += sessionStats.correct;
        this.stats.totalAnswered += sessionStats.total;
        this.stats.lastStudyDate = new Date().toISOString();

        localStorage.setItem('studyingflash_stats', JSON.stringify(this.stats));
    }

    updateDeckStats(deckId) {
        const deckFlashcards = this.flashcards.filter(card => card.deckId === deckId);
        const deck = this.decks.find(d => d.id === deckId);
        
        if (deck) {
            deck.stats = {
                total: deckFlashcards.length,
                studied: deckFlashcards.filter(card => card.algorithm_data.repetitions > 0).length,
                mastered: deckFlashcards.filter(card => card.algorithm_data.repetitions >= 3).length
            };
            
            localStorage.setItem('studyingflash_decks', JSON.stringify(this.decks));
        }
    }

    // ===== GESTIÓN DE DECKS =====
    editDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        const newName = prompt('Nuevo nombre del deck:', deck.name);
        if (newName && newName.trim()) {
            deck.name = newName.trim();
            localStorage.setItem('studyingflash_decks', JSON.stringify(this.decks));
            this.updateDecksList();
            Utils.showNotification('Deck actualizado', 'success');
        }
    }

    /**
     * Elimina un deck y sus tarjetas asociadas
     * @param {string} deckId - Identificador del deck a eliminar
     * @returns {Promise<void>}
     */
    async deleteDeck(deckId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este deck y todas sus tarjetas?')) {
            return;
        }

        try {
            // Intentar eliminar de API
            await ApiService.delete(`/decks/${deckId}`);
            Utils.log('Deck eliminado de API');
        } catch (error) {
            Utils.log('Usando fallback localStorage para eliminar deck');
        }

        // Eliminar de localStorage
        this.decks = this.decks.filter(deck => deck.id !== deckId);
        this.flashcards = this.flashcards.filter(card => card.deckId !== deckId);
        
        localStorage.setItem('studyingflash_decks', JSON.stringify(this.decks));
        localStorage.setItem('studyingflash_flashcards', JSON.stringify(this.flashcards));

        this.updateDecksList();
        this.updateDeckOptions();
        this.updateDashboardDecks();
        Utils.showNotification('Deck eliminado', 'success');
    }

    /**
     * Re-inicializa los event listeners de navegación
     */
    reinitializeNavigation() {
        console.log('🔄 Re-inicializando navegación...');
        
        // Remover listeners existentes y agregar nuevos
        document.querySelectorAll('[data-section]').forEach(link => {
            // Crear nueva función para evitar duplicados
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = e.currentTarget.getAttribute('data-section');
                console.log('🔗 Click navegación:', section);
                this.showSection(section);
            };
            
            // Remover listeners anteriores
            link.removeEventListener('click', clickHandler);
            // Agregar nuevo listener
            link.addEventListener('click', clickHandler);
        });
        
        // También para la navegación móvil Apple
        document.querySelectorAll('.apple-nav-item[data-section]').forEach(link => {
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = e.currentTarget.getAttribute('data-section');
                console.log('🔗 Click Apple nav:', section);
                this.showSection(section);
                this.closeMobileMenu();
            };
            
            link.removeEventListener('click', clickHandler);
            link.addEventListener('click', clickHandler);
        });
        
        console.log('✅ Navegación re-inicializada');
    }

    /**
     * Obtiene el número de tarjetas estudiadas hoy
     * @returns {number}
     */
    getStudiedToday() {
        const today = new Date().toDateString();
        const lastStudyDate = this.stats.lastStudyDate ? new Date(this.stats.lastStudyDate).toDateString() : null;
        return lastStudyDate === today ? (this.stats.totalAnswered || 0) : 0;
    }

    /**
     * Obtiene la racha actual de días de estudio
     * @returns {number}
     */
    getCurrentStreak() {
        // Implementación básica - podría ser más sofisticada
        const lastStudyDate = this.stats.lastStudyDate;
        if (!lastStudyDate) return 0;
        
        const today = new Date();
        const lastStudy = new Date(lastStudyDate);
        const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 1 ? 1 : 0; // Simplificado por ahora
    }

    /**
     * Calcula estadísticas de ranking
     * @returns {object}
     */
    calculateRankingStats() {
        const totalCards = this.flashcards.length;
        const studiedCards = this.flashcards.filter(card => 
            card.algorithm_data && card.algorithm_data.repetitions > 0
        ).length;
        
        return {
            totalCards,
            studiedCards,
            accuracy: this.stats.totalAnswered ? 
                Math.round((this.stats.totalCorrect / this.stats.totalAnswered) * 100) : 0
        };
    }

    // ===== MÉTODOS ALIAS PARA COMPATIBILIDAD =====
    
    /**
     * Alias para cargar decks
     */
    loadDecks() {
        this.updateDecksList();
    }

    /**
     * Alias para salir de sesión de estudio
     */
    exitStudySession() {
        this.endStudySession();
    }

    /**
     * Alias para iniciar nueva sesión
     */
    startNewSession() {
        this.loadStudySection();
    }

    /**
     * Alias para arreglar navegación
     */
    fixNavigation() {
        this.reinitializeNavigation();
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('DOM cargado, inicializando app');
    
    // Crear instancia global de la app
    app = new StudyingFlashApp();
    window.app = app;
    
    // Exponer funciones globales para onclick en HTML
    window.showSection = (sectionName) => app.showSection(sectionName);
    window.startStudySession = (deckId) => app.startStudySession(deckId);
    window.editDeck = (deckId) => app.editDeck(deckId);
    window.deleteDeck = (deckId) => app.deleteDeck(deckId);
    window.createDeck = () => app.createDeck();
    window.createFlashcard = () => app.createFlashcard();
    window.flipCard = () => app.flipCard();
    window.evaluateCard = (difficulty) => app.evaluateCard(difficulty);
    window.exitStudySession = () => app.endStudySession();
    window.startNewSession = () => app.loadStudySection();
    window.openDeckActions = (deckId) => app.openDeckActions(deckId);
    window.fixNavigation = () => app.reinitializeNavigation();
    console.log('✅ App inicializada y expuesta globalmente');
});

// Hacer la app accesible globalmente para debugging
window.StudyingFlashApp = StudyingFlashApp;
window.CONFIG = CONFIG;
window.Utils = Utils;
window.ApiService = ApiService;

// ===== MÓDULO DE AUTENTICACIÓN =====
const AuthModule = {
    loginWithFacebook() {
        Utils.showNotification('Login com Facebook em desenvolvimento', 'info');
    },

    loginWithGoogle() {
        Utils.log('Tentativa de login com Google');
        Utils.showNotification('Login com Google em desenvolvimento', 'info');
    },

    showForgotPassword() {
        Utils.log('Mostrando modal de esqueci a senha');
    },

    showRegisterModal() {
        Utils.log('Mostrando modal de registro');
        Utils.showNotification('Modal de registro em desenvolvimento', 'info');
    },

    handleLoginForm(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        Utils.log('Tentativa de login', { email });

        if (email && password) {
            Utils.showNotification('Login realizado com sucesso!', 'success');
            AuthModule.hideLoginModal();
            AuthModule.updateUIForLoggedUser(email);
        } else {
            Utils.showNotification('Por favor, preencha todos os campos', 'error');
        }
    },

    updateUIForLoggedUser(email) {
        const loginButtons = document.querySelectorAll('#apple-login-btn, .btn[onclick*="showLoginModal"]');
        loginButtons.forEach(btn => {
            btn.textContent = `👤 ${email.split('@')[0]}`;
            /** @type {HTMLButtonElement} */ (btn).onclick = () => AuthModule.showUserMenu();
        });

        localStorage.setItem('studyingflash_user', JSON.stringify({ email, loggedIn: true }));
    },

    showUserMenu() {
        Utils.showNotification('Menu do usuário em desenvolvimento', 'info');
    },

    checkUserLogin() {
        const user = JSON.parse(localStorage.getItem('studyingflash_user') || '{}');
        if (user.loggedIn) {
            AuthModule.updateUIForLoggedUser(user.email);
        }
    },

    togglePasswordVisibility() {
        const passwordField = document.getElementById('login-password');
        const toggleIcon = document.querySelector('.input-icon');

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    },

    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        loginModal.style.display = 'flex';

        const emailField = document.getElementById('login-email');
        const passwordField = document.getElementById('login-password');

        if (emailField) {
            emailField.focus();
        } else if (passwordField) {
            passwordField.focus();
        }
    },

    hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    },

    init() {
        document.addEventListener('DOMContentLoaded', () => AuthModule.checkUserLogin());
    }
};

AuthModule.init();

// Exponer funciones de AuthModule globalmente para compatibilidad con HTML
window.loginWithFacebook = () => AuthModule.loginWithFacebook();
window.loginWithGoogle = () => AuthModule.loginWithGoogle();
window.showForgotPassword = () => AuthModule.showForgotPassword();
window.showRegisterModal = () => AuthModule.showRegisterModal();
window.handleLoginForm = event => AuthModule.handleLoginForm(event);
window.updateUIForLoggedUser = email => AuthModule.updateUIForLoggedUser(email);
window.showUserMenu = () => AuthModule.showUserMenu();
window.togglePasswordVisibility = () => AuthModule.togglePasswordVisibility();
window.showLoginModal = () => AuthModule.showLoginModal();
window.hideLoginModal = () => AuthModule.hideLoginModal();



/**
 * Valida la información del usuario antes del registro
 * @param {Object} userData - Datos del usuario a validar
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Correo electrónico del usuario
 * @param {string} [userData.password] - Contraseña a validar (opcional)
 * @returns {{valid: boolean, error?: string}} Resultado de la validación
 */
function validateUser(userData) {
    if (!userData || typeof userData !== 'object') {
        return { valid: false, error: 'Datos de usuario faltantes' };
    }

    const { username, email, password } = userData;

    if (!username || !email) {
        return { valid: false, error: 'Nombre de usuario y email son requeridos' };
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || /[^\w]/.test(cleanUsername)) {
        return { valid: false, error: 'Nombre de usuario inválido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Email inválido' };
    }

    const bannedDomains = ['tempmail.com', 'dispostable.com'];
    const domain = email.toLowerCase().split('@').pop();
    if (bannedDomains.includes(domain)) {
        return { valid: false, error: 'Dominio de email no permitido' };
    }

    if (password !== undefined && password.trim().length < 6) {
        return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    return { valid: true };
}


