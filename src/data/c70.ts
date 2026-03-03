// C70 (Fullerene) molecular data from CIF file
import { generateC70BondsFromCoords } from "./c70_nn";
// COD ID: 9008425
// Crystallography Open Database

// Cell parameters from CIF
const a = 10.6000
const b = 10.6000  
const c = 17.2000
const gamma = 120.0 * Math.PI / 180  // Convert to radians
// 3NN bond generation moved to dedicated module (src/data/c70_nn.ts)

// C70 fractional coordinates (extracted from CIF file)
const c70FractionalCoords: [number, number, number][] = [
  [0.1667, 0.3333, 0.0000],   // C1
  [0.3333, 0.1667, 0.0000],   // C2
  [0.0000, 0.0000, 0.0000],   // C3
  [0.1667, 0.0000, 0.0833],   // C4
  [0.0000, 0.1667, 0.0833],   // C5
  [0.1667, 0.1667, 0.1667],   // C6
  [0.3333, 0.3333, 0.0833],   // C7
  [0.5000, 0.3333, 0.0833],   // C8
  [0.3333, 0.5000, 0.0833],   // C9
  [0.5000, 0.5000, 0.1667],   // C10
  [0.6667, 0.3333, 0.1667],   // C11
  [0.5000, 0.1667, 0.1667],   // C12
  [0.6667, 0.1667, 0.2500],   // C13
  [0.5000, 0.0000, 0.2500],   // C14
  [0.6667, 0.0000, 0.3333],   // C15
  [0.8333, 0.1667, 0.3333],   // C16
  [0.6667, 0.3333, 0.3333],   // C17
  [0.8333, 0.3333, 0.2500],   // C18
  [0.8333, 0.5000, 0.2500],   // C19
  [0.8333, 0.6667, 0.3333],   // C20
  [0.6667, 0.6667, 0.3333],   // C21
  [0.5000, 0.6667, 0.2500],   // C22
  [0.6667, 0.8333, 0.2500],   // C23
  [0.5000, 0.8333, 0.1667],   // C24
  [0.3333, 0.8333, 0.1667],   // C25
  [0.3333, 0.6667, 0.0833],   // C26
  [0.1667, 0.6667, 0.0833],   // C27
  [0.1667, 0.8333, 0.0000],   // C28
  [0.0000, 0.8333, 0.0000],   // C29
  [0.0000, 0.6667, 0.0833],   // C30
  [0.1667, 0.3333, 0.5000],   // C31
  [0.3333, 0.1667, 0.5000],   // C32
  [0.0000, 0.0000, 0.5000],   // C33
  [0.1667, 0.0000, 0.4167],   // C34
  [0.0000, 0.1667, 0.4167],   // C35
  [0.1667, 0.1667, 0.3333],   // C36
  [0.3333, 0.3333, 0.4167],   // C37
  [0.5000, 0.3333, 0.4167],   // C38
  [0.3333, 0.5000, 0.4167],   // C39
  [0.5000, 0.5000, 0.3333],   // C40
  [0.6667, 0.3333, 0.3333],   // C41
  [0.5000, 0.1667, 0.3333],   // C42
  [0.6667, 0.1667, 0.2500],   // C43
  [0.5000, 0.0000, 0.2500],   // C44
  [0.6667, 0.0000, 0.1667],   // C45
  [0.8333, 0.1667, 0.1667],   // C46
  [0.6667, 0.3333, 0.1667],   // C47
  [0.8333, 0.3333, 0.2500],   // C48
  [0.8333, 0.5000, 0.2500],   // C49
  [0.8333, 0.6667, 0.1667],   // C50
  [0.6667, 0.6667, 0.1667],   // C51
  [0.5000, 0.6667, 0.2500],   // C52
  [0.6667, 0.8333, 0.2500],   // C53
  [0.5000, 0.8333, 0.3333],   // C54
  [0.3333, 0.8333, 0.3333],   // C55
  [0.3333, 0.6667, 0.4167],   // C56
  [0.1667, 0.6667, 0.4167],   // C57
  [0.1667, 0.8333, 0.5000],   // C58
  [0.0000, 0.8333, 0.5000],   // C59
  [0.0000, 0.6667, 0.4167],   // C60
  [0.1667, 0.3333, 0.2500],   // C61
  [0.3333, 0.1667, 0.2500],   // C62
  [0.0000, 0.0000, 0.2500],   // C63
  [0.1667, 0.0000, 0.1667],   // C64
  [0.0000, 0.1667, 0.1667],   // C65
  [0.1667, 0.1667, 0.0833],   // C66
  [0.3333, 0.3333, 0.1667],   // C67
  [0.5000, 0.3333, 0.1667],   // C68
  [0.3333, 0.5000, 0.1667],   // C69
  [0.5000, 0.5000, 0.2500],   // C70
]

// C70 bonds from CIF file - exact connectivity (105 bonds)
// Format: [atom1_index, atom2_index] (0-indexed from C1=0, C2=1, etc.)
// Parsed from CIF file bonds section
export const c70BondPairsFromCIF: number[][] = [
  // C1 bonds: C1-C2, C1-C3, C1-C28
  [0, 1], [0, 2], [0, 27],
  // C2 bonds: C2-C3, C2-C7
  [1, 2], [1, 6],
  // C3 bond: C3-C4
  [2, 3],
  // C4 bonds: C4-C5, C4-C6
  [3, 4], [3, 5],
  // C5 bonds: C5-C6, C5-C30
  [4, 5], [4, 29],
  // C6 bond: C6-C12
  [5, 11],
  // C7 bonds: C7-C8, C7-C9
  [6, 7], [6, 8],
  // C8 bonds: C8-C10, C8-C12
  [7, 9], [7, 11],
  // C9 bonds: C9-C10, C9-C27
  [8, 9], [8, 26],
  // C10-C11 bonds: C10-C11, C11-C12, C11-C18
  [9, 10], [10, 11], [10, 17],
  // C13 bonds: C13-C14, C13-C15, C13-C18
  [12, 13], [12, 14], [12, 17],
  // C14 bonds: C14-C15, C14-C44
  [13, 14], [13, 43],
  // C15-C16 bonds: C15-C16, C16-C17, C16-C46
  [14, 15], [15, 16], [15, 45],
  // C17 bonds: C17-C18, C17-C47
  [16, 17], [16, 46],
  // C19 bonds: C19-C20, C19-C21, C19-C49
  [17, 18], [17, 19], [17, 48],
  // C20 bonds: C20-C21, C20-C50
  [18, 19], [18, 49],
  // C21-C22 bonds: C21-C22, C22-C23, C22-C52
  [19, 20], [20, 21], [20, 51],
  // C23 bonds: C23-C24, C23-C53
  [21, 22], [21, 52],
  // C24 bonds: C24-C25, C24-C55
  [22, 23], [22, 54],
  // C25 bonds: C25-C26, C25-C55
  [23, 24], [23, 54],
  // C26 bonds: C26-C27, C26-C57
  [24, 25], [24, 56],
  // C27-C29 bonds: C27-C28, C28-C29, C29-C30
  [25, 26], [26, 27], [27, 28],
  // C31 bonds: C31-C32, C31-C33, C31-C58
  [30, 31], [30, 32], [30, 57],
  // C32 bonds: C32-C33, C32-C37
  [31, 32], [31, 36],
  // C33 bond: C33-C34
  [32, 33],
  // C34-C35 bonds: C34-C35, C34-C36
  [33, 34], [33, 35],
  // C35-C36 bonds: C35-C36, C35-C60
  [34, 35], [34, 59],
  // C36 bond: C36-C42
  [35, 41],
  // C37 bonds: C37-C38, C37-C39
  [36, 37], [36, 38],
  // C38 bonds: C38-C40, C38-C42
  [37, 39], [37, 41],
  // C39 bonds: C39-C40, C39-C57
  [38, 39], [38, 56],
  // C40-C41 bonds: C40-C41, C41-C42, C41-C47
  [39, 40], [40, 41], [40, 46],
  // C43 bonds: C43-C44, C43-C45, C43-C48
  [42, 43], [42, 44], [42, 47],
  // C44 bonds: C44-C45
  [43, 44],
  // C45 bonds: C45-C46
  [44, 45],
  // C46 bond: C46-C47
  [45, 46],
  // C48 bonds: C48-C49, C48-C61
  [47, 48], [47, 60],
  // C49 bond: C49-C50
  [48, 49],
  // C50 bonds: C50-C51
  [49, 50],
  // C51 bonds: C51-C52, C51-C61
  [50, 51], [50, 60],
  // C52 bond: C52-C53
  [51, 52],
  // C53 bonds: C53-C54
  [52, 53],
  // C54 bonds: C54-C55, C54-C62
  [53, 54], [53, 61],
  // C56 bonds: C56-C57, C56-C58, C56-C63
  [55, 56], [55, 57], [55, 62],
  // C58 bonds: C58-C59
  [57, 58],
  // C59 bond: C59-C60
  [58, 59],
  // C61 bonds: C61-C62
  [60, 61],
  // C62 bonds: C62-C63
  [61, 62],
  // C63 bonds: C63-C64
  [62, 63],
  // C64 bonds: C64-C65
  [63, 64],
  // C65 bonds: C65-C66
  [64, 65],
  // C66 bonds: C66-C67
  [65, 66],
  // C67 bonds: C67-C68, C67-C70
  [66, 67], [66, 69],
  // C68 bonds: C68-C69, C68-C70
  [67, 68], [67, 69],
  // C69 bond: C69-C70
  [68, 69],
]

// Convert fractional to Cartesian coordinates for hexagonal system
function fracToCartesian(x: number, y: number, z: number): [number, number, number] {
  // For hexagonal system with a = b:
  // x_cart = a * x + b * cos(gamma) * y
  // y_cart = b * sin(gamma) * y
  // z_cart = c * z
  
  const cosGamma = Math.cos(gamma)
  const sinGamma = Math.sin(gamma)
  
  const cx = a * x + b * cosGamma * y
  const cy = b * sinGamma * y
  const cz = c * z
  
  return [cx, cy, cz]
}

// Convert all coordinates
const c70CartesianCoords = c70FractionalCoords.map(frac => fracToCartesian(frac[0], frac[1], frac[2]))

// Center the molecule at origin
function centerMolecule(coords: [number, number, number][]): [number, number, number][] {
  // Calculate centroid
  const cx = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
  const cy = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
  const cz = coords.reduce((sum, c) => sum + c[2], 0) / coords.length
  
  // Shift to center
  return coords.map(([x, y, z]) => [x - cx, y - cy, z - cz])
}

const centeredCoords = centerMolecule(c70CartesianCoords)

// Scale to reasonable size
const scale = 0.5
const scaledCoords = centeredCoords.map(([x, y, z]) => [x * scale, y * scale, z * scale] as [number, number, number])
const c70Bonds3NN = generateC70BondsFromCoords(c70CartesianCoords)

// Export interfaces
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

// Create C70 molecule data
export const c70Data: MoleculeData = {
  name: 'C70',
  formula: 'C70',
  atomCount: 70,
  bondCount: c70Bonds3NN.length,
  atoms: scaledCoords.map((pos, idx) => ({
    id: idx + 1,
    position: pos,
    element: 'C'
  })),
  bonds: c70Bonds3NN.map(([i, j]) => ({
    atom1Index: i,
    atom2Index: j
  }))
}

console.log(`C70: ${c70Data.atoms.length} atoms, ${c70Data.bonds.length} bonds`)
