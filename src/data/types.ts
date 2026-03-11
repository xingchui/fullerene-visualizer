// Shared types for fullerene molecules
// Extracted from c60.ts and c70.ts to avoid duplication

export interface Atom {
  id: number
  position: [number, number, number]
  element: string
}

export interface Bond {
  atom1Index: number
  atom2Index: number
}

export interface MoleculeData {
  name: string
  formula: string
  atoms: Atom[]
  bonds: Bond[]
  atomCount: number
  bondCount: number
}

// Fullerene topology formulas
export const FULLERENE_FORMULAS = {
  // For C_n where n >= 20
  vertices: (n: number) => n,
  edges: (n: number) => Math.floor(n * 1.5),      // E = 3n/2
  faces: (n: number) => Math.floor(n / 2) + 2,     // F = n/2 + 2
  pentagons: () => 12,                             // Always 12
  hexagons: (n: number) => n / 2 - 10              // n/2 - 10
} as const

// Validate fullerene topology
export function validateFullereneTopology(
  n: number,
  atomCount: number,
  bondCount: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const expectedV = FULLERENE_FORMULAS.vertices(n)
  const expectedE = FULLERENE_FORMULAS.edges(n)
  const expectedF = FULLERENE_FORMULAS.faces(n)
  const expectedPentagons = FULLERENE_FORMULAS.pentagons()
  const expectedHexagons = FULLERENE_FORMULAS.hexagons(n)
  
  if (atomCount !== expectedV) {
    errors.push(`Expected ${expectedV} atoms, got ${atomCount}`)
  }
  
  if (bondCount !== expectedE) {
    errors.push(`Expected ${expectedE} bonds, got ${bondCount}`)
  }
  
  // Euler formula: V - E + F = 2
  const euler = atomCount - bondCount + expectedF
  if (euler !== 2) {
    errors.push(`Euler formula failed: ${atomCount} - ${bondCount} + ${expectedF} = ${euler} (expected 2)`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
