# Guía de Migración a Next.js 15 + TypeScript

## Paso 2.1: Inicializar Next.js preservando tu código

```bash
# Crear nuevo proyecto Next.js
npx create-next-app@latest studyingflash-next --typescript --tailwind --app

# Estructura recomendada:
studyingflash-next/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          # Layout con navegación
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Server Component
│   │   │   └── components/
│   │   │       ├── StatsCard.tsx
│   │   │       └── RealtimeStats.tsx  # Client Component
│   │   ├── study/
│   │   │   ├── [deckId]/page.tsx
│   │   │   └── components/
│   │   │       └── StudyCard.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── ranking/
│   │       ├── page.tsx
│   │       └── components/
│   │           └── Leaderboard.tsx
│   ├── api/
│   │   ├── decks/route.ts
│   │   ├── cards/route.ts
│   │   └── study/route.ts
│   └── layout.tsx
├── components/
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── RealtimeProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Card.tsx
├── lib/
│   ├── firebase.ts
│   ├── supabase.ts
│   └── pusher.ts
└── types/
    └── index.ts
```

## Paso 2.2: Migrar navegación SPA a App Router

```typescript
// app/(main)/layout.tsx
import Navigation from '@/components/Navigation'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
```

```typescript
// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: 'chart' },
    { href: '/study', label: 'Estudiar', icon: 'book' },
    { href: '/create', label: 'Crear', icon: 'plus' },
    { href: '/ranking', label: 'Ranking', icon: 'trophy' }
  ]
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

## Paso 2.3: Migrar funciones principales

### Tu función `createDeck()` actual → Server Action

```typescript
// app/actions/deck-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createDeck(formData: FormData) {
  const supabase = createClient()
  
  const deck = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    isPublic: formData.get('isPublic') === 'true',
    userId: (await supabase.auth.getUser()).data.user?.id
  }
  
  const { error } = await supabase
    .from('decks')
    .insert(deck)
  
  if (!error) {
    revalidatePath('/dashboard')
    revalidatePath('/create')
  }
  
  return { error }
}
```

```typescript
// app/(main)/create/page.tsx
import { createDeck } from '@/app/actions/deck-actions'

export default function CreatePage() {
  return (
    <form action={createDeck} className="max-w-md mx-auto">
      <input
        name="name"
        type="text"
        placeholder="Nombre del deck"
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        name="description"
        placeholder="Descripción"
        className="w-full p-2 border rounded mt-2"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded mt-4"
      >
        Crear Deck
      </button>
    </form>
  )
}
```

## Paso 2.4: Configurar Tiempo Real

```typescript
// lib/pusher.ts
import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: 'us2',
  useTLS: true
})

// Client
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: 'us2'
  }
)
```

```typescript
// components/providers/RealtimeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import type { LeaderboardEntry } from '@/types'

interface RealtimeContextType {
  onlineUsers: number
  leaderboard: LeaderboardEntry[]
  subscribe: (channel: string, event: string, callback: Function) => void
}

const RealtimeContext = createContext<RealtimeContextType>({
  onlineUsers: 0,
  leaderboard: [],
  subscribe: () => {}
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Canal global para estadísticas
    const channel = pusherClient.subscribe('global-stats')
    
    channel.bind('users-online', (data: { count: number }) => {
      setOnlineUsers(data.count)
    })
    
    channel.bind('leaderboard-update', (data: { entries: LeaderboardEntry[] }) => {
      setLeaderboard(data.entries)
    })
    
    return () => {
      pusherClient.unsubscribe('global-stats')
    }
  }, [])

  const subscribe = (channel: string, event: string, callback: Function) => {
    const ch = pusherClient.subscribe(channel)
    ch.bind(event, callback)
    return () => ch.unbind(event, callback)
  }

  return (
    <RealtimeContext.Provider value={{ onlineUsers, leaderboard, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)
```