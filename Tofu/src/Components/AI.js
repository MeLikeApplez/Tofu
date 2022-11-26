import Tofu, { Calculate } from '../Tofu'
import Tank from './Tank'

export default class AI {
    constructor(options={}) {
        const { BodyColor, BarrelColor, x, y, rotation, Target, movement, aiming, shooting } = options

        this.Tank = new Tank({ x, y, BodyColor, BarrelColor })
        this.Target = Target || null

        this.Tank.rotateBarrel(rotation)

        // difficulty 1 - 3
        // 1(easy) - 2(medium) - 3(hard)
        this.movement = movement ?? 1
        this.aiming = aiming ?? 1
        this.shooting = shooting ?? 1
        
        // when to aim
        this.intervalUpdate = 3
        this.interval = this.intervalUpdate
        
        // when to shoot
        this.intervalCount = 0 // start
        this.intervalCountLimit = 5 // end
        
        this.setAngle = rotation || 0
        // aiming range
        this.range = 45 
        
        this.second = 0
        
        this.setMovementDifficulty(this.movement)
        this.setAimingDifficulty(this.aiming)
        this.setShootingDifficulty(this.shooting)
    }

    setMovementDifficulty(difficulty) {
        if(typeof difficulty !== 'number') return

        this.movement = Calculate.Clamp(difficulty, 1, 3)

        if(difficulty === 1) { // slow movement
            
        } else if(difficulty === 2) { // slow but accurate tracking
            
        } else if(difficulty === 3) { // fast movement and accurate tracking
            
        }

        return this.movement
    }

    setAimingDifficulty(difficulty) {
        if(typeof difficulty !== 'number') return

        this.aiming = Calculate.Clamp(difficulty, 1, 3)

        if(difficulty === 1) { // slow, wide range aiming
            this.intervalUpdate = 3
            this.interval = this.intervalUpdate
            this.range = 45
        } else if(difficulty === 2) { // fast, slightly narrow aiming
            this.intervalUpdate = 0.5
            this.interval = this.intervalUpdate
            this.range = 30
        } else if(difficulty === 3) { // very fast accurate aiming
            this.intervalUpdate = 0.05
            this.interval = this.intervalUpdate
            this.range = 5
        }

        return this.aiming
    }

    setShootingDifficulty(difficulty) {
        if(typeof difficulty !== 'number') return

        this.shooting = Calculate.Clamp(difficulty, 1, 3)

        this.intervalCount = 0

        if(difficulty === 1) { // very slow shots
            this.intervalCountLimit = 2
        } else if(difficulty === 2) { // normal speed shots
            this.intervalCountLimit = 1.5
        } else if(difficulty === 3) { // rapid shots
            this.intervalCountLimit = 0.5
        }

        return this.shooting
    }

    Render() {
        if(!this.Target || !this.Target.Properties.isInTheScene || !this.Tank.Properties.isInTheScene) return

        let delta = Tofu.Animation.delta
        let targetCenter = this.Target.Body.Geometry.getCenter()
        let center = this.Tank.Body.Geometry.getCenter()

        let distance = Calculate.distance(center.x, center.y, targetCenter.x, targetCenter.y)
        let angle = 360 - Calculate.toDeg(Math.atan2(targetCenter.y - center.y, targetCenter.x - center.x))

        this.intervalUpdate += Tofu.Animation.delta
        this.second += Tofu.Animation.delta

        let updateInterval = this.intervalUpdate >= this.interval

        if(updateInterval) {
            let randomAngle = Calculate.Random(angle - this.range, angle + this.range) % 360

            this.setAngle = randomAngle        
        }

        let currentAngle = this.Tank.Barrel.Geometry.Angle
        let newAngle = (this.setAngle - currentAngle) * delta

        this.Tank.Barrel.Geometry.rotation.rotate(newAngle, center.x, center.y)

        if(this.intervalCount >= this.intervalCountLimit) {
            this.intervalCount = 0

            if(distance <= 500) {
                this.Tank.shoot()
            }
        }

        if(this.second >= this.intervalCountLimit) {
            this.intervalCount++

            this.second = 0
        }

        if(updateInterval) {
            this.intervalUpdate = 0
        }
    }
}