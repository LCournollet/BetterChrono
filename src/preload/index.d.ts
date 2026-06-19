import { ElectronAPI } from '@electron-toolkit/preload'

export interface BetterChronoApi {
  saveJson: (defaultName: string, contents: string) => Promise<boolean>
  openJson: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    // Optionnel : absent dans un contexte navigateur pur (repli sans Electron).
    api?: BetterChronoApi
  }
}
