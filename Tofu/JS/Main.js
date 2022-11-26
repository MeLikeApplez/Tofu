import Tofu, { Geometry, Color, Collision, Level } from '../src/Tofu'
import Tank from '../src/Components/Tank'
import Obstacle from '../src/Components/Obstacle'
import AI from '../src/Components/AI'

window.Tofu = Tofu

const canvas = document.querySelector('canvas')
const width = 1080
const height = 720
const wallThickness = 500

Tofu.Engine(canvas, width, height)
Tofu.addScript(Start, Animate)

const sceneWidth = Tofu.Scene.internalResolution.width
const sceneHeight = Tofu.Scene.internalResolution.height

// wall borders
new Obstacle({ y: sceneHeight, width: sceneWidth, height: wallThickness, Color: Color.rgb(250, 140, 80) }) // top
new Obstacle({ y: -wallThickness, width: sceneWidth, height: wallThickness, Color: Color.rgb(250, 120, 50) }) // bottom
new Obstacle({ x: -wallThickness, width: wallThickness, height: sceneHeight, Color: Color.rgb(250, 140, 80) }) // left
new Obstacle({ x: sceneWidth, width: wallThickness, height: sceneHeight, Color: Color.rgb(250, 140, 80) }) // right

const tank = new Tank({ x: 50, y: 310, Nametag: 'Test Player' })

const ai = new AI({
    BodyColor: Color.rgb(99, 79, 32), 
    BarrelColor: Color.rgb(150, 125, 65),
    x: 900, y: 300,
    rotation: 180,
    Target: tank,
    aiming: 1, shooting: 1
})

window.tank = tank
window.ai = ai

function Start() {
    const level = Level.create({
        Obstacles: [
            { y: sceneHeight, width: sceneWidth, height: wallThickness, Color: Color.rgb(250, 140, 80) }, // top
            { y: -wallThickness, width: sceneWidth, height: wallThickness, Color: Color.rgb(250, 120, 50) }, // bottom
            { x: -wallThickness, width: wallThickness, height: sceneHeight, Color: Color.rgb(250, 140, 80) }, // left
            { x: sceneWidth, width: wallThickness, height: sceneHeight, Color: Color.rgb(250, 140, 80) }, // right
            { x: 550, y: 200, width: 75, height: 300, Color: Color.rgb(190, 160, 100) },
            { x: 300, y: 200, width: 75, height: 100, Color: Color.rgb(190, 160, 100) },
            { x: 300, y: 400, width: 75, height: 100, Color: Color.rgb(190, 160, 100) }
        ],
        Tanks: [
            // { x: 50, y: 310, BodyColor: Color.rgb(80, 130, 250), BarrelColor: Color.rgb(50, 120, 250), Nametag: 'Test Player', type: 'Player' },
            // { x: 900, y: 300, BodyColor: Color.rgb(99, 79, 32), BarrelColor: Color.rgb(150, 125, 65), type: 'AI' }
        ]
    })

    // Tofu.Scene.loadLevelMap(level)
    Tofu.Scene.loadLevelMap(level, [...tank.getAllComponents(), ...ai.Tank.getAllComponents()])
    // console.log(Level.isLevelMap(level))

    // console.log(tank)
    // console.log(ai)
}

function Animate(fps, delta) {
    ai.Render()

    if(!tank.Properties.isInTheScene) return

    tank.rotateBarrelToCoordinate(Tofu.Controller.mouseX, Tofu.Controller.mouseY)

    if(Tofu.Controller.mouseDown && Tofu.Controller.whichMouse === 'left') {
        tank.shoot()
    }

    if(Tofu.Controller.mouseDown && Tofu.Controller.whichMouse === 'right') {
        tank.mine()
    }

    if(Tofu.Controller.hasPressed('w')) {
        tank.moveUp()
    }

    if(Tofu.Controller.hasPressed('a')) {
        tank.moveLeft()
    }

    if(Tofu.Controller.hasPressed('s')) {
        tank.moveDown()
    }

    if(Tofu.Controller.hasPressed('d')) {
        tank.moveRight()
    }
}