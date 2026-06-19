import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Page } from '../types'

interface NavState {
  page: Page
  /** Identifiant d'entraînement courant (édition, lancement de séance). */
  workoutId?: string
}

interface NavContextValue extends NavState {
  navigate: (page: Page, workoutId?: string) => void
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, setState] = useState<NavState>({ page: 'dashboard' })

  const navigate = useCallback((page: Page, workoutId?: string) => {
    setState({ page, workoutId })
  }, [])

  const value = useMemo<NavContextValue>(
    () => ({ ...state, navigate }),
    [state, navigate]
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavigation(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavigation doit être utilisé dans un <NavigationProvider>')
  return ctx
}
