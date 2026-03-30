# AGENTS.md - Developer Guide for AI Agents

This file provides guidelines and instructions for AI agents working on this codebase.

## Project Overview

- **Name**: Fullerene Visualizer (富勒烯3D可视化工具)
- **Type**: Electron + React + Three.js Desktop Application
- **Purpose**: 3D visualization of fullerene carbon cage molecules (C20, C60, C70, C76, C78, C80, C84)
- **Tech Stack**: React 18, Three.js, React Three Fiber, Electron, TypeScript, Vite, Vitest

---

## Build & Development Commands

### Development
```bash
# Start development server
npm run dev

# Run Electron in dev mode
npm run electron:dev
```

### Building
```bash
# Build for production (web)
npm run build

# Build Electron app
npm run electron:build

# Output: release/ directory
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run a single test file
npm test -- src/test/fullerene.test.ts

# Run a specific test
npm test -- src/test/fullerene.test.ts -t "C60 Molecular Data"
```

### Linting
```bash
# Run ESLint
npx eslint src/

# Fix linting issues
npx eslint src/ --fix
```

---

## Code Style Guidelines

### TypeScript

- **Use strict typing**: Avoid `any`, use proper types
- **Use interfaces over types** for object shapes
- **Use `as const`** for constant objects
- **Type imports**: `import { TypeName } from 'module'`

```typescript
// Good
interface Atom {
  id: number
  position: [number, number, number]
  element: string
}

export const FULLERENE_FORMULAS = {
  vertices: (n: number) => n,
  edges: (n: number) => Math.floor(n * 1.5)
} as const

// Avoid
const atom: any = { ... }
```

### React Components

- **Use functional components** with TypeScript
- **Use explicit prop types** with interfaces
- **Hooks first**: Prefer hooks over class components

```typescript
// Good
interface CarbonAtomProps {
  position: [number, number, number]
  radius?: number
  color?: string
}

function CarbonAtom({ position, radius = 0.28 }: CarbonAtomProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
    </mesh>
  )
}
```

### Imports

**Order:**
1. React/Framework imports
2. Third-party libraries
3. Internal imports (relative paths)

```typescript
// 1. React/Framework
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'

// 2. Third-party
import * as THREE from 'three'

// 3. Internal
import { c60Data } from './data/c60'
import { MoleculeData } from './data/types'
```

### Naming Conventions

- **Components**: PascalCase (`MoleculeScene`, `CarbonAtom`)
- **Functions/variables**: camelCase (`generateBonds`, `atomCount`)
- **Constants**: UPPER_SNAKE_CASE or camelCase with `k` prefix
- **Types/Interfaces**: PascalCase (`Atom`, `Bond`, `MoleculeData`)
- **Files**: kebab-case (`fullerene.test.ts`, `types.ts`)

### Error Handling

- **Use try-catch** for async operations
- **Return error results** instead of throwing for expected errors
- **Type error states** explicitly

```typescript
// Good
function validateFullereneTopology(...): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  // ... validation logic
  return { valid: errors.length === 0, errors }
}

// Avoid empty catch blocks
try {
  // ... code
} catch (e) {
  console.error('Error:', e) // Always log or handle
}
```

### Three.js / React Three Fiber

- **Use `useMemo`** for expensive calculations (geometry creation)
- **Use `useRef`** for Three.js object references
- **Dispose geometries/materials** when unmounting

```typescript
function MoleculeScene() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Use useMemo for geometries that don't change
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), [])
  
  return <mesh ref={meshRef} geometry={geometry} />
}
```

---

## Project Structure

```
src/
├── App.tsx              # Main React application
├── main.tsx             # React entry point
├── data/
│   ├── types.ts        # Shared TypeScript interfaces
│   ├── fullerenes.ts   # Shared utilities
│   └── c20.ts - c84.ts # Fullerene coordinate data
├── test/
│   ├── fullerene.test.ts  # Topology validation tests
│   ├── molecule.test.ts   # Molecule rendering tests
│   └── setup.ts        # Vitest setup
└── tools/
    └── *.ts            # Utility scripts

electron/
└── main.ts             # Electron main process
```

---

## Testing Guidelines

### Test File Naming
- Use `.test.ts` or `.spec.ts` suffix
- Place in `src/test/` directory

### Test Patterns
```typescript
import { describe, it, expect } from 'vitest'
import { c60Data } from '../data/c60'

describe('Fullerene Data', () => {
  it('should have correct number of atoms', () => {
    expect(c60Data.atoms).toHaveLength(60)
  })
})
```

### Running Tests
```bash
# All tests
npm test

# Single file
npm test -- src/test/fullerene.test.ts

# Specific test name
npm test -t "C60"

# Coverage
npm test -- --coverage
```

---

## Common Patterns

### Conditional Rendering
```typescript
{projectionMode === 'perspective' ? (
  <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
    {/* ... */}
  </Canvas>
) : (
  <Canvas orthographic camera={{ ... }}>
    {/* ... */}
  </Canvas>
)}
```

### Data Export Pattern
```typescript
// In data files (c60.ts, c70.ts, etc.)
export const c60Data: MoleculeData = createMoleculeData(
  'C60',
  'C60',
  c60Vertices,
  c60Bonds
)
```

---

## Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push to remote: `git push origin feature/your-feature`
4. Create Pull Request

### Commit Messages
- Use clear, descriptive messages
- Prefix with type: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

---

## Notes for AI Agents

- **Read before editing**: Always read existing files before modifying
- **Check types**: Use TypeScript, avoid `any`
- **Test changes**: Run `npm test` before committing
- **Build verification**: Run `npm run build` to verify compilation
- **Keep changes focused**: One feature/fix per commit
- **Check ESLint**: Run `npx eslint src/` before pushing
