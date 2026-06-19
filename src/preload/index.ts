import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom API exposed to the renderer for native file dialogs.
const api = {
  /** Opens a native save dialog and writes the JSON contents. Returns true if saved. */
  saveJson: (defaultName: string, contents: string): Promise<boolean> =>
    ipcRenderer.invoke('dialog:saveJson', defaultName, contents),
  /** Opens a native file dialog and returns the file contents (or null if cancelled). */
  openJson: (): Promise<string | null> => ipcRenderer.invoke('dialog:openJson')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
