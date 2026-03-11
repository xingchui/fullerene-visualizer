// C70 (Fullerene) - Proper D5h coordinates from Nanoten
// Pre-computed coordinates for C70 D5h (rugby ball shape)
// Source: https://nanoten.com/science/fullerene/fullerene.php?C=70
// These coordinates form the correct cage structure with:
// 70 vertices, 105 edges, 12 pentagons + 25 hexagons = 37 faces

const SCALE = 3.5

// Pre-computed C70 D5h coordinates from crystallographic data
function generateC70VerticesD5h(): [number, number, number][] {
  // C70 D5h coordinates from optimized structure (Nanoten)
  const coords = [
    [3.10040, -2.22950, 0.64890],
    [2.35690, -2.27550, 1.80620],
    [3.86850, -1.12570, 0.31760],
    [2.36060, -1.19050, 2.64930],
    [1.18890, -0.80600, 3.26780],
    [0.00540, -1.54950, 3.15030],
    [-1.17760, -0.80380, 3.26930],
    [3.10400, -1.30760, -1.92120],
    [2.35870, -2.42090, -1.60480],
    [3.87340, -0.64920, -0.97850],
    [2.35600, -2.88280, -0.31200],
    [1.18470, -3.36370, 0.23960],
    [-0.00320, -3.48300, -0.49190],
    [-1.19250, -3.36240, 0.23850],
    [-0.00130, -2.68640, 2.27260],
    [1.18580, -2.97550, 1.59230],
    [-1.19010, -2.97170, 1.59250],
    [3.12430, 1.43310, -1.84010],
    [2.37240, 0.77960, -2.79640],
    [3.88420, 0.72990, -0.92560],
    [2.35810, -0.59160, -2.83490],
    [1.18600, -1.26820, -3.10940],
    [0.00600, -0.59530, -3.45190],
    [-1.17840, -1.26620, -3.11030],
    [-0.00230, -2.99610, -1.84630],
    [1.18540, -2.43850, -2.33220],
    [-1.18990, -2.43670, -2.33050],
    [3.10970, 2.17860, 0.79510],
    [2.36530, 2.89280, -0.12460],
    [3.88190, 1.09750, 0.40490],
    [2.36830, 2.51700, -1.44650],
    [1.19510, 2.58280, -2.17010],
    [0.00630, 3.10740, -1.64850],
    [-1.18420, 2.58420, -2.16880],
    [0.00530, 0.83980, -3.41030],
    [1.19580, 1.47190, -3.03170],
    [-1.18330, 1.47290, -3.03170],
    [3.12070, -0.08220, 2.33410],
    [2.37300, 1.01260, 2.72740],
    [3.88130, -0.04450, 1.18320],
    [2.36430, 2.14600, 1.95270],
    [1.19340, 2.85550, 1.77540],
    [0.01230, 2.51750, 2.44940],
    [-1.17090, 2.85580, 1.77680],
    [0.00690, 3.50530, -0.26620],
    [1.19320, 3.33770, 0.45570],
    [-1.17970, 3.33650, 0.45530],
    [0.00690, 1.33420, 3.26100],
    [1.19420, 0.59640, 3.32470],
    [-1.18140, 0.60020, 3.32240],
    [-3.08240, 2.18940, 0.79720],
    [-2.34770, 2.14890, 1.96240],
    [-2.35890, 1.01380, 2.73390],
    [-3.84350, 1.10370, 0.39200],
    [-3.10280, 1.43960, -1.84690],
    [-2.36200, 2.53430, -1.44740],
    [-2.35510, 2.90830, -0.12980],
    [-3.85090, 0.71830, -0.93570],
    [-3.09450, -1.31330, -1.93060],
    [-2.35580, -0.58590, -2.84480],
    [-2.35840, 0.78400, -2.80610],
    [-3.85150, -0.66220, -0.97070],
    [-3.09790, -2.24060, 0.65370],
    [-2.36930, -2.89780, -0.31960],
    [-2.36750, -2.43580, -1.60910],
    [-3.85400, -1.12300, 0.33240],
    [-3.10720, -0.07410, 2.34350],
    [-2.36000, -1.19420, 2.65860],
    [-2.36230, -2.27810, 1.81840],
    [-3.85710, -0.03460, 1.18500]
  ]

  // Normalize to desired scale
  // Find center and scale
  let cx = 0, cy = 0, cz = 0
  for (const c of coords) {
    cx += c[0]; cy += c[1]; cz += c[2]
  }
  cx /= 70; cy /= 70; cz /= 70

  // Scale coordinates
  return coords.map(c => {
    const x = (c[0] - cx) * SCALE / 3.5
    const y = (c[1] - cy) * SCALE / 3.5
    const z = (c[2] - cz) * SCALE / 3.5
    return [x, y, z] as [number, number, number]
  })
}

function generateC70Vertices(): [number, number, number][] {
  // Use proper D5h symmetry generator
  return generateC70VerticesD5h()
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

function generateBonds(vertices: [number, number, number][]): [number, number][] {
  const pairs: {i: number, j: number, d: number}[] = []
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      pairs.push({i, j, d: distance(vertices[i], vertices[j])})
    }
  }
  pairs.sort((a, b) => a.d - b.d)
  
  const threshold = 2.65
  const bonds: [number, number][] = []
  const deg = new Array(vertices.length).fill(0)
  
  for (const p of pairs) {
    if (p.d > threshold) break
    if (deg[p.i] < 3 && deg[p.j] < 3) {
      bonds.push([p.i, p.j])
      deg[p.i]++
      deg[p.j]++
    }
  }
  
  return bonds
}

export function generateC70VerticesExport(): [number, number, number][] {
  return generateC70Vertices()
}

export function generateC70BondsExport(vertices: [number, number, number][]): [number, number][] {
  return generateBonds(vertices)
}
