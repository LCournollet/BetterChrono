import React, { useMemo, useState } from 'react'
import { useStore } from '../storage/StoreContext'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button, IconButton } from '../components/ui/Button'
import { CalendarWeekView } from '../components/CalendarWeekView'
import { StatCard } from '../components/StatCard'
import { addWeeks, formatWeekRange, startOfWeek, toDateKey } from '../utils/time'
import { computeWeekStats } from '../utils/stats'
import { formatHumanDuration } from '../utils/time'
import { IconPrev, IconNext, IconCalendar, IconClock, IconCheck } from '../components/Icons'

export function CalendarPage(): React.JSX.Element {
  const { sessions, deleteSession } = useStore()
  const [reference, setReference] = useState(() => new Date())

  const stats = useMemo(() => computeWeekStats(sessions, reference), [sessions, reference])

  const isCurrentWeek = toDateKey(startOfWeek(reference)) === toDateKey(startOfWeek(new Date()))

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Calendrier"
        subtitle="Vos séances réalisées, semaine par semaine."
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Séances"
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
          label="Terminées / interrompues"
          value={`${stats.completedCount} / ${stats.interruptedCount}`}
          icon={<IconCheck width={18} height={18} />}
          tone="amber"
        />
      </div>

      <CalendarWeekView
        referenceDate={reference}
        sessions={sessions}
        onDeleteSession={deleteSession}
      />
    </div>
  )
}
