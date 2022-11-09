export default Geometry => class Text extends Geometry {
    constructor(text='', x=0, y=0) {
        super('Text')

        this.GeometryParams = [text, x, y]
        this.Text = text
    }

    get x() { return this.GeometryParams[1] }
    set x(value) { 
        if(this.handleCollision) return this.GeometryParams[1]

        this.updateSAT()

        return this.GeometryParams[1] = value 
    }

    get y() { return this.GeometryParams[2] }
    set y(value) { 
        if(this.handleCollision) return this.GeometryParams[2]

        this.updateSAT()

        return this.GeometryParams[2] = value 
    }
}