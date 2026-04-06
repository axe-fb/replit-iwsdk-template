# IWSDK Quick Reference Guide

This guide is a companion to the `.replit` agent instructions. It provides
expanded API details, tips, and patterns for building IWSDK scenes.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [World Creation](#world-creation)
3. [Entity Lifecycle](#entity-lifecycle)
4. [Components Reference](#components-reference)
5. [Systems & Per-Frame Logic](#systems--per-frame-logic)
6. [Interaction & Input](#interaction--input)
7. [Physics](#physics)
8. [Audio](#audio)
9. [Textures & Materials](#textures--materials)
10. [GLTF Models](#gltf-models)
11. [Tips & Best Practices](#tips--best-practices)

---

## Core Concepts

IWSDK is built on **Entity Component System (ECS)** architecture:

| Concept   | What it is                                  | Analogy                  |
|-----------|---------------------------------------------|--------------------------|
| World     | The universe. Manages everything.           | The game engine instance |
| Entity    | An ID with attached data. No behavior.      | A row in a database      |
| Component | Pure data attached to an entity.            | A column value           |
| System    | Logic that processes entities each frame.   | A query + update loop    |

**Think in data, not objects.** Instead of `class Ball extends Mesh`, you create
an entity and attach `MeshComponent`, `MaterialComponent`, and
`TransformComponent`. A `PhysicsSystem` then processes all entities that have
`RigidBodyComponent`.

---

## World Creation

```typescript
import { World } from '@iwsdk/core';

const world = await World.create({
  features: [
    'renderer',     // Required — WebGL/WebXR rendering
    'mesh',         // 3D geometry
    'material',     // PBR materials
    'light',        // Lighting
    'transform',    // Position/rotation/scale
    'environment',  // Skybox / environment maps
    'interaction',  // Hand/controller interactions
    'physics',      // Rigid body physics
    'emulator',     // IWER desktop XR emulation
    'audio',        // Spatial audio
    'text',         // 3D text rendering
    'gltf',         // GLTF model loading
    'animation',    // Animation playback
  ],
});
```

Only include features you need — each one activates its corresponding system.

---

## Entity Lifecycle

```typescript
// Create
const entity = world.createEntity();

// Add components
entity.addComponent(MeshComponent, { type: 'sphere', radius: 0.5 });
entity.addComponent(TransformComponent, { position: { x: 0, y: 1, z: -2 } });

// Read component data
const transform = entity.getComponent(TransformComponent);
console.log(transform.position); // { x: 0, y: 1, z: -2 }

// Modify component data (mutable reference)
transform.position.y = 2.0;

// Remove a component
entity.removeComponent(MeshComponent);

// Destroy the entity entirely
entity.destroy();
```

---

## Components Reference

### MeshComponent
Defines 3D geometry. Available types:

| Type       | Properties                                                  |
|------------|-------------------------------------------------------------|
| `box`      | `width`, `height`, `depth`                                  |
| `sphere`   | `radius`, `widthSegments`, `heightSegments`                 |
| `cylinder` | `radiusTop`, `radiusBottom`, `height`, `radialSegments`     |
| `cone`     | `radius`, `height`, `radialSegments`                        |
| `plane`    | `width`, `height`                                           |
| `torus`    | `radius`, `tube`, `radialSegments`, `tubularSegments`       |
| `ring`     | `innerRadius`, `outerRadius`, `thetaSegments`               |

### MaterialComponent
PBR material properties:

| Property            | Type    | Default   | Description                      |
|---------------------|---------|-----------|----------------------------------|
| `color`             | string  | '#ffffff' | Hex color                        |
| `metalness`         | number  | 0.0       | 0 = dielectric, 1 = metal       |
| `roughness`         | number  | 1.0       | 0 = mirror, 1 = diffuse         |
| `emissive`          | string  | '#000000' | Self-illumination color          |
| `emissiveIntensity` | number  | 1.0       | Emissive strength                |
| `opacity`           | number  | 1.0       | Transparency (needs transparent) |
| `transparent`       | boolean | false     | Enable transparency              |
| `side`              | string  | 'front'   | 'front' / 'back' / 'double'     |
| `map`               | string  | —         | Texture URL                      |
| `normalMap`         | string  | —         | Normal map URL                   |
| `roughnessMap`      | string  | —         | Roughness map URL                |

### TransformComponent

| Property   | Type              | Default             |
|------------|-------------------|---------------------|
| `position` | `{ x, y, z }`    | `{ 0, 0, 0 }`      |
| `rotation` | `{ x, y, z }`    | `{ 0, 0, 0 }` (rad)|
| `scale`    | `{ x, y, z }`    | `{ 1, 1, 1 }`      |

### LightComponent

| Property     | Types that support it       |
|--------------|-----------------------------|
| `type`       | all                         |
| `color`      | all                         |
| `intensity`  | all                         |
| `castShadow` | directional, spot           |
| `distance`   | point, spot                 |
| `angle`      | spot                        |
| `penumbra`   | spot                        |

---

## Systems & Per-Frame Logic

Custom systems run every frame on matching entities:

```typescript
import { System, TransformComponent } from '@iwsdk/core';

// A tag component — no data, just marks entities
class SpinTag {}

class SpinSystem extends System {
  static queries = {
    spinners: { components: [TransformComponent, SpinTag] },
  };

  execute(delta: number): void {
    for (const entity of this.queries.spinners.results) {
      const t = entity.getComponent(TransformComponent);
      t.rotation.y += delta * 1.0; // 1 radian per second
    }
  }
}

// Register
world.registerSystem(SpinSystem);

// Tag an entity to make it spin
myEntity.addComponent(SpinTag);
```

### System Priorities

Systems run in registration order by default. Use `priority` to control order
(lower = earlier):

```typescript
class PhysicsSystem extends System {
  static priority = 10;
  // ...
}

class RenderPrepSystem extends System {
  static priority = 20; // Runs after PhysicsSystem
  // ...
}
```

---

## Interaction & Input

### Grab Interaction
```typescript
import { GrabInteraction } from '@iwsdk/core';

entity.addComponent(GrabInteraction);

entity.on('grabStart', (event) => {
  console.log('Grabbed by:', event.hand); // 'left' | 'right'
});

entity.on('grabEnd', (event) => {
  console.log('Released');
});
```

### Poke Interaction
```typescript
import { PokeInteraction } from '@iwsdk/core';

entity.addComponent(PokeInteraction);
entity.on('poke', () => console.log('Poked!'));
```

### Ray Interaction
```typescript
import { RayInteraction } from '@iwsdk/core';

entity.addComponent(RayInteraction);
entity.on('rayEnter', () => { /* Hover start */ });
entity.on('rayExit', () => { /* Hover end */ });
entity.on('raySelect', () => { /* Click / trigger press */ });
```

---

## Physics

### Rigid Bodies
```typescript
import { RigidBodyComponent, ColliderComponent } from '@iwsdk/core';

// Dynamic body (affected by gravity, forces)
entity.addComponent(RigidBodyComponent, {
  type: 'dynamic',
  mass: 1.0,
  linearDamping: 0.1,
  angularDamping: 0.1,
});

// Static body (immovable, for floors/walls)
wall.addComponent(RigidBodyComponent, { type: 'static' });

// Kinematic body (moved by code, not physics)
platform.addComponent(RigidBodyComponent, { type: 'kinematic' });
```

### Colliders
```typescript
entity.addComponent(ColliderComponent, {
  type: 'box',
  halfExtents: { x: 0.5, y: 0.5, z: 0.5 },
  restitution: 0.5,  // Bounciness
  friction: 0.3,
});
```

### Collision Events
```typescript
entity.on('collisionStart', (event) => {
  console.log('Hit:', event.other); // The other entity
});
entity.on('collisionEnd', (event) => {
  console.log('Separated from:', event.other);
});
```

---

## Audio

```typescript
import { AudioComponent } from '@iwsdk/core';

entity.addComponent(AudioComponent, {
  src: '/assets/sound.mp3',
  spatial: true,       // 3D positional audio
  loop: false,
  autoplay: false,
  volume: 0.8,
  refDistance: 1,
  maxDistance: 50,
  rolloffFactor: 1,
});

// Play programmatically
const audio = entity.getComponent(AudioComponent);
audio.play();
audio.pause();
audio.stop();
```

---

## Textures & Materials

```typescript
// Textured material
entity.addComponent(MaterialComponent, {
  map: '/assets/textures/wood.jpg',
  normalMap: '/assets/textures/wood_normal.jpg',
  roughness: 0.8,
  metalness: 0.0,
});
```

Place texture files in the `public/assets/textures/` directory.

---

## GLTF Models

```typescript
import { GLTFComponent } from '@iwsdk/core';

const model = world.createEntity();
model.addComponent(GLTFComponent, {
  src: '/assets/models/robot.glb',
  scale: 1.0,
});
model.addComponent(TransformComponent, {
  position: { x: 0, y: 0, z: -3 },
});

// Access loaded scene for animations
model.on('gltfLoaded', (gltf) => {
  // Play animation by name
  gltf.playAnimation('Walk');
});
```

Place model files in `public/assets/models/`.

---

## Tips & Best Practices

1. **Units are meters.** A `height: 1` box is 1 meter tall.
2. **Y is up.** Floor is y=0, eye level ≈ y=1.6.
3. **User faces -Z.** Objects at negative Z are "in front".
4. **Start simple.** Get a basic scene rendering, then layer complexity.
5. **Use the emulator.** The 'emulator' feature enables desktop XR emulation
   via IWER — no headset needed during development.
6. **Performance:** Minimize draw calls by reusing materials. Avoid creating
   entities every frame. Use object pooling for particle-like effects.
7. **Debugging:** `world.debug(true)` enables visual helpers for physics
   colliders, light gizmos, and transform axes.
8. **Asset paths:** Place static assets in `public/` — Vite serves them at `/`.
9. **TypeScript:** Always use strict mode. Import types from `@iwsdk/core`.
10. **Hot reload:** Vite HMR works — save a file and the scene updates live.
