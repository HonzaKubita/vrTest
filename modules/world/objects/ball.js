import * as THREE from "three";
import * as CANNON from "cannon-es";
import PhysObject from "../templates/physObject";

export default class Ball extends PhysObject {
    constructor(radius, staticObject=false) {
        // Create CANNON object
        const cannonBody = new CANNON.Body({
            // Calculate mass based on size
            mass: staticObject ? 0 : (radius * 1),
            // Calculate half extents based on size
            shape: new CANNON.Sphere(radius),
            material: new CANNON.Material({ friction: 10, restitution: 4 }),
        });

        const textureLoader = new THREE.TextureLoader();

        // Create three object
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load("/assets/textures/ball.jpeg"),
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Call super constructor
        super(cannonBody, mesh);

        this.isGrabbable = !staticObject;
        this.grabDistance = radius;
    }
}