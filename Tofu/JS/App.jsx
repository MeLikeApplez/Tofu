import { useEffect, useState, useRef } from 'react'
import { Settings, Multiplayer } from './Pages'
import Tofu from '../src/Tofu'

const contentTemplete = (key, value) => {
    let templete = { Back: null, Main: 'none', Multiplayer: 'none', Settings: 'none' }

    if(key || value) templete[key] = value

    return templete
}

export default function App() {
    const multiplayerScreen = useRef()
    const [ screen, setScreen ] = useState('Main')
    const [ title, setTitle ] = useState('Tofu Tank Game')
    const [ content, setContent ] = useState(contentTemplete('Main', 'block'))
    const [ history, setHistory ] = useState({ screen, title, content })

    function Main({ style }) {
        return <>
            <button style={style} onClick={() => screenSwitcher('Multiplayer')}>Multiplayer</button>
            <button style={style} onClick={() => screenSwitcher('Settings')}>Settings</button>
        </>
    }

    function screenSwitcher(name, newTitle) {
        let temp = contentTemplete()

        if(!(name in temp)) return

        newTitle = newTitle || name

        if(name === 'Back') {
            if(screen === 'Main') return displayMultiplayerScreen()

            setScreen(history.screen)
            setTitle(history.title)
            setContent(history.content)

            return
        }

        temp[name] = 'block'

        setHistory({ screen, title, content })

        setScreen(name)
        setTitle(newTitle)
        setContent(temp)
    }

    function displayMultiplayerScreen() {
        const display = window.getComputedStyle(multiplayerScreen.current).display

        multiplayerScreen.current.style.display = display === 'flex' ? 'none' : 'flex'

        Tofu.Controller.allowMouseListening = display === 'flex'
        Tofu.Controller.allowKeyboardListening = display === 'flex'
        // if(display === 'none') return Tofu.Animation.pause()
        
        // Tofu.Animation.run()
    }

    useEffect(() => {
        Tofu.Controller.listenForKeyboard((event, key, type) => {
            if(type === 'down' && (key === '/' || key === 'Escape')) displayMultiplayerScreen()
        })

        // Tofu.Controller.allowMouseListening = false
        // Tofu.Controller.allowKeyboardListening = false

        // screenSwitcher('Multiplayer')
    }, [])

    // https://www.toptal.com/designers/htmlarrows/
    return <>
        <div ref={multiplayerScreen} className='Multiplayer'>
            <div className='Top-Left-Buttons'>
                <button className='Back' onClick={() => screenSwitcher('Back')}>&#8592; Back</button>
                <button className='Exit' onClick={() => displayMultiplayerScreen()}>&#215;</button>
            </div>
            <div>{ title }</div>

            <Ping></Ping>

            <Main style={{ display: content.Main }}></Main>
            <Multiplayer style={{ display: content.Multiplayer }}></Multiplayer>
            <Settings style={{ display: content.Settings }}></Settings>
        </div>
    </>
}

function Ping() {
    const pingRef = useRef()
    const [ ping, setPing ] = useState('*')
    const [ pingLoop, setPingLoop ] = useState(null)
    const [ autoRefresh, setAutoRefresh ] = useState(false)

    function refresh() {
        if(!Tofu.SocketClient.isSocketConnected()) return

        setPingLoop(
            setInterval(async () => {
                let time = await Tofu.SocketClient.Ping()
                let newColor = 'transparent'
                let bgColor = 'transparent'
                
                if(time <= 50) {
                    newColor = 'rgb(80, 250, 120)'
                    bgColor = 'rgb(80, 250, 120, 0.1)'
                } else if(time > 50 && time <= 100) {
                    newColor = 'rgb(250, 160, 50)'
                    bgColor = 'rgb(250, 160, 50, 0.1)'
                } else {
                    newColor = 'rgb(250, 0, 80)'
                    bgColor = 'rgb(250, 0, 80, 0.1)'
                }

                pingRef.current.style.borderBottom = '2px solid ' + newColor
                pingRef.current.style.backgroundColor = bgColor
    
                setPing(time)
            }, 1000)
        )
    }

    function clear() {
        clearInterval(pingLoop)

        pingRef.current.style.borderBottom = '2px solid transparent'
        pingRef.current.style.backgroundColor = 'transparent'

        setPing('*')
        setPingLoop(null)
    }

    function toggleRefresh() {
        if(autoRefresh) {
            clear()
        } else {
            refresh()
        }

        setAutoRefresh(!autoRefresh)
    }

    useEffect(() => {
        Tofu.SocketClient.onConnect(toggleRefresh)
    }, [])

    return <div ref={pingRef} onClick={toggleRefresh} className='Ping'>{ ping }ms</div>
}

function User({ name }) {
    return <></>
}