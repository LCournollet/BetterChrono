import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { writeFile, readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f4f6f9',
    title: 'BetterChrono',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer in dev, loaded file in production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Native "save file" dialog used by the JSON export feature.
ipcMain.handle(
  'dialog:saveJson',
  async (_event, defaultName: string, contents: string): Promise<boolean> => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exporter en JSON',
      defaultPath: defaultName,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return false
    await writeFile(filePath, contents, 'utf-8')
    return true
  }
)

// Native "open file" dialog used by the JSON import feature.
ipcMain.handle('dialog:openJson', async (): Promise<string | null> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Importer un fichier JSON',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (canceled || filePaths.length === 0) return null
  return readFile(filePaths[0], 'utf-8')
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.betterchrono.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
