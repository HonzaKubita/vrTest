import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as render from "../../render/render";
import * as physics from "../../physics/physics";
import { objects, getObjectByThree } from "../worldObjects";
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
            this.handModel = render.models["hand"]
        else if (this.side == "right") 
            this.handModel = render.models["hand2"]
    
        this.controller.add(this.handModel);
        
        this.correctHandModel();
        this.createHitbox();
        this.createGrabPoint();

        // Create raycaster for seeing what the controller is pointing at
        this.raycaster = new THREE.Raycaster();
        // Raycaster visual
        const raycasterGeometry = new THREE.CylinderGeometry(0.003, 0.003, 100, 32);
        const raycasterMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.raycasterMesh = new THREE.Mesh(raycasterGeometry, raycasterMaterial);
        this.raycasterMesh.rotation.x = Math.PI / 2;
        this.raycasterMesh.position.z = -50;
        this.raycasterMesh.visible = false;
        
        this.controller.add(this.raycasterMesh);

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
        pointBody.collisionFilterGroup = 0;
        pointBody.collisionFilterMask = 0;

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

            if (distance > (0.2 + object.grabDistance)) continue; // Too far away

            if (distance < lastDistance) {
                console.log("found grab candidate");
                lastDistance = distance;
                foundObject = true;
                toGrab = object;
            }
        }

        if (foundObject) {
            console.log(`grabbing: `, toGrab);

            // Create constraint between grabPointBody and toGrab
            const constraint = new CANNON.LockConstraint(this.grabPoint.grabPointObject.cannonBody, toGrab.cannonBody);
            physics.world.addConstraint(constraint);
            this.grabPoint.grabPointConstraint = constraint;

            return;
        }

        console.log("no object to grab");

        // Finding object to throw to player
        console.log("finding object to throw to player");
        // use raycaster to find object to throw to player
        this.raycaster.set(
            this.controller.getWorldPosition(new THREE.Vector3()), 
            new THREE.Vector3(0, 0, -1).applyQuaternion(this.controller.getWorldQuaternion(new THREE.Quaternion()))
        );

        // Display raycaster
        this.raycasterMesh.visible = true;
    
        const intersects = this.raycaster.intersectObjects(render.scene.children, false);
        
        console.log("Intersects: ", intersects);

        // Filter out objects that are not in the world
        const worldThreeObjects = intersects.filter((intersect) => getObjectByThree(intersect.object) ? true : false);
        console.log("World Three objects: ", worldThreeObjects);
        // Map three objects to world objects
        const worldObjects = worldThreeObjects.map((intersect) => getObjectByThree(intersect.object));
        console.log("World objects: ", worldObjects);
        // Filter out objects that are not grabbable
        const throwableObjects = worldObjects.filter((object) => object.isGrabbable);
        console.log("Throwable objects: ", throwableObjects);

        if (throwableObjects.length > 0) {
            console.log("found object to throw to player");
            const objectToThrow = throwableObjects[0];
            console.log("Throwing: ", objectToThrow);

            // Calculate velocity to throw object in a curve
            const gravity = Math.abs(physics.world.gravity.y);
            console.log("Gravity: ", gravity);

            const objectToThrowPosition = new THREE.Vector3(
                objectToThrow.cannonBody.position.x,
                objectToThrow.cannonBody.position.y,
                objectToThrow.cannonBody.position.z
            );
            const objectToThrowVelocity = new THREE.Vector3(
                objectToThrow.cannonBody.velocity.x,
                objectToThrow.cannonBody.velocity.y,
                objectToThrow.cannonBody.velocity.z
            );
            const objectToThrowMass = objectToThrow.cannonBody.mass;

            const handPosition = this.controller.getWorldPosition(new THREE.Vector3());

            const neededForce = new THREE.Vector3(0, 0, 0);

            const neededForceX = (handPosition.x - objectToThrowPosition.x) * (objectToThrowMass);
            const neededForceY = (handPosition.y - objectToThrowPosition.y) * (objectToThrowMass * gravity);
            const neededForceZ = (handPosition.z - objectToThrowPosition.z) * (objectToThrowMass);

            neededForce.x = neededForceX;
            neededForce.y = neededForceY + 1.5;
            neededForce.z = neededForceZ;

            objectToThrow.cannonBody.applyImpulse(new CANNON.Vec3(neededForce.x, neededForce.y, neededForce.z), new CANNON.Vec3(0, 0, 0));
            
            return;
        }

        console.log("No object to throw to player");
    }

    onRelease() {
        console.log("release");

        this.grabbing = false;
        // Remove constraint between grabPointBody and toGrab if it exists
        if (this.grabPoint.grabPointConstraint) {
            physics.world.removeConstraint(this.grabPoint.grabPointConstraint);
            this.grabPoint.grabPointConstraint = null;
        }

        // Hide raycaster
        this.raycasterMesh.visible = false;
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