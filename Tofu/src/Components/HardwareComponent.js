import Tofu, { Color, Collision } from '../Tofu'
import Geometry from '../Geometry/Geometry'

export class HardwareComponent {
    static Components = []

    constructor(Button) {
        this.button = Button
        this.name = Button.name

        this.body = Tofu.Mesh({
            Geometry: new Geometry.Box(0, 0, Button.width, Button.height),
            Color: Button.color
        })
        this.text = Tofu.Mesh({
            Geometry: new Geometry.Text(Button.name, 5, 7),
            Color: Color.rgb(255, 255, 255),
            FontSize: HardwareButton.fontSize,
            name: Button.name
        })
        this.inputs = []
        this.outputs = []
        
        HardwareComponent.Components.push(this)
    }

    setPosition(x, y) {
        this.body.Geometry.position.setX(x)
        this.body.Geometry.position.setY(y)

        this.text.Geometry.position.setX(x / 2 + 5)
        this.text.Geometry.position.setY(y + this.button.textHeight)
    }
}

export class HardwareButton {
    static Buttons = []
    static textSpace = 0
    static fontSize = 20
    
    constructor(text, color) {
        const textSize = Tofu.getTextSize(text, HardwareButton.fontSize)
        const width = textSize.width + HardwareButton.fontSize
        const height = 30
        const textWidth = HardwareButton.textSpace / 2
        const textHeight = 7

        const button = Tofu.Mesh({
            Geometry: new Geometry.Box(HardwareButton.textSpace, 0, width, height),
            Color: color,
            Collision: true,
            name: text
        })

        button.Text = Tofu.Mesh({
            Geometry: new Geometry.Text(text, 5 + textWidth, textHeight),
            Color: Color.rgb(255, 255, 255),
            FontSize: HardwareButton.fontSize,
            name: text
        })

        HardwareButton.textSpace += textSize.width + 25

        this.button = button
        this.name = text

        this.color = color

        this.width = width
        this.height = height

        this.textWidth = textWidth
        this.textHeight = textHeight

        HardwareButton.Buttons.push(this)

        console.log(this)
    }
}