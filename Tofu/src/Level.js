import { Color } from './Tofu'

export class LevelMap {
    constructor(obstacles=[], tanks=[]) {
        this.Obstacles = [...obstacles]
        this.Tanks = [...tanks]
    }

    stringify(spaces=0) {
        return JSON.stringify(this, null, spaces)
    }
}

export default class Level {
    get ObstacleTemplete() {
        return {
            Color: Color.rgb(),
            x: 0, y: 0, width: 0, height: 0,
        }
    }

    get TankTemplete() {
        return {
            Nametag: '',
            BodyColor: Color.rgb(), BarrelColor: Color.rgb(), type: 'Player/AI',
            AI: {},
            x: 0, y: 0
        }
    }

    // map = { Obstacles: [{ ... }, { ... }], Tanks: [{ ... }, { ... }] }
    create(map={}) {
        if(map?.Obstacles) {
            for(let i = 0; i < map.Obstacles.length; i++) {
                let obstacle = map.Obstacles[i]

                map.Obstacles[i] = { ...this.ObstacleTemplete, ...obstacle }

                // Object.assign(this.ObstacleTemplete, obstacle)
            }
        }

        if(map?.Tanks) {
            for(let i = 0; i < map.Tanks.length; i++) {
                let tank = map.Tanks[i]

                map.Tanks[i] = { ...this.TankTemplete, ...tank }

                // Object.assign(this.TankTemplete, tank)
            }
        }

        let levelMap = new LevelMap(map.Obstacles, map.Tanks)

        return levelMap
    }

    edit(levelMap, map) {
        return levelMap
    }

    isLevelMap(map) {
        if(typeof map !== 'object') return false

        if(map?.Obstacles) {
            let oKeys = Object.keys(this.ObstacleTemplete)

            for(let i = 0; i < map.Obstacles.length; i++) {
                let obstacle = Object.keys(map.Obstacles[i])

                for(let j = 0; j < oKeys.length; j++) {
                    if(!obstacle.includes(oKeys[j])) return false
                }
            }
        }

        if(map?.Tanks) {
            let tKeys = Object.keys(this.TankTemplete)

            for(let i = 0; i < map.Tanks.length; i++) {
                let tank = Object.keys(map.Tanks[i])

                for(let j = 0; j < tKeys.length; j++) {
                    if(!tank.includes(tKeys[j])) return false
                }
            }
        }

        return map instanceof LevelMap
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
    saveToLocalStorage() {

    }

    getFromLocalStorage() {

    }
}