import { Calculate } from './Tofu'

export default class Color {
    constructor(values, format, type) {
        if(!(values && format && type)) return Color

        const entries = Object.entries(values)

        for(let i = 0; i < entries.length; i++) {
            let [ key, value ] = entries[i]

            this[key] = value
        }

        this.format = format || ''
        this.type = type || ''
    }

    generateRandomColor() {
        if(this.type === 'rgb') return Color.random.rgb()
        if(this.type === 'hsl') return Color.random.hsl()
        if(this.type === 'hex') return Color.random.hex()
    }

    // https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
    static hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100
        const f = n => {
            const k = (n + h / 30) % 12
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
            return Math.round(255 * color).toString(16).padStart(2, '0')   // convert to Hex and prefix "0" if needed
        }
        
        return `${f(0)}${f(8)}${f(4)}`
      }

    static get random() {
        let { rgb, hsl, hex } = this

        return {
            rgb: () => rgb(Calculate.Random(0, 255), Calculate.Random(0, 255), Calculate.Random(0, 255)),
            hsl: () => hsl(Calculate.Random(0, 360), Calculate.Random(0, 100), Calculate.Random(0, 100)),
            hex: () => hex(Calculate.Random(0, 0xffffff))
        }
    }

    static parse(value) {
        let type = typeof value

        if(value instanceof Color) {
            return value.format
        } else if(type === 'string') {
            return value
        } else if(type === 'number') {
            return this.hex(value).format
        }

        return null
    }

    static invert(value) {
        let parse = this.parse(value) || ''
        // https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
        let invertHex = hex => (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()

        if(parse.includes('#')) return '#' + invertHex(parseInt(parse.replace('#', '0x'), 16))
       
        if(parse.includes('rgb')) {
            let toHex = v => {
                let h = v.toString(16)

                return h.length == 1 ? '0' + h : h
            }
            let rgbValues = parse.match(/\d+/g).map(v => parseInt(v))

            return '#' + invertHex(toHex(rgbValues[0]) + toHex(rgbValues[1]) + toHex(rgbValues[2]))
        } else if(parse.includes('hsl')) {
              let hslValues = parse.match(/\d+/g).map(v => parseInt(v))

              return invertHex(parseInt('0x' + this.hslToHex(...hslValues), 16))
        }

        return null
    }

    static rgb(r=0, g=0, b=0, a=1) {
        r = Calculate.Clamp(r, 0, 255)
        g = Calculate.Clamp(g, 0, 255)
        b = Calculate.Clamp(b, 0, 255)
        a = Calculate.Clamp(a, 0, 1)
        
        return new Color({ r, g, b, a }, `rgba(${r}, ${g}, ${b}, ${a})`, 'rgb')
    }

    static hsl(hue=0, saturation=0, lightness=0) {
        hue = Calculate.Clamp(hue, 0, 360)
        saturation = Calculate.Clamp(saturation, 0, 100)
        lightness = Calculate.Clamp(lightness, 0, 100)

        return new Color({ hue, saturation, lightness }, `hsl(${hue}, ${saturation}%, ${lightness}%)`, 'hsl')
    }

    static hex(hex=0x0) {
        hex = Calculate.Clamp(hex, 0, 0xffffff)
        let str = hex.toString(16)

        return new Color({ hex: `0x${str}`, int: hex }, `#${str}`, 'hex')
    }
}