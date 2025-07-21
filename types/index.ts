export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
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
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  createdAt: Date;
  lastReviewed?: Date;
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  cards: Flashcard[];
  currentIndex: number;
  algorithm: 'sm2' | 'anki' | 'fsrs' | 'ultra_sm2';
}