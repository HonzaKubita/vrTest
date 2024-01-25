import * as CANNON from 'cannon-es'

export let world = null;

export function init() {
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    });
}

export function update() {
    world.fixedStep();
}