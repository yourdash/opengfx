import { is } from '@electron-toolkit/utils'
import Electron, { BrowserWindow, screen } from 'electron'
import { join } from 'path'

/**
 * Custom BrowserWindow class that is used to spawn a window
 * on each display connected to the computer (based on settings).
 * When a method is called on this class, it will be called on all windows
 */
export default class WindowManager {
  window: BrowserWindow;

  options: Electron.BrowserViewConstructorOptions = {}

  constructor(options: Electron.BrowserViewConstructorOptions) {
    this.options = options

    const display = screen.getPrimaryDisplay()

    this.window = new BrowserWindow({
                                      ...options, x: display.bounds.x, y: display.bounds.y
                                      // width: display.workArea.width,
                                      // height: display.workArea.height
                                    })
  }

  loadMain() {
    // Fixes error https://github.com/electron/electron/issues/19847
    try {
      // example from https://github.com/alex8088/electron-vite-boilerplate/blob/master/electron.vite.config.ts
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        this.window.loadFile(join(__dirname, '../renderer/index.html'))
      }
    } catch (error) {
      console.error('Error while loading url', error)
      // @ts-ignore
      if (error?.code === 'ERR_ABORTED') {
        // ignore ERR_ABORTED error
      } else {
        this.loadMain()
      }
    }
  }

  loadURL(url: string) {
    this.window.loadURL(url)
  }

  loadFile(file: string) {
    this.window.loadFile(file)
  }

  reload() {
    this.window.reload()
  }

  setKiosk(kiosk: boolean) {
    this.window.setKiosk(kiosk)
  }

  toggleKiosk() {
    this.window.setKiosk(!this.window.isKiosk())
  }

  focus() {
    if (this.window.isMinimized()) this.window.restore()
    this.window.focus()
  }

	// @ts-ignore
  attachWebContentEvent(event: string, listener: (event: any, detailId: any) => void) {
    // @ts-ignore
    this.window.webContents.on(event, listener)
  }

  onBeforeSendHeaders(listener: () => void) {
    this.window.webContents.session.webRequest.onBeforeSendHeaders(listener)
  }

  onHeadersReceived(listener: () => void) {
    this.window.webContents.session.webRequest.onHeadersReceived(listener)
  }

  openDevTools() {
    this.window.webContents.openDevTools()
  }

  async clearCache() {
    await this.window.webContents.session.clearCache()
  }

  async clearStorageData() {
    await this.window.webContents.session.clearStorageData({
                                                             storages: [
                                                               // @ts-ignore
                                                               'appcache', 'cookies', 'localstorage', 'cachestorage'
                                                             ]
                                                           })
  }

  destroy() {
    this.window.destroy()
  }
}
