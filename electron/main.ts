import {app, BrowserWindow, nativeImage, Tray} from 'electron'
import path from 'node:path'
import AppInfoDefine from '../common/define/app-info-define.ts'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'lemon-box-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: true,
    skipTaskbar: true,
    type: 'panel'
  })
  if (app.dock) {
    app.dock.hide()
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL('http://localhost:40531')
    // win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let tray = null
app.whenReady().then(() => {
  const menuBarIcon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'lemon-box-logo.png'))
  tray = new Tray(menuBarIcon.resize({width: 20, height: 20}))
  tray.on('click', function (_, bounds) {
    win?.setBounds({x: bounds.x - 200, y: bounds.y > 520 ? bounds.y - 510 : bounds.y + 20, width: 460, height: 500})
    toggleWin()
  })
  tray.setToolTip(AppInfoDefine.APP_NAME)
})

function toggleWin() {
  if (win?.isVisible()) {
    win?.hide()
  } else {
    win?.show()
    setTimeout(() => {
      win?.once('blur', () => {
        if (!win?.webContents.isDevToolsOpened()) {
          win?.hide()
        }
      })
    })
  }
}

app.whenReady().then(createWindow)
