export default Geometry => class Box extends Geometry {
    constructor(x=0, y=0, width=0, height=0) {
        super('Polygon', 'Box')

        this.GeometryParams = [x, y, width, height]
        this.points = [x, y, width + x, y, width + x, height + y, x, height + y]
    }

    get x() { return this.GeometryParams[0] }
    set x(value) { 
        if(this.handleCollision) return this.GeometryParams[0]

        this.updateSAT()
        
        return this.GeometryParams[0] = value 
    }

    get y() { return this.GeometryParams[1] }
    set y(value) { 
        if(this.handleCollision) return this.GeometryParams[1]

        this.updateSAT()

        return this.GeometryParams[1] = value 
    }

    get width() { return this.GeometryParams[2] }
    set width(value) {
        if(this.handleCollision) return this.GeometryParams[2]

        let difference = value - this.GeometryParams[2]
        let angle = this.Angle
        let { x, y } = this.getCenter()

        this.rotation.set(0)

        this.points[2] += difference
        this.points[4] += difference

        this.rotation.set(angle, x, y)

        this.updateSAT()

        return this.GeometryParams[2] = value
    }

    get height() { return this.GeometryParams[3] }
    set height(value) {
        if(this.handleCollision) return this.GeometryParams[3]

        let difference = value - this.GeometryParams[3]
        let angle = this.Angle
        let { x, y } = this.getCenter()

        this.rotation.set(0)

        this.points[5] += difference
        this.points[7] += difference

        this.rotation.set(angle, x, y)

        this.updateSAT()

        return this.GeometryParams[3] = value
    }
}