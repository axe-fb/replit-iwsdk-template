/**
 * Example: Spatial Audio Source
 *
 * Demonstrates 3D positional audio that attenuates with distance.
 * The glowing sphere acts as a visible speaker marker.
 *
 * To use: import { createAudioSource } from './examples/spatial-audio';
 */

import {
  World,
  MeshComponent,
  MaterialComponent,
  TransformComponent,
  AudioComponent,
} from '@iwsdk/core';

export function createAudioSource(
  world: World,
  position: { x: number; y: number; z: number },
  audioSrc: string,
): void {
  const speaker = world.createEntity();
  speaker.addComponent(MeshComponent, { type: 'sphere', radius: 0.1, widthSegments: 16, heightSegments: 16 });
  speaker.addComponent(MaterialComponent, {
    color: '#00ff88',
    emissive: '#00ff88',
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });
  speaker.addComponent(TransformComponent, { position });

  // Spatial audio — sound attenuates with distance
  speaker.addComponent(AudioComponent, {
    src: audioSrc,
    loop: true,
    autoplay: true,
    spatial: true,
    refDistance: 1,
    maxDistance: 20,
    rolloffFactor: 2,
    volume: 0.6,
  });
}
