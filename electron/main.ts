import {app, BrowserWindow, nativeImage, Tray} from 'electron'
import path from 'node:path'

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
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
  })
  win?.setVisibleOnAllWorkspaces(true)
  // win.webContents.openDevTools()

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
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

let tray = null
app.whenReady().then(() => {
  const menuBarIcon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'lemon-box-logo.png'))
  tray = new Tray(menuBarIcon.resize({width: 20, height: 20}))
  tray.on('click', function (event, bounds) {
    win?.setBounds({x: bounds.x - 200, y: bounds.y > 520 ? bounds.y - 510 : bounds.y + 20, width: 400, height: 500})
    toggleWin()
  })
  tray.setToolTip('This is my application.')
})

function toggleWin() {
  if (win?.isVisible()) {
    win?.hide()
  } else {
    win?.show()
    // win?.focus()
    setTimeout(() => {
      win?.once('blur', () => {
        // if (!win?.webContents.isDevToolsOpened()) {
        win?.hide()
        // }
        console.log('blur!!!')
      })
    })
  }
}

if (app.dock) {
  app.dock.hide()
}
app.whenReady().then(createWindow)
