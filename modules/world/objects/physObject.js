import WorldObject from "../worldObject";

export default class PhysObject extends WorldObject {
    constructor(cannonObject, threeMesh) {
        super(cannonObject, threeMesh);

        this.enablePositionCopy = true;
        this.enableQuaternionCopy = true;
    }

    update() {
        if (!this.cannonObject || !this.threeMesh) return;
        // Update three object position based on CANNON object position
        if(this.enablePositionCopy)
            this.threeMesh.position.copy(this.cannonObject.position);
        if (this.enableQuaternionCopy)
            this.threeMesh.quaternion.copy(this.cannonObject.quaternion);
    }
}