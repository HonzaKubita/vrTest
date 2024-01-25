import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as render from "../../render/render";
import * as physics from "../../physics/physics";
import objects from "../worldObjects";
import WorldObject from "../templates/worldObject";
import PhysObject from "../templates/physObject";

const hitBoxSize = [0.05, 0.1, 0.2];
const hitBoxDebug = false;
const grabPointDebug = false;

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
            this.controller.add(render.models["hand"]);
        else if (this.side == "right")
            this.controller.add(render.models["hand2"]);
        
        this.correctHandModel();
        this.createHitbox();
        this.createGrabPoint();

        // Register event listeners for grabbing
        this.controller.addEventListener("selectstart", (event) => {
            this.onGrab();
        });
        this.controller.addEventListener("selectend", (event) => {
            this.onRelease();
        });
        this.grabbing = false;

        this.debug();
    }

    correctHandModel() {
        console.log(render.models["hand"]);
        if (this.side == "left")
            render.models["hand"].applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));

        // Rotate the hands (dialed in for Meta Quest 3)
        // Left hand
        render.models["hand"].rotation.x = -(Math.PI / 2);

        render.models["hand"].position.x = -0.025;
        render.models["hand"].position.y = -0.04;
        render.models["hand"].position.z = 0.14;

        // Right hand
        render.models["hand2"].rotation.x = -(Math.PI / 2);

        render.models["hand2"].position.x = 0.025;
        render.models["hand2"].position.y = -0.04;
        render.models["hand2"].position.z = 0.14;
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

    createGrabPoint() {
        // Connection diagram
        //   three          three         cannon           cannon      grabbableItem
        // controller -> (grabPoint -> grabPointBody) -> constraint -> item

        // Create grabPoint
        const grabPointGeometry = new THREE.SphereGeometry(0.02, 32, 32);
        const debugMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const grabPointMesh = new THREE.Mesh(grabPointGeometry, debugMaterial);
        // Hide the mesh
        grabPointMesh.visible = false;
        // Align the position with the hand model
        grabPointMesh.position.x = this.side == "left" ? 0.04 : -0.04;
        grabPointMesh.position.y = -0.04;
        grabPointMesh.position.z = 0.05;
        // Add grabPoint to controller
        this.controller.add(grabPointMesh);

        const grabPointBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Sphere(1),
        });
        grabPointBody.collisionFilterGroup = 0
        grabPointBody.collisionFilterMask = 0

        // Create physObject for grabPoint and grabPointBody
        const grabPointObject = new PhysObject(grabPointBody, grabPointMesh, "three");

        this.grabPoint = {
            grabPointObject: grabPointObject,
            grabPointConstraint: null
        };
    }

    onGrab() {
        if (this.grabbing) return;
        console.log("grab");
        this.grabbing = true;
        // Find the nearest grabbable object

        let toGrab = objects[0];
        let foundObject = false;
        let lastDistance = 1000;

        for (const object of objects) {
            if (!object.isGrabbable) continue; // Not grabbable

            console.log("Found grabbable object");
            
            const distance = 
                object.threeMesh.getWorldPosition(new THREE.Vector3())
                .distanceTo(
                    this.grabPoint.grabPointObject.threeMesh.getWorldPosition(new THREE.Vector3())
                );

            console.log(distance);

            if (distance > 0.3) continue; // Too far away

            if (distance < lastDistance) {
                console.log("found grab candidate");
                lastDistance = distance;
                foundObject = true;
                toGrab = object;
            }
        }

        if (!foundObject) {
            console.log("no object to grab");
            return;
        };

        console.log(`grabbing: `, toGrab);

        // Create constraint between grabPointBody and toGrab
        const constraint = new CANNON.LockConstraint(this.grabPoint.grabPointObject.cannonBody, toGrab.cannonBody);
        physics.world.addConstraint(constraint);
        this.grabPoint.grabPointConstraint = constraint;
    }

    onRelease() {
        console.log("release");
        this.grabbing = false;
        physics.world.removeConstraint(this.grabPoint.grabPointConstraint);
        this.grabPoint.grabPointConstraint = null;
    }

    debug() {
        if (hitBoxDebug)
            this.hitbox.hitboxObject.threeMesh.visible = true;
        if (grabPointDebug)
            this.grabPoint.grabPointObject.threeMesh.visible = true;
    }

    // override update method
    update() {
        // Update hitboxPoint position based on controller position
        this.hitbox.hitboxPointObject.update();
        this.hitbox.hitboxObject.update();
        this.hitbox.cannonConstraint.update();

        // Update grabPoint position based on controller position
        this.grabPoint.grabPointObject.update();
        if (this.grabPoint.grabPointConstraint) {
            this.grabPoint.grabPointConstraint.update();
        }
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