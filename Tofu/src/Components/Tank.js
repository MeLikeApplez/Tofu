import Tofu, { Calculate, TofuGameObject } from '../Tofu'
import Geometry from '../Geometry/Geometry'
import Color from '../Color'
import Bullet from './Bullet'
import Mine from './Mine'

const speed = () => 300 * Tofu.Animation.delta

export default class Tank extends TofuGameObject {
    constructor({ x, y, BodyColor, BarrelColor, Nametag, BulletSpeed }={}) {
        super()

        this.Body = Tofu.Mesh({
            Geometry: new Geometry.Box(0, 0, 100, 80),
            Color: BodyColor || Color.rgb(80, 130, 250),
            Collision: true,
            name: 'Tank-Body'
        })

        this.Barrel = Tofu.Mesh({
            Geometry: new Geometry.Polygon(50, 35, 140, 35, 140, 45, 50, 45),
            Color: BarrelColor || Color.rgb(50, 120, 250),
            name: 'Tank-Barrel'
        })

        this.Particle = Tofu.ParticleEffects({
            Geometry: new Geometry.Box(150, 150, 30, 30),
            Color: Color.rgb(250, 120, 40, 0.5),
            CompositeOperation: 'lighter',
            loop: true
        }).spread({
            amount: 40, interval: 1, rate: 40,
            speed: 3, size: 2.8,
            fadeout: 0.3, duration: 0.3,
        })

        let fontSize = 20
        let fontFamily = 'Source Code Pro'
        let textSize = Tofu.getTextSize(Nametag, fontSize, fontFamily)

        if(textSize.width > 96) fontSize += ((96 - textSize.width) / 12) - 1.75

        // overflowing at ~> 96px
        this.Nametag = Tofu.Mesh({
            Geometry: new Geometry.Text(Nametag, x - 24, y + this.Body.Geometry.height + 10),
            FontSize: fontSize,
            FontFamily: fontFamily,
            Color: Color.rgb(255, 255, 255)
        })

        this.Body.Tank = this
        this.Barrel.Tank = this

        this.lastTimeShot = 0
        this.shotCount = 0
        this.shotCountLimit = 6
        this.bulletSpeed = BulletSpeed ?? 1

        this.lastTimeMine = 0
        this.mineCount = 0
        this.mineCountLimit = 2

        if(x) {
            this.Body.Geometry.position.x(x)
            this.Barrel.Geometry.position.x(x)
        }

        if(y) {
            this.Body.Geometry.position.y(y)
            this.Barrel.Geometry.position.y(y)
        }

        Tofu.Scene.add(this)
    }

    RenderGeometry() {
        super.RenderGeometry()

        let collision = this.Body.Collision.isColliding(this.Velocity.dx, this.Velocity.dy)

        if(!collision) return

        if(collision.colliding.name === 'Bullet') {
            let bullet = collision.colliding

            bullet.Tank.shotCount--
            bullet.kill()
            this.kill()
        }
    }

    // https://youtu.be/TOEi6T2mtHo
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    RaycastBulletDestination(angle=0, bounceLimit=1) {
        let bounces = 0
        let rays = []

        // get all lines
        // do ray intersection calculations
        // bounce then repeat until bounce limit reached
        
        return rays
    }

    getAllComponents() {
        return [this, this.Body, this.Barrel, this.Particle, this.Nametag]
    }

    toggleNametag() {
        this.Nametag.Style.Alpha = this.Nametag.Style.Alpha === 1 ? 0 : 1
    }

    kill() {
        let center = this.Body.Geometry.getCenter()

        this.Particle.Geometry.position.setX(center.x)
        this.Particle.Geometry.position.setY(center.y)

        this.Particle.play(0.3)

        Tofu.Scene.remove(this, this.Body, this.Barrel, this.Nametag)
    }

    mine() {
        if(!this.Properties.isInTheScene) return

        const delay = 300

        if(this.mineCount >= this.mineCountLimit) return
        if(this.lastTimeMine !== 0 && performance.now() - this.lastTimeMine < delay) return

        let center = this.Body.Geometry.getCenter()
        let mine = new Mine({
            Geometry: new Geometry.Box(center.x - 10, center.y - 10, 20, 10),
            Color: Color.rgb(250, 220, 120),
            LineColor: Color.rgb(20, 20, 20),
            LineWidth: 1,
            CompositeOperation: 'destination-over',
            Collision: true,
            Tank: this,
            name: 'Mine'
        })

        mine.Collision.toggleNoClip()        

        this.lastTimeMine = performance.now()
        this.mineCount++
    }

    shoot() {
        if(!this.Properties.isInTheScene) return

        const delay = 250

        if(this.shotCount >= this.shotCountLimit) return
        if(this.lastTimeShot !== 0 && performance.now() - this.lastTimeShot < delay) return

        let center = this.Body.Geometry.getCenter()
        let radius = 90
        let angle = this.Barrel.Geometry.AngleType === 'DEGREE' ? 2 * Math.PI - Calculate.toRad(this.Barrel.Geometry.Angle) : this.Barrel.Geometry.Angle
        let x = Math.cos(angle) * radius + center.x
        let y = Math.sin(angle) * radius + center.y

        let bullet = new Bullet({
            Geometry: new Geometry.Polygon(0, 0, 20, 0, 20, 5, 0, 5),
            Color: Color.rgb(200, 200, 200),
            VelocityX: (x - center.x) * this.bulletSpeed, VelocityY: (y - center.y) * this.bulletSpeed,
            Collision: true,
            name: 'Bullet',
            Tank: this
        })

        bullet.Geometry.position.x(x)
        bullet.Geometry.position.y(y - 2.5)
        bullet.Geometry.rotation.rotate(this.Barrel.Geometry.Angle, x, y)

        bullet.Trail.Geometry.position.x(x)
        bullet.Trail.Geometry.position.y(y - 2.5)
        bullet.Trail.Geometry.rotation.rotate(this.Barrel.Geometry.Angle, x, y)

        bullet.Trail.play()

        // console.log('BULLET ' + (this.shotCount + 1))
        
        this.lastTimeShot = performance.now()
        this.shotCount++
    }

    rotateBarrel(angle) {
        let center = this.Body.Geometry.getCenter()

        this.Barrel.Geometry.rotation.set(angle, center.x, center.y)
    }

    rotateBarrelToCoordinate(x, y) {
        // https://stackoverflow.com/questions/1311049/how-to-map-atan2-to-degrees-0-360
        let center = this.Body.Geometry.getCenter()
        let angle = -Calculate.toDeg(Math.atan2(y - center.y, x - center.x))

        this.Barrel.Geometry.rotation.set(angle, center.x, center.y)
    }

    moveUp() {
        if(this.Body.Collision.isColliding(0, speed())) return

        this.Velocity.dy = speed()

        this.Nametag.Geometry.position.y(speed())
        this.Body.Geometry.position.y(speed())
        this.Barrel.Geometry.position.y(speed())
    }
    
    moveDown() {
        if(this.Body.Collision.isColliding(0, -speed())) return

        this.Velocity.dy = -speed()

        this.Nametag.Geometry.position.y(-speed())
        this.Body.Geometry.position.y(-speed())
        this.Barrel.Geometry.position.y(-speed())
    }

    moveLeft() {
        if(this.Body.Collision.isColliding(-speed())) return

        this.Velocity.dx = -speed()

        this.Nametag.Geometry.position.x(-speed())
        this.Body.Geometry.position.x(-speed())
        this.Barrel.Geometry.position.x(-speed())
    }

    moveRight() {
        if(this.Body.Collision.isColliding(speed())) return

        this.Velocity.dx = speed()

        this.Nametag.Geometry.position.x(speed())
        this.Body.Geometry.position.x(speed())
        this.Barrel.Geometry.position.x(speed())
    }
}