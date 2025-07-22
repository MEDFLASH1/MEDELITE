// ===== TIPOS PARA SERVICIOS =====

import type { 
  Deck, 
  Flashcard, 
  StudySession, 
  StudySettings, 
  SessionStats, 
  NotificationConfig, 
  UserStats, 
  DeckStats, 
  ReviewRating 
} from './index.js';

export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface DeckService {
  getAll(): Promise<Deck[]>;
  getById(id: string): Promise<Deck | null>;
  create(deck: Omit<Deck, 'id' | 'createdAt' | 'stats'>): Promise<Deck>;
  update(id: string, updates: Partial<Deck>): Promise<Deck>;
  delete(id: string): Promise<boolean>;
  getDeckStats(id: string): Promise<DeckStats>;
}

export interface FlashcardService {
  getByDeck(deckId: string): Promise<Flashcard[]>;
  getById(id: string): Promise<Flashcard | null>;
  create(card: Omit<Flashcard, 'id' | 'createdAt' | 'algorithm_data'>): Promise<Flashcard>;
  update(id: string, updates: Partial<Flashcard>): Promise<Flashcard>;
  delete(id: string): Promise<boolean>;
  getNextReviewCards(deckId: string, limit?: number): Promise<Flashcard[]>;
  markAsReviewed(id: string, rating: ReviewRating): Promise<Flashcard>;
}

export interface StudyService {
  startSession(deckId: string, settings?: StudySettings): Promise<StudySession>;
  endSession(sessionId: string): Promise<StudySession>;
  reviewCard(sessionId: string, cardId: string, rating: ReviewRating): Promise<void>;
  getSessionStats(sessionId: string): Promise<SessionStats>;
  pauseSession(sessionId: string): Promise<void>;
  resumeSession(sessionId: string): Promise<void>;
}

export interface NotificationService {
  show(config: NotificationConfig): void;
  success(message: string, duration?: number): void;
  error(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
  clear(): void;
}

export interface StatisticsService {
  getUserStats(userId: string): Promise<UserStats>;
  getDeckStats(deckId: string): Promise<DeckStats>;
  updateStats(userId: string, updates: Partial<UserStats>): Promise<void>;
  getStudyHistory(userId: string, days?: number): Promise<StudySession[]>;
  calculateRetentionRate(deckId: string): Promise<number>;
}

export interface SyncService {
  syncToServer(): Promise<boolean>;
  syncFromServer(): Promise<boolean>;
  getLastSyncTime(): Date | null;
  needsSync(): boolean;
  enableAutoSync(enabled: boolean): void;
}