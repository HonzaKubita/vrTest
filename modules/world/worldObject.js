import * as THREE from "three";

export default class WorldObject {
    constructor(oimoObject, threeMesh) {
        this.oimoObject = oimoObject;
        this.threeMesh = threeMesh;

        this.positionController = "oimo";
    }

    update() {
        if (this.positionController == "oimo") {
            const position = this.oimoObject.getPosition();
            const quaternion = this.oimoObject.getQuaternion();
    
            this.threeMesh.position.copy(position);
            this.threeMesh.quaternion.copy(quaternion);
        }
        else if (this.positionController == "three") {
            const position = this.threeMesh.localToWorld(new THREE.Vector3(0, 0, 0));
            // const quaternion = this.threeMesh.getWorldQuaternion();

            this.oimoObject.setPosition(position);
            // this.oimoObject.setQuaternion(quaternion);
        }
    }

    addToScene(scene) {
        scene.add(this.threeMesh);
    }
}