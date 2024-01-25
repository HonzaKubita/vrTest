import * as render from './modules/render/render.js';
import * as physics from './modules/physics/physics.js';
import * as world from './modules/world/world.js';

async function main() {
    // Initialize modules
    physics.init();
    await render.init();
    world.init();

    // We use animation loop for all updates
    render.renderer.setAnimationLoop(() => {
        // Render
        render.renderer.render( render.scene, render.camera );

        // Update physics
        physics.update();
        // Update world
        world.update();
    });
}

main();