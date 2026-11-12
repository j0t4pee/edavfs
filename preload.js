const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTogglePttGlobal: (callback) => ipcRenderer.on('toggle-ptt-global', callback),
  toggleOverlay: (isOverlay) => ipcRenderer.send('toggle-overlay', isOverlay)
});