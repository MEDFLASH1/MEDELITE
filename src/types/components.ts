// ===== TIPOS PARA COMPONENTES REACT =====

import type { ReactNode } from 'react';
import type { 
  Deck, 
  Flashcard, 
  StudySession, 
  NotificationConfig,
  UserStats,
  DeckStats,
  CreateDeckForm,
  CreateFlashcardForm,
  StudySettings,
  ReviewRating
} from './index.js';

// ===== PROPS DE COMPONENTES BASE =====

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// ===== NAVIGATION COMPONENTS =====

export interface NavigationProps extends BaseComponentProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  isMobile?: boolean;
}

export interface NavItemProps extends BaseComponentProps {
  href: string;
  label: string;
  isActive?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

// ===== DECK COMPONENTS =====

export interface DeckListProps extends BaseComponentProps {
  decks: Deck[];
  onDeckSelect?: (deck: Deck) => void;
  onDeckEdit?: (deck: Deck) => void;
  onDeckDelete?: (deckId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface DeckCardProps extends BaseComponentProps {
  deck: Deck;
  onSelect?: (deck: Deck) => void;
  onEdit?: (deck: Deck) => void;
  onDelete?: (deckId: string) => void;
  showActions?: boolean;
}

export interface DeckFormProps extends BaseComponentProps {
  initialData?: Partial<CreateDeckForm>;
  onSubmit: (data: CreateDeckForm) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export interface DeckStatsProps extends BaseComponentProps {
  stats: DeckStats;
  deckName: string;
  showDetailed?: boolean;
}

// ===== FLASHCARD COMPONENTS =====

export interface FlashcardListProps extends BaseComponentProps {
  flashcards: Flashcard[];
  onFlashcardEdit?: (flashcard: Flashcard) => void;
  onFlashcardDelete?: (flashcardId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface FlashcardProps extends BaseComponentProps {
  flashcard: Flashcard;
  isFlipped?: boolean;
  onFlip?: () => void;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (flashcardId: string) => void;
  showActions?: boolean;
}

export interface FlashcardFormProps extends BaseComponentProps {
  deckId: string;
  initialData?: Partial<CreateFlashcardForm>;
  onSubmit: (data: CreateFlashcardForm) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

// ===== STUDY COMPONENTS =====

export interface StudyCardProps extends BaseComponentProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: ReviewRating) => void;
  showTimer?: boolean;
  timeElapsed?: number;
}

export interface StudyProgressProps extends BaseComponentProps {
  session: StudySession;
  currentIndex: number;
  totalCards: number;
  reviewedCards: number;
  correctAnswers: number;
}

export interface StudyControlsProps extends BaseComponentProps {
  onRate: (rating: ReviewRating) => void;
  onPause: () => void;
  onStop: () => void;
  disabled?: boolean;
  showHint?: boolean;
}

export interface StudySettingsProps extends BaseComponentProps {
  settings: StudySettings;
  onSettingsChange: (settings: StudySettings) => void;
  onStart: (deckId: string, settings: StudySettings) => void;
  availableDecks: Deck[];
}

// ===== FORM COMPONENTS =====

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
value: string | number | boolean;
onChange: (value: string | number | boolean) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: Array<{ value: any; label: string }>;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  icon?: ReactNode;
}

// ===== UI COMPONENTS =====

export interface NotificationProps extends BaseComponentProps {
  config: NotificationConfig;
  onDismiss?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

// ===== LAYOUT COMPONENTS =====

export interface LayoutProps extends BaseComponentProps {
  navigation?: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export interface PageProps extends BaseComponentProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  loading?: boolean;
}

// ===== DASHBOARD COMPONENTS =====

export interface DashboardProps extends BaseComponentProps {
  userStats: UserStats;
  recentDecks: Deck[];
  upcomingReviews: Flashcard[];
  onDeckSelect: (deck: Deck) => void;
  onStartStudy: (deckId: string) => void;
}

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
}

// ===== HOOKS PROPS =====

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export interface UseStudySessionReturn {
  session: StudySession | null;
  currentCard: Flashcard | null;
  isActive: boolean;
  startSession: (deckId: string, settings?: StudySettings) => Promise<void>;
  endSession: () => Promise<void>;
  reviewCard: (rating: ReviewRating) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
}

export interface UseNotificationsReturn {
  notifications: NotificationConfig[];
  show: (config: NotificationConfig) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (index: number) => void;
  clear: () => void;
}
