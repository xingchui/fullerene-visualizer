// Unified Fullerene Generator Utility
// Provides common algorithms for generating fullerene structures

import { Atom, Bond, MoleculeData, FULLERENE_FORMULAS } from './types'

const PHI = (1 + Math.sqrt(5)) / 2  // Golden ratio ≈ 1.618

/**
 * Generate truncated icosahedron vertices (for C60 and similar)
 * Uses golden ratio to create the classic buckyball structure
 */
export function generateTruncatedIcosahedron(scale: number = 3.5): [number, number, number][] {
  const vertices: [number, number, number][] = []
  
  // Icosahedron's 12 vertices
  const ico = [
    [0, 1, PHI],
    [0, -1, PHI],
    [0, 1, -PHI],
    [0, -1, -PHI],
    [1, PHI, 0],
    [-1, PHI, 0],
    [1, -PHI, 0],
    [-1, -PHI, 0],
    [PHI, 0, 1],
    [-PHI, 0, 1],
    [PHI, 0, -1],
    [-PHI, 0, -1]
  ]
  
  // Find edges (distance = 2)
  const edgeSet = new Set<string>()
  for (let i = 0; i < ico.length; i++) {
    for (let j = i + 1; j < ico.length; j++) {
      const d = Math.sqrt(
        Math.pow(ico[i][0] - ico[j][0], 2) +
        Math.pow(ico[i][1] - ico[j][1], 2) +
        Math.pow(ico[i][2] - ico[j][2], 2)
      )
      if (Math.abs(d - 2) < 0.1) {
        edgeSet.add(`${i}-${j}`)
      }
    }
  }
  
  // Create vertices at 1/3 and 2/3 along each edge
  edgeSet.forEach(edge => {
    const [i, j] = edge.split('-').map(Number)
    const v1 = ico[i]
    const v2 = ico[j]
    
    for (let t = 1; t <= 2; t++) {
      const f = t / 3
      const v = [
        v1[0] + (v2[0] - v1[0]) * f,
        v1[1] + (v2[1] - v1[1]) * f,
        v1[2] + (v2[2] - v1[2]) * f
      ]
      const norm = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
      vertices.push([
        v[0] / norm * scale,
        v[1] / norm * scale,
        v[2] / norm * scale
      ])
    }
  })
  
  return vertices
}

/**
 * Calculate distance between two 3D points
 */
function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  )
}

/**
 * Generate bonds based on distance threshold
 * @param vertices Array of 3D coordinates
 * @param targetBonds Expected number of bonds
 * @param threshold Distance threshold for bond formation
 */
export function generateBondsByDistance(
  vertices: [number, number, number][],
  targetBonds: number,
  threshold: number = 2.8
): Bond[] {
  const allPairs: { i: number; j: number; dist: number }[] = []
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      allPairs.push({
        i,
        j,
        dist: distance(vertices[i], vertices[j])
      })
    }
  }
  
  // Sort by distance and take the closest bonds
  allPairs.sort((a, b) => a.dist - b.dist)
  
  // Find optimal cutoff based on target
  const bonds: Bond[] = []
  const cutoff = allPairs[targetBonds - 1]?.dist ?? threshold
  
  for (const p of allPairs) {
    if (p.dist <= cutoff && bonds.length < targetBonds) {
      bonds.push({ atom1Index: p.i, atom2Index: p.j })
    }
  }
  
  return bonds
}

/**
 * Generate bonds using mutual k-nearest neighbors algorithm
 * Only creates bonds when both atoms consider each other neighbors
 */
export function generateBondsByMutualKN(
  vertices: [number, number, number][],
  k: number = 3,
  targetEdges: number = -1
): Bond[] {
  const n = vertices.length
  
  // Compute all distances
  const dists: { idx: number; d: number }[][] = []
  for (let i = 0; i < n; i++) {
    dists[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d2 = (
        (vertices[i][0] - vertices[j][0]) ** 2 +
        (vertices[i][1] - vertices[j][1]) ** 2 +
        (vertices[i][2] - vertices[j][2]) ** 2
      )
      dists[i].push({ idx: j, d: d2 })
    }
    dists[i].sort((a, b) => a.d - b.d)
  }
  
  // Find mutual k-NN edges
  const edgeSet = new Set<string>()
  for (let i = 0; i < n; i++) {
    for (let t = 0; t < k && t < dists[i].length; t++) {
      const j = dists[i][t].idx
      const isMutual = dists[j].some(p => p.idx === i)
      if (isMutual && i < j) {
        edgeSet.add(`${i}-${j}`)
      }
    }
  }
  
  let bonds = Array.from(edgeSet).map(s => {
    const [a, b] = s.split('-').map(Number)
    return { atom1Index: a, atom2Index: b }
  })
  
  // Edge fill: if less than target, add nearest pairs
  if (targetEdges > 0 && bonds.length < targetEdges) {
    const existing = new Set(bonds.map(e => `${e.atom1Index}-${e.atom2Index}`))
    const candidates: { i: number; j: number; d: number }[] = []
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (!existing.has(`${i}-${j}`)) {
          candidates.push({
            i,
            j,
            d: (
              (vertices[i][0] - vertices[j][0]) ** 2 +
              (vertices[i][1] - vertices[j][1]) ** 2 +
              (vertices[i][2] - vertices[j][2]) ** 2
            )
          })
        }
      }
    }
    
    candidates.sort((a, b) => a.d - b.d)
    for (const c of candidates) {
      if (bonds.length >= targetEdges) break
      bonds.push({ atom1Index: c.i, atom2Index: c.j })
    }
  }
  
  return bonds
}

/**
 * Create MoleculeData from vertices and bonds
 */
export function createMoleculeData(
  name: string,
  formula: string,
  vertices: [number, number, number][],
  bonds: Bond[]
): MoleculeData {
  return {
    name,
    formula,
    atomCount: vertices.length,
    bondCount: bonds.length,
    atoms: vertices.map((pos, idx) => ({
      id: idx + 1,
      position: pos,
      element: 'C'
    })),
    bonds
  }
}

/**
 * Validate and log fullerene topology
 */
export function validateAndLog(
  name: string,
  vertices: [number, number, number][],
  bonds: Bond[]
): boolean {
  const n = vertices.length
  const expectedE = FULLERENE_FORMULAS.edges(n)
  const expectedF = FULLERENE_FORMULAS.faces(n)
  
  const euler = vertices.length - bonds.length + expectedF
  const valid = euler === 2 && bonds.length === expectedE
  
  console.log(`${name}: ${vertices.length} atoms, ${bonds.length} bonds, ${expectedF} faces`)
  console.log(`${name} Euler: ${vertices.length} - ${bonds.length} + ${expectedF} = ${euler} ${valid ? '✓' : '✗'}`)
  
  return valid
}
