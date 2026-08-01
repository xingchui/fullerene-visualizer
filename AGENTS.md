# AGENTS.md - Developer Guide for AI Agents

## Project Overview

- **Name**: Fullerene Molecular Visualization (富勒烯3D可视化工具)
- **Type**: Electron + React + Three.js Desktop Application
- **Purpose**: 3D visualization of fullerene carbon cage molecules (C20, C60, C70, C76, C78, C80, C84)
- **Tech Stack**: React 18, Three.js, React Three Fiber (`@react-three/drei` + `@react-three/fiber`), Electron 22, TypeScript, Vite, Vitest
- **GitHub**: `xingchui/fullerene-visualizer`

---

## Critical Gotchas (agents WILL get these wrong)

### 1. Never add `"type": "module"` to package.json
Removing it was the fix for the Electron `ERR_REQUIRE_ESM` crash. Electron 22 requires a CommonJS main process. `vite.config.ts` already forces `format: 'cjs'` for `electron/main.ts` and `electron/preload.ts` builds — do not "fix" or remove that either.

### 2. Orthographic projection: use `OrthoFrustumCamera`, NOT the Canvas `orthographic` prop
The `<Canvas orthographic camera={{...}}>` pattern does NOT create a working orthographic camera — the molecule renders with perspective distortion. The working pattern (in `src/App.tsx`) is a drei `<OrthographicCamera makeDefault />` whose frustum is computed from viewport aspect ratio:

```tsx
const halfHeight = distance * Math.tan(THREE.MathUtils.degToRad(fov / 2))
const halfWidth = halfHeight * aspect  // aspect = size.width / size.height
```

A fixed square frustum (`left/right/top/bottom = ±20`) makes the molecule look flattened/squashed — the frustum must track the aspect ratio.

### 3. The packaged exe is NOT standalone
`npm run electron:build` outputs to `release/win-unpacked/`. The exe inside depends on sibling DLLs (`ffmpeg.dll`, etc.). Copying just the `.exe` to another machine fails with "找不到 ffmpeg.dll". Distribute the **entire `win-unpacked/` folder as a zip** (see release flow below).

### 4. `electron:dev` is just `vite`
The vite-plugin-electron config auto-starts Electron on `vite serve`. Do not change it back to `vite build && electron .` — that was the old slow flow.

---

## Commands

### Development
```bash
npm run dev            # Vite dev server (browser only)
npm run electron:dev   # Vite + Electron auto-start (use this to test desktop app)
```

### Build / Verify
```bash
npm run build          # tsc && vite build  (typecheck FIRST — do not skip)
npm run electron:build # vite build && electron-builder → release/win-unpacked/
npx tsc --noEmit       # fast typecheck without building
```

### Test
```bash
npm test               # vitest watch
npm run test:run       # vitest run (single pass)
npm test -- src/test/fullerene.test.ts        # single file
npm test -- src/test/fullerene.test.ts -t "C60"  # specific test
```

### Lint
```bash
npx eslint src/
```

---

## Project Structure

```
src/
├── App.tsx              # Main app: App → MoleculeScene → CarbonAtom/Bond, OrthoFrustumCamera
├── main.tsx             # React entry point
├── data/
│   ├── types.ts        # MoleculeData, Atom, Bond interfaces
│   ├── fullerenes.ts   # Shared utilities (bond generation, topology)
│   └── c20.ts - c84.ts # Coordinate data, exported as cXXData: MoleculeData
├── test/
│   ├── fullerene.test.ts  # Topology validation (Euler V-E+F=2)
│   ├── molecule.test.ts   # Rendering tests
│   └── setup.ts
electron/
├── main.ts             # Electron main process (CJS output)
└── preload.ts          # contextBridge API (electronAPI: saveScreenshot, toggleFullscreen, platform)
vite.config.ts          # electron plugin: main+preload → cjs; manualChunks: three-vendor, react-vendor
```

## Architecture Notes

- **Molecule data map**: `MOLECULE_DATA_MAP` in `App.tsx` is initialized directly at module scope from `c20Data`...`c84Data` imports. Use `useMoleculeData(molecule)` to look it up. Don't reintroduce null-cast lazy init.
- **Debug component**: `CameraDebug` logs camera type in the 3D scene but is guarded to no-op in production (`process.env.NODE_ENV === 'production'`). Keep that guard.
- **Performance**: `Bond` component memoizes position/quaternion/length computation with `useMemo` (deps: `start`, `end`, `radius`). Keep geometry creation out of the render path.
- **Electron security baseline** (preserve): `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, CSP headers, blocked external navigation/new windows. Preload uses `contextBridge` only.

## Release Flow (GitHub Releases)

The portable distributable is the zipped `win-unpacked` folder:

```bash
npm run electron:build
powershell -Command "Compress-Archive -Path 'release\win-unpacked\*' -DestinationPath 'release\Fullerene Molecular Visualization V<VER>.zip' -Force"
gh release create v<VER> "release\Fullerene Molecular Visualization V<VER>.zip" --title "V<VER>" --notes "解压后双击 Fullerene Molecular Visualization.exe"
```

- Repo: `xingchui/fullerene-visualizer`
- Electron 22 is pinned for Windows 7/8/8.1 compatibility — do not bump without checking.

## Workflow Conventions

- Verify with `npx tsc --noEmit` (or `npm run build`) + `npm run test:run` before claiming completion.
- Vitest prints Vite CJS-deprecation warnings on startup — these are noise, not failures.
- Tests live in `src/test/` with `.test.ts` suffix.
- Commit style: `feat:`, `fix:`, `chore:`, `docs:`, `test:` prefixes.
