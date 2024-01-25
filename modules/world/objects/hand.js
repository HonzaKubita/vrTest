import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as render from "../../render/render";
import WorldObject from "../worldObject";

const hitBoxSize = [0.02, 0.1, 0.2];
const hitBoxDebug = true;

export default class Hand extends WorldObject {
    constructor(controllerIndex, side) {
        // Get controller object
        const controller = render.renderer.xr.getController(controllerIndex);

        // Initialize world object
        super(null, controller);

        this.side = side;
        this.controller = controller;

        // Add hand models to controllers
        if (this.side === "left")
            this.controller.add(render.models["robotic_hand_left"]);
        else if (this.side === "right")
            this.controller.add(render.models["robotic_hand_right"]);

        this.createHitbox();

        if (hitBoxDebug) this.enableDebug();
    }

    createHitbox() {
        // Create CANNON hitbox object
        const cannonHitboxObject = new CANNON.Body({
            // Calculate mass based on size
            mass: 0,
            // Calculate half extents based on size
            shape: new CANNON.Box(new CANNON.Vec3(...hitBoxSize.map((x) => x / 2))),
        });

        const hitboxGeometry = new THREE.BoxGeometry(hitBoxSize[0], hitBoxSize[1], hitBoxSize[2]);
        const debugMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const hitboxMesh = new THREE.Mesh(hitboxGeometry, debugMaterial);

        // Align the hitbox with the hand model
        hitboxMesh.position.x = this.side === "left" ? -0.025 : 0.025;
        hitboxMesh.position.y = -0.04;
        hitboxMesh.position.z = 0.05;

        // Add hitbox to controller
        this.controller.add(hitboxMesh);

        // Create hitbox object
        this.hitbox = {
            cannonObject: cannonHitboxObject,
            threeMesh: hitboxMesh,
        };
    }

    enableDebug() {
        this.threeMesh.castShadow = true;
        this.threeMesh.receiveShadow = true;
    }

    // override update method
    update() {
        if (!this.hitbox.threeMesh || !this.hitbox.cannonObject) return;
        // Update CANNON object position based on controller position
        this.hitbox.cannonObject.position.copy(this.hitbox.threeMesh.getWorldPosition(new THREE.Vector3()));
        this.hitbox.cannonObject.quaternion.copy(this.hitbox.threeMesh.getWorldQuaternion(new THREE.Quaternion()));
    }

    // override addToWorld method
    addToWorld(world) {
        world.addBody(this.hitbox.cannonObject);
    }
}