export default Geometry => class Circle extends Geometry {
    constructor(x=0, y=0, radius=0) {
        super('Circle')

        this.GeometryParams = [x, y, radius]
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

    get radius() { return this.GeometryParams[2] }
    set radius(value) { 
        if(this.handleCollision) return this.GeometryParams[2]

        this.updateSAT()

        return this.GeometryParams[2] = value 
    }
}