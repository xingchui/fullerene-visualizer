// C20 (Fullerene) - Smallest fullerene (dodecahedron)
// 20 vertices, 30 edges, 12 pentagons, 0 hexagons
// Uses unified fullerene generator

import { MoleculeData, FULLERENE_FORMULAS } from './types'
import { generateBondsByMutualKN, createMoleculeData, validateAndLog } from './fullerenes'

const PHI = (1 + Math.sqrt(5)) / 2  // Golden ratio ≈ 1.618
const SCALE = 3.5

/**
 * Generate dodecahedron vertices (for C20)
 * A dodecahedron has 20 vertices, all pentagonal faces
 */
function generateDodecahedronVertices(scale: number = SCALE): [number, number, number][] {
  const phi = PHI
  const invPhi = 1 / phi
  
  const vertices: [number, number, number][] = []
  
  // 8 vertices: (±1, ±1, ±1)
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      for (let k = -1; k <= 1; k += 2) {
        vertices.push([i * scale, j * scale, k * scale])
      }
    }
  }
  
  // 4 vertices: (0, ±φ, ±1/φ)
  for (let j = -1; j <= 1; j += 2) {
    for (let k = -1; k <= 1; k += 2) {
      vertices.push([0, j * phi * scale, k * invPhi * scale])
    }
  }
  
  // 4 vertices: (±1/φ, 0, ±φ)
  for (let i = -1; i <= 1; i += 2) {
    for (let k = -1; k <= 1; k += 2) {
      vertices.push([i * invPhi * scale, 0, k * phi * scale])
    }
  }
  
  // 4 vertices: (±φ, ±1/φ, 0)
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      vertices.push([i * phi * scale, j * invPhi * scale, 0])
    }
  }
  
  return vertices
}

// Generate C20 vertices (dodecahedron)
const c20Vertices = generateDodecahedronVertices()

// Generate bonds using mutual 3NN (30 edges for C20)
const TARGET_BONDS = FULLERENE_FORMULAS.edges(20)  // 30
const c20Bonds = generateBondsByMutualKN(c20Vertices, 3, TARGET_BONDS)

// Create molecule data
export const c20Data: MoleculeData = createMoleculeData(
  'C20',
  'C20',
  c20Vertices,
  c20Bonds
)

// Validate topology
validateAndLog('C20', c20Vertices, c20Bonds)

// Re-export for compatibility
export type { Atom, Bond, MoleculeData } from './types'
