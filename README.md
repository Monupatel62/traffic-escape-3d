# Traffic Escape 3D

A browser-first, mobile-friendly 3D traffic puzzle built with TypeScript, Vite and Three.js.

## Current prototype

- Isometric 3D board with 6×6 lanes
- Drag vehicles along their own axis
- Collision and board-boundary checks
- Undo and restart
- One hand-authored tutorial puzzle with a red exit vehicle
- Responsive layout for desktop and mobile

This is the first playable foundation, not the full 100-level release. Level content, persistence, offline caching, audio, Monetag integration and the remaining screens are planned next.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The project is configured for a static Vite build. Deploy the `dist/` directory to Netlify.
