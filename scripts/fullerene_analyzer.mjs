// Fullerene Topology Analyzer
// Universal script to analyze any fullerene structure

import fs from 'fs';
import { generateC70VerticesExport } from '../src/data/c70_math.js';

// Usage: node scripts/fullerene_analyzer.mjs <coords_file> [n]
// Example: node scripts/fullerene_analyzer.mjs c70_coords.txt 70

const args = process.argv.slice(2);
const coordsFile = args[0] || 'coords.txt';
const n = parseInt(args[1]) || 60; // Default to C60

console.log(`=== Fullerene Analyzer ===`);
console.log(`Input: ${coordsFile}, Atoms: ${n}\n`);

// Expected values
const EXPECTED_V = n;
const EXPECTED_E = (3 * n - 6) / 2;
const EXPECTED_F = n / 2 + 2;
const EXPECTED_PENT = 12;
const EXPECTED_HEX = n / 2 - 10;

console.log(`Expected topology:`);
console.log(`  V = ${EXPECTED_V}, E = ${EXPECTED_E}, F = ${EXPECTED_F}`);
console.log(`  Pentagons: ${EXPECTED_PENT}, Hexagons: ${EXPECTED_HEX}\n`);

// Try to read coordinates from file
let coords = [];

try {
  // Try reading XYZ file
  const content = fs.readFileSync(coordsFile, 'utf8');
  const lines = content.trim().split('\n');
  
  // XYZ format: first line is atom count, second is comment
  const startLine = lines[0].trim().match(/^\d+$/) ? 2 : 0;
  
  for (let i = startLine; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 4) {
      coords.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    }
  }
  console.log(`Loaded ${coords.length} coordinates from ${coordsFile}`);
} catch (e) {
  console.log(`Could not load ${coordsFile}, no fallback for n=${n}`);
  console.log(`Usage: node scripts/fullerene_analyzer.mjs <xyz_file> <atom_count>`);
  console.log(`Example: node scripts/fullerene_analyzer.mjs c60.xyz 60`);
  process.exit(1);
}

if (coords.length !== EXPECTED_V) {
  console.error(`ERROR: Expected ${EXPECTED_V} atoms, got ${coords.length}`);
  process.exit(1);
}

// Build adjacency using mutual 3NN + edge fill
const adj = Array.from({ length: n }, () => []);
const dists = [];

for (let i = 0; i < n; i++) {
  dists[i] = [];
  for (let j = 0; j < n; j++) {
    if (i === j) continue;
    const dx = coords[i][0] - coords[j][0];
    const dy = coords[i][1] - coords[j][1];
    const dz = coords[i][2] - coords[j][2];
    const d2 = dx * dx + dy * dy + dz * dz;
    dists[i].push({ idx: j, d: d2 });
  }
  dists[i].sort((a, b) => a.d - b.d);
}

// Mutual 3NN
const edgeSet = new Set();
for (let i = 0; i < n; i++) {
  for (let t = 0; t < 3; t++) {
    const j = dists[i][t].idx;
    const isMutual = dists[j].some(p => p.idx === i);
    if (isMutual && i < j) {
      edgeSet.add(`${i}-${j}`);
    }
  }
}

// Edge fill
let edges = Array.from(edgeSet).map(s => s.split('-').map(Number));
if (edges.length < EXPECTED_E) {
  const existing = new Set(edges.map(e => `${e[0]}-${e[1]}`));
  const candidates = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
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
    if (edges.length >= EXPECTED_E) break;
    edges.push([c.i, c.j]);
  }
}

// Build adjacency
for (const [i, j] of edges) {
  adj[i].push(j);
  adj[j].push(i);
}

console.log(`\n=== Generated Topology ===`);
console.log(`Vertices: ${n}, Bonds: ${edges.length}`);

// Degree check
let degreeErrors = 0;
for (let i = 0; i < n; i++) {
  if (adj[i].length !== 3) {
    console.log(`  Atom ${i}: degree ${adj[i].length} (expected 3)`);
    degreeErrors++;
  }
}
if (degreeErrors === 0) {
  console.log(`  All atoms: degree = 3 ✓`);
}

// Find faces
function findAllSmallCycles(adj) {
  const faces = new Map();
  
  function findCyclesFrom(start, current, path) {
    for (const next of adj[current]) {
      if (next === start && path.length >= 4) {
        const cycle = [...path].sort((a, b) => a - b);
        const size = cycle.length;
        if (size === 5 || size === 6) {
          faces.set(cycle.join('-'), { size, atoms: cycle });
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

console.log(`\n=== Face Analysis ===`);
console.log(`Pentagons: ${pentagons.length} (expected ${EXPECTED_PENT})`);
console.log(`Hexagons: ${hexagons.length} (expected ${EXPECTED_HEX})`);
console.log(`Total faces: ${pentagons.length + hexagons.length} (expected ${EXPECTED_F})`);

// Euler verification
const V = n;
const E = edges.length;
const F = pentagons.length + hexagons.length;
const euler = V - E + F;

console.log(`\n=== Euler Verification ===`);
console.log(`V - E + F = ${V} - ${E} + ${F} = ${euler}`);
console.log(`Expected: 2`);
console.log(`Status: ${euler === 2 ? '✓ PASS' : '✗ FAIL'}`);

// Output face lists
if (pentagons.length > 0) {
  console.log(`\n=== Pentagon List ===`);
  pentagons.forEach((p, i) => {
    console.log(`P${i + 1}: [${p.atoms.join(', ')}]`);
  });
}

if (hexagons.length > 0) {
  console.log(`\n=== Hexagon List ===`);
  hexagons.forEach((h, i) => {
    console.log(`H${i + 1}: [${h.atoms.join(', ')}]`);
  });
}

// Summary
console.log(`\n=== SUMMARY ===`);
const passed = degreeErrors === 0 && pentagons.length === EXPECTED_PENT && 
               hexagons.length === EXPECTED_HEX && euler === 2;
console.log(`Status: ${passed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
