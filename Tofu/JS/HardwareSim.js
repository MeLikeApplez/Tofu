import Tofu, { Color, Collision } from '../src/Tofu'
import Geometry from '../src/Geometry/Geometry'
import { HardwareComponent, HardwareButton } from '../src/Components/HardwareComponent'

window.Tofu = Tofu

const canvas = document.querySelector('canvas')
const width = 1080
const height = 720

Tofu.Engine(canvas, width, height)
Tofu.addScript(Start, Animate)

const mouse = Tofu.Mesh({
    Geometry: new Geometry.Circle(0, 0, 0),
    Collision: true
})

function Start() {
    new HardwareButton('NAND', Color.rgb(180, 80, 50))
    new HardwareButton('NOT', Color.rgb(250, 120, 80))
    new HardwareButton('AND', Color.rgb(80, 120, 250))
}

let grabbing = ''
let once = false
function Animate(fps, delta) {
    mouse.Geometry.position.setX(Tofu.Controller.mouseX)
    mouse.Geometry.position.setY(Tofu.Controller.mouseY)

    if(Tofu.Controller.mouseDown) {
        for(let i = 0; i < HardwareButton.Buttons.length; i++) {
            let hardwareButton = HardwareButton.Buttons[i]
    
            if(Collision.colliding(hardwareButton.button.Collision.SAT, mouse.Collision.SAT)) {
                grabbing = hardwareButton

                break
            }
        }

        if(grabbing && !once) {
            once = true

            console.log(
                new HardwareComponent(grabbing)
            )      
        }

        for(let i = 0; i < HardwareComponent.Components.length; i++) {
            let component = HardwareComponent.Components[i]

            if(grabbing === component.button) {
                component.setPosition(Tofu.Controller.mouseX, Tofu.Controller.mouseY)

            }

        }
    }

    if(!Tofu.Controller.mouseDown && once) once = false    
    
    grabbing = ''
}