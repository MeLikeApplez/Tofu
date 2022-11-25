import Tofu, { Calculate } from '../Tofu'
import TofuGameObject from './TofuGameObject'

export default class ParticleEffects extends TofuGameObject {
    constructor(options={}) {
        const { Geometry, Color: color, Colors, CompositeOperation, loop, update, begin, complete } = options

        super({ Geometry, CompositeOperation })
    
        this._options = options
        this.Geometries = []

        this.type = ''
        this.reverse = false // start from the end and end in the beginning

        this.amount = 0
        this.currentAmount = 0
        this.rate = 1
        this.interval = 1 // in seconds

        this.sign = 1
        this.range = [0, 360]
        this.speed = 1
        this.angle = 0
        this.size = 1

        this.fadeout = 0 // in seconds
        this.fadeoutAlpha = true

        this.loop = loop ?? false
        this.duration = Infinity // in seconds
        this.durationCount = 0
        this.delay = 0 // in seconds
        this.delayCount = 0

        this.Style.Color = color
        this.Style.Colors = Colors ?? []

        this.animationState = 'paused'
        this.animationCount = 0

        this.timelineOrderReady = false
        this.timelineOrder = []

        // event listeners
        this.update = []
        this.begin = []
        this.complete = []
    }

    spread(options={}) {
        const { color, amount, interval, rate, range, speed, size, fadeout, fadeoutAlpha, reverse, duration, delay } = options

        this.type = 'spread'
        this.reverse = reverse ?? false
        this.Style.Color = color ?? this.Style.Color

        
        this.amount = Calculate.Clamp(amount ?? 0, 0, Infinity)
        this.interval = Calculate.Clamp(interval ?? 1, 1, Infinity)
        this.rate = Math.floor(Calculate.Clamp(rate ?? 1, 1, Infinity))
        
        this.range = Array.isArray(range) ? range : [0, 360] // in a circle range 0deg - 360deg
        this.speed = Calculate.Clamp(speed ?? 1, 0, Infinity)
        this.size = Calculate.Clamp(size ?? 1, 1, Infinity)
        this.fadeout = Calculate.Clamp(fadeout ?? 0, 0, Infinity)
        this.fadeoutAlpha = fadeoutAlpha ?? true

        this.duration = Calculate.Clamp(duration ?? Infinity, 0, Infinity)
        this.delay = Calculate.Clamp(delay ?? 0, 0, Infinity)

        return this
    }

    direction(options={}) {
        const { color, reverse, amount, interval, rate, duration, delay, angle, speed, fadeout, fadeoutAlpha } = options

        this.type = 'direction'
        this.reverse = reverse ?? false
        this.Style.Color = color ?? this.Style.Color

        this.amount = Calculate.Clamp(amount ?? 0, 0, Infinity)
        this.interval = Calculate.Clamp(interval ?? 1, 1, Infinity)
        this.rate = Math.floor(Calculate.Clamp(rate ?? 1, 1, Infinity))

        this.speed = Calculate.Clamp(speed ?? 1, 0, Infinity)
        this.angle = angle ?? 0

        this.fadeout = Calculate.Clamp(fadeout ?? 0, 0, Infinity)
        this.fadeoutAlpha = fadeoutAlpha ?? true

        this.duration = Calculate.Clamp(duration ?? Infinity, 0, Infinity)
        this.delay = Calculate.Clamp(delay ?? 0, 0, Infinity)

        return this
    }

    addEventListener(type, callback) {
        if(typeof callback !== 'function') return

        if(type === 'update' || type === 'begin' || type === 'complete') this[type].push(callback)
    }

    get timeline() {
        const pushTimeline = (options, type) => {
            let tl = Tofu.ParticleEffects(this._options)

            this.timelineOrder.push(tl)

            tl[type](options)
        }
        // const pushTimeline = (options, type) => this.timelineOrder.push({ ...options, type })

        return {
            spread: function(options) {
                pushTimeline(options, 'spread')

                return this
            },
            direction: function(options) {
                pushTimeline(options, 'direction')

                return this
            },
            spiral: function(options) {
                pushTimeline(options, 'spiral')

                return this
            }
        }
    }

    RenderGeometry() {
        if(this.animationState === 'paused' || this.type === '') return
        const delta = Tofu.Animation.delta

        if(this.delay > 0) this.delayCount += delta

        if(this.delayCount >= this.delay) {

            if(this.duration !== Infinity) this.durationCount += delta

            // begin event
            if(this.animationCount <= 0 && this.begin.length > 0) this.begin.forEach(v => v())
            // begin event

            // update event
            if(this.update.length > 0) this.update.forEach(v => v())
            // update event

            // complete event
            if(this.durationCount + this.delayCount >= this.duration + this.delay && this.Geometries.length <= 0) {
                this.pause()

                if(this.complete.length > 0) return this.complete.forEach(v => v())
            }
            // complete event

            if(this.currentAmount < this.amount && this.durationCount <= this.duration) {
                let push = {}

                if(this.type === 'spiral') {
                    let setAngle = this.range[0] !== 0 ? this.range[0] : this.angle

                    // bounce = true && reverse = true <-- is not working properly

                    if(this.bounce) {
                        if((this.angle >= this.range[1] && this.sign === 1) || (this.angle <= this.range[0] && this.sign === -1)) this.sign *= -1

                        if(this.sign === -1) {
                            this.angle = setAngle - 1
                        } else {
                            this.angle = (this.reverse ? setAngle - 1 : setAngle + 1)
                        }
                    } else {
                        if(this.angle >= this.range[1]) {
                            setAngle = this.range[0]
                        } else if(this.angle <= this.range[0]) {
                            setAngle = this.range[1]
                        }

                        this.angle = (this.reverse ? setAngle - 1 : setAngle + 1)
                    }

                    
                }

                for(let i = 0; i < this.rate; i++) {
                    let newGeometry = new this.Geometry.constructor(...this.Geometry.GeometryParams)

                    switch(this.type) {
                        case 'spread': {
                            const { x, y } = Calculate.RandomPointInCircle(this.size, this.range[0], this.range[1])

                            push = { dx: x * 10 * this.size, dy: y * 10 * this.size }

                            if(this.reverse) {
                                newGeometry.position.x(push.dx)
                                newGeometry.position.y(push.dy)
                                
                                push.dx *= -1
                                push.dy *= -1
                            }

                            break
                        }
                        case 'direction': {
                            push = {
                                dx: Math.cos(Calculate.toRad(this.angle)) * 10 * this.speed,
                                dy: Math.sin(Calculate.toRad(this.angle)) * 10 * this.speed
                            }

                            if(this.reverse) {
                                newGeometry.position.x(push.dx * this.speed * this.fadeout)
                                newGeometry.position.y(push.dy * this.speed * this.fadeout)
                                
                                push.dx *= -1
                                push.dy *= -1
                            }

                            break
                        }
                        case 'spiral': {
                            push = {
                                dx: Math.cos(Calculate.toRad(this.angle * this.rotationSpeed)) * 10 * this.speed,
                                dy: Math.sin(Calculate.toRad(this.angle * this.rotationSpeed)) * 10 * this.speed
                            }

                            if(this.reverse) {
                                newGeometry.position.x(push.dx * this.speed * this.fadeout)
                                newGeometry.position.y(push.dy * this.speed * this.fadeout)
                                
                                push.dx *= -1
                                push.dy *= -1
                            }

                            break
                        }
                    }

                    push.Geometry = newGeometry
                    push.fadeout = 0
                    push.alpha = 1

                    this.Geometries.push(push)
                }

                this.animationCount += delta
                this.currentAmount += this.rate
            } else if(this.loop) {
                this.currentAmount = 0
            }
        }

        for(let i = 0; i < this.Geometries.length; i++) {
            let particle = this.Geometries[i]

            if(particle.fadeout >= this.fadeout) this.Geometries.splice(i, 1)
            if(this.fadeoutAlpha) particle.alpha = Calculate.Clamp(1 - (particle.fadeout / (this.fadeout)), 0, 1)

            particle.fadeout += delta

            particle.Geometry.position.x(particle.dx * delta * this.speed)
            particle.Geometry.position.y(particle.dy * delta * this.speed)

            super.RenderGeometry({ ...this.Style, Alpha: particle.alpha }, particle.Geometry)
        }
    }

    pause() {
        this.animationState = 'paused'

        for(let i = 0; i < this.timelineOrder.length; i++) {
            let tl = this.timelineOrder[i]

            tl.pause()
        }
        
        return this.animationState
    }

    play() {
        this.animationState = 'playing'

        this.reset()

        if(this.timelineOrder.length > 0 && !this.timelineOrderReady) {
            this.timelineOrderReady = true

            // not perfectly in sync yet
            for(let i = 0; i < this.timelineOrder.length - 1; i++) {
                let tl = this.timelineOrder[i]
                let next = this.timelineOrder[i + 1]
                
                tl.addEventListener('complete', () => {
                    console.log('next')
                    
                    next.play()
                })
            }
        }

        if(this.timelineOrder.length > 0) this.timelineOrder[0].play()
 
        return this.animationState
    }

    reset() {
        this.angle = 0
        this.durationCount = 0
        this.delayCount = 0
        this.animationCount = 0
        this.currentAmount = 0
    }

    stop() {
        this.remove()
    }

    remove() {
        this.animationState = 'removed'
        
        Tofu.Scene.remove(this)
    }
}