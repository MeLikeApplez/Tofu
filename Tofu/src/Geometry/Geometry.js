import { Calculate } from '../Tofu'
import Polygon from './Polygon'
import Box from './Box'
import Circle from './Circle'
import Text from './Text'

export default class Geometry {
    static Polygon = Polygon(this)
    static Box = Box(this)
    static Circle = Circle(this)
    static Text = Text(this)

    constructor(type, subType='') {
        this.GeometryType = type
        this.GeometrySubType = subType
        this.AngleType = 'DEGREE' // 'DEGREE' or 'RADIAN'
        this.Angle = 0

        this.updateSAT = () => null
    }

    getArrayPoints() {
        switch(this.GeometryType) {
            case 'Polygon': return Geometry.createArrayPoints(this.points)
            case 'Circle': return Geometry.createArrayPoints([this.x, this.y])
            case 'Text': return Geometry.createArrayPoints([this.x, this.y])
        }
    }

    getPoints() {
        switch(this.GeometryType) {
            case 'Polygon': return Geometry.createPoints(this.points)
            case 'Circle': return Geometry.createPoints([this.x, this.y])
            case 'Text': return Geometry.createPoints([this.x, this.y])
        }
    }

    getCenter() {
        switch(this.GeometryType) {
            case 'Polygon': return Calculate.center(...this.getPoints())
            case 'Circle': return { x: this.x, y: this.y }
            case 'Text': return { x: this.x, y: this.y }
        }
    }

    get position() {
        let ref = this

        return {
            x: function(x=0) {
                if(ref.GeometrySubType === 'Box' || ref.GeometryType === 'Circle' || ref.GeometryType === 'Text') {
                    ref.x += ref.GeometryType === 'Text' ? x / 2 : x
                }

                if(ref.GeometryType === 'Polygon') {
                    for(let i = 0; i < ref.points.length; i+=2) {
                        ref.points[i] += x
                    }
                }

                ref.updateSAT()
            },
            y: function(y=0) {
                if(ref.GeometrySubType === 'Box' || ref.GeometryType === 'Circle' || ref.GeometryType === 'Text') {
                    ref.y += y
                }
                
                if(ref.GeometryType === 'Polygon') {
                    for(let i = 1; i < ref.points.length; i+=2) {
                        ref.points[i] += y
                    }
                }

                ref.updateSAT()
            },
            setX: function(x=0) {
                this.x(x - ref.getPoints()[0].x)
            },
            setY: function(y=0) {
                this.y(y - ref.getPoints()[0].y)
            }
        }
    }

    get rotation() {
        let ref = this

        return {
            setAngleType: function(type) {
                if(ref.GeometryType === 'Text') return
                
                type = type.toUpperCase()

                if(!(type === 'RADIAN' || type === 'DEGREE')) return false
                if(type === ref.AngleType) return ref.Angle

                ref.AngleType = (type === 'RADIAN') ? 'RADIAN' : 'DEGREE'
                ref.Angle = ref.AngleType === 'RADIAN' ? Calculate.toRad(ref.Angle) : Calculate.toDeg(ref.Angle)
                
                return ref.Angle
            },
            set: function(angle=0, cx, cy) {
                if(ref.GeometryType === 'Text') return

                let currentAngle = ref.AngleType === 'RADIAN' ? Calculate.toDeg(ref.Angle) : ref.Angle

                this.rotate(angle - currentAngle, cx, cy)
            },
            rotate: function(angle=0, cx, cy) {
                if(ref.GeometryType === 'Text') return

                ref.Angle += angle

                if(ref.AngleType === 'DEGREE') angle = Calculate.toRad(angle)
                let { x, y } = ref.getCenter()

                cx = isNaN(cx) ? x : cx
                cy = isNaN(cy) ? y : cy

                let newPoints = Calculate.rotate(ref.getPoints(), angle, cx, cy)

                if(ref.GeometrySubType === 'Box' || ref.GeometryType === 'Circle') {
                    ref.x = newPoints[0].x
                    ref.y = newPoints[0].y
                 
                    ref.updateSAT()
                }
                
                if(ref.GeometryType === 'Polygon') {
                    let points = ref.points
                    
                    for(let i = 0, j = 0; i < points.length; i+=2) {
                        points[i] = newPoints[j].x
                        points[i + 1] = newPoints[j].y
                        j++
                    }

                    ref.updateSAT()
                    
                    return
                }
            }
        }
    }

    static createPoints(points) {
        let setPoints = []

        if(points.length % 2 === 1) points.splice(points.length - 1, 1)
        
        for(let i = 0; i < points.length; i+=2) {
            setPoints.push({ x: points[i], y: points[i + 1] })
        }

        return setPoints
    }

    static createArrayPoints(points) {
        let setPoints = []

        if(points.length % 2 === 1) points.splice(points.length - 1, 1)
        
        for(let i = 0; i < points.length; i+=2) {
            setPoints.push([points[i], points[i + 1]])
        }

        return setPoints
    }
}