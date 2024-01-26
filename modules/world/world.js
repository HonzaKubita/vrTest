import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import * as physics from '../physics/physics';
import * as render from '../render/render';

import objects from './worldObjects';

import WorldObject from './templates/worldObject';
import Cube from './objects/cube';
import Hand from './objects/hand';
import Ball from './objects/ball';

import Mug from './objects/mug';


// VR
export let controller0 = null;
export let controller1 = null;

function setupHands() {
    const leftHand = new Hand(0, "left");
    leftHand.addToScene(render.scene);
    leftHand.addToWorld(physics.world);
    objects.push(leftHand);

    const rightHand = new Hand(1, "right");
    rightHand.addToScene(render.scene);
    rightHand.addToWorld(physics.world);
    objects.push(rightHand);
}

function setupBaseObjects() {
    // Create starting objects

    // Ground - THREE
    // Create ground with repeating texture (textures/ground.jpeg)
    const groundTexture = new THREE.TextureLoader().load('/assets/textures/ground.jpeg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;

    // Ground - CANNON
    const groundCANNONBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    groundCANNONBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up

    const groundObject = new WorldObject(groundCANNONBody, groundMesh);
    groundObject.enableQuaternionCopy = false;
    groundObject.addToScene(render.scene);
    groundObject.addToWorld(physics.world);
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

export function init() {

    setupHands();
    setupBaseObjects();
    setupLights();

    // Create table
    const tableObject = new Cube([1, 1, 1], true);
    tableObject.cannonBody.position.set(0, 0, -2);
    tableObject.addToScene(render.scene);
    tableObject.addToWorld(physics.world);
    objects.push(tableObject);

    // Create cube
    const cubeObject = new Cube([0.2, 0.2, 0.2]);
    cubeObject.cannonBody.position.set(-0.4, 1, -2);
    cubeObject.addToScene(render.scene);
    cubeObject.addToWorld(physics.world);
    objects.push(cubeObject);

    // Create another cube
    const cube2Object = new Cube([0.5, 0.5, 0.5]);
    cube2Object.cannonBody.position.set(1, 2, -2);
    cube2Object.addToScene(render.scene);
    cube2Object.addToWorld(physics.world);
    objects.push(cube2Object);

    // Create ball
    const ballObject = new Ball(0.3);
    ballObject.cannonBody.position.set(0.2, 3, -2);
    ballObject.addToScene(render.scene);
    ballObject.addToWorld(physics.world);
    objects.push(ballObject);

    // Create mug
    const mugObject = new Mug();
    mugObject.cannonBody.position.set(0, 1, -1.6);
    mugObject.addToScene(render.scene);
    mugObject.addToWorld(physics.world);
    objects.push(mugObject);
}

export function update() {
    // Update objects
    for (const object of objects) {
        object.update();
    }
}