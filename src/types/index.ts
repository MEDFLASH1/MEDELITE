// ===== TIPOS BASE PARA MEDELITE (Adaptados al código actual) =====

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  studyReminders: boolean;
  algorithmPreference: AlgorithmType;
}

// Tipos ajustados al código actual
export interface Deck {
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

export interface Flashcard {
  id: string;
  deckId: string;
  front_content: {
    text: string;
    image_url: string | null;
    audio_url: string | null;
    video_url: string | null;
  };
  back_content: {
    text: string;
    image_url: string | null;
    audio_url: string | null;
    video_url: string | null;
  };
  createdAt: string;
  algorithm_data: {
    interval: number;
    repetitions: number;
    ease_factor: number;
    next_review: string;
    difficulty: number;
  };
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  cards: Flashcard[];
  currentCardIndex: number;
  algorithm: AlgorithmType;
  stats: SessionStats;
}

export interface SessionStats {
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
  averageResponseTime: number;
  difficultyDistribution: Record<string, number>;
}

export type AlgorithmType = 'sm2' | 'anki' | 'fsrs' | 'ultra_sm2';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

// ===== TIPOS PARA API Y SERVICIOS =====

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== TIPOS PARA COMPONENTES =====

export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// ===== TIPOS PARA FORMULARIOS =====

export interface CreateDeckForm {
  name: string;
  description: string;
  isPublic: boolean;
  tags?: string[];
}

export interface CreateFlashcardForm {
  deckId: string;
  front: string;
  back: string;
}

export interface StudySettings {
  maxNewCards: number;
  maxReviewCards: number;
  algorithm: AlgorithmType;
  showTimer: boolean;
  autoReveal: boolean;
}

// ===== TIPOS PARA ESTADÍSTICAS =====

export interface DeckStats {
  totalCards: number;
  newCards: number;
  reviewCards: number;
  learnedCards: number;
  averageEaseFactor: number;
  retentionRate: number;
  averageInterval: number;
}

export interface UserStats {
  totalDecks: number;
  totalFlashcards: number;
  studiedToday: number;
  dueToday: number;
  streakDays: number;
  totalStudyTime: number;
  averageRetention: number;
}

// ===== EVENTOS Y CALLBACKS =====

export interface StudyEvents {
  onCardReviewed: (card: Flashcard, rating: ReviewRating) => void;
  onSessionComplete: (session: StudySession) => void;
  onSessionPause: (session: StudySession) => void;
  onError: (error: Error) => void;
}

// ===== CONFIGURACIÓN =====

export interface AppConfig {
  apiBaseUrl: string;
  storagePrefix: string;
  debug: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// ===== UTILITARIOS =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ===== RE-EXPORTS =====
export * from './services';
export * from './components';