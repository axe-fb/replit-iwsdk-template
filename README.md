# IWSDK Template for Replit

A pre-scaffolded **Immersive Web SDK (IWSDK)** project designed to be forked on
Replit. Use Replit Agent to build XR scenes by describing them in natural language.

## Getting Started

1. **Fork this template** on Replit
2. Click **Run** — the demo scene renders in the webview
3. Open Replit Agent and describe what you want to build:
   - *"Add a solar system with orbiting planets"*
   - *"Build a VR bowling alley with physics"*
   - *"Create an art gallery with grabbable paintings"*
4. Agent writes correct IWSDK code using the built-in instructions

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The scene renders with IWER desktop
emulation — no XR headset needed.

## Project Structure

```
├── .replit              # Run config + Agent instructions
├── replit.nix           # Node.js 20 environment
├── package.json         # Vite + TypeScript
├── tsconfig.json        # Strict TypeScript config
├── vite.config.ts       # Vite dev server
├── index.html           # Entry HTML with IWSDK CDN import map
├── src/
│   ├── main.ts          # Entry — creates World, starts scene
│   └── scene.ts         # Demo scene with 3D objects
└── docs/
    └── IWSDK_GUIDE.md   # API reference (Agent reads this)
```

## Key Concepts

- **ECS Architecture**: Entities + Components + Systems, not OOP
- **World.create()**: Always pass a `features` array
- **Components**: MeshComponent, MaterialComponent, TransformComponent, etc.
- **Import from `@iwsdk/core`**: Never use Three.js directly

See `docs/IWSDK_GUIDE.md` for the full API reference.

## Tech Stack

- **Vite 5+** with TypeScript
- **IWSDK** packages via CDN import maps
- **IWER** for desktop XR emulation
- No backend, no React — pure ECS
