export default class WorldObject {
    constructor(cannonObject=null, threeMesh=null) {
        this.cannonObject = cannonObject;
        this.threeMesh = threeMesh;
    }

    update() {}

    addToScene(scene) {
        if (this.threeMesh)
            scene.add(this.threeMesh);
    }

    addToWorld(world) {
        if (this.cannonObject)
            world.addBody(this.cannonObject);
    }
}