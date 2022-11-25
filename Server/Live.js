class Room {
    constructor(host) {
        this.Clients = new Map()
        this.Max = 4
        this.Code = ''
        this.Status = 'Closed'        
    }

    static Host() {

    }

    static Member() {

    }

    join() {

    }

    remove() {

    }
}

class Client {
    constructor(socket) {
        this.socket = socket
        this.timeCreated = new Date()

        this.sid = socket.id
        this.uuid = ''
    }
}


class Live {
    constructor() {
        this.Rooms = new Map()
    }
}

module.exports = {
    Live: new Live(),
    Client,
}