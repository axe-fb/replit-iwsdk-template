/**
 * Example: Interactive Grabbable Objects
 *
 * Demonstrates physics + grab interaction. Users can pick up balls
 * with their hands or controllers and throw them.
 *
 * To use: import { createGrabbableBall } from './examples/grabbable-objects';
 */

import {
  World,
  MeshComponent,
  MaterialComponent,
  TransformComponent,
  GrabInteraction,
  RigidBodyComponent,
  ColliderComponent,
} from '@iwsdk/core';

export function createGrabbableBall(
  world: World,
  position: { x: number; y: number; z: number },
  color = '#e74c3c',
): void {
  const ball = world.createEntity();
  ball.addComponent(MeshComponent, { type: 'sphere', radius: 0.15, widthSegments: 24, heightSegments: 24 });
  ball.addComponent(MaterialComponent, { color, roughness: 0.3, metalness: 0.2 });
  ball.addComponent(TransformComponent, { position });

  // Make it grabbable — users can pick it up with hands or controllers
  ball.addComponent(GrabInteraction);

  // Add physics so it falls and bounces
  ball.addComponent(RigidBodyComponent, {
    type: 'dynamic',
    mass: 0.5,
  });
  ball.addComponent(ColliderComponent, {
    type: 'sphere',
    radius: 0.15,
    restitution: 0.7,
  });
}

/**
 * Creates a set of colorful grabbable balls arranged in a row.
 */
export function createGrabbableBallSet(world: World): void {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
  colors.forEach((color, i) => {
    createGrabbableBall(
      world,
      { x: -1 + i * 0.5, y: 1.0, z: -1.5 },
      color,
    );
  });
}
