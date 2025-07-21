import type { Deck, Flashcard } from './index';

/**
 * Props for the Navigation component.
 * Currently stateless; exposed to allow future extension (e.g. custom nav items).
 */
export interface NavigationProps {
  /** Additional Tailwind classes to merge with default styling */
  className?: string;
}

/**
 * Props for the DeckForm component (used in create & edit flows).
 */
export interface DeckFormProps {
  /** Pre-filled deck when editing; undefined for creation */
  initialDeck?: Partial<Deck>;
  /** Callback fired when the form is submitted successfully */
  onSubmit: (values: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cardCount' | 'userId' | 'tags'>) => void | Promise<void>;
  /** Disable the form while saving */
  loading?: boolean;
}

/**
 * Props for the FlashcardForm component.
 */
export interface FlashcardFormProps {
  /** Deck identifier where the card belongs */
  deckId: string;
  /** Card to edit (optional) */
  initialCard?: Partial<Flashcard>;
  /** Fired after save */
  onSubmit: (values: Omit<Flashcard, 'id' | 'deckId' | 'createdAt' | 'lastReviewed'>) => void | Promise<void>;
  loading?: boolean;
}

/**
 * Props for each StudyCard (displaying one flashcard inside a study session).
 */
export interface StudyCardProps {
  card: Flashcard;
  /** Whether the back side is currently visible */
  flipped: boolean;
  onFlip: () => void;
  onRate: (difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
}