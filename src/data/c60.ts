// C60 (Buckminsterfullerene) - Refactored
// 60 vertices, 90 edges, 12 pentagons, 20 hexagons
// Uses unified fullerene generator

import { MoleculeData, FULLERENE_FORMULAS } from './types'
import { 
  generateTruncatedIcosahedron, 
  generateBondsByDistance,
  createMoleculeData,
  validateAndLog
} from './fullerenes'

// Generate C60 vertices (truncated icosahedron)
const c60Vertices = generateTruncatedIcosahedron(3.5)

// Generate 90 bonds using distance threshold
const TARGET_BONDS = FULLERENE_FORMULAS.edges(60)  // 90
const c60Bonds = generateBondsByDistance(c60Vertices, TARGET_BONDS)

// Create molecule data
export const c60Data: MoleculeData = createMoleculeData(
  'C60',
  'C60',
  c60Vertices,
  c60Bonds
)

// Validate topology
validateAndLog('C60', c60Vertices, c60Bonds)

// Re-export for compatibility
export type { Atom, Bond, MoleculeData } from './types'
