import TofuGameObjectProperties from "./TofuGameObjectProperties"
import Tofu, { Color, Collision as CreateCollision, Helpers } from '../Tofu'
import { validate as uuidValidate, v4 as uuidv4 } from 'uuid'

export default class TofuGameObject {
    constructor(options={}) {
        const { Geometry, Color, LineColor, LineWidth, Collision, FontSize, FontFamily, Alpha, CompositeOperation, 
            UUID, name, VelocityX, VelocityY } = options

        this.Geometry = Geometry || null
        this.Style = {
            Alpha: Alpha ?? 1,
            Color: Color || null,
            LineColor: LineColor || null,
            LineWidth: LineWidth ?? null,
            FontSize: FontSize ?? null,
            FontFamily: FontFamily || null,
            CompositeOperation: CompositeOperation || 'source-over'
        }

        this.Properties = new TofuGameObjectProperties(this)
        this.Collision = Collision ? new CreateCollision(this) : null
        this.Velocity = { x: VelocityX || 0, y: VelocityY || 0, dx: 0, dy: 0 }

        this.UUID = uuidValidate(UUID) ? UUID : uuidv4()
        this.name = name || 'GameObject'

        Helpers.freezeProperty(this, 'UUID', this.UUID)
    }
    
    RenderGeometry(Style=this.Style, Geometry=this.Geometry, hitbox=false) {
        if(!Geometry) return

        let { Color: color, LineColor, LineWidth, FontSize, FontFamily, Alpha, CompositeOperation } = Style

        color = Color.parse(color)
        LineColor = Color.parse(LineColor)

        Tofu.setGlobalCompositeOperation(CompositeOperation)
        Tofu.setGlobalAlpha(Alpha)
        Tofu.setColor(color)
        Tofu.setLineColor(LineColor)
        Tofu.setLineWidth(LineWidth)
        Tofu.setFontSize(FontSize)
        Tofu.setFontFamily(FontFamily)

        switch(Geometry.GeometryType) {
            case 'Polygon': {
                if(color) Tofu.fillPolygon(...Geometry.points)
                if(LineColor) Tofu.linePolygon(...Geometry.points)
                
                break
            }
            case 'Circle': {
                if(color) Tofu.fillCircle(Geometry.x, Geometry.y, Geometry.radius)
                if(LineColor) Tofu.lineCircle(Geometry.x, Geometry.y, Geometry.radius)

                break
            }
            case 'Text': {
                if(color) Tofu.fillText(Geometry.Text, Geometry.x, Geometry.y)
                if(LineColor) Tofu.lineText(Geometry.Text, Geometry.x, Geometry.y)

                break
            }
        }

        // render hitbox
        if(!hitbox && this.Collision?.Hitbox) this.RenderGeometry(this.Collision.Hitbox, this.Geometry, true)

        this.Velocity.dx = 0
        this.Velocity.dy = 0

        Tofu.resetCanvas()
    }

    remove() {
        Tofu.Scene.remove(this)

        return true
    }
}