class SocketClient {
    constructor() {
        this.thread = null
        this.listener = false

        // this.connect()
    }

    connect() {
        if(this.socket || this.thread) return this.socket

        this.thread = new Worker(new URL('./Thread.js', import.meta.url), {
            type: 'module'
        })

        this.callbackListener()

        this.thread.postMessage('init')

        return this.socket
    }

    callbackListener() {
        if(this.listener) return
        this.listener = true

        this.thread.onmessage = event => {
            console.log('SocketClient', event)
        }
    }
}

export default new SocketClient()