export default class WorldObject {
    constructor(cannonObject, threeMesh) {
        this.cannonObject = cannonObject;
        this.threeMesh = threeMesh;
    }

    update() {
        // Update three object
        this.threeMesh.position.copy(this.cannonObject.position);
        this.threeMesh.quaternion.copy(this.cannonObject.quaternion);
    }

    addToScene(scene) {
        scene.add(this.threeMesh);
    }

    addToWorld(world) {
        world.addBody(this.cannonObject);
    }
}