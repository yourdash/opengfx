import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
	BrowserWindow,
	app,
	globalShortcut,
	ipcMain,
	protocol,
	screen
} from 'electron'
import { platform } from 'os'
import { join } from 'path'
import WindowManager from './WindowManager.js'

let restarting = false

// fixes https://github.com/electron/electron/issues/19775
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

function UpsertKeyValue(obj: any, keyToChange: any, value: any) {
	const keyToChangeLower = keyToChange.toLowerCase()
	for (const key of Object.keys(obj)) {
		if (key.toLowerCase() === keyToChangeLower) {
			// Reassign old key
			// @ts-ignore
			obj[key] = value
			// Done
			return
		}
	}
	// Insert at end instead
	// @ts-ignore
	obj[keyToChange] = value
}

let window: WindowManager

function setupWindow() {
	// Create the browser window.
	window = new WindowManager({
		width: 768,
		height: 512,
		fullscreen: !is.dev,
		frame: is.dev,
		autoHideMenuBar: true,
		kiosk: !is.dev,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'), // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#preload-files
			sandbox: false,
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
			// for more info
			// @ts-ignore
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true
		}
	})

	// FIX: https://github.com/innovation-system/electron-kiosk/issues/3
	window.attachWebContentEvent('render-process-gone', (event, detailed) => {
		console.log(
			`!crashed, reason: ${detailed.reason}, exitCode = ${detailed.exitCode}`
		)
		if (detailed.reason === 'crashed') {
			// relaunch app
			app.relaunch({
				args: process.argv.slice(1).concat(['--relaunch'])
			})
			app.exit(0)
		}
	})

	// FIX CORS ERROR: https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
	window.onBeforeSendHeaders((details, callback) => {
		const { requestHeaders } = details
		UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])
		callback({ requestHeaders })
	})

	window.onHeadersReceived((details, callback) => {
		const { responseHeaders } = details
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
		UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
		callback({
			responseHeaders
		})
	})

	window.loadMain()
}

/** Global application shortcuts */
function registerShortcuts() {
	globalShortcut.register('CommandOrControl+Shift+I', () => {
		window.openDevTools()
	})

	globalShortcut.register('CommandOrControl+Shift+K', async () => {
		window.loadMain()
	})

	globalShortcut.register('CommandOrControl+Shift+L', () => {
		window.toggleKiosk()
	})

	globalShortcut.register('CommandOrControl+Shift+R', () => {
		window.reload()
	})

	globalShortcut.register('CommandOrControl+Shift+Q', () => {
		app.quit()
	})

	// globalShortcut.register('CommandOrControl+Shift+H', () => {
	// 	win.hide()
	// })

	// globalShortcut.register('CommandOrControl+Shift+S', () => {
	// 	win.show()
	// })

	// globalShortcut.register('CommandOrControl+Shift+M', () => {
	// 	win.minimize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+U', () => {
	// 	win.maximize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+D', () => {
	// 	win.unmaximize()
	// })

	// globalShortcut.register('CommandOrControl+Shift+F', () => {
	// 	win.setFullScreen(!win.isFullScreen())
	// })
}

/** Register to IPC releated events */
function registerIpc() {
	ipcMain.on('action', async (event, action, ...args) => {
		let data = null
		try {
			switch (action) {
				case 'clearCache':
					await window.clearCache()
					break
				case 'clearStorage':
					await window.clearStorageData()
					break
				case 'getDisplays':
					data = screen.getAllDisplays().map(display => {
						return {
							id: display.id,
							label: display.label
						}
					})
					break
				default:
					break
			}
		} catch (error) {
			console.error(error)
		}
		event.reply('action', action, data)
	})
}

/** APP SETUP */

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
])

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
	app.quit()
} else {
	// When another instance is started, focus the already running instance
	app.on('second-instance', () => {
		// Someone tried to run a second instance, we should focus our window.
		if (window) {
			window.focus()
		}
	})

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin' && !restarting) {
			app.quit()
		}
	})

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) setupWindow()
	})

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', async () => {
		// Set app user model id for windows
		electronApp.setAppUserModelId('uk.ewsgit.yourdash.opengfx-console-runtime')

		// Default open or close DevTools by F12 in development
		// and ignore CommandOrControl + R in production.
		// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window)
		})

		registerShortcuts()
		registerIpc()
		setupWindow()
	})

	// Ignore certificates errors on page
	app.commandLine.appendSwitch('ignore-certificate-errors')
	app.commandLine.appendSwitch('allow-insecure-localhost', 'true')

	// Exit cleanly on request from parent process in development mode.
	if (is.dev) {
		if (process.platform === 'win32') {
			process.on('message', data => {
				if (data === 'graceful-exit') {
					app.quit()
				}
			})
		} else {
			process.on('SIGTERM', () => {
				app.quit()
			})
		}
	}
}

process.on('uncaughtException', (error, origin) => {
	console.error('Uncaught Exception at:', origin, 'error:', error)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
