# Dashboard en Tiempo Real - Implementación

## 1. Dashboard Server Component (Datos iniciales)

```typescript
// app/(main)/dashboard/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import StatsGrid from './components/StatsGrid'
import RealtimeStats from './components/RealtimeStats'
import ActivityChart from './components/ActivityChart'
import RecentDecks from './components/RecentDecks'

async function getDashboardData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Queries paralelas para performance
  const [stats, recentDecks, activityData] = await Promise.all([
    supabase.from('user_stats').select('*').eq('user_id', user?.id).single(),
    supabase.from('decks').select('*').eq('user_id', user?.id).limit(5),
    supabase.from('study_sessions')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ])
  
  return { stats: stats.data, recentDecks: recentDecks.data, activityData: activityData.data }
}

export default async function DashboardPage() {
  const { stats, recentDecks, activityData } = await getDashboardData()
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Estadísticas estáticas del servidor */}
      <StatsGrid initialStats={stats} />
      
      {/* Componente cliente para actualizaciones en tiempo real */}
      <RealtimeStats />
      
      {/* Gráficos de actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart data={activityData} />
        <RecentDecks decks={recentDecks} />
      </div>
    </div>
  )
}
```

## 2. Componente de Estadísticas en Tiempo Real

```typescript
// app/(main)/dashboard/components/RealtimeStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/components/providers/RealtimeProvider'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveStats {
  activeUsers: number
  studyingSessions: number
  cardsReviewed: number
  averageAccuracy: number
}

export default function RealtimeStats() {
  const { onlineUsers, subscribe } = useRealtime()
  const [liveStats, setLiveStats] = useState<LiveStats>({
    activeUsers: 0,
    studyingSessions: 0,
    cardsReviewed: 0,
    averageAccuracy: 0
  })

  useEffect(() => {
    // Suscribirse a estadísticas en vivo
    const unsubscribe = subscribe('dashboard-stats', 'update', (data: LiveStats) => {
      setLiveStats(data)
    })

    return unsubscribe
  }, [subscribe])

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Actividad en Tiempo Real</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Usuarios Activos"
          value={onlineUsers}
          icon="👥"
          pulse
        />
        <StatCard
          label="Sesiones Activas"
          value={liveStats.studyingSessions}
          icon="📚"
        />
        <StatCard
          label="Cartas Revisadas (Hoy)"
          value={liveStats.cardsReviewed}
          icon="🎯"
        />
        <StatCard
          label="Precisión Promedio"
          value={`${liveStats.averageAccuracy}%`}
          icon="📊"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, pulse }: any) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {pulse && (
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-2"
        >
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-80">{label}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

## 3. Sistema de Ranking en Tiempo Real

```typescript
// app/(main)/ranking/page.tsx
import { Suspense } from 'react'
import Leaderboard from './components/Leaderboard'
import UserRankCard from './components/UserRankCard'
import RankingFilters from './components/RankingFilters'

export default function RankingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Ranking Global</h1>
      
      {/* Tarjeta del ranking del usuario actual */}
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
        <UserRankCard />
      </Suspense>
      
      {/* Filtros de ranking */}
      <RankingFilters />
      
      {/* Tabla de líderes en tiempo real */}
      <Leaderboard />
    </div>
  )
}
```

```typescript
// app/(main)/ranking/components/Leaderboard.tsx
'use client'

import { useRealtime } from '@/components/providers/RealtimeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function Leaderboard() {
  const { leaderboard } = useRealtime()
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Top 100 Estudiantes</h2>
      </div>
      
      <div className="divide-y">
        <AnimatePresence>
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.userId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Medalla para top 3 */}
                  <div className="w-8 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  
                  {/* Avatar y nombre */}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={entry.avatar || '/default-avatar.png'}
                        alt={entry.displayName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {entry.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{entry.displayName}</div>
                      <div className="text-sm text-gray-500">
                        Racha: {entry.studyStreak} días
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Puntos y cambio */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">{entry.points.toLocaleString()} pts</div>
                    <div className="flex items-center text-sm">
                      {entry.change === 'up' && (
                        <span className="text-green-500">↑ Subiendo</span>
                      )}
                      {entry.change === 'down' && (
                        <span className="text-red-500">↓ Bajando</span>
                      )}
                      {entry.change === 'same' && (
                        <span className="text-gray-400">= Sin cambios</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
```
