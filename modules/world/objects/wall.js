import * as THREE from "three";
import * as CANNON from "cannon-es";
import PhysObject from "../templates/physObject";

export default class Cube extends PhysObject {
    constructor(size, staticObject=false) {
        // Create CANNON object
        const cannonBody = new CANNON.Body({
            // Calculate mass based on size
            mass: staticObject ? 0 : (size[0] * size[1] * size[2] * 2),
            // Calculate half extents based on size
            shape: new CANNON.Box(new CANNON.Vec3(...size.map((x) => x / 2))),
            // Add material
            material: new CANNON.Material({ friction: 0.2, restitution: 0.2}),
        });

        // Create three object
        const cubeTexture = new THREE.TextureLoader().load('/assets/textures/wall.png');
        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const material = new THREE.MeshStandardMaterial({
            map: cubeTexture,
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Call super constructor
        super(cannonBody, mesh);

        this.isGrabbable = !staticObject;
        this.grabDistance = size[0] / 2;
    }
}