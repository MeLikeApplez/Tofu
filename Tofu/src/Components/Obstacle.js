import Tofu, { Calculate, TofuGameObject } from '../Tofu'
import Geometry from '../Geometry/Geometry'
import Color from '../Color'

export default class Obstacle extends TofuGameObject {
    constructor({ x, y, width, height, Color: color }={}) {
        super({
            Geometry: new Geometry.Box(x, y, width, height),
            Color: color,
            Collision: true,
            name: 'Obstacle'
        })

        Tofu.Scene.add(this)
    }
}