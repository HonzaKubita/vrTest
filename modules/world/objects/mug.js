import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as render from "../../render/render";
import SimpleCustomObject from "../templates/SimpleCustomObject";

export default class Mug extends SimpleCustomObject {
    constructor() {
        const mugModel = render.models["mug"];

        // Create CANNON body
        const mugCannonBody = new CANNON.Body({
            mass: 0.3,
            shape: new CANNON.Cylinder(0.05, 0.05, 0.14, 32),
        });

        super(mugModel, mugCannonBody);

        // Add debug cylinder
        // const debugCylinder = new THREE.Mesh(
        //     new THREE.CylinderGeometry(0.055, 0.055, 0.14, 32),
        //     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        // );
        // this.mainThreeObject.add(debugCylinder);

        mugModel.scale.set(1.5, 1.5, 1.5);
        mugModel.rotation.y = Math.PI;
        mugModel.position.y = -0.07;

        // Correct rotation
        this.model.rotation.x = Math.PI / 2;

        this.isGrabbable = true;
        this.grabDistance = 0.2;
    }
}