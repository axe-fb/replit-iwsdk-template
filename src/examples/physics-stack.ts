/**
 * Example: Physics Scene with Stacking Boxes
 *
 * Demonstrates rigid body physics with a stack of dynamic boxes
 * on a static floor. Each box is grabbable.
 *
 * To use: import { createPhysicsStack } from './examples/physics-stack';
 */

import {
  World,
  MeshComponent,
  MaterialComponent,
  TransformComponent,
  RigidBodyComponent,
  ColliderComponent,
  GrabInteraction,
} from '@iwsdk/core';

export function createPhysicsStack(world: World): void {
  // Static floor collider
  const floor = world.createEntity();
  floor.addComponent(MeshComponent, { type: 'plane', width: 10, height: 10 });
  floor.addComponent(MaterialComponent, { color: '#34495e', roughness: 0.9 });
  floor.addComponent(TransformComponent, {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  });
  floor.addComponent(RigidBodyComponent, { type: 'static' });
  floor.addComponent(ColliderComponent, { type: 'plane' });

  // Stack of dynamic boxes
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
  for (let i = 0; i < 5; i++) {
    const box = world.createEntity();
    box.addComponent(MeshComponent, { type: 'box', width: 0.4, height: 0.4, depth: 0.4 });
    box.addComponent(MaterialComponent, { color: colors[i], metalness: 0.2, roughness: 0.5 });
    box.addComponent(TransformComponent, {
      position: { x: 0, y: 0.2 + i * 0.42, z: -2 },
    });
    box.addComponent(RigidBodyComponent, { type: 'dynamic', mass: 1.0 });
    box.addComponent(ColliderComponent, {
      type: 'box',
      halfExtents: { x: 0.2, y: 0.2, z: 0.2 },
      restitution: 0.2,
      friction: 0.6,
    });
    box.addComponent(GrabInteraction);
  }
}
