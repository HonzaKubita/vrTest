import * as THREE from "three";
import * as physics from "../../physics/physics";
import WorldObject from "../worldObject";

export default class Cube extends WorldObject {
    constructor(size, position, quaternion, move=true) {
        // Create oimo physics object
        const oimoObject = physics.world.add({
            type: "box",
            size: size,
            pos: position,
            rot: quaternion,
            move: move,
            density: 1
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
        super(oimoObject, mesh);
    }
}