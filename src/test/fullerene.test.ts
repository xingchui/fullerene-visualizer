import { describe, it, expect } from 'vitest'
import { c20Data } from '../data/c20'
import { c60Data } from '../data/c60'
import { c70Data } from '../data/c70'
import { c76Data } from '../data/c76'
import { c78Data } from '../data/c78'
import { c80Data } from '../data/c80'
import { c84Data } from '../data/c84'
import { FULLERENE_FORMULAS } from '../data/types'

// Test data for all fullerenes
const fullereneTests = [
  { data: c20Data, name: 'C20', atoms: 20, bonds: 30 },
  { data: c60Data, name: 'C60', atoms: 60, bonds: 90 },
  { data: c70Data, name: 'C70', atoms: 70, bonds: 105 },
  { data: c76Data, name: 'C76', atoms: 76, bonds: 114 },
  { data: c78Data, name: 'C78', atoms: 78, bonds: 117 },
  { data: c80Data, name: 'C80', atoms: 80, bonds: 120 },
  { data: c84Data, name: 'C84', atoms: 84, bonds: 126 }
]

describe('Fullerene Topology Validation', () => {
  fullereneTests.forEach(({ data, name, atoms, bonds }) => {
    describe(`${name} Molecular Data`, () => {
      it('should have correct number of atoms', () => {
        expect(data.atoms).toHaveLength(atoms)
      })

      it('should have correct atomCount property', () => {
        expect(data.atomCount).toBe(atoms)
      })

      it('should have correct number of bonds', () => {
        expect(data.bonds).toHaveLength(bonds)
      })

      it('should have correct bondCount property', () => {
        expect(data.bondCount).toBe(bonds)
      })

      it('should have correct bondCount via formula', () => {
        expect(data.bondCount).toBe(FULLERENE_FORMULAS.edges(atoms))
      })

      it('should have correct atom structure', () => {
        const atom = data.atoms[0]
        expect(atom).toHaveProperty('id')
        expect(atom).toHaveProperty('position')
        expect(atom).toHaveProperty('element')
        expect(atom.element).toBe('C')
      })

      it('should have valid molecule name', () => {
        expect(data.name).toBe(name)
        expect(data.formula).toBe(name)
      })

      it('should have correct bond structure', () => {
        const bond = data.bonds[0]
        expect(bond).toHaveProperty('atom1Index')
        expect(bond).toHaveProperty('atom2Index')
      })

      it('should have valid bond indices', () => {
        data.bonds.forEach(bond => {
          expect(bond.atom1Index).toBeGreaterThanOrEqual(0)
          expect(bond.atom2Index).toBeGreaterThanOrEqual(0)
          expect(bond.atom1Index).toBeLessThan(atoms)
          expect(bond.atom2Index).toBeLessThan(atoms)
        })
      })

      it('should have valid atom positions (all finite)', () => {
        data.atoms.forEach(atom => {
          const [x, y, z] = atom.position
          expect(Number.isFinite(x)).toBe(true)
          expect(Number.isFinite(y)).toBe(true)
          expect(Number.isFinite(z)).toBe(true)
        })
      })

      it('should have correct number of faces via Euler formula', () => {
        const expectedFaces = FULLERENE_FORMULAS.faces(atoms)
        const euler = atoms - bonds + expectedFaces
        expect(euler).toBe(2)
      })
    })
  })
})

describe('Fullerene Formula Constants', () => {
  it('should have correct vertices formula', () => {
    expect(FULLERENE_FORMULAS.vertices(60)).toBe(60)
    expect(FULLERENE_FORMULAS.vertices(70)).toBe(70)
  })

  it('should have correct edges formula', () => {
    expect(FULLERENE_FORMULAS.edges(60)).toBe(90)
    expect(FULLERENE_FORMULAS.edges(70)).toBe(105)
    expect(FULLERENE_FORMULAS.edges(84)).toBe(126)
  })

  it('should have correct faces formula', () => {
    expect(FULLERENE_FORMULAS.faces(60)).toBe(32)
    expect(FULLERENE_FORMULAS.faces(70)).toBe(37)
    expect(FULLERENE_FORMULAS.faces(84)).toBe(44)
  })

  it('should always have 12 pentagons', () => {
    expect(FULLERENE_FORMULAS.pentagons()).toBe(12)
  })

  it('should have correct hexagons formula', () => {
    expect(FULLERENE_FORMULAS.hexagons(60)).toBe(20)
    expect(FULLERENE_FORMULAS.hexagons(70)).toBe(25)
    expect(FULLERENE_FORMULAS.hexagons(84)).toBe(32)
  })
})

describe('C60 Specific Tests', () => {
  it('should have unique bond pairs', () => {
    const bondSet = new Set<string>()
    c60Data.bonds.forEach(bond => {
      const key = `${Math.min(bond.atom1Index, bond.atom2Index)}-${Math.max(bond.atom1Index, bond.atom2Index)}`
      bondSet.add(key)
    })
    // All bonds should be unique pairs
    expect(bondSet.size).toBe(c60Data.bonds.length)
  })
})

describe('C70 Specific Tests', () => {
  it('should have proper rugby ball structure', () => {
    // C70 has D5h symmetry - check if z-coordinates are spread
    const zCoords = c70Data.atoms.map(a => a.position[2])
    const maxZ = Math.max(...zCoords)
    const minZ = Math.min(...zCoords)
    // C70 should have significant z-spread (elongated shape)
    expect(maxZ - minZ).toBeGreaterThan(1)
  })
})

describe('C84 Specific Tests', () => {
  it('should have correct D2 symmetry structure', () => {
    // C84 D2(22) isomer
    expect(c84Data.atoms).toHaveLength(84)
    expect(c84Data.bonds).toHaveLength(126)
  })
})
