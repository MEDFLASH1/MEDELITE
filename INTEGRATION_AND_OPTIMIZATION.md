# Integración Final y Optimización

## 1. Conectar Next.js con Microservicio Go

```typescript
// lib/study-engine.ts
import { ReviewRequest, ReviewResponse } from '@/types'

const STUDY_ENGINE_URL = process.env.NEXT_PUBLIC_STUDY_ENGINE_URL || 'https://study-engine-xxx.run.app'

export class StudyEngineClient {
  private token: string | null = null
  
  setAuthToken(token: string) {
    this.token = token
  }
  
  async processReview(request: ReviewRequest): Promise<ReviewResponse> {
    const response = await fetch(`${STUDY_ENGINE_URL}/api/v1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error('Failed to process review')
    }
    
    return response.json()
  }
  
  async getNextCards(deckId: string, limit = 20): Promise<Flashcard[]> {
    const response = await fetch(
      `${STUDY_ENGINE_URL}/api/v1/next-cards/${deckId}?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    )
    
    return response.json()
  }
}

export const studyEngine = new StudyEngineClient()
```

## 2. Componente de Estudio Optimizado

```typescript
// app/(main)/study/[deckId]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudySession from './components/StudySession'

export default async function StudyPage({ 
  params 
}: { 
  params: { deckId: string } 
}) {
  const supabase = createClient()
  
  // Verificar que el deck existe y el usuario tiene acceso
  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', params.deckId)
    .single()
    
  if (!deck) {
    notFound()
  }
  
  return <StudySession deck={deck} />
}
```

```typescript
// app/(main)/study/[deckId]/components/StudySession.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { studyEngine } from '@/lib/study-engine'
import { useAuth } from '@/components/providers/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import StudyCard from './StudyCard'
import SessionStats from './SessionStats'
import { Flashcard, Deck } from '@/types'

export default function StudySession({ deck }: { deck: Deck }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    studied: 0,
    correct: 0,
    incorrect: 0,
    startTime: Date.now()
  })
  const [loading, setLoading] = useState(true)
  
  // Cargar cartas para estudiar
  useEffect(() => {
    if (token) {
      studyEngine.setAuthToken(token)
      loadCards()
    }
  }, [token])
  
  const loadCards = async () => {
    try {
      const nextCards = await studyEngine.getNextCards(deck.id)
      setCards(nextCards)
      setLoading(false)
    } catch (error) {
      console.error('Error loading cards:', error)
      setLoading(false)
    }
  }
  
  const handleRating = useCallback(async (rating: number) => {
    const card = cards[currentIndex]
    
    try {
      // Enviar review al microservicio Go
      const response = await studyEngine.processReview({
        userId: user?.id,
        cardId: card.id,
        deckId: deck.id,
        rating,
        algorithm: user!.preferences?.algorithm || 'fsrs',
        elapsedDays: calculateElapsedDays(card.lastReview),
        currentState: {
          easeFactor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          stability: card.stability ?? 1,
          difficulty: card.difficulty ?? 5,
          lastReview: card.lastReview
        }
      })
      
      // Actualizar estadísticas
      setSessionStats(prev => ({
        ...prev,
        studied: prev.studied + 1,
        correct: rating >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: rating < 3 ? prev.incorrect + 1 : prev.incorrect
      }))
      
      // Actualizar carta con nueva información
      const updatedCards = [...cards]
      updatedCards[currentIndex] = {
        ...card,
        ...response.newState,
        nextReview: response.nextReview
      }
      setCards(updatedCards)
      
      // Avanzar a la siguiente carta
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // Sesión completada
        completeSession()
      }
    } catch (error) {
      console.error('Error processing review:', error)
    }
  }, [currentIndex, cards, user, deck.id])
  
  const completeSession = () => {
    // Guardar estadísticas de sesión
    const duration = Date.now() - sessionStats.startTime
    
    // Mostrar resumen y redirigir
    router.push(`/study/${deck.id}/complete?stats=${encodeURIComponent(
      JSON.stringify({ ...sessionStats, duration })
    )}`)
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  }
  
  if (cards.length === 0) {
    return <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">¡No hay cartas para revisar!</h2>
      <p className="text-gray-600 mb-8">Vuelve más tarde cuando haya cartas listas para repasar.</p>
      <button
        onClick={() => router.push('/dashboard')}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg"
      >
        Volver al Dashboard
      </button>
    </div>
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso: {currentIndex + 1} / {cards.length}</span>
          <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Estadísticas de sesión */}
      <SessionStats stats={sessionStats} />
      
      {/* Carta actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cards[currentIndex].id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <StudyCard
            card={cards[currentIndex]}
            onRate={handleRating}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function calculateElapsedDays(lastReview?: Date): number {
  if (!lastReview) return 0
  const now = new Date()
  const last = new Date(lastReview)
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}
```

## 3. Optimizaciones de Performance

### Cache con Redis

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    return await redis.get(key)
  },
  
  async set(key: string, value: any, ex?: number): Promise<void> {
    if (ex) {
      await redis.setex(key, ex, value)
    } else {
      await redis.set(key, value)
    }
  },
  
  async del(key: string): Promise<void> {
    await redis.del(key)
  },
  
  // Cache para rankings (TTL: 5 minutos)
  async getRanking(): Promise<LeaderboardEntry[] | null> {
    return await this.get('ranking:global')
  },
  
  async setRanking(entries: LeaderboardEntry[]): Promise<void> {
    await this.set('ranking:global', entries, 300)
  },
  
  // Cache para estadísticas de usuario (TTL: 1 minuto)
  async getUserStats(userId: string): Promise<UserStats | null> {
    return await this.get(`stats:${userId}`)
  },
  
  async setUserStats(userId: string, stats: UserStats): Promise<void> {
    await this.set(`stats:${userId}`, stats, 60)
  }
}
```

### Optimización de Imágenes

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

### Service Worker para Offline

```javascript
// public/sw.js
const CACHE_NAME = 'studyingflash-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline'))
    )
  }
})
```

## 4. Monitoreo y Analytics

```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}

// Eventos personalizados
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// Uso en componentes
trackEvent('study_session_complete', {
  deck_id: deck.id,
  cards_studied: sessionStats.studied,
  accuracy: (sessionStats.correct / sessionStats.studied) * 100,
  duration: duration
})
```

## 5. Testing E2E

```typescript
// cypress/e2e/study-flow.cy.ts
describe('Study Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password')
  })
  
  it('should complete a study session', () => {
    // Navegar a estudiar
    cy.visit('/dashboard')
    cy.contains('Estudiar').click()
    
    // Seleccionar deck
    cy.contains('JavaScript Basics').click()
    
    // Verificar que se carga la sesión
    cy.contains('Sesión de Estudio').should('be.visible')
    
    // Estudiar primera carta
    cy.contains('Mostrar Respuesta').click()
    cy.contains('Fácil').click()
    
    // Verificar progreso
    cy.contains('2 / 10').should('be.visible')
    
    // Completar sesión
    cy.studyAllCards()
    
    // Verificar resumen
    cy.contains('Sesión Completada').should('be.visible')
    cy.contains('Precisión: 100%').should('be.visible')
  })
})
```