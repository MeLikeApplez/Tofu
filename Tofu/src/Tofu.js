import _Animation from './Animation'
import Controller from './Controller'

import SocketClient from './Multiplayer/SocketClient'
import Scene from './Scene'

import _TofuGameObject from './GameObject/TofuGameObject'
import _Calculate from './Math/Calculate'
import _Collision from './Physics/Collision'
import _Geometry from './Geometry/Geometry'
import _Color from './Color'
import _Particle from './GameObject/Particle'

import SAT from 'sat'

export const TofuGameObject = _TofuGameObject
export const Particle = _Particle
export const Animation = new _Animation()
export const Collision = _Collision
export const Geometry = _Geometry
export const Color = _Color
export const Calculate = _Calculate

export class Helpers {
    static freezeProperty(object, prop, value) {
        return Object.defineProperty(object, prop, {
            value, writable: false, configurable: false
        })
    }
}

class Tofu {
    constructor() {
        this.Scripts = []

        this.defaultsCanvas = {
            backgroundColor: 'rgb(40, 40, 40)',
            color: 'white',
            lineColor: 'white', lineWidth: 1,
            fontSize: 16, fontFamily: 'Arial',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            startAngle: 0, endAngle: 360
        }

        this.currentCanvas = { ...this.defaultsCanvas }
        this.existingImages = []

        this.Animation = Animation
        this.SocketClient = SocketClient

        this.Helpers = Helpers
    }

    Mesh(options={}) {
        let GameObject = new TofuGameObject(options)

        this.Scene.add(GameObject)

        return GameObject
    }

    Particle(options={}) {
        let GameObject = new Particle(options)

        this.Scene.add(GameObject)

        return GameObject
    }

    // <Drawing>

    getTextSize(text='', fontSize=this.currentCanvas.fontSize) {
        this.canvasContext.font = `${fontSize}px ${this.currentCanvas.fontFamily}`

        const metric = this.canvasContext.measureText(text)

        this.canvasContext.font = `${this.currentCanvas.fontSize}px ${this.currentCanvas.fontFamily}`
        
        return metric
    }

    resetCanvas() {
        this.currentCanvas = { ...this.defaultsCanvas }
    }

    getBackgroundColor() {
        return window.getComputedStyle(this.canvasElement).backgroundColor
    }

    setBackgroundColor(color) {
        color = color || this.defaultsCanvas.backgroundColor

        this.canvasElement.style.backgroundColor = color

        return this.getBackgroundColor()
    }

    setGlobalAlpha(alpha) {
        this.currentCanvas.globalAlpha = !isNaN(alpha) ? alpha : this.defaultsCanvas.globalAlpha

        return this
    }

    setGlobalCompositeOperation(gco) {
        this.currentCanvas.globalCompositeOperation = gco || this.defaultsCanvas.globalCompositeOperation

        return this
    }

    setColor(color) {
        this.currentCanvas.color = color || this.defaultsCanvas.color

        return this
    }

    setLineColor(color) {
        this.currentCanvas.lineColor = color || this.defaultsCanvas.lineColor

        return this
    }

    setLineWidth(width) {
        this.currentCanvas.lineWidth = !isNaN(width) ? width : this.defaultsCanvas.lineWidth

        return this
    }

    setFontSize(size) {
        this.currentCanvas.fontSize = !isNaN(size) ? size : this.defaultsCanvas.fontSize

        return this
    }

    setFontFamily(family) {
        this.currentCanvas.fontFamily = family ?? this.defaultsCanvas.fontFamily

        return this
    }

    line(x1, y1, x2, y2) {
        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.linePolygon(x1, y1, x2, y2)

        return this
    }

    fillRect(x, y, width, height) {
        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()
        this.canvasContext.rect(x, y, width, height)

        this.canvasContext.fillStyle = this.currentCanvas.color
        
        this.canvasContext.fill()

        return this
    }

    lineRect(x, y, width, height) {
        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()
        this.canvasContext.rect(x, y, width, height)

        this.canvasContext.strokeStyle = this.currentCanvas.lineColor
        this.canvasContext.lineWidth = this.currentCanvas.lineWidth

        this.canvasContext.stroke()

        return this
    }

    linePolygon(...coordinates) {
        if(coordinates.length % 2 === 1) coordinates.splice(coordinates.length - 1, 1)

        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()

        for(let i = 0; i < coordinates.length; i += 2) {
            let x = coordinates[i]
            let y = coordinates[i + 1]

            this.canvasContext.lineTo(x, y)
        }

        this.canvasContext.strokeStyle = this.currentCanvas.lineColor
        this.canvasContext.lineWidth = this.currentCanvas.lineWidth

        this.canvasContext.closePath()
        this.canvasContext.stroke()

        return this
    }

    fillPolygon(...coordinates) {
        if(coordinates.length % 2 === 1) coordinates.splice(coordinates.length - 1, 1)

        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()

        for(let i = 0; i < coordinates.length; i += 2) {
            let x = coordinates[i]
            let y = coordinates[i + 1]

            this.canvasContext.lineTo(x, y)
        }

        this.canvasContext.fillStyle = this.currentCanvas.color

        this.canvasContext.fill()
        this.canvasContext.closePath()

        return this
    }

    lineCircle(x, y, radius) {
        const rad = Math.PI / 180

        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()

        this.canvasContext.arc(x, y, radius, this.currentCanvas.startAngle * rad, this.currentCanvas.endAngle * rad)
        
        this.canvasContext.strokeStyle = this.currentCanvas.lineColor
        this.canvasContext.lineWidth = this.currentCanvas.lineWidth

        this.canvasContext.stroke()
        this.canvasContext.closePath()

        return this
    }

    fillCircle(x, y, radius) {
        const rad = Math.PI / 180

        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.beginPath()

        this.canvasContext.arc(x, y, radius, this.currentCanvas.startAngle * rad, this.currentCanvas.endAngle * rad)
        
        this.canvasContext.fillStyle = this.currentCanvas.color

        this.canvasContext.fill()
        this.canvasContext.closePath()

        return this
    }

    lineText(text, x, y) {
        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.save()
        this.canvasContext.translate(x, y * 2)
        this.canvasContext.scale(1, -1)

        this.canvasContext.font = `${this.currentCanvas.fontSize}px ${this.currentCanvas.fontFamily}`
        this.canvasContext.strokeStyle = this.currentCanvas.lineColor
        this.canvasContext.lineWidth = this.currentCanvas.lineWidth

        this.canvasContext.strokeText(text, x, y)

        this.canvasContext.restore()

        return this
    }

    fillText(text, x, y) {
        this.canvasContext.globalAlpha = this.currentCanvas.globalAlpha
        this.canvasContext.globalCompositeOperation = this.currentCanvas.globalCompositeOperation

        this.canvasContext.save()
        this.canvasContext.translate(x, y * 2)
        this.canvasContext.scale(1, -1)

        this.canvasContext.font = `${this.currentCanvas.fontSize}px ${this.currentCanvas.fontFamily}`
        this.canvasContext.fillStyle = this.currentCanvas.color

        this.canvasContext.fillText(text, x, y)

        this.canvasContext.restore()

        return this
    }

    image(src, x, y, width, height) {
        let img = new window.Image(width, height)
        img.src = src

        if(!this.existingImages.some(v => v === src)) {
            document.body.appendChild(img)

            this.existingImages.push(src)
        }
        
        this.canvasContext.save()

        this.canvasContext.translate(0, height + y * 2)
        this.canvasContext.scale(1, -1)

        this.canvasContext.drawImage(img, x, y, width, height)

        this.canvasContext.restore()

        return this
    }

    // <Drawing>

    toGlobal(obj) {
        let keys = Object.keys(obj)
    
        for(let i = 0; i < keys.length; i++) {
            window[keys[i]] = obj[keys[i]]
        }
    }

    Engine(canvas, width, height) {
        this.canvasElement = canvas
        this.canvasContext = canvas.getContext('2d')

        this.Scene = new Scene(canvas, width, height)
        this.Controller = new Controller(canvas)

		this.toGlobal({ Tofu: this, Scene: this.Scene, Collision, Geometry, Color, Calculate, SAT })
    }

    addScript(Init, Draw) {
        if(typeof Init !== 'function' || typeof Draw !== 'function') return false

        this.Scripts.push({ Init, Draw })

        return true
    }
}

export default new Tofu()