// types/index.ts
export interface User {
  id: string;
  email: string;
  displayName?: string;
  stats?: UserStats;
  createdAt: Date;
  lastActive?: Date;
}

export interface UserStats {
  totalCards: number;
  totalDecks: number;
  studyStreak: number;
  totalReviews: number;
  averageAccuracy: number;
  rank?: number;
  points?: number;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  cardCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  // Algoritmo de repetición
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  // FSRS específico
  stability?: number;
  difficulty?: number;
  // Metadatos
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount?: number;
}

export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  algorithm: 'sm2' | 'anki' | 'fsrs' | 'ultra_sm2';
  startedAt: Date;
  completedAt?: Date;
  cards?: Flashcard[];
  currentIndex?: number;
  cardsStudied?: number;
  correctAnswers?: number;
  // Para real-time
  isActive?: boolean;
  currentCard?: Flashcard;
}

export interface ReviewResult {
  cardId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  responseTime: number;
  timestamp: Date;
}

// Para el ranking en tiempo real
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  points: number;
  rank: number;
  studyStreak: number;
  change: 'up' | 'down' | 'same';
  isOnline?: boolean;
}