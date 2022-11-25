require('dotenv').config()

const express = require('express')
const app = express()
const server = app.listen(process.env.SERVER_PORT, () => console.log('Listening...'))

const { Live, Client } = require('./Live.js')
const io = require('socket.io')(server, { cors: { origin: '*' } })

io.on('connection', socket => {
    // console.log('Connected: ' + socket.id)

    socket.on('Ping', () => {
        socket.emit('Ping', Date.now())
    })

    socket.on('disconnect', data => {
        // console.log('Disconnected: ' + socket.id)
    })
})