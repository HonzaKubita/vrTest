import * as THREE from "three";
import * as CANNON from "cannon-es";
import PhysObject from "../templates/physObject";

export default class Cube extends PhysObject {
    constructor(size, staticObject=false) {
        // Create CANNON object
        const cannonBody = new CANNON.Body({
            // Calculate mass based on size
            mass: staticObject ? 0 : (size[0] * size[1] * size[2] * 1),
            // Calculate half extents based on size
            shape: new CANNON.Box(new CANNON.Vec3(...size.map((x) => x / 2))),
        });

        const textureLoader = new THREE.TextureLoader();

        // Create three object
        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load("/assets/textures/cube2.png"),
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Call super constructor
        super(cannonBody, mesh);

        this.isGrabbable = !staticObject;
        this.grabRadius = size / 2;
    }
}