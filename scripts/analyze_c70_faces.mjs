// C70 Face Analysis Script - Improved Algorithm
// Use edge-based face detection for fullerene

import fs from 'fs';

// Read C70 coordinates directly from c70_math.ts
const c70MathPath = './src/data/c70_math.ts';
const content = fs.readFileSync(c70MathPath, 'utf8');

// Extract coordinates from the coords array
const coordsMatch = content.match(/\[\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*\]/g);
const coords = coordsMatch.map(s => {
  const nums = s.match(/[\d.-]+/g).map(Number);
  return nums;
});

console.log(`Found ${coords.length} coordinates`);

// Build bonds using 3NN + mutual check + edge fill
const adj = Array.from({ length: 70 }, () => []);

// Compute distances
const dists = [];
for (let i = 0; i < 70; i++) {
  dists[i] = [];
  for (let j = 0; j < 70; j++) {
    if (i === j) continue;
    const dx = coords[i][0] - coords[j][0];
    const dy = coords[i][1] - coords[j][1];
    const dz = coords[i][2] - coords[j][2];
    const d2 = dx * dx + dy * dy + dz * dz;
    dists[i].push({ idx: j, d: d2 });
  }
  dists[i].sort((a, b) => a.d - b.d);
}

// Find mutual 3NN edges
const edgeSet = new Set();
for (let i = 0; i < 70; i++) {
  for (let t = 0; t < 3; t++) {
    const j = dists[i][t].idx;
    const isMutual = dists[j].some(p => p.idx === i);
    if (isMutual && i < j) {
      edgeSet.add(`${i}-${j}`);
    }
  }
}

// Edge fill to reach 105
let edges = Array.from(edgeSet).map(s => s.split('-').map(Number));
if (edges.length < 105) {
  const existing = new Set(edges.map(e => `${e[0]}-${e[1]}`));
  const candidates = [];
  for (let i = 0; i < 70; i++) {
    for (let j = i + 1; j < 70; j++) {
      if (!existing.has(`${i}-${j}`)) {
        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const d2 = dx * dx + dy * dy + dz * dz;
        candidates.push({ i, j, d: d2 });
      }
    }
  }
  candidates.sort((a, b) => a.d - b.d);
  for (const c of candidates) {
    if (edges.length >= 105) break;
    edges.push([c.i, c.j]);
  }
}

// Build adjacency
for (const [i, j] of edges) {
  adj[i].push(j);
  adj[j].push(i);
}

console.log(`Vertices: 70, Bonds: ${edges.length}`);

// Verify degrees
let degreeIssues = 0;
for (let i = 0; i < 70; i++) {
  if (adj[i].length !== 3) {
    console.log(`Atom ${i}: degree ${adj[i].length}`);
    degreeIssues++;
  }
}
if (degreeIssues === 0) console.log('All atoms degree = 3 ✓');

// More efficient: for each vertex, find all small cycles
function findAllSmallCycles(adj) {
  const n = adj.length;
  const faces = new Map();
  
  function findCyclesFrom(start, current, path) {
    for (const next of adj[current]) {
      if (next === start && path.length >= 4) {
        // Found cycle
        const cycle = [...path].sort((a, b) => a - b);
        const key = cycle.join('-');
        if (!faces.has(key)) {
          const size = cycle.length;
          if (size === 5 || size === 6) {
            faces.set(key, { size, atoms: cycle });
          }
        }
      } else if (!path.includes(next) && path.length < 6) {
        findCyclesFrom(start, next, [...path, next]);
      }
    }
  }
  
  for (let i = 0; i < n; i++) {
    findCyclesFrom(i, i, [i]);
  }
  
  return Array.from(faces.values());
}

const allFaces = findAllSmallCycles(adj);

const pentagons = allFaces.filter(f => f.size === 5);
const hexagons = allFaces.filter(f => f.size === 6);

console.log(`\n=== Found ${pentagons.length} pentagons and ${hexagons.length} hexagons ===`);
console.log(`Total faces: ${pentagons.length + hexagons.length}`);

// Verify Euler: V - E + F = 2
const V = 70, E = 105, F = pentagons.length + hexagons.length;
console.log(`Euler: ${V} - ${E} + ${F} = ${V - E + F} (should be 2)`);

// Each edge should belong to exactly 2 faces
console.log('\n=== Edge-face verification ===');
const edgeFaceCount = new Map();
for (const face of allFaces) {
  const atoms = face.atoms;
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];
    const b = atoms[(i + 1) % atoms.length];
    const key = Math.min(a, b) + '-' + Math.max(a, b);
    edgeFaceCount.set(key, (edgeFaceCount.get(key) || 0) + 1);
  }
}
let edgesWith2Faces = 0;
for (const count of edgeFaceCount.values()) {
  if (count === 2) edgesWith2Faces++;
}
console.log(`Edges with exactly 2 faces: ${edgesWith2Faces}/${E}`);

console.log('\n=== PENTAGONS (5-membered rings) ===');
pentagons.forEach((p, idx) => {
  console.log(`Pentagon ${idx + 1}: [${p.atoms.join(', ')}]`);
});

console.log('\n=== HEXAGONS (6-membered rings) ===');
hexagons.forEach((h, idx) => {
  console.log(`Hexagon ${idx + 1}: [${h.atoms.join(', ')}]`);
});
