import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Screenshot functionality
  saveScreenshot: (dataUrl: string) => ipcRenderer.invoke('save-screenshot', dataUrl),
  
  // Fullscreen
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  
  // Platform info
  platform: process.platform
})

// Expose version info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})
