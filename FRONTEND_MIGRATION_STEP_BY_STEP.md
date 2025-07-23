# 🚀 Guía de Migración Frontend - Paso a Paso

## 📋 Resumen de la Migración
- **De**: JavaScript Vanilla (1 archivo de 1,359 líneas)
- **A**: Next.js 15 + TypeScript + Tailwind CSS
- **Duración estimada**: 6-8 semanas
- **Enfoque**: Migración incremental sin romper funcionalidad

---

## 🔄 FASE 1: Preparación y TypeScript (Semana 1)

### Día 1-2: Configurar TypeScript sin cambiar nada

```bash
# 1. Instalar dependencias
npm install -D typescript @types/node

# 2. Crear tsconfig.json
npx tsc --init
```

**tsconfig.json** inicial:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false, // Empezar permisivo
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["**/*.js", "**/*.ts"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Día 3-4: Agregar tipos gradualmente a tu código actual

```javascript
// app-functional.js - Agregar al inicio
// @ts-check

/** @typedef {Object} Deck
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} isPublic
 * @property {number} cardCount
 * @property {string} createdAt
 */

/** @typedef {Object} Flashcard
 * @property {number} id
 * @property {number} deckId
 * @property {string} front
 * @property {string} back
 * @property {string} createdAt
 * @property {number} difficulty
 * @property {string} nextReview
 */
```

### Día 5-7: Crear archivo de tipos TypeScript

```typescript
// types/index.d.ts
export interface User {
  id: string
  email: string
  displayName: string
  createdAt: Date
}

export interface Deck {
  id: string
  name: string
  description: string
  isPublic: boolean
  cardCount: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  createdAt: Date
  lastReviewed?: Date
}

export interface StudySession {
  currentCard: Flashcard | null
  queue: Flashcard[]
  reviewedCards: number
  correctAnswers: number
  startTime: Date
}
```

---

## 🏗️ FASE 2: Modularizar Código Actual (Semana 2)

### Día 8-9: Separar en módulos

Crear estructura de carpetas:
```
src/
├── services/
│   ├── auth.js
│   ├── storage.js
│   ├── api.js
│   └── navigation.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
└── components/
    └── notifications.js
```

**Ejemplo de separación:**

```javascript
// src/services/storage.js
// @ts-check

const STORAGE_PREFIX = "studyingflash_";

export const StorageService = {
  /**
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  },

  /**
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
};
```

### Día 10-11: Convertir a ES Modules

```javascript
// src/services/deck.js
import { StorageService } from './storage.js';
import { generateId } from '../utils/helpers.js';

export class DeckService {
  static getAll() {
    return StorageService.get('decks') || [];
  }

  static create(deckData) {
    const decks = this.getAll();
    const newDeck = {
      id: generateId(),
      ...deckData,
      cardCount: 0,
      createdAt: new Date().toISOString()
    };
    
    decks.push(newDeck);
    StorageService.set('decks', decks);
    return newDeck;
  }

  static update(id, updates) {
    const decks = this.getAll();
    const index = decks.findIndex(d => d.id === id);
    
    if (index !== -1) {
      decks[index] = { ...decks[index], ...updates };
      StorageService.set('decks', decks);
      return decks[index];
    }
    
    return null;
  }
}
```

### Día 12-14: Actualizar HTML para usar módulos

```html
<!-- index.html -->
<script type="module">
  import { App } from './src/app.js';
  
  // Inicializar app cuando DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
  });
</script>
```

---

## 🎨 FASE 3: Crear Proyecto Next.js (Semana 3)

### Día 15-16: Inicializar Next.js

```bash
# Crear proyecto Next.js en carpeta separada
npx create-next-app@latest studyingflash-next \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd studyingflash-next
```

### Día 17-18: Estructura de carpetas Next.js

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── study/
│       │   └── page.tsx
│       ├── create/
│       │   └── page.tsx
│       └── manage/
│           └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── layout/
│       ├── Navigation.tsx
│       └── Footer.tsx
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   └── useLocalStorage.ts
└── types/
    └── index.ts
```

### Día 19-21: Migrar layout principal

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyingFlash - Flashcards con Repetición Espaciada',
  description: 'Optimiza tu aprendizaje con flashcards inteligentes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

```typescript
// src/app/(dashboard)/layout.tsx
import Navigation from '@/components/layout/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

---

## 🔧 FASE 4: Migrar Componentes (Semana 4)

### Día 22-23: Crear componentes base

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

### Día 24-25: Migrar navegación

```typescript
// src/components/layout/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Plus, Settings, Trophy } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/study', label: 'Estudiar', icon: BookOpen },
  { href: '/create', label: 'Crear', icon: Plus },
  { href: '/manage', label: 'Gestionar', icon: Settings },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-xl">StudyingFlash</span>
          </Link>

          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### Día 26-28: Migrar formulario de crear deck

```typescript
// src/app/(dashboard)/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { useDeckStore } from '@/stores/deck-store'

export default function CreatePage() {
  const router = useRouter()
  const createDeck = useDeckStore((state) => state.createDeck)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createDeck(formData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating deck:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Deck</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nombre del Deck
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Vocabulario Inglés"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Descripción
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el contenido del deck..."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="public" className="text-sm font-medium">
              Deck Público
            </label>
            <p className="text-sm text-gray-500">
              Otros usuarios podrán ver y estudiar este deck
            </p>
          </div>
          <Switch
            id="public"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Crear Deck
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
```

---

## 💾 FASE 5: Gestión de Estado (Semana 5)

### Día 29-30: Migrar de localStorage a Zustand

```bash
npm install zustand
```

```typescript
// src/stores/deck-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Deck } from '@/types'

interface DeckStore {
  decks: Deck[]
  isLoading: boolean
  
  // Actions
  setDecks: (decks: Deck[]) => void
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Deck>
  updateDeck: (id: string, updates: Partial<Deck>) => void
  deleteDeck: (id: string) => void
  getDeckById: (id: string) => Deck | undefined
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      decks: [],
      isLoading: false,

      setDecks: (decks) => set({ decks }),

      createDeck: async (deckData) => {
        const newDeck: Deck = {
          ...deckData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          cardCount: 0,
        }

        set((state) => ({
          decks: [...state.decks, newDeck],
        }))

        return newDeck
      },

      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === id
              ? { ...deck, ...updates, updatedAt: new Date() }
              : deck
          ),
        }))
      },

      deleteDeck: (id) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== id),
        }))
      },

      getDeckById: (id) => {
        return get().decks.find((deck) => deck.id === id)
      },
    }),
    {
      name: 'deck-storage',
    }
  )
)
```

### Día 31-32: Hook personalizado para localStorage

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para actualizar el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
```

### Día 33-35: Migrar dashboard

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import DashboardStats from './components/DashboardStats'
import RecentDecks from './components/RecentDecks'
import StudyProgress from './components/StudyProgress'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido de vuelta. Aquí está tu progreso de estudio.
        </p>
      </div>

      <Suspense fallback={<StatsLoader />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
          <StudyProgress />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
          <RecentDecks />
        </Suspense>
      </div>
    </div>
  )
}

function StatsLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
      ))}
    </div>
  )
}
```

---

## 🚀 FASE 6: Optimización y Deploy (Semana 6)

### Día 36-37: Optimizar bundle

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Análisis de bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### Día 38-39: Implementar PWA

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // ... configuración anterior
})
```

### Día 40-42: Testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-red-600')
  })
})
```

---

## 📱 FASE 7: Características Avanzadas (Opcional)

### Animaciones con Framer Motion

```bash
npm install framer-motion
```

```typescript
// src/components/StudyCard.tsx
import { motion } from 'framer-motion'

export default function StudyCard({ card, onFlip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      {/* Contenido de la carta */}
    </motion.div>
  )
}
```

### Dark Mode

```typescript
// src/providers/ThemeProvider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  )
}
```

---

## 🎯 Checklist de Migración

- [ ] TypeScript configurado
- [ ] Código modularizado
- [ ] Proyecto Next.js creado
- [ ] Navegación migrada
- [ ] Formularios migrados
- [ ] Estado migrado a Zustand
- [ ] Dashboard funcional
- [ ] PWA configurada
- [ ] Tests básicos
- [ ] Deploy en Vercel

---

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)