import * as THREE from 'three';
import * as physics from '../physics/physics';
import * as render from '../render/render';
import WorldObject from './worldObject';
import Cube from './objects/cube';

export let objects = [];

// VR
export let controller0 = null;
export let controller1 = null;

function setupHands() {
    // Get controller objects
    controller0 = render.renderer.xr.getController(0);
    controller1 = render.renderer.xr.getController(1);

    // Add controllers to scene
    render.scene.add(controller0);
    render.scene.add(controller1);

    // Rotate the hands (dialed in for Meta Quest 3)
    // Left hand
    render.models["robotic_hand_left"].rotation.x = -(Math.PI / 2);

    render.models["robotic_hand_left"].position.x = -0.025;
    render.models["robotic_hand_left"].position.y = -0.04;
    render.models["robotic_hand_left"].position.z = 0.14;

    // Right hand
    render.models["robotic_hand_right"].rotation.x = -(Math.PI / 2);

    render.models["robotic_hand_right"].position.x = 0.025;
    render.models["robotic_hand_right"].position.y = -0.04;
    render.models["robotic_hand_right"].position.z = 0.14;

    // Add hand models to controllers
    controller0.add(render.models["robotic_hand_left"]);
    controller1.add(render.models["robotic_hand_right"]);

    // Create oimo physics objects for hands
    const controllerLeftBox = new Cube([0.1, 0.1, 0.1], [0, 0, 0], [0, 0, 0, 1], false);
    controllerLeftBox.positionController = "three";
    controllerLeftBox.addToScene(controller0);
    objects.push(controllerLeftBox);

    const controllerRightBox = new Cube([0.1, 0.1, 0.1], [0, 0, 0], [0, 0, 0, 1], false);
    controllerRightBox.positionController = "three";
    controllerRightBox.addToScene(controller1);
    objects.push(controllerRightBox);
}

function setupBaseObjects() {
    // Create starting objects

    // Create ground with repeating texture (textures/ground.jpeg)
    const groundTexture = new THREE.TextureLoader().load('/assets/textures/ground.jpeg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const groundGeometry = new THREE.BoxGeometry(100, 0.1, 100);
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;

    // Ground - oimo
    const groundOimoObject = physics.world.add({
        type: "box",
        size: [100, 0.1, 100],
        pos: [0, 0.1, 0],
        rot: [0, 0, 0, 1],
        move: false,
        density: 5
    });

    const groundObject = new WorldObject(groundOimoObject, groundMesh);
    groundObject.addToScene(render.scene);
}

function setupLights() {
    // Init lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    render.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 10);
    pointLight.position.set(1, 3, 0);
    pointLight.castShadow = true;
    render.scene.add(pointLight);

    // White directional light at half intensity shining from the top.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    render.scene.add(directionalLight);
}

let tableCube = null;

export function init() {

    setupHands();
    setupBaseObjects();
    setupLights();

    // Create table
    const tableObject = new Cube([1, 1, 1], [0, 0.2, -1], [0, 0, 0, 1], false);
    tableCube = tableObject;
    tableObject.addToScene(render.scene);
    objects.push(tableObject);

    // Create cube
    const cubeObject = new Cube([0.2, 0.2, 0.2], [0, 2, -1], [0, 0, 0, 1], true);
    cubeObject.addToScene(render.scene);
    objects.push(cubeObject);

    // Create another cube
    const cube2Object = new Cube([0.5, 0.5, 0.5], [0, 4, -1], [0, 0, 0, 1], true);
    cube2Object.addToScene(render.scene);
    objects.push(cube2Object);
}

export function update() {
    // Update objects
    for (const object of objects) {
        object.update();
    }
}