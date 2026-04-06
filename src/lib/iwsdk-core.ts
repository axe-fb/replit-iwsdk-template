/**
 * IWSDK Core Shim
 *
 * A lightweight implementation of the IWSDK ECS API backed by Three.js.
 * This allows the template to render a working 3D scene out of the box.
 *
 * When the real @iwsdk/core package is available, replace this shim
 * by updating the import map or Vite alias — no application code changes needed
 * since this shim matches the IWSDK API surface.
 */

import * as THREE from 'three';

// ── Component Tokens ────────────────────────────────────────────────────
// These are used as keys when calling entity.addComponent(Token, data).

export const MeshComponent = Symbol('MeshComponent');
export const MaterialComponent = Symbol('MaterialComponent');
export const TransformComponent = Symbol('TransformComponent');
export const LightComponent = Symbol('LightComponent');
export const GrabInteraction = Symbol('GrabInteraction');
export const PokeInteraction = Symbol('PokeInteraction');
export const RayInteraction = Symbol('RayInteraction');
export const RigidBodyComponent = Symbol('RigidBodyComponent');
export const ColliderComponent = Symbol('ColliderComponent');
export const AudioComponent = Symbol('AudioComponent');
export const TextComponent = Symbol('TextComponent');
export const GLTFComponent = Symbol('GLTFComponent');

export type ComponentToken = symbol;

// ── Entity ──────────────────────────────────────────────────────────────

export class Entity {
  private components = new Map<symbol, any>();
  private object3D: THREE.Object3D | null = null;
  private scene: THREE.Scene;
  private listeners = new Map<string, Array<(...args: any[]) => void>>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addComponent(token: symbol, data?: any): this {
    this.components.set(token, data ?? {});
    this.reconcile();
    return this;
  }

  getComponent(token: symbol): any {
    return this.components.get(token);
  }

  removeComponent(token: symbol): this {
    this.components.delete(token);
    return this;
  }

  setParent(parent: Entity): this {
    if (this.object3D && parent.object3D) {
      parent.object3D.add(this.object3D);
    }
    return this;
  }

  on(event: string, callback: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
    return this;
  }

  destroy(): void {
    if (this.object3D) {
      this.object3D.removeFromParent();
      if (this.object3D instanceof THREE.Mesh) {
        this.object3D.geometry?.dispose();
        if (this.object3D.material instanceof THREE.Material) {
          this.object3D.material.dispose();
        }
      }
    }
    this.components.clear();
  }

  /** Sync Three.js objects from component data */
  private reconcile(): void {
    const meshData = this.components.get(MeshComponent);
    const matData = this.components.get(MaterialComponent);
    const transformData = this.components.get(TransformComponent);
    const lightData = this.components.get(LightComponent);

    // Handle light entities
    if (lightData && !meshData) {
      if (!this.object3D) {
        this.object3D = createLight(lightData);
        this.scene.add(this.object3D);
      }
      if (transformData) {
        applyTransform(this.object3D, transformData);
      }
      return;
    }

    // Handle mesh entities
    if (meshData) {
      const geometry = createGeometry(meshData);
      const material = createMaterial(matData ?? {});

      if (this.object3D instanceof THREE.Mesh) {
        this.object3D.geometry.dispose();
        (this.object3D.material as THREE.Material).dispose();
        this.object3D.geometry = geometry;
        this.object3D.material = material;
      } else {
        if (this.object3D) this.object3D.removeFromParent();
        this.object3D = new THREE.Mesh(geometry, material);
        this.object3D.castShadow = true;
        this.object3D.receiveShadow = true;
        this.scene.add(this.object3D);
      }

      if (transformData) {
        applyTransform(this.object3D, transformData);
      }
    }
  }
}

// ── World ───────────────────────────────────────────────────────────────

export interface WorldOptions {
  features?: string[];
  canvas?: HTMLCanvasElement;
}

export interface EnvironmentOptions {
  skyType?: 'gradient' | 'color' | 'equirectangular';
  skyTopColor?: string;
  skyBottomColor?: string;
  groundColor?: string;
  skyImage?: string;
}

export class World {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private entities: Entity[] = [];
  private systems: Array<{ execute: (delta: number) => void }> = [];
  private running = false;
  private clock = new THREE.Clock();

  private constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 1.6, 3);
    this.camera.lookAt(0, 0.8, -2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    document.body.appendChild(this.renderer.domElement);

    // Handle resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Simple orbit: drag to rotate camera around origin
    this.setupMouseControls();
  }

  static async create(options?: WorldOptions): Promise<World> {
    return new World();
  }

  createEntity(): Entity {
    const entity = new Entity(this.scene);
    this.entities.push(entity);
    return entity;
  }

  setEnvironment(options: EnvironmentOptions): void {
    if (options.skyType === 'gradient' || options.skyType === 'color') {
      const topColor = new THREE.Color(options.skyTopColor ?? '#1a1a2e');
      const bottomColor = new THREE.Color(options.skyBottomColor ?? '#16213e');

      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, `#${topColor.getHexString()}`);
      gradient.addColorStop(1, `#${bottomColor.getHexString()}`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 256);

      const texture = new THREE.CanvasTexture(canvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
    }
  }

  registerSystem(SystemClass: any): void {
    const system = new SystemClass();
    if (system.execute) {
      this.systems.push(system);
    }
  }

  debug(enabled: boolean): void {
    // Debug helpers (no-op in shim)
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  private loop = (): void => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const delta = this.clock.getDelta();
    for (const system of this.systems) {
      system.execute(delta);
    }
    this.renderer.render(this.scene, this.camera);
  };

  private setupMouseControls(): void {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let theta = 0;
    let phi = Math.PI / 6;
    let radius = 5;
    const target = new THREE.Vector3(0, 0.8, -1);

    const updateCamera = () => {
      this.camera.position.x = target.x + radius * Math.sin(theta) * Math.cos(phi);
      this.camera.position.y = target.y + radius * Math.sin(phi);
      this.camera.position.z = target.z + radius * Math.cos(theta) * Math.cos(phi);
      this.camera.lookAt(target);
    };
    updateCamera();

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });
    window.addEventListener('pointerup', () => { isDragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      theta -= dx * 0.005;
      phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 2.5, phi + dy * 0.005));
      updateCamera();
    });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      radius = Math.max(1.5, Math.min(20, radius + e.deltaY * 0.01));
      updateCamera();
    }, { passive: false });
  }
}

// ── Three.js Helpers ────────────────────────────────────────────────────

function createGeometry(data: any): THREE.BufferGeometry {
  switch (data.type) {
    case 'box':
      return new THREE.BoxGeometry(data.width ?? 1, data.height ?? 1, data.depth ?? 1);
    case 'sphere':
      return new THREE.SphereGeometry(
        data.radius ?? 0.5,
        data.widthSegments ?? 32,
        data.heightSegments ?? 32,
      );
    case 'cylinder':
      return new THREE.CylinderGeometry(
        data.radiusTop ?? 0.5,
        data.radiusBottom ?? 0.5,
        data.height ?? 1,
        data.radialSegments ?? 32,
      );
    case 'cone':
      return new THREE.ConeGeometry(
        data.radius ?? 0.5,
        data.height ?? 1,
        data.radialSegments ?? 32,
      );
    case 'torus':
      return new THREE.TorusGeometry(
        data.radius ?? 0.5,
        data.tube ?? 0.2,
        data.radialSegments ?? 16,
        data.tubularSegments ?? 32,
      );
    case 'plane':
      return new THREE.PlaneGeometry(data.width ?? 1, data.height ?? 1);
    case 'ring':
      return new THREE.RingGeometry(
        data.innerRadius ?? 0.3,
        data.outerRadius ?? 0.5,
        data.thetaSegments ?? 32,
      );
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function createMaterial(data: any): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color ?? '#ffffff'),
    metalness: data.metalness ?? 0.0,
    roughness: data.roughness ?? 1.0,
    emissive: data.emissive ? new THREE.Color(data.emissive) : undefined,
    emissiveIntensity: data.emissiveIntensity ?? 1.0,
    opacity: data.opacity ?? 1.0,
    transparent: data.transparent ?? (data.opacity != null && data.opacity < 1),
    side: data.side === 'double' ? THREE.DoubleSide
      : data.side === 'back' ? THREE.BackSide
      : THREE.FrontSide,
  });
}

function createLight(data: any): THREE.Light {
  const color = new THREE.Color(data.color ?? '#ffffff');
  const intensity = data.intensity ?? 1.0;

  switch (data.type) {
    case 'ambient':
      return new THREE.AmbientLight(color, intensity);
    case 'directional': {
      const light = new THREE.DirectionalLight(color, intensity);
      light.castShadow = data.castShadow ?? false;
      if (light.castShadow) {
        light.shadow.mapSize.set(2048, 2048);
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 50;
        const d = 10;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
      }
      return light;
    }
    case 'point':
      return new THREE.PointLight(color, intensity, data.distance ?? 0);
    case 'spot': {
      const spot = new THREE.SpotLight(
        color, intensity, data.distance ?? 0,
        data.angle ?? Math.PI / 6, data.penumbra ?? 0,
      );
      spot.castShadow = data.castShadow ?? false;
      return spot;
    }
    default:
      return new THREE.AmbientLight(color, intensity);
  }
}

function applyTransform(obj: THREE.Object3D, data: any): void {
  if (data.position) {
    obj.position.set(data.position.x ?? 0, data.position.y ?? 0, data.position.z ?? 0);
  }
  if (data.rotation) {
    obj.rotation.set(data.rotation.x ?? 0, data.rotation.y ?? 0, data.rotation.z ?? 0);
  }
  if (data.scale) {
    obj.scale.set(data.scale.x ?? 1, data.scale.y ?? 1, data.scale.z ?? 1);
  }
}

// ── System Base Class ───────────────────────────────────────────────────

export class System {
  static queries: Record<string, { components: symbol[] }> = {};
  static priority = 0;
  queries: Record<string, { results: Entity[] }> = {};

  execute(delta: number): void {
    // Override in subclass
  }
}
