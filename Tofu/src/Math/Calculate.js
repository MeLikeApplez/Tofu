class Calculate {
    static DEG = 180 / Math.PI
    static RAD = Math.PI / 180

    static Clamp(value, min, max) {
        return (value < min) ? min : (value > max) ? max : value
    }

    static ClampRadianRange(value, min=0, max=Math.PI) {
        return value >= min && value <= max ? value : (value < 0) ? -value % max : value % max
    }

    static ClampDegreeRange(value, min=0, max=360) {
        return value >= min && value <= max ? value : (value < 0) ? -value % max : value % max
    }

    static Random(min=0, max=1) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static RandomPoint(minX, maxX, minY, maxY) {
        return { x: this.Random(minX, maxX), y: this.Random(minY, maxY) }
    }

    static RandomPointInCircle(radius, minAngleDeg=0, maxAngleDeg=360) {
        let angle = (Math.random() * (maxAngleDeg - minAngleDeg) + minAngleDeg) / 180 * Math.PI
        // let angle = Math.random() * Math.PI * 2 + 0.01
        
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    }

    static resolution(ratio, pixels) {
        return { width: ratio * pixels, height: pixels }
    }

    static toRad(angle) {
        return angle * this.RAD
    }

    static toDeg(angle) {
        return angle * this.DEG
    }

    static distance(x1, y1, x2, y2) {
        let a = x1 - x2
        let b = y1 - y2

        return Math.sqrt(a * a + b * b)
    }

    static center(...points) {
        let sumX = 0
        let sumY = 0

        for(let i = 0; i < points.length; i++) {
            sumX += points[i].x
            sumY += points[i].y
        }

        return { x: sumX / points.length, y: sumY / points.length }
    }
    
    static rotate(points, rad, cx=0, cy=0) {
        let cos = Math.cos(rad)
        let sin = Math.sin(rad)

        for(let i = 0; i < points.length; i++) {
            let x = points[i].x
            let y = points[i].y

            points[i].x = (cos * (x - cx)) + (sin * (y - cy)) + cx
            points[i].y = (cos * (y - cy)) - (sin * (x - cx)) + cy
        }

        return points
    }

    static slopeToDeg(slope) {
        return this.toDeg(Math.atan(slope))
    }

    // https://www.desmos.com/calculator/ivmcurvllk
    // deflect(0, 0, x, y, wallSlope)
    static deflect(cx=0, cy=0, dx=0, dy=0, wallSlope=0) {
        let wall = this.slopeToDeg(wallSlope)
        let slope = this.slopeToDeg(dy / dx)
        let theta = 180 + (2 * (wall - slope))

        let distance = this.distance(cx, cy, dx, dy)
        let arctan = Math.atan2(dy - cy, dx - cx) + this.toRad(theta)

        let nx = Math.cos(arctan) * distance + cx
        let ny = Math.sin(arctan) * distance + cy
        
        return { x: nx, y: ny, deg: theta }
    }
}

export default Calculate