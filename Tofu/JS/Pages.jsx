import { useEffect, useState, useRef } from 'react'
import Tofu from '../src/Tofu'

export function Settings({ style }) {
    return <div style={style} className='Settings-Screen'>
        in Settings
    </div>
}

export function Multiplayer({ style }) {
    const [ status, setStatus ] = useState('Connecting To Server...')

    function live() {
        const { SocketClient } = Tofu

        setStatus(SocketClient.socket.id)
    }

    useEffect(() => {
        if(style.display === 'none' || Tofu.SocketClient.isSocketConnected()) return

        Tofu.SocketClient.connect(currentStatus => {
            if(currentStatus === 'error') setStatus('Connection Error, Re-Attempting...')
            if(currentStatus === 'failed') setStatus('Connection Failed! Check "Dev Tools" for error logs...')
            if(currentStatus === 'success') {
                setStatus('Connected!')
                live()
            }
        })

    }, [style])

    return <div style={style} className='Multiplayer-Screen'>
        { status }
    </div>
}