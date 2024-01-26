import * as THREE from "three";
import PhysObject from "./physObject";

export default class SimpleCustomObject extends PhysObject {
    constructor(model, cannonBody) {
        // Create main object so we can offset the model from the center of cannonBody
        const mainThreeObject = new THREE.Object3D();

        super(cannonBody, mainThreeObject);

        this.mainThreeObject = mainThreeObject;
        this.model = model;
        // Add model to main object
        mainThreeObject.add(this.model);
    }
}