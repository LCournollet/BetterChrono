import React from 'react'
import type { WorkoutSession } from '../types'
import { isSameDay, toDateKey, weekDays, weekdayLabel, formatTime, formatHumanDuration } from '../utils/time'
import { Badge } from './ui/Badge'
import { IconTrash } from './Icons'
import { cn } from '../utils/cn'

export interface CalendarWeekViewProps {
  referenceDate: Date
  sessions: WorkoutSession[]
  onDeleteSession?: (id: string) => void
}

export function CalendarWeekView({
  referenceDate,
  sessions,
  onDeleteSession
}: CalendarWeekViewProps): React.JSX.Element {
  const days = weekDays(referenceDate)
  const today = new Date()

  const sessionsForDay = (date: Date): WorkoutSession[] => {
    const key = toDateKey(date)
    return sessions
      .filter((s) => s.date === key)
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => {
        const daySessions = sessionsForDay(day)
        const isToday = isSameDay(day, today)
        const hasTraining = daySessions.length > 0
        return (
          <div
            key={toDateKey(day)}
            className={cn(
              'flex min-h-[180px] flex-col rounded-xl border bg-surface',
              isToday ? 'border-accent-300 ring-1 ring-accent-100' : 'border-line'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between rounded-t-xl border-b px-3 py-2',
                isToday ? 'border-accent-100 bg-accent-50/60' : 'border-line bg-canvas/40'
              )}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {weekdayLabel(day).slice(0, 3)}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    isToday ? 'text-accent-600' : 'text-ink'
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
              {hasTraining && (
                <span className="h-2 w-2 rounded-full bg-sage-500" title="Jour entraîné" />
              )}
            </div>

            <div className="flex-1 space-y-2 p-2">
              {daySessions.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-ink-faint">—</span>
                </div>
              ) : (
                daySessions.map((s) => (
                  <div
                    key={s.id}
                    className="group rounded-lg border border-line bg-canvas/50 p-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="truncate text-xs font-semibold text-ink" title={s.workoutName}>
                        {s.workoutName}
                      </p>
                      {onDeleteSession && (
                        <button
                          aria-label="Supprimer la séance"
                          onClick={() => onDeleteSession(s.id)}
                          className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-danger-500 group-hover:opacity-100"
                        >
                          <IconTrash width={13} height={13} />
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-faint tabular-nums">
                      {formatTime(s.startedAt)} · {formatHumanDuration(s.totalDurationSeconds)}
                    </p>
                    <div className="mt-1.5">
                      <Badge tone={s.completed ? 'completed' : 'interrupted'} dot>
                        {s.completed ? 'Terminé' : 'Interrompu'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
