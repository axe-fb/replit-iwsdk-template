/**
 * IWSDK Template — Entry Point
 *
 * Creates the IWSDK World, loads features, and starts the demo scene.
 * This file bootstraps the ECS world and hands off to scene.ts for content.
 */

import { World } from '@iwsdk/core';
import { setupDemoScene } from './scene';

async function main() {
  // Create the IWSDK World with required features.
  // Features opt-in to specific systems (rendering, physics, interaction, etc.)
  const world = await World.create({
    features: [
      'renderer',       // WebGL/WebXR rendering
      'mesh',           // 3D mesh components
      'material',       // PBR materials
      'light',          // Lighting system
      'transform',      // Position, rotation, scale
      'environment',    // Skybox and environment map
      'interaction',    // Grab, poke, ray interactions
      'physics',        // Rigid body physics
      'emulator',       // IWER desktop emulation (for non-XR browsers)
    ],
  });

  // Build the demo scene
  setupDemoScene(world);

  // Hide loading overlay
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');

  // Start the simulation loop
  world.start();

  console.log('IWSDK World started. Open the browser preview to see your scene.');
}

main().catch((err) => {
  console.error('Failed to start IWSDK:', err);
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = `Error: ${err.message}`;
});
