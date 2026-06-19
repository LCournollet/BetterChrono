import React from 'react'
import { AppShell } from './layout/AppShell'
import { NavigationProvider, useNavigation } from './hooks/useNavigation'
import { DashboardPage } from './pages/DashboardPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { WorkoutEditPage } from './pages/WorkoutEditPage'
import { SessionPage } from './pages/SessionPage'
import { CalendarPage } from './pages/CalendarPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { SettingsPage } from './pages/SettingsPage'

function PageRouter(): React.JSX.Element {
  const { page } = useNavigation()
  switch (page) {
    case 'dashboard':
      return <DashboardPage />
    case 'workouts':
      return <WorkoutsPage />
    case 'workout-edit':
      return <WorkoutEditPage />
    case 'session':
      return <SessionPage />
    case 'calendar':
      return <CalendarPage />
    case 'statistics':
      return <StatisticsPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <DashboardPage />
  }
}

export default function App(): React.JSX.Element {
  return (
    <NavigationProvider>
      <AppShell>
        <PageRouter />
      </AppShell>
    </NavigationProvider>
  )
}
