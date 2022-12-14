import Tofu, { Animation, TofuGameObject, Level } from './Tofu'

// import Tank from '../src/Components/Tank'
// import Obstacle from '../src/Components/Obstacle'
// import AI from '../src/Components/AI'

const GameObjectList = []

export default class Scene {
    constructor(canvas, width=0, height=0) {
        this.canvasElement = canvas
        this.canvasContext = canvas.getContext('2d')

        this.canvasElement.oncontextmenu = () => false

        this.width = width
        this.height = height
        this.allowDynamicResizing = false
        this.internalResolution = { width: 1280, height: 720 }

        this.aspectRatioWidth = 16
        this.aspectRatioHeight = 9
        this.aspectRatio = this.aspectRatioWidth / this.aspectRatioHeight

        this._MEMOIZE = {
            lastUpdate: Date.now()
        }

        this.setSize(width, height)

        this.animation()

        window.onresize = () => {
            if(!this.allowDynamicResizing) return

            const { innerWidth, innerHeight } = window

            this.width = innerWidth
            this.height = innerHeight

            this.setSize(this.width, this.height)
        }
    }

    async loadLevelMap(levelMap, preserve=[]) {
        if(!Level.isLevelMap(levelMap)) return false
        
        console.warn('LOADING LEVEL MAP...')

        // clear everything
        GameObjectList.splice(0, GameObjectList.length)
        
        // preserve
        this.add(...preserve)

        const [ Obstacle, Tank, AI ] = (await Promise.all([import('./Components/Obstacle'), import('./Components/Tank'), import('./Components/AI')])).map(v => v.default)


        for(let i = 0; i < levelMap.Obstacles.length; i++) {
            let obstacle = levelMap.Obstacles[i]

            new Obstacle(obstacle)
        }

        for(let i = 0; i < levelMap.Tanks.length; i++) {
            let tank = levelMap.Tanks[i]

            // a bit imperfect
            if(tank.type === 'Player') {
                new Tank(tank)
            } else if(tank.type === 'AI') {
                // needs extra parameters for AI
                new AI({ ...tank, ...tank.AI })
            }
        }
    }

    getGameObjects() {
        return [...GameObjectList]
    }

    add(...GameObjects) {
        let updatedOnce = false

        for(let i = 0; i < GameObjects.length; i++) {
            let GameObject = GameObjects[i]

            if(!(GameObject instanceof TofuGameObject)) continue

            updatedOnce = true
            GameObjectList.push(GameObject)
            GameObject.Properties.isInTheScene = true
        }

        if(updatedOnce) this._MEMOIZE.lastUpdate = Date.now()

        return this.getGameObjects()
    }

    remove(...GameObjects) {
        let updatedOnce = false

        for(let i = 0; i < GameObjects.length; i++) {
            let GameObject = GameObjects[i]

            if(!(GameObject instanceof TofuGameObject)) continue

            updatedOnce = true
            GameObjectList.splice(GameObjectList.findIndex(g => g.UUID === GameObject.UUID), 1)
            GameObject.Properties.isInTheScene = false
        }

        if(updatedOnce) this._MEMOIZE.lastUpdate = Date.now()

        return this.getGameObjects()
    }

    setSize(width=0, height=0) {
        this.canvasElement.width = this.internalResolution.width
        this.canvasElement.height = this.internalResolution.height

        this.canvasElement.style.width = `${width}px`
        this.canvasElement.style.height = `${height}px`

        // flip the y-axis to a normal traditional graph
        this.canvasContext.transform(1, 0, 0, -1, 0, this.canvasElement.height)

        this.canvasContext.strokeStyle = 'white'
        this.canvasContext.fillStyle = 'white'
    }

    clear() {
        const { canvasElement, canvasContext } = this

        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    }

    animation() {
        let init = false

        Animation.runner((fps, delta) => {
            const { Scripts } = Tofu

            this.clear()

            for(let i = 0; i < Scripts.length; i++) {
                let script = Scripts[i]

                if(!init) script.Init()
                script.Draw(fps, delta)
            }

            for(let i = 0; i < GameObjectList.length; i++) {
                let GameObject = GameObjectList[i]

                GameObject.RenderGeometry()
            }

            if(!init) init = true

            Tofu.currentCanvas = { ...Tofu.defaultsCanvas }
        })
    }
}