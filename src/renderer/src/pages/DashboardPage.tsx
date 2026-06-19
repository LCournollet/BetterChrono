import React, { useMemo } from 'react'
import { useStore } from '../storage/StoreContext'
import { useNavigation } from '../hooks/useNavigation'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import {
  IconPlay,
  IconDumbbell,
  IconClock,
  IconCheck,
  IconFlame,
  IconCalendar
} from '../components/Icons'
import { computeWeekStats } from '../utils/stats'
import { formatHumanDuration, formatDateLabel, formatTime } from '../utils/time'

export function DashboardPage(): React.JSX.Element {
  const { workouts, sessions } = useStore()
  const { navigate } = useNavigation()

  const stats = useMemo(() => computeWeekStats(sessions, new Date()), [sessions])

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 5),
    [sessions]
  )

  const topWorkout = stats.topWorkouts[0]

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Tableau de bord"
        subtitle={`Vue d'ensemble de votre semaine — ${formatDateLabel(new Date())}`}
        actions={
          <Button
            variant="primary"
            iconLeft={<IconPlay width={16} height={16} />}
            onClick={() => navigate('session')}
          >
            Lancer une séance
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Séances cette semaine"
          value={stats.sessionCount}
          icon={<IconCalendar width={18} height={18} />}
          tone="accent"
        />
        <StatCard
          label="Temps d'entraînement"
          value={formatHumanDuration(stats.totalSeconds)}
          icon={<IconClock width={18} height={18} />}
          tone="sage"
        />
        <StatCard
          label="Séances terminées"
          value={stats.completedCount}
          icon={<IconCheck width={18} height={18} />}
          tone="sage"
        />
        <StatCard
          label="Séances interrompues"
          value={stats.interruptedCount}
          icon={<IconFlame width={18} height={18} />}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Séances récentes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('calendar')}>
              Voir le calendrier
            </Button>
          </div>
          {recentSessions.length === 0 ? (
            <EmptyState
              icon={<IconCalendar width={22} height={22} />}
              title="Aucune séance enregistrée"
              description="Lancez votre premier entraînement pour commencer le suivi."
              action={
                <Button variant="primary" onClick={() => navigate('session')}>
                  Lancer une séance
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.workoutName}</p>
                    <p className="text-xs text-ink-faint tabular-nums">
                      {formatDateLabel(new Date(s.startedAt))} · {formatTime(s.startedAt)} ·{' '}
                      {formatHumanDuration(s.totalDurationSeconds)}
                    </p>
                  </div>
                  <Badge tone={s.completed ? 'completed' : 'interrupted'} dot>
                    {s.completed ? 'Terminé' : 'Interrompu'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-ink">Repères</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-canvas/60 px-3 py-2.5">
              <span className="text-sm text-ink-soft">Entraînements enregistrés</span>
              <span className="text-sm font-semibold text-ink tabular-nums">{workouts.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-canvas/60 px-3 py-2.5">
              <span className="text-sm text-ink-soft">Le plus fréquent</span>
              <span className="max-w-[55%] truncate text-sm font-semibold text-ink">
                {topWorkout ? `${topWorkout.name}` : '—'}
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            iconLeft={<IconDumbbell width={16} height={16} />}
            onClick={() => navigate('workouts')}
          >
            Gérer mes entraînements
          </Button>
        </Card>
      </div>
    </div>
  )
}
