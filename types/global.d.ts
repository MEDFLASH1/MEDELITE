/**
 * Declaraciones de tipos globales para StudyingFlash
 * Elimina errores de TypeScript en app-functional.js
 */

// ===== INTERFACES PRINCIPALES =====
interface Deck {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  flashcards: Flashcard[];
  stats: {
    total: number;
    studied: number;
    mastered: number;
  };
}

interface Flashcard {
  id: string;
  deckId: string;
  front_content: {
    text: string;
    image_url?: string;
    audio_url?: string;
    video_url?: string;
  };
  back_content: {
    text: string;
    image_url?: string;
    audio_url?: string;
    video_url?: string;
  };
  createdAt: string;
  algorithm_data: {
    algorithm_type?: string;
    difficulty: number;
    interval: number;
    repetitions: number;
    ease_factor: number;
    next_review: string;
  };
}

interface StudySession {
  deckId: string;
  deckName: string;
  cards: Flashcard[];
  currentCardIndex: number;
  isFlipped: boolean;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
  };
}

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface ValidationErrors {
  deckSelect?: boolean;
  frontInput?: boolean;
  backInput?: boolean;
}

// ===== EXTENSIONES DE WINDOW =====
declare global {
  interface Window {
    // App principal
    app: StudyingFlashApp;
    StudyingFlashApp: typeof StudyingFlashApp;
    CONFIG: typeof CONFIG;
    Utils: typeof Utils;
    ApiService: typeof ApiService;
    
    // Funciones de navegación
    showSection: (sectionName: string) => void;
    startStudySession: (deckId: string) => void;
    editDeck: (deckId: string) => void;
    deleteDeck: (deckId: string) => void;
    createDeck: () => void;
    createFlashcard: () => void;
    flipCard: () => void;
    evaluateCard: (difficulty: string) => void;
    exitStudySession: () => void;
    startNewSession: () => void;
    openDeckActions: (deckId: string) => void;
    fixNavigation: () => void;
    
    // Funciones de autenticación
    loginWithFacebook: () => void;
    loginWithGoogle: () => void;
    showForgotPassword: () => void;
    showRegisterModal: () => void;
    handleLoginForm: (event: Event) => void;
    updateUIForLoggedUser: (email: string) => void;
    showUserMenu: () => void;
    togglePasswordVisibility: () => void;
    showLoginModal: () => void;
    hideLoginModal: () => void;
  }

  // ===== ELEMENTOS HTML EXTENDIDOS =====
  interface HTMLElement {
    value?: string;
    checked?: boolean;
    disabled?: boolean;
    type?: string;
    onclick?: (event: Event) => void;
  }
}

// ===== CLASES PRINCIPALES =====
declare class StudyingFlashApp {
  constructor();
  init(): void;
  loadDecks(): void;
  showSection(sectionName: string): void;
  startStudySession(deckId: string): void;
  editDeck(deckId: string): void;
  deleteDeck(deckId: string): void;
  createDeck(): void;
  createFlashcard(): void;
  flipCard(): void;
  evaluateCard(difficulty: string): void;
  exitStudySession(): void;
  startNewSession(): void;
  openDeckActions(deckId: string): void;
  fixNavigation(): void;
  getStudiedToday(): number;
  getCurrentStreak(): number;
  calculateRankingStats(): any;
}

declare const CONFIG: {
  API_BASE_URL: string;
  STORAGE_KEYS: {
    DECKS: string;
    CURRENT_SESSION: string;
    USER_PREFERENCES: string;
    STUDY_STATS: string;
  };
  SPACED_REPETITION: {
    INITIAL_INTERVAL: number;
    EASE_FACTOR: number;
    MIN_EASE_FACTOR: number;
    MAX_EASE_FACTOR: number;
  };
  UI: {
    ANIMATION_DURATION: number;
    NOTIFICATION_TIMEOUT: number;
  };
};

declare const Utils: {
  log(message: string): void;
  error(message: string): void;
  showNotification(message: string): void;
  formatDate(date: Date): string;
  debounce(func: Function, delay: number): Function;
  generateId(): string;
  validateDeck(deck: Partial<Deck>): ValidationErrors;
  validateFlashcard(card: Partial<Flashcard>): ValidationErrors;
  saveToStorage(key: string, data: any): void;
  loadFromStorage(key: string): any;
};

declare const ApiService: {
  get(endpoint: string): Promise<any>;
  post(endpoint: string, data: any): Promise<any>;
  put(endpoint: string, data: any): Promise<any>;
  delete(endpoint: string): Promise<any>;
  handleError(error: any): void;
  isOnline(): boolean;
  saveOffline(endpoint: string, options: ApiOptions): void;
  syncOfflineData(): Promise<void>;
};

// ===== MÓDULO DE AUTENTICACIÓN =====
declare const AuthModule: {
  login(event: Event): void;
  updateUIForLoggedUser(email: string): void;
  showUserMenu(): void;
  togglePasswordVisibility(): void;
  showLoginModal(): void;
  hideLoginModal(): void;
};

export {};
