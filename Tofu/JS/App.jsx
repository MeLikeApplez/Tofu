import { useEffect, useRef } from 'react'
import Pages from './Pages'
import Tofu from '../src/Tofu'

export default function App() {
    const multiplayerScreen = useRef()

    useEffect(() => {
        Tofu.Controller.listenForKeyboard((event, key, type) => {
            if(type === 'down' && key === '/') {
                const display = multiplayerScreen.current.style.display

                multiplayerScreen.current.style.display = display === 'flex' ? 'none' : 'flex'
            }
        })
    }, [])

    return <>
        <div ref={multiplayerScreen} className='Multiplayer'>
            Multiplayer
            <button>Multiplayer</button>
            <button>Settings</button>
        </div>
    </>
}

function User({ name }) {
    return <></>
}