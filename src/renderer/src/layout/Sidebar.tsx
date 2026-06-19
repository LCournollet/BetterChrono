import React from 'react'
import type { Page } from '../types'
import { useNavigation } from '../hooks/useNavigation'
import { cn } from '../utils/cn'
import {
  IconDashboard,
  IconDumbbell,
  IconPlay,
  IconCalendar,
  IconChart,
  IconSettings,
  IconClock
} from '../components/Icons'

interface NavItem {
  page: Page
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { page: 'dashboard', label: 'Tableau de bord', icon: <IconDashboard /> },
  { page: 'workouts', label: 'Entraînements', icon: <IconDumbbell /> },
  { page: 'session', label: 'Lancer une séance', icon: <IconPlay /> },
  { page: 'calendar', label: 'Calendrier', icon: <IconCalendar /> },
  { page: 'statistics', label: 'Statistiques', icon: <IconChart /> },
  { page: 'settings', label: 'Paramètres', icon: <IconSettings /> }
]

export function Sidebar(): React.JSX.Element {
  const { page, navigate } = useNavigation()

  // L'édition d'un entraînement reste rattachée à l'onglet « Entraînements ».
  const activePage: Page = page === 'workout-edit' ? 'workouts' : page

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <IconClock width={22} height={22} />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-ink">BetterChrono</p>
          <p className="text-xs text-ink-faint">Suivi d'entraînement</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.page
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:ring-2 focus-visible:ring-accent-500/40',
                active
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-ink-soft hover:bg-canvas hover:text-ink'
              )}
            >
              <span className={cn(active ? 'text-accent-600' : 'text-ink-faint')}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs text-ink-faint">
          Données enregistrées localement sur cet ordinateur.
        </p>
      </div>
    </aside>
  )
}
