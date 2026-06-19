/**
 * Couche d'accès au stockage local.
 * Encapsule localStorage pour isoler la persistance du reste de l'application.
 */

const PREFIX = 'betterchrono'

export const STORAGE_KEYS = {
  workouts: `${PREFIX}.workouts`,
  sessions: `${PREFIX}.sessions`,
  seeded: `${PREFIX}.seeded`
} as const

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.error(`[storage] lecture impossible pour ${key}`, err)
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] écriture impossible pour ${key}`, err)
  }
}

export function readFlag(key: string): boolean {
  return localStorage.getItem(key) === 'true'
}

export function writeFlag(key: string, value: boolean): void {
  localStorage.setItem(key, value ? 'true' : 'false')
}
