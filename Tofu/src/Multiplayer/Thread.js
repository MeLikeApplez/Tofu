// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

// https://socket.io/docs/v4/client-initialization/
import { io } from 'socket.io-client'

let socket

self.onmessage = function(event) {
    const { data } = event

    if(data === 'init' || !socket) {
        socket = io('http://localhost:8080')
    }

    if(socket) {
        
    }
}