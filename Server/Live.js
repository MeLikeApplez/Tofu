class Client {
    constructor() {
        this.socket = null
        this.timeCreated = new Date()
    }
}


class Live {
    constructor() {
        this.Room = new Map()
        this.Parties = new Map()
    }
}

module.exports = {
    Live: new Live(),
    Client,
}