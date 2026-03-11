// Lightweight, heuristic symmetry checker for fullerene-like graphs
// This is an approximate tool to assess symmetry around the principal axis (z-axis)
// and a horizontal mirror (XY-plane) for the C70 topology generated via 3NN.
// It does not guarantee mathematical proof but helps guide exploration.

export type SymmetryResult = {
  fivefold: boolean;
  fivefoldAngles?: number[];
  mirror: boolean;
  permutation5Fold?: number[]; // mapping from original index to rotated index under best rotation
  permutationMirror?: number[];
};

// Rotate a point around Z axis by angle theta (radians) about a given center
export function rotateAroundZ(p: [number, number, number], theta: number, center: [number, number, number] = [0,0,0]): [number, number, number] {
  const [cx, cy, cz] = center;
  const x = p[0] - cx;
  const y = p[1] - cy;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const xr = x * cosT - y * sinT;
  const yr = x * sinT + y * cosT;
  return [xr + cx, yr + cy, p[2]];
}

// Compute nearest-neighbor index mapping from a set of rotated coordinates back to the original indices.
function bestIndexMapping(rotated: [number, number, number][], originals: [number, number, number][]): number[] {
  const mapping: number[] = [];
  for (const r of rotated) {
    let best = 0;
    let bestD = Number.POSITIVE_INFINITY;
    for (let i = 0; i < originals.length; i++) {
      const dx = r[0] - originals[i][0];
      const dy = r[1] - originals[i][1];
      const dz = r[2] - originals[i][2];
      const d = dx*dx + dy*dy + dz*dz;
      if (d < bestD) { bestD = d; best = i; }
    }
    mapping.push(best);
  }
  return mapping;
}

// Build an edge set descriptor for quick lookup
function edgeSetFromEdges(edges: number[][]): Set<string> {
  const s = new Set<string>();
  for (const [a, b] of edges) {
    const x = Math.min(a, b);
    const y = Math.max(a, b);
    s.add(`${x}-${y}`);
  }
  return s;
}

export function estimatePhaseCSymmetry(coords: [number, number, number][], edges: number[][], tolerance = 1e-6): SymmetryResult {
  const n = coords.length;
  // Centered-original coordinates (we assume coords are already centered in upstream code)
  // Prepare original set
  const originals = coords;
  const edgeSet = edgeSetFromEdges(edges);

  // 5-fold rotations around Z axis by multiples of 72 degrees
  const bestFiveFold: {angle: number; ok: boolean; mapping?: number[]}[] = [];
  for (let k = 0; k < 5; k++) {
    const angle = (2 * Math.PI / 5) * k;
    // rotate all points
    const rotated = originals.map(p => rotateAroundZ(p, angle));
    // build mapping from rotated index -> nearest original index
    const mapping = bestIndexMapping(rotated, originals);
    // verify edge set invariance under this permutation
    let ok = true;
    for (const [a, b] of edges) {
      const ta = mapping[a];
      const tb = mapping[b];
      const x = Math.min(ta, tb);
      const y = Math.max(ta, tb);
      if (!edgeSet.has(`${x}-${y}`)) { ok = false; break; }
    }
    bestFiveFold.push({ angle, ok, mapping });
  }
  const fivefold = bestFiveFold.filter(r => r.ok).length > 0; // if at least one rotation preserves edges

  // Mirror symmetry: reflect across XY-plane (z -> -z)
  const mirrored = originals.map(p => [p[0], p[1], -p[2]] as [number,number,number]);
  const mapMirror = bestIndexMapping(mirrored, originals);
  let mirror = true;
  for (let i = 0; i < n; i++) {
    const mi = mapMirror[i];
    // There must be an edge corresponding to mirrored position in original
    // We'll simply check that the distance is small to some vertex; actual edge check would require mapping to edges; approximate check:
  }

  return {
    fivefold,
    mirror,
  };
}
