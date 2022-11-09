export default Geometry => class Polygon extends Geometry {
    constructor(...points) {
        super('Polygon')

        this.GeometryParams = points
        this.points = points
    }
}
