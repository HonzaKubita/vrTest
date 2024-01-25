import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { loadAll } from './modelLoader';

// Three
export let scene = null;
export let camera = null;
export let renderer = null;

// Models
export let models = null;

export async function init() {
    // Init three
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.z = 0.2;
    camera.position.y = 1.6;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    document.body.appendChild(renderer.domElement);

    // Resize renderer on window resize
    addEventListener("resize", (event) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize( width, height );
    });

    // Change background color
    renderer.setClearColor("#e5e5e5");

    // VR Stuff
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    // Load custom models
    models = await loadAll();
}