// C70 (Fullerene) - Refactored
// 70 vertices, 105 edges, 12 pentagons, 25 hexagons (rugby ball shape)
// Uses unified fullerene generator

import { MoleculeData, FULLERENE_FORMULAS } from './types'
import { generateC70VerticesExport } from './c70_math'
import { generateBondsByMutualKN, createMoleculeData, validateAndLog } from './fullerenes'

// Generate C70 vertices using D5h symmetry (precomputed coordinates)
const c70Vertices = generateC70VerticesExport()

// Generate bonds using mutual 3NN (105 edges for proper cage topology)
const TARGET_BONDS = FULLERENE_FORMULAS.edges(70)  // 105
const c70Bonds = generateBondsByMutualKN(c70Vertices, 3, TARGET_BONDS)

// Create molecule data
export const c70Data: MoleculeData = createMoleculeData(
  'C70',
  'C70',
  c70Vertices,
  c70Bonds
)

// Validate topology
validateAndLog('C70', c70Vertices, c70Bonds)

// Re-export for compatibility
export type { Atom, Bond, MoleculeData } from './types'
