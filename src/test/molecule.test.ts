import { describe, it, expect } from 'vitest'
import { c60Data } from '../data/c60'
import { c70Data } from '../data/c70'

describe('C60 Molecular Data', () => {
  it('should have 60 atoms', () => {
    expect(c60Data.atoms).toHaveLength(60)
  })

  it('should have 90 bonds', () => {
    expect(c60Data.bonds).toHaveLength(90)
  })

  it('should have correct atom structure', () => {
    expect(c60Data.atoms[0]).toHaveProperty('id')
    expect(c60Data.atoms[0]).toHaveProperty('position')
    expect(c60Data.atoms[0]).toHaveProperty('element')
    expect(c60Data.atoms[0].element).toBe('C')
  })

  it('should have correct bond structure', () => {
    expect(c60Data.bonds[0]).toHaveProperty('atom1Index')
    expect(c60Data.bonds[0]).toHaveProperty('atom2Index')
  })

  it('should have valid molecule name', () => {
    expect(c60Data.name).toBe('C60')
    expect(c60Data.formula).toBe('C60')
  })
})

describe('C70 Molecular Data', () => {
  it('should have 70 atoms', () => {
    expect(c70Data.atoms).toHaveLength(70)
  })

  it('should have correct atom count property', () => {
    expect(c70Data.atomCount).toBe(70)
  })

  it('should have correct atom structure', () => {
    expect(c70Data.atoms[0]).toHaveProperty('id')
    expect(c70Data.atoms[0]).toHaveProperty('position')
    expect(c70Data.atoms[0]).toHaveProperty('element')
    expect(c70Data.atoms[0].element).toBe('C')
  })

  it('should have valid molecule name', () => {
    expect(c70Data.name).toBe('C70')
    expect(c70Data.formula).toBe('C70')
  })
})
