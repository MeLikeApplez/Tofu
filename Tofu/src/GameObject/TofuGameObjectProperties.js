export default class TofuGameObjectProperties {
    constructor(GameObject) {
        this.GameObject = GameObject

        this.isInTheScene = false
    }

    get isCollisionAllowed() { return !!this.GameObject.Collision }
    get isHandleCollisionsAllowed() { return this.isCollisionAllowed ? this.GameObject.Collision.HandleCollisions : false }
}