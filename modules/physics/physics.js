import * as OIMO from '../../lib/oimo.module.js';

export let world = null;

export function init() {
    // Setup oimo physics
    world = new OIMO.World({ 
        timestep: 1/120, 
        iterations: 8, 
        broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
        worldscale: 1, // scale full world 
        random: true,  // randomize sample
        info: false,   // calculate statistic or not
        gravity: [0,-9.8,0] 
    });
}

export function update() {
    // Update physics 1/120 times per second
    world.step();
}