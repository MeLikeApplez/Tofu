// https://github.com/jriecken/sat-js 
import SAT from 'sat'
import Tofu, { Color } from '../Tofu'

class Collision {
    // for collidable game objects
    static _MEMOIZE = {
        lastUpdated: 0,
        GameObjects: []
    }

    constructor(GameObject, NoClip=false) {
        this.GameObject = GameObject
        this.Hitbox = null
        this.NoClip = NoClip
        // this.ignore = []

        this.HandleCollisions = true
        this.Optimized = false
        this.OptimizeType = 'None'

        let geometryType = this.GameObject.Geometry ? this.GameObject.Geometry.GeometryType : null

        this.Shape = geometryType === 'Polygon' ? SAT.Polygon : (geometryType === 'Circle' ? SAT.Circle : null)
        this.ShapeType = geometryType
        this.SAT = null

        this.updateSAT()

        if(this.ShapeType) this.GameObject.Geometry.updateSAT = this.updateSAT.bind(this)
    }

    static pointInShape(x, y, sat) {
        let shape = sat.constructor.name

        if(shape === 'Polygon') {
            return SAT.pointInPolygon(new SAT.Vector(x, y), sat) 
        } else if(shape === 'Circle') {
            return SAT.pointInCircle(new SAT.Vector(x, y), sat) 
        }
    }

    static colliding(satA, satB) {
        let aShape = satA.constructor.name
        let bShape = satB.constructor.name
        let response = new SAT.Response()

        if(aShape === 'Polygon') {
            if(bShape === 'Polygon') return SAT.testPolygonPolygon(satA, satB, response) ? response : false

            return SAT.testPolygonCircle(satA, satB, response) ? response : false
        } else if(aShape === 'Circle') {
            if(bShape === 'Circle') return SAT.testCircleCircle(satA, satB, response) ? response : false

            return SAT.testCirclePolygon(satA, satB, response) ? response : false
        }
    }

    static getAllCollidables() {
        // update, filter the collidable game objects and store it
        if(Tofu.Scene._MEMOIZE.lastUpdate !== Collision._MEMOIZE.lastUpdated) {
            let GameObjects = Tofu.Scene.getGameObjects()
            let memoizeGameObjects = []

            // here to allow optimizations
            for(let i = 0; i < GameObjects.length; i++) {
                let gameObject = GameObjects[i]

                if(gameObject.Properties.isCollisionAllowed) {
                    memoizeGameObjects.push(gameObject)
                }
            }

            Collision._MEMOIZE.lastUpdated = Tofu.Scene._MEMOIZE.lastUpdate
            Collision._MEMOIZE.GameObjects = memoizeGameObjects
        }
        // else, return the most recent non-changed array of game objects

        return Collision._MEMOIZE.GameObjects
    }

    static getAllNoClips() {
        let collidables = this.getAllCollidables()
        let noclips = []

        for(let i = 0; i < collidables.length; i++) {
            let collidable = collidables[i]

            if(collidable.Collision.NoClip) noclips.push(collidable)
        }

        return noclips
    }

    // addIgnore(...GameObjects) {
    //     let updatedOnce = false

    //     for(let i = 0; i < GameObjects.length; i++) {
    //         let GameObject = GameObjects[i]

    //         if(!(GameObject instanceof TofuGameObject)) continue

    //         updatedOnce = true
    //         this.ignore.push(GameObject)
    //     }

    //     return updatedOnce
    // }

    // removeIgnore(...GameObjects) {
    //     let updatedOnce = false

    //     for(let i = 0; i < GameObjects.length; i++) {
    //         let GameObject = GameObjects[i]

    //         if(!(GameObject instanceof TofuGameObject)) continue

    //         updatedOnce = true
    //         this.ignore.splice(this.ignore.findIndex(g => g.UUID === GameObject.UUID), 1)
    //     }

    //     return updatedOnce
    // }

    toggleNoClip() {
        this.NoClip = !this.NoClip

        return this.NoClip
    }

    displayHitbox() {
        if(!this.ShapeType) return false
        if(this.Hitbox) {
            this.Hitbox = null

            return
        }

        let invertedColor = Color.invert(this.GameObject.Style.Color)
        // let geometry = this.GameObject.Geometry.constructor

        let hitbox = {
            Color: invertedColor,
            LineColor: invertedColor,
            LineWidth: 3,
            Alpha: 0.5,
            // CompositeOperation: 'lighter'
        }

        this.Hitbox = hitbox
    }

    getSATEdit(x=0, y=0, radius) {
        if(!this.ShapeType) return false

        if(this.ShapeType === 'Polygon') {
            let points = this.SAT.points
            let newSAT = []

            for(let i = 0; i < points.length; i++) {
                let point = points[i]

                newSAT.push(new SAT.Vector(point.x + x, point.y + y))
            }

            return new this.Shape(new SAT.Vector(), newSAT)
        } else if(this.ShapeType === 'Circle') {
            let point = this.SAT.pos
            radius = radius ?? this.SAT.r
            
            return new this.Shape(new SAT.Vector(point.x + x, point.y + y), radius)
        }
    }

    isColliding(x=0, y=0, { include=[], ignoreNoClip=false }={}) {
        if(!this.HandleCollisions) return false

        let editSAT = this.getSATEdit(x, y)
        let allCollidables = Collision.getAllCollidables()
        let response

        allCollidables.push(...include)

        for(let i = 0; i < allCollidables.length; i++) {
            let collider = allCollidables[i]

            if(this.GameObject === collider || (!ignoreNoClip && collider.Collision.NoClip)) continue

            response = Collision.colliding(editSAT, collider.Collision.SAT)

            if(response) return { response, colliding: collider }
        }

        return false
    }

    isCollidingMultiple(x=0, y=0, { include=[], ignoreNoClip=false }={}) {
        if(!this.HandleCollisions) return false

        let editSAT = this.getSATEdit(x, y)
        let allCollidables = Collision.getAllCollidables()
        let response
        let collisions = []

        allCollidables.push(...include)

        for(let i = 0; i < allCollidables.length; i++) {
            let collider = allCollidables[i]

            if(this.GameObject === collider || (!ignoreNoClip && collider.Collision.NoClip)) continue

            response = Collision.colliding(editSAT, collider.Collision.SAT)

            if(response) collisions.push({ response, colliding: collider })
        }

        return collisions
    }

    updateSAT() {
        if(!this.ShapeType) return false

        if(this.ShapeType === 'Polygon') {
            let points = this.GameObject.Geometry.points
            let vectorPoints = []

            for(let i = 0; i < points.length; i+=2) {
                vectorPoints.push(new SAT.Vector(points[i], points[i + 1]))
            }

            if(this.SAT) return this.SAT.setPoints(vectorPoints)

            this.SAT = new this.Shape(new SAT.Vector(), vectorPoints)
        } else if(this.ShapeType === 'Circle') {
            let { x, y, radius } = this.GameObject.Geometry

            this.SAT = new this.Shape(new SAT.Vector(x, y), radius)
        }
    }
}

export default Collision