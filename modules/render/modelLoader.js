import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Models
const models = {
    "hand": "/assets/models/hand.glb",
    "hand2": "/assets/models/hand.glb",
}

const loader = new GLTFLoader();

export async function load(url) {
    console.log("Loading model: " + url);
    return new Promise((resolve, reject) => {
        loader.load(
            // resource URL 
            url,
            // called when the resource is loaded
            function ( gltf ) {
                resolve(gltf.scene);
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.error(error);
                reject(error);
            }
        );
    });
}

export async function loadAll() {
    const loadedModels = {}; // Array for loaded models
    const promises = [];    // Array for promises of loading models

    // Create promises for loading models
    for (const [model, url] of Object.entries(models)) {
        promises.push(new Promise((resolve, reject) => {
            load(url).then((scene) => {
                loadedModels[model] = scene;
                resolve();
            }).catch((error) => {
                reject(error);
            });
        }));
    }

    // Wait for all models to load
    await Promise.all(promises);

    return loadedModels;
}