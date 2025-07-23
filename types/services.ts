import type { Deck, Flashcard } from './index';

export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface DeckService {
  getAll(): Promise<Deck[]>;
  getById(id: string): Promise<Deck | null>;
  create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck>;
  update(id: string, updates: Partial<Deck>): Promise<Deck>;
  delete(id: string): Promise<boolean>;
}

export interface FlashcardService {
  getByDeck(deckId: string): Promise<Flashcard[]>;
  getById(id: string): Promise<Flashcard | null>;
  create(card: Omit<Flashcard, 'id' | 'createdAt'>): Promise<Flashcard>;
  update(id: string, updates: Partial<Flashcard>): Promise<Flashcard>;
  delete(id: string): Promise<boolean>;
  getNextReviewCards(deckId: string, limit?: number): Promise<Flashcard[]>;
}