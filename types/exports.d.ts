// Re-export global types for JSDoc imports
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

export interface StudySession {
  id: string;
  deckId: string;
  startedAt: Date;
  cards: Flashcard[];
  currentCardIndex: number;
  stats: {
    reviewed: number;
    correct: number;
    incorrect: number;
  };
}

export interface UserStats {
  totalDecks: number;
  totalFlashcards: number;
  studiedToday: number;
  streakDays: number;
}

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
}

export interface ValidationErrors {
  deckSelect?: boolean;
  frontInput?: boolean;
  backInput?: boolean;
}
