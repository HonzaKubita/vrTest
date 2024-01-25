import * as THREE from "three";
import * as CANNON from "cannon-es";
import PhysObject from "./physObject";

export default class Cube extends PhysObject {
    constructor(size, staticObject=false) {
        // Create CANNON object
        const cannonObject = new CANNON.Body({
            // Calculate mass based on size
            mass: staticObject ? 0 : (size[0] * size[1] * size[2] * 2),
            // Calculate half extents based on size
            shape: new CANNON.Box(new CANNON.Vec3(...size.map((x) => x / 2))),
        });

        const textureLoader = new THREE.TextureLoader();

        // Create three object
        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load("/assets/textures/cube.jpeg"),
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Call super constructor
        super(cannonObject, mesh);
    }
}