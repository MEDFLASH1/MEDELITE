// StudyingFlash - JavaScript Funcional Reconstruido
// Versión: 1.0 - Funcionalidad básica completa

class StudyingFlashApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.decks = JSON.parse(localStorage.getItem('studyingflash_decks') || '[]');
        this.flashcards = JSON.parse(localStorage.getItem('studyingflash_flashcards') || '[]');
        this.stats = JSON.parse(localStorage.getItem('studyingflash_stats') || '{}');
        
        this.init();
    }

    init() {
        console.log('🚀 StudyingFlash App iniciando...');
        this.setupEventListeners();
        this.showSection('dashboard');
        this.updateStats();
        console.log('✅ App inicializada correctamente');
    }

    setupEventListeners() {
        // Navegación principal
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Navegación Apple mobile
        document.querySelectorAll('.apple-nav-item[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
                this.closeMobileMenu();
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
            appleMenuBtn.addEventListener('click', () => this.toggleAppleMenu());
        }

        console.log('🔗 Event listeners configurados');
    }

    showSection(sectionName) {
        console.log(`📱 Navegando a sección: ${sectionName}`);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        }

        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelectorAll('.apple-nav-item').forEach(link => {
            link.classList.remove('active');
        });

        // Marcar enlace activo
        const activeLinks = document.querySelectorAll(`[data-section="${sectionName}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
        });

        this.currentSection = sectionName;

        // Cargar contenido específico de la sección
        this.loadSectionContent(sectionName);
    }

    loadSectionContent(sectionName) {
        switch(sectionName) {
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
        }
    }

    loadDashboard() {
        console.log('📊 Cargando dashboard...');
        this.updateStats();
        this.loadDashboardDecks();
    }

    loadStudySection() {
        console.log('📚 Cargando sección de estudio...');
        this.loadDecksForStudy();
    }

    loadCreateSection() {
        console.log('➕ Cargando sección de creación...');
        this.loadDecksForFlashcardCreation();
        this.updateDeckCountsInUI();
    }

    loadManageSection() {
        console.log('⚙️ Cargando sección de gestión...');
        this.loadDecksForManagement();
    }

    loadRankingSection() {
        console.log('🏆 Cargando ranking...');
        // Implementar ranking más tarde
    }

    createDeck() {
        const nameInput = document.getElementById('deck-name');
        const descriptionInput = document.getElementById('deck-description');
        const publicCheckbox = document.getElementById('deck-public');

        if (!nameInput || !nameInput.value.trim()) {
            this.showNotification('Por favor, ingresa un nombre para el deck', 'error');
            return;
        }

        const newDeck = {
            id: Date.now(),
            name: nameInput.value.trim(),
            description: descriptionInput ? descriptionInput.value.trim() : '',
            isPublic: publicCheckbox ? publicCheckbox.checked : false,
            createdAt: new Date().toISOString(),
            cardCount: 0
        };

        this.decks.push(newDeck);
        this.saveDecks();

        // Limpiar formulario
        nameInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (publicCheckbox) publicCheckbox.checked = false;

        this.showNotification(`Deck "${newDeck.name}" creado exitosamente!`, 'success');
        this.loadCreateSection();
        this.updateStats();
        this.updateDeckCountsInUI();

        console.log('✅ Deck creado:', newDeck);
    }

    createFlashcard() {
        const deckSelect = document.getElementById('flashcard-deck');
        const frontInput = document.querySelector('textarea#flashcard-front');
        const backInput = document.querySelector('textarea#flashcard-back');

        console.log('🔍 Elementos encontrados:', {
            deckSelect: deckSelect ? 'OK' : 'NO ENCONTRADO',
            frontInput: frontInput ? 'OK' : 'NO ENCONTRADO', 
            backInput: backInput ? 'OK' : 'NO ENCONTRADO'
        });

        if (!deckSelect || !deckSelect.value) {
            this.showNotification('Por favor, selecciona un deck', 'error');
            return;
        }

        if (!frontInput || !frontInput.value || !frontInput.value.trim()) {
            this.showNotification('Por favor, ingresa el frente de la flashcard', 'error');
            return;
        }

        if (!backInput || !backInput.value || !backInput.value.trim()) {
            this.showNotification('Por favor, ingresa el reverso de la flashcard', 'error');
            return;
        }

        const newFlashcard = {
            id: Date.now(),
            deckId: parseInt(deckSelect.value),
            front: frontInput.value.trim(),
            back: backInput.value.trim(),
            createdAt: new Date().toISOString(),
            difficulty: 0,
            nextReview: new Date().toISOString()
        };

        console.log('✅ Creando flashcard:', newFlashcard);

        this.flashcards.push(newFlashcard);
        this.saveFlashcards();

        // Actualizar contador de cartas en el deck
        const deck = this.decks.find(d => d.id === newFlashcard.deckId);
        if (deck) {
            deck.cardCount = this.flashcards.filter(f => f.deckId === deck.id).length;
            this.saveDecks();
        }

        // Limpiar formulario
        frontInput.value = '';
        backInput.value = '';

        this.showNotification('Flashcard creada exitosamente!', 'success');
        this.updateStats();
        this.updateDeckCountsInUI();

        console.log('✅ Flashcard creada:', newFlashcard);
    }

    updateDeckCountsInUI() {
        // Actualizar dropdown de selección de deck
        this.loadDecksForFlashcardCreation();
        
        // Actualizar dashboard si está visible
        if (this.currentSection === 'dashboard') {
            this.loadDashboardDecks();
        }
        
        // Actualizar sección de estudio si está visible
        if (this.currentSection === 'estudiar') {
            this.loadDecksForStudy();
        }
        
        // Actualizar sección de gestión si está visible
        if (this.currentSection === 'gestionar') {
            this.loadDecksForManagement();
        }
    }

    loadDecksForFlashcardCreation() {
        const deckSelect = document.getElementById('flashcard-deck');
        if (!deckSelect) return;

        deckSelect.innerHTML = '<option value="">Selecciona un deck...</option>';
        
        this.decks.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.id;
            option.textContent = `${deck.name} (${deck.cardCount} cartas)`;
            deckSelect.appendChild(option);
        });
    }

    loadDashboardDecks() {
        const decksContainer = document.getElementById('dashboard-decks');
        if (!decksContainer) return;

        if (this.decks.length === 0) {
            decksContainer.innerHTML = `
                <div class="empty-state">
                    <p>No tienes decks aún. ¡Crea tu primer deck!</p>
                    <button class="btn btn-primary" onclick="app.showSection('crear')">
                        ➕ Crear Primer Deck
                    </button>
                </div>
            `;
            return;
        }

        decksContainer.innerHTML = this.decks.map(deck => `
            <div class="deck-card">
                <div class="deck-header">
                    <h3 class="deck-title">${deck.name}</h3>
                    <span class="deck-count">${deck.cardCount} cartas</span>
                </div>
                <p class="deck-description">${deck.description || 'Sin descripción'}</p>
                <div class="deck-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.startStudySession(${deck.id})">
                        📚 Estudiar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="app.editDeck(${deck.id})">
                        ✏️ Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadDecksForStudy() {
        const deckSelection = document.getElementById('deck-selection');
        if (!deckSelection) return;

        if (this.decks.length === 0) {
            deckSelection.innerHTML = `
                <div class="empty-state">
                    <p>No tienes decks para estudiar. ¡Crea tu primer deck!</p>
                    <button class="btn btn-primary" onclick="app.showSection('crear')">
                        ➕ Crear Primer Deck
                    </button>
                </div>
            `;
            return;
        }

        deckSelection.innerHTML = this.decks.map(deck => `
            <div class="deck-card">
                <div class="deck-header">
                    <h3 class="deck-title">${deck.name}</h3>
                    <span class="deck-count">${deck.cardCount} cartas</span>
                </div>
                <p class="deck-description">${deck.description || 'Sin descripción'}</p>
                <button class="btn btn-primary" onclick="app.startStudySession(${deck.id})">
                    📚 Comenzar Estudio
                </button>
            </div>
        `).join('');
    }

    loadDecksForManagement() {
        const manageDecks = document.getElementById('manage-decks');
        if (!manageDecks) return;

        if (this.decks.length === 0) {
            manageDecks.innerHTML = `
                <div class="empty-state">
                    <p>No tienes decks para gestionar.</p>
                </div>
            `;
            return;
        }

        manageDecks.innerHTML = this.decks.map(deck => `
            <div class="deck-card">
                <div class="deck-header">
                    <h3 class="deck-title">${deck.name}</h3>
                    <span class="deck-count">${deck.cardCount} cartas</span>
                </div>
                <p class="deck-description">${deck.description || 'Sin descripción'}</p>
                <div class="deck-actions">
                    <button class="btn btn-secondary btn-sm" onclick="app.editDeck(${deck.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteDeck(${deck.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    startStudySession(deckId) {
        console.log(`📚 Iniciando sesión de estudio para deck ${deckId}`);
        this.showNotification('Función de estudio en desarrollo', 'info');
    }

    editDeck(deckId) {
        console.log(`✏️ Editando deck ${deckId}`);
        this.showNotification('Función de edición en desarrollo', 'info');
    }

    deleteDeck(deckId) {
        if (confirm('¿Estás seguro de que quieres eliminar este deck?')) {
            this.decks = this.decks.filter(deck => deck.id !== deckId);
            this.flashcards = this.flashcards.filter(card => card.deckId !== deckId);
            this.saveDecks();
            this.saveFlashcards();
            this.loadSectionContent(this.currentSection);
            this.updateStats();
            this.showNotification('Deck eliminado exitosamente', 'success');
        }
    }

    updateStats() {
        const totalCards = this.flashcards.length;
        const totalDecks = this.decks.length;

        // Actualizar estadísticas en dashboard
        const totalCardsEl = document.getElementById('total-cards');
        if (totalCardsEl) {
            totalCardsEl.textContent = totalCards;
        }

        // Actualizar otros elementos de estadísticas
        const elements = {
            'studied-today': 0,
            'accuracy': '0%',
            'streak': 0,
            'study-time': '0m',
            'total-progress': '0%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        console.log(`📊 Stats actualizadas: ${totalCards} cartas, ${totalDecks} decks`);
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    toggleAppleMenu() {
        const sidebar = document.getElementById('apple-sidebar');
        const overlay = document.getElementById('apple-sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const sidebar = document.getElementById('apple-sidebar');
        const overlay = document.getElementById('apple-sidebar-overlay');
        
        if (menu) menu.classList.remove('active');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);

        console.log(`🔔 Notificación (${type}): ${message}`);
    }

    saveDecks() {
        localStorage.setItem('studyingflash_decks', JSON.stringify(this.decks));
    }

    saveFlashcards() {
        localStorage.setItem('studyingflash_flashcards', JSON.stringify(this.flashcards));
    }

    saveStats() {
        localStorage.setItem('studyingflash_stats', JSON.stringify(this.stats));
    }
}

// I// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM cargado, inicializando StudyingFlash...');
    const app = new StudyingFlashApp();
    
    // Exponer app globalmente para debugging y event listeners
    window.app = app;
    
    console.log('✅ App inicializada y expuesta globalmente');
});

// Hacer la app accesible globalmente para debugging
window.StudyingFlashApp = StudyingFlashApp;

