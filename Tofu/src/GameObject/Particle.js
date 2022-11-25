import Tofu, { Calculate } from '../Tofu'
import TofuGameObject from './TofuGameObject'

export default class Particle extends TofuGameObject {
    constructor(options={}) {
        const { Geometry, Color, Colors, CompositeOperation, ColorCycle, x, y,
             spiralBounce, spreadSpeed, spread, range, amount, amountSlice, loop, interval, fadeout, fadeoutType } = options

        super({ Geometry, CompositeOperation })

        this.Geometries = []

        this.x = x ?? 0
        this.y = y ?? 0

        this.sign = 1
        this.spread = spread ?? 'circle' // 'circle' or 'range' or 'spiral'
        this.spreadSpeed = spreadSpeed ?? 0.5
        this.spiralBounce = spiralBounce ?? true
        this.range = this.spread === 'spiral' ? [0, 0, ...(range ?? [0, 360])] : (range ?? [0, 360]) // 'circle' => [minDeg, maxDeg], 'range' => [x-min, x-max, y-min, y-max], 'spiral' => [mixDeg, maxDeg]
        this.interval = Calculate.Clamp(interval ?? 1000, 1, Infinity) // millisecond intervals of every newly made geometry
        this.currentInterval = 0 // track current interval every frame render
        this.fadeoutType = fadeoutType ?? 'opacity' // 'opacity' or 'instant'
        this.fadeout = Calculate.Clamp(fadeout ?? 1000, 0, Infinity) // millisecond fadeout time

        if(this.spread === 'spiral') {
            this.range[0] = this.range[2]
            this.range[1] = this.range[2]
        }

        // 'random', 'ascend' or 'decend' choosing which color
        this.Style.ColorCycle = ColorCycle ?? 'ascend'
        this.Style.Colors = Array.isArray(Colors) ? Colors : [Color]
        this.Style.Color = Color || null
        this.Style.ColorIndex = 0

        this.loop = loop ?? false
        this.amount = Calculate.Clamp(amount ?? 0, 0, Infinity)
        this.amountSlice = Calculate.Clamp(amountSlice ?? 1, 0, this.amount)
        this.currentAmount = 0

        this.animationState = 'paused'
        this.animationDuration = Infinity
        this.animationCount = 0
        
        // event listeners
        this.onStop = null
        this.onPause = null
    }

    spreadParticle(options={}) {
        const { loop, CompositeOperation, interval } = options

        this.loop = loop ?? this.loop
        this.CompositeOperation = CompositeOperation ?? this.CompositeOperation
        this.interval = Calculate.Clamp(interval ?? 1000, 1, Infinity)

        return this
    }

    spiralParticle(options={}) {
        const { loop, CompositeOperation, interval } = options

        this.loop = loop ?? this.loop
        this.CompositeOperation = CompositeOperation ?? this.CompositeOperation
        this.interval = Calculate.Clamp(interval ?? 1000, 1, Infinity)

        return this
    }

    pause() {
        this.animationState = 'paused'

        this.animationDuration = Infinity
        this.animationCount = 0

        if(typeof this.onPause === 'function') this.onPause()

        return this.animationState
    }

    play(duration=Infinity) {
        this.animationState = 'playing'

        this.animationDuration = Calculate.Clamp(duration, 0, Infinity)
        this.animationCount = 0

        return this.animationState
    }

    stop() {
        this.animationState = 'stopped'

        if(typeof this.onStop === 'function') this.onStop()

        return this.animationState
    }

    remove() {
        Tofu.Scene.remove(this)

        Object.defineProperty(this, 'animationState', {
            configurable: false,
            writable: false,
            value: 'removed'
        })

        return this.animationState
    }

    RenderGeometry() {
        if(this.animationState === 'stopped') return this.animationState
        let delta = Tofu.Animation.delta

        if(this.animationDuration !== Infinity) {
            this.animationCount += delta

            if(this.animationCount >= this.animationDuration) this.pause()
        }

        if(this.animationState === 'playing' && this.currentAmount < this.amount) {
            this.currentInterval += delta

            if(this.currentInterval >= this.interval / 1000) {
                for(let i = 0; i < this.amountSlice; i++) {
                    let newGeometry = new this.Geometry.constructor(...this.Geometry.GeometryParams)
                
                    if(this.spread === 'spiral') {
                        let min = this.range[2]
                        let max = this.range[3]

                        if(this.spiralBounce && this.range[0] > max || this.range[0] < min) this.sign *= -1

                        let step = ((max - min) / this.amount) * this.sign
                        
                        this.range[0] = this.range[0] + step
                        this.range[1] = this.range[0]
                    }

                    let offset = this.spread === 'circle' || this.spread === 'spiral' ? 
                        Calculate.RandomPointInCircle(this.spreadSpeed, ...this.range) 
                        : Calculate.RandomPoint(...this.range)
                    let color

                    // console.log(this.currentAmount)

                    // 'random', 'ascend', 'decend' or 'default' choosing which color
                    if(this.Style.ColorCycle === 'random') {
                        color = this.Style.Colors[Calculate.Random(0, this.Style.Colors.length)]
                    } else if(this.Style.ColorCycle === 'ascend') {
                        if(++this.Style.ColorIndex >= this.Style.Colors.length) this.Style.ColorIndex = 0

                        color = this.Style.Colors[this.Style.ColorIndex]
                    } else if(this.Style.ColorCycle === 'decend') {
                        if(--this.Style.ColorIndex <= 0) this.Style.ColorIndex = this.Style.Colors.length
        
                        color = this.Style.Colors[this.Style.ColorIndex]
                    }

                    if(this.x !== 0) newGeometry.position.setX(this.x)
                    if(this.y !== 0) newGeometry.position.setY(this.y)

                    this.Geometries.push({
                        Geometry: newGeometry, offset, fadeout: 0, alpha: 1, color
                    })

                    this.currentInterval = 0
                    this.currentAmount++
                }
            }
        } else {
            if(this.loop) this.currentAmount = 0
        }

        if(!this.loop && this.currentAmount >= this.amount) {
            this.pause()
        }
        
        for(let i = 0; i < this.Geometries.length; i++) {
            let particle = this.Geometries[i]

            if(particle.fadeout >= this.fadeout / 1000) this.Geometries.splice(i, 1)
            if(this.fadeoutType === 'opacity') {
                particle.alpha = Calculate.Clamp(1 - (particle.fadeout / (this.fadeout / 1000)), 0, 1)
            }

            super.RenderGeometry({ ...this.Style, Alpha: particle.alpha, Color: particle.color }, particle.Geometry)

            particle.fadeout += delta

            particle.Geometry.position.x(particle.offset.x)
            particle.Geometry.position.y(particle.offset.y)
        }
        
    }
}