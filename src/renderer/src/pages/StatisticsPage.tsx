import React, { useMemo, useState } from 'react'
import { useStore } from '../storage/StoreContext'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { computeWeekStats } from '../utils/stats'
import { addWeeks, formatWeekRange, startOfWeek, toDateKey, formatHumanDuration } from '../utils/time'
import {
  IconPrev,
  IconNext,
  IconCalendar,
  IconClock,
  IconCheck,
  IconFlame,
  IconChart
} from '../components/Icons'

export function StatisticsPage(): React.JSX.Element {
  const { sessions } = useStore()
  const [reference, setReference] = useState(() => new Date())

  const stats = useMemo(() => computeWeekStats(sessions, reference), [sessions, reference])
  const isCurrentWeek = toDateKey(startOfWeek(reference)) === toDateKey(startOfWeek(new Date()))
  const maxCount = stats.topWorkouts[0]?.count ?? 1

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Statistiques"
        subtitle="Analyse de votre activité hebdomadaire."
        actions={
          <div className="flex items-center gap-2">
            <IconButton label="Semaine précédente" variant="secondary" onClick={() => setReference((d) => addWeeks(d, -1))}>
              <IconPrev width={18} height={18} />
            </IconButton>
            <div className="min-w-[180px] text-center text-sm font-medium text-ink">
              {formatWeekRange(reference)}
            </div>
            <IconButton label="Semaine suivante" variant="secondary" onClick={() => setReference((d) => addWeeks(d, 1))}>
              <IconNext width={18} height={18} />
            </IconButton>
            {!isCurrentWeek && (
              <Button variant="ghost" size="sm" onClick={() => setReference(new Date())}>
                Aujourd'hui
              </Button>
            )}
          </div>
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
          label="Durée totale"
          value={formatHumanDuration(stats.totalSeconds)}
          icon={<IconClock width={18} height={18} />}
          tone="sage"
        />
        <StatCard
          label="Terminées"
          value={stats.completedCount}
          icon={<IconCheck width={18} height={18} />}
          tone="sage"
        />
        <StatCard
          label="Interrompues"
          value={stats.interruptedCount}
          icon={<IconFlame width={18} height={18} />}
          tone="amber"
        />
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-ink">Entraînements les plus fréquents</h2>
        {stats.topWorkouts.length === 0 ? (
          <EmptyState
            icon={<IconChart width={22} height={22} />}
            title="Pas encore de données"
            description="Réalisez des séances pour voir vos entraînements les plus fréquents."
          />
        ) : (
          <ul className="space-y-3">
            {stats.topWorkouts.map((w) => (
              <li key={w.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{w.name}</span>
                  <span className="text-ink-soft tabular-nums">
                    {w.count} {w.count > 1 ? 'séances' : 'séance'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-accent-500 transition-all"
                    style={{ width: `${(w.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
