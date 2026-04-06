/**
 * IWSDK Template — Demo Scene
 *
 * A visually interesting starter scene with:
 * - A ground plane
 * - Ambient + directional lighting
 * - Several colorful 3D primitives (sphere, box, cylinder, torus)
 * - An environment/skybox
 *
 * This demonstrates core IWSDK ECS patterns: creating entities,
 * attaching components, and configuring systems.
 */

import { World, MeshComponent, MaterialComponent, TransformComponent, LightComponent } from '@iwsdk/core';

export function setupDemoScene(world: World): void {
  // ── Environment ──────────────────────────────────────────────────────
  setupEnvironment(world);

  // ── Lighting ─────────────────────────────────────────────────────────
  setupLighting(world);

  // ── Ground Plane ─────────────────────────────────────────────────────
  createGroundPlane(world);

  // ── 3D Objects ───────────────────────────────────────────────────────
  createSphere(world, { x: 0, y: 1.2, z: -2 }, { color: '#ff6b6b', metalness: 0.3, roughness: 0.4 });
  createBox(world, { x: -1.5, y: 0.5, z: -2.5 }, { color: '#4ecdc4', metalness: 0.1, roughness: 0.6 });
  createCylinder(world, { x: 1.5, y: 0.75, z: -2.5 }, { color: '#ffe66d', metalness: 0.5, roughness: 0.3 });
  createTorus(world, { x: 0, y: 2.0, z: -3 }, { color: '#a29bfe', metalness: 0.7, roughness: 0.2 });
  createBox(world, { x: -0.7, y: 0.35, z: -1.2 }, { color: '#fd79a8', metalness: 0.2, roughness: 0.5, scale: { x: 0.7, y: 0.7, z: 0.7 } });
  createSphere(world, { x: 1.0, y: 0.4, z: -1.5 }, { color: '#55efc4', metalness: 0.4, roughness: 0.3, radius: 0.4 });
}

// ── Helpers ──────────────────────────────────────────────────────────────

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface MaterialOptions {
  color: string;
  metalness?: number;
  roughness?: number;
}

function setupEnvironment(world: World): void {
  // Set a gradient sky environment
  world.setEnvironment({
    skyType: 'gradient',
    skyTopColor: '#1a1a2e',
    skyBottomColor: '#16213e',
    groundColor: '#2d2d2d',
  });
}

function setupLighting(world: World): void {
  // Ambient light for base illumination
  const ambientLight = world.createEntity();
  ambientLight.addComponent(LightComponent, {
    type: 'ambient',
    color: '#404060',
    intensity: 0.6,
  });

  // Main directional light (sun-like)
  const directionalLight = world.createEntity();
  directionalLight.addComponent(LightComponent, {
    type: 'directional',
    color: '#ffffff',
    intensity: 1.0,
    castShadow: true,
  });
  directionalLight.addComponent(TransformComponent, {
    position: { x: 5, y: 10, z: 5 },
    rotation: { x: -0.5, y: 0.3, z: 0 },
  });

  // Warm point light for accent
  const pointLight = world.createEntity();
  pointLight.addComponent(LightComponent, {
    type: 'point',
    color: '#ff9f43',
    intensity: 0.8,
    distance: 10,
  });
  pointLight.addComponent(TransformComponent, {
    position: { x: -2, y: 3, z: -1 },
  });
}

function createGroundPlane(world: World): void {
  const ground = world.createEntity();
  ground.addComponent(MeshComponent, {
    type: 'plane',
    width: 20,
    height: 20,
  });
  ground.addComponent(MaterialComponent, {
    color: '#2d3436',
    metalness: 0.1,
    roughness: 0.9,
  });
  ground.addComponent(TransformComponent, {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  });
}

function createSphere(
  world: World,
  position: Vec3,
  options: MaterialOptions & { radius?: number },
): void {
  const entity = world.createEntity();
  entity.addComponent(MeshComponent, {
    type: 'sphere',
    radius: options.radius ?? 0.5,
    widthSegments: 32,
    heightSegments: 32,
  });
  entity.addComponent(MaterialComponent, {
    color: options.color,
    metalness: options.metalness ?? 0.3,
    roughness: options.roughness ?? 0.4,
  });
  entity.addComponent(TransformComponent, { position });
}

function createBox(
  world: World,
  position: Vec3,
  options: MaterialOptions & { scale?: Vec3 },
): void {
  const entity = world.createEntity();
  entity.addComponent(MeshComponent, {
    type: 'box',
    width: 1,
    height: 1,
    depth: 1,
  });
  entity.addComponent(MaterialComponent, {
    color: options.color,
    metalness: options.metalness ?? 0.1,
    roughness: options.roughness ?? 0.6,
  });
  entity.addComponent(TransformComponent, {
    position,
    scale: options.scale ?? { x: 1, y: 1, z: 1 },
  });
}

function createCylinder(
  world: World,
  position: Vec3,
  options: MaterialOptions,
): void {
  const entity = world.createEntity();
  entity.addComponent(MeshComponent, {
    type: 'cylinder',
    radiusTop: 0.4,
    radiusBottom: 0.4,
    height: 1.5,
    radialSegments: 32,
  });
  entity.addComponent(MaterialComponent, {
    color: options.color,
    metalness: options.metalness ?? 0.5,
    roughness: options.roughness ?? 0.3,
  });
  entity.addComponent(TransformComponent, { position });
}

function createTorus(
  world: World,
  position: Vec3,
  options: MaterialOptions,
): void {
  const entity = world.createEntity();
  entity.addComponent(MeshComponent, {
    type: 'torus',
    radius: 0.6,
    tube: 0.2,
    radialSegments: 24,
    tubularSegments: 48,
  });
  entity.addComponent(MaterialComponent, {
    color: options.color,
    metalness: options.metalness ?? 0.7,
    roughness: options.roughness ?? 0.2,
  });
  entity.addComponent(TransformComponent, { position });
}

// ── More Examples ────────────────────────────────────────────────────────
// See src/examples/ for ready-to-use patterns:
//   - grabbable-objects.ts  — Physics + grab interaction
//   - physics-stack.ts      — Stacking dynamic boxes
//   - spatial-audio.ts      — 3D positional audio
//
// Import and call them from main.ts:
//   import { createGrabbableBallSet } from './examples/grabbable-objects';
//   createGrabbableBallSet(world);
