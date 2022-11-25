// https://socket.io/docs/v4/client-initialization/
import { io } from 'socket.io-client'

class SocketClient {
    constructor() {
        this.socket = null

        this.connectionErrorMaxAttempts = 1
        this.connectionErrorAttempts = 0

        this._initEvents = false
        this._Ping = null
        this._onConnect = []
        
    }

    isSocketConnected() {
        if(!this.socket) return false

        return this.socket.connected
    }

    Ping(callback) {
        if(!this.isSocketConnected()) return null

        this.socket.emit('Ping', null)

        return new Promise(resolve => {
            let bundle = sTime => {
                if(typeof callback === 'function') callback(sTime)
            
                resolve(sTime)
            }

            this._Ping = bundle
        })

    }

    initEvents() {
        if(this._initEvents) return

        this.socket.on('Ping', sTime => this._Ping(Date.now() - sTime))
    }

    onConnect(callback) {
        if(this.isSocketConnected()) callback()

        this._onConnect.push(callback)
    }

    connect(callback) {
        if(this.socket) return        

        let handler = () => {
            this.connectionErrorHandler()

            if(typeof callback === 'function') callback('error')

            if(this.connectionErrorAttempts >= this.connectionErrorMaxAttempts && typeof callback === 'function') {
                callback('failed')

                this.socket = null
            }
        }

        this.connectionErrorAttempts = 0

        const SERVER_IP = import.meta.env.VITE_SERVER_IP
        const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

        this.socket = io.connect(`http://${SERVER_IP}:${SERVER_PORT}`)

        this.socket.on('connect', () => {
            if(typeof callback === 'function') callback('success')

            for(let i = 0; i < this._onConnect.length; i++) {
                this._onConnect[i]()
            }

            this.initEvents()
        })
        this.socket.on('connect_error', handler)
        this.socket.on('connect_failed', handler)

        return this.socket
    }

    // https://stackoverflow.com/questions/14649590/how-to-catch-socket-io-errors-and-prevent-them-from-showing-up-in-the-console
    connectionErrorHandler() {
        if(++this.connectionErrorAttempts >= this.connectionErrorMaxAttempts) {
            this.socket.disconnect()

            console.error('Socket Has Disconnected...')
            console.error('Please check if the Server is running...')

            return
        }

        console.warn('Connection Error...')
        console.warn(`Re-Connecting Attempt: ${this.connectionErrorAttempts}/${this.connectionErrorMaxAttempts}`)
    }
}

export default new SocketClient()