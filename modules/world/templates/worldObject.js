export default class WorldObject {
    constructor(cannonBody=null, threeMesh=null) {
        this.cannonBody = cannonBody;
        this.threeMesh = threeMesh;
    }

    update() {}

    addToScene(scene) {
        if (this.threeMesh)
            scene.add(this.threeMesh);
    }

    addToWorld(world) {
        if (this.cannonBody)
            world.addBody(this.cannonBody);
    }
}