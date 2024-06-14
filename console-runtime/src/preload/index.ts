import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipc', {
	send: (channel: any, action: any, ...args: any) => {
		// whitelist channels
		const validChannels = ['action']
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, action, ...args)
		}
	},
	on: (channel: any, func: any) => {
		const validChannels = ['action']
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args))
		}
	}
})
