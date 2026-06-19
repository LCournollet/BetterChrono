import React from 'react'
import { Sidebar } from './Sidebar'

export interface AppShellProps {
  children: React.ReactNode
}

/** Coquille applicative : sidebar fixe à gauche, zone principale large à droite. */
export function AppShell({ children }: AppShellProps): React.JSX.Element {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
