import Tofu from '../Tofu'
import TofuGameObject from '../GameObject/TofuGameObject'

export default class Bullet extends TofuGameObject {
    constructor(options={}) {
        super(options)

        this.bounce = 0
        this.bounceLimit = 1
        this.Tank = options.Tank || null
        this.Trail = Tofu.Particle({
            Geometry: new Geometry.Polygon(0, 0, 20, 0, 20, 5, 0, 5),
            ColorCycle: 'random',
            Color: Color.rgb(200, 120, 40, 1),
            CompositeOperation: 'lighter',
            amount: 10,
            amountSlice: 1,
            interval: 1,
            range: [0, 0, 0, 0],
            spread: 'range',
            spreadSpeed: 1,
            fadeout: 200,
            loop: true
        })
        this.Explosion = Tofu.Particle({
            Geometry: new Geometry.Box(0, 0, 10, 10),
            ColorCycle: 'random',
            Color: Color.rgb(200, 120, 40, 1),
            CompositeOperation: 'lighter',
            amount: 10,
            amountSlice: 1,
            interval: 1,
            spread: 'circle',
            spreadSpeed: 2,
            fadeout: 200,
            // loop: true
        })

        Tofu.Scene.add(this)
    }

    RenderGeometry() {
        super.RenderGeometry()

        let vx = this.Velocity.x * Tofu.Animation.delta * 2
        let vy = this.Velocity.y * Tofu.Animation.delta * 2
        let collision = this.Collision.isColliding(vx, vy)

        if(collision) {
            let { response, colliding } = collision

            switch(colliding.name) {
                case 'Bullet': {
                    this.kill()
                    colliding.kill()
                    this.Tank.shotCount -= 2

                    break
                }
                case 'Obstacle': {
                    if(this.bounce >= this.bounceLimit) {
                        this.kill()
                        this.Tank.shotCount--

                        break
                    }

                    let slope = (response.overlapV.y - response.overlapN.y) / (response.overlapV.x - response.overlapN.x)
                    let deflect = Calculate.deflect(0, 0, this.Velocity.x, this.Velocity.y, slope)
                    
                    this.Geometry.rotation.rotate(360 - deflect.deg)
                    this.Trail.Geometry.rotation.rotate(360 - deflect.deg)
    
                    this.Velocity.x = deflect.x
                    this.Velocity.y = deflect.y

                    this.bounce++

                    break
                }

                case 'Tank-Body': {
                    colliding.Tank.kill()
                    this.kill()
                    
                    this.Tank.shotCount--

                    break
                }
            }

            return
        }

        this.Geometry.position.x(vx)
        this.Geometry.position.y(vy)
        this.Trail.Geometry.position.x(vx)
        this.Trail.Geometry.position.y(vy)
    }

    kill() {
        let center = this.Geometry.getCenter()

        this.Trail.stop()
        this.Explosion.play()

        this.Explosion.Geometry.position.x(center.x)
        this.Explosion.Geometry.position.y(center.y)

        this.Trail.onStop = () => Tofu.Scene.remove(this.Trail)

        this.Explosion.onPause = () => Tofu.Scene.remove(this.Explosion)

        Tofu.Scene.remove(this, this.Trail)
    }
}