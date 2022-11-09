export default class Controller {
    constructor(canvasElement) {
        let controller = this

        this.canvasElement = canvasElement

        this.MouseEvent = null
        this.mouseX = null
        this.mouseY = null
        this.mouseUp = true
        this.mouseDown = false
        this.whichMouse = ''
        
        this.KeyboardEvent = null
        this.keyPress = []
        this.keyUp = true
        this.keyDown = false

        this.canvasElement.onmousemove = function(event) {
            controller.MouseEvent = event
            
            let rect = this.getBoundingClientRect()
            let { clientX, clientY } = event
            let newMouseX = clientX - rect.left
            let newMouseY = ((clientY - rect.top) - (this.height / 2)) * -1

            // get relative position from window to canvas
            controller.mouseX = newMouseX
            // mirror y position
            controller.mouseY = newMouseY
        }

        this.canvasElement.onmousedown = function(event) {
            controller.MouseEvent = event
            controller.mouseUp = false
            controller.mouseDown = true
            controller.whichMouse = event.which === 1 ? 'left' : (event.which === 2 ? 'middle' : 'right')
        }

        this.canvasElement.onmouseup = function(event) {
            controller.MouseEvent = event
            controller.mouseUp = true
            controller.mouseDown = false
            controller.whichMouse = ''
        }

        window.onkeydown = function(event) {
            controller.KeyboardEvent = event
            
            controller.keyUp = false
            controller.keyDown = true
            
            if(!controller.keyPress.includes(event.key)) {
                controller.keyPress.push(event.key)
            }
        }

        window.onkeyup = function(event) {
            controller.KeyboardEvent = event

            let index = controller.keyPress.findIndex(v => v === event.key)

            if(index !== -1) {
                controller.keyPress.splice(index, 1)
            }

            if(controller.keyPress.length === 0) {
                controller.keyUp = true
                controller.keyDown = false
            }
        }
    }

    hasPressed(key) {
        for(let i = 0; i < this.keyPress.length; i++) {
            if(key === this.keyPress[i]) return true
        }

        return false
    }
}