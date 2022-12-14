import Tofu, { Color, Collision } from '../Tofu'
import TofuGameObject from '../GameObject/TofuGameObject'
import Geometry from '../Geometry/Geometry'

export default class Mine extends TofuGameObject {
    constructor(options={}) {
        super(options)

        this.Tank = options.Tank || null
        this.timeCount = 0
        this.timeCountLimit = 5 // seconds

        this.timeInterval = 0
        this.timeIntervalCount = 0
        this.timeIntervalCountLimit = 10

        this.rapidAlert = false

        let center = this.Geometry.getCenter()

        this.ExplosionArea = Tofu.Mesh({
            Geometry: new Geometry.Circle(center.x, center.y, 90),
            // Color: Color.rgb(250, 180, 80, 0.5),
            Collision: true
        })

        this.ExplosionArea.Collision.toggleNoClip()
        
        this.Explosion = Tofu.ParticleEffects({
            Geometry: new Geometry.Box(150, 150, 30, 30),
            Color: Color.rgb(250, 120, 40, 0.5),
            CompositeOperation: 'lighter',
            loop: true
        }).spread({
            amount: 40, interval: 1, rate: 40,
            speed: 3, size: 3,
            fadeout: 0.4, duration: 0.4,
        })

        Tofu.Scene.add(this)
    }

    showExplosion() {
        let center = this.Geometry.getCenter()

        this.Explosion.Geometry.position.setX(center.x - 10)
        this.Explosion.Geometry.position.setY(center.y - 10)

        this.Explosion.play()
    }

    blowup(skipMines=false) {
        // console.log('mine blow up')

        let center = this.Geometry.getCenter()

        this.showExplosion()
        
        // console.log(this.Explosion)

        this.ExplosionArea.Geometry.position.setX(center.x)
        this.ExplosionArea.Geometry.position.setY(center.y)

        if(!skipMines) {
            let collision = this.ExplosionArea.Collision.isCollidingMultiple(0, 0, { ignoreNoClip: true })

            for(let i = 0; i < collision.length; i++) {
                let colliding = collision[i].colliding

                if(colliding.UUID === this.UUID) continue

                if(colliding.name === 'Tank-Body') {
                    colliding.Tank.kill()
                }

                if(colliding.name === 'Bullet') {
                    colliding.kill()
                    colliding.Tank.shotCount--
                }

                if(colliding.name === 'Mine') {
                    colliding.blowup(true)
                }
            }
        }

        this.Tank.mineCount--

        this.remove()
        this.ExplosionArea.remove()
    }


    RenderGeometry() {
        super.RenderGeometry()

        this.timeCount += Tofu.Animation.delta

        let collision = this.Collision.isColliding()

        if(collision) {
            let colliding = collision.colliding

            if(colliding.UUID === this.Tank.Body.UUID) return

            this.blowup()
        }

        if(this.timeCount >= this.timeCountLimit) {
            this.timeInterval += Tofu.Animation.delta

            if(this.timeInterval >= 0.1) {
                this.rapidAlert = !this.rapidAlert

                this.timeIntervalCount++
                this.timeInterval = 0

                if(this.timeIntervalCount >= this.timeIntervalCountLimit) {
                    // blow up

                    this.blowup()
                }
            }

            this.Style.Color = this.rapidAlert ? Color.rgb(250, 220, 120) : Color.rgb(250, 130, 80)
        }
    }
}