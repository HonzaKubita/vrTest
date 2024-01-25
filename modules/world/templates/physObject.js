import * as THREE from "three";
import WorldObject from "./worldObject";

export default class PhysObject extends WorldObject {
    constructor(cannonBody, threeMesh, controller="cannon") {
        super(cannonBody, threeMesh);

        this.controller = controller;

        this.enablePositionCopy = true;
        this.enableQuaternionCopy = true;
    }

    update() {
        if (!this.cannonBody || !this.threeMesh) return;
        // Update three object position based on CANNON object position
        if (this.controller == "cannon") {
            if(this.enablePositionCopy)
                this.threeMesh.position.copy(this.cannonBody.position);
            if (this.enableQuaternionCopy)
                this.threeMesh.quaternion.copy(this.cannonBody.quaternion);
        }
        else if (this.controller == "three") {
            if(this.enablePositionCopy)
                this.cannonBody.position.copy(this.threeMesh.getWorldPosition(new THREE.Vector3()));
            if (this.enableQuaternionCopy)
                this.cannonBody.quaternion.copy(this.threeMesh.getWorldQuaternion(new THREE.Quaternion()));
        }
    }
}