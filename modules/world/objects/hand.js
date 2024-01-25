import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as render from "../../render/render";
import WorldObject from "../templates/worldObject";
import PhysObject from "../templates/physObject";

const hitBoxSize = [0.05, 0.1, 0.2];
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
        if (this.side == "left")
            this.controller.add(render.models["robotic_hand_left"]);
        else if (this.side == "right")
            this.controller.add(render.models["robotic_hand_right"]);

        this.createHitbox();
        this.createGrabJoint();

        if (hitBoxDebug) this.enableDebug();
    }

    createHitbox() {
        // Connection diagram
        //    three          three         cannon        cannon         cannon         three
        // controller -> (hitboxPoint -> pointBody) -> constraint -> (hitboxBody -> hitboxMesh)
        //               --------physObject--------                  --------physObject--------

        // Create three hitboxPoint
        const hitboxPointGeometry = new THREE.SphereGeometry(0.02, 32, 32);
        const hitboxPointDebugMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const hitboxPointMesh = new THREE.Mesh(hitboxPointGeometry, hitboxPointDebugMaterial);
        // Hide the mesh
        hitboxPointMesh.visible = false;
        // Align the hitbox with the hand model
        hitboxPointMesh.position.x = this.side == "left" ? -0.025 : 0.025;
        hitboxPointMesh.position.y = -0.04;
        hitboxPointMesh.position.z = 0.05;
        // Add hitbox to controller
        this.controller.add(hitboxPointMesh);

        // Create cannon pointBody object
        const pointBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Sphere(1),
        });
        pointBody.collisionFilterGroup = 0
        pointBody.collisionFilterMask = 0

        // Create physObject for pointBody and hitboxPoint
        const hitboxPointObject = new PhysObject(pointBody, hitboxPointMesh, "three");

        // Create cannon hitboxBody object
        const hitboxBody = new CANNON.Body({
            mass: 5,
            // Calculate half extents based on size
            shape: new CANNON.Box(new CANNON.Vec3(...hitBoxSize.map((x) => x / 2))),
        });

        // Create three hitboxMesh
        const hitboxGeometry = new THREE.BoxGeometry(hitBoxSize[0], hitBoxSize[1], hitBoxSize[2]);
        const debugMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const hitboxMesh = new THREE.Mesh(hitboxGeometry, debugMaterial);
        // Hide the mesh
        hitboxMesh.visible = false;

        // Create physObject for hitboxBody and hitboxMesh
        const hitboxObject = new PhysObject(hitboxBody, hitboxMesh, "cannon");

        // Create constraint between pointBody and hitboxBody
        const cannonConstraint = new CANNON.LockConstraint(pointBody, hitboxBody);

        // Create hitbox object
        this.hitbox = {
            hitboxPointObject: hitboxPointObject,
            hitboxObject: hitboxObject,
            cannonConstraint: cannonConstraint,
        };
    }

    createGrabJoint() {
        // Create item attach joint
        const cannonJoint = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Sphere(1),
        });

        const grabJointGeometry = new THREE.SphereGeometry(0.02, 32, 32);
        const debugMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const grabJointMesh = new THREE.Mesh(grabJointGeometry, debugMaterial);

        // Hide the mesh
        grabJointMesh.visible = false;

        // Align the position with the hand model
        grabJointMesh.position.x = this.side == "left" ? 0.04 : -0.04;
        grabJointMesh.position.y = -0.04;
        grabJointMesh.position.z = 0.05;

        // Add grabJoint to controller
        this.controller.add(grabJointMesh);

        // Create grabJoint object
        this.grabJoint = {
            cannonJoint: cannonJoint,
            threeMesh: grabJointMesh
        }
    }

    enableDebug() {
        this.hitbox.hitboxObject.threeMesh.visible = true;
        this.grabJoint.threeMesh.visible = true;
    }

    // override update method
    update() {
        // Update hitboxPoint position based on controller position
        this.hitbox.hitboxPointObject.update();
        this.hitbox.hitboxObject.update();
        this.hitbox.cannonConstraint.update();

        // Update grabJoint position based on controller position
    }

    // override addToWorld method
    addToWorld(world) {
        world.addBody(this.hitbox.hitboxPointObject.cannonBody);
        world.addBody(this.hitbox.hitboxObject.cannonBody);
        world.addConstraint(this.hitbox.cannonConstraint);
    }

    // override addToScene method
    addToScene(scene) {
        super.addToScene(scene);
        scene.add(this.hitbox.hitboxObject.threeMesh);
    }
}