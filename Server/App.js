const express = require('express')
const app = express()
const server = app.listen(8080, () => console.log('Listening...'))

const io = require('socket.io')(server, { cors: { origin: '*' } })

io.on('connection', socket => {
    console.log('Socket Connected: ' + socket.id)

    socket.on('disconnect', data => {
        console.log('Socket Disconnected: ' + socket.id)
    })
})