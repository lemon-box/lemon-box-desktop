import {app, BrowserWindow} from 'electron'
import path from 'node:path'
import {Tray, Menu, nativeImage, screen} from 'electron'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true
  })
  win.webContents.openDevTools()

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.on('blur', () => {
    if (win?.webContents.isDevToolsOpened()) {
      win?.hide()
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL('http://localhost:40531')
    // win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.dock.hide()

let tray = null
app.whenReady().then(() => {
  const menuBarIcon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'lemon-box-logo.png'))
  tray = new Tray(menuBarIcon.resize({width: 20, height: 20}))
  console.log('创建了tray')
  tray.on('click', function (event, bounds) {
    console.log('tray click', bounds)
    // Find the display where the mouse cursor will be
    // const {x, y} = screen.getCursorScreenPoint();
    // const currentDisplay = screen.getDisplayNearestPoint({x, y})
// Set window position to that display coordinates
//     win?.setPosition(currentDisplay.workArea.x, currentDisplay.workArea.y)
    win?.setVisibleOnAllWorkspaces(true)
    win?.setBounds({x: bounds.x - 200, y: bounds.y})
    toggleWin()
  })
  tray.setToolTip('This is my application.')
})

function toggleWin() {
  if (win?.isVisible()) {
    win?.hide()
  } else {
    win?.show()
  }
}

app.whenReady().then(createWindow)
