const { app, BrowserWindow, globalShortcut, session, Menu, Tray, Notification, nativeImage, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

const tempUserData = path.join(os.tmpdir(), 'falcon-edafs-cache');
app.setPath('userData', tempUserData);

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow = null;
let tray = null;
let isQuitting = false;

Menu.setApplicationMenu(null);

function createWindow() {
  const iconPath = path.join(__dirname, 'public', 'favicon.ico');
  const appIcon = nativeImage.createFromPath(iconPath);
  
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 1000,
    minHeight: 700,
    maxWidth: 1200,
    maxHeight: 800,
    maximizable: false, // Impede ecrã inteiro desnecessário
    icon: appIcon,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    callback(false);
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
  } else {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl);
  }

  mainWindow.on('close', function (event) {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({ title: 'FALCON EDAFS', body: 'O sistema continua a operar em segundo plano.', icon: appIcon }).show();
      }
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public', 'favicon.ico');
  const appIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(appIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Mostrar FALCON', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { type: 'separator' },
    { label: 'Encerrar', click: () => { isQuitting = true; if (mainWindow) mainWindow.destroy(); app.quit(); } }
  ]);
  
  tray.setToolTip('FALCON EDAFS');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });
}

// IPC para Mecanismo de Sobreposição (Overlay)
ipcMain.on('toggle-overlay', (event, isOverlay) => {
  if (!mainWindow) return;
  if (isOverlay) {
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(320, 160);
    mainWindow.setSize(340, 200, true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Fica por cima do Simulador
    mainWindow.setResizable(false);
  } else {
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(1000, 700);
    mainWindow.setSize(1100, 750, true);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMaximizable(false);
  }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.edafs.falcon');
    createWindow();
    createTray();
    globalShortcut.register('F12', () => { if (mainWindow) mainWindow.webContents.send('toggle-ptt-global'); });
  });
}

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') {} });