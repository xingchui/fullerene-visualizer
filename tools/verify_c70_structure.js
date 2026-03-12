// ES module friendly topology verifier for C70 model generated via 3NN
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to c70.ts
const dataPath = path.resolve(__dirname, '../src/data/c70.ts');
const ts = fs.readFileSync(dataPath, 'utf-8');

// Extract all triples [x, y, z] from fractional coordinates in c70.ts
const tripleRegex = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
let coords = [];
let m;
while ((m = tripleRegex.exec(ts)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}

// Convert fractional to Cartesian coordinates for hexagonal system
const a = 10.6, b = 10.6, c = 17.2, gamma = Math.PI * 2 / 3; // 120 degrees in radians
function fracToCartesian(x, y, z) {
  const cos = Math.cos(gamma);
  const sin = Math.sin(gamma);
  const cx = a * x + b * cos * y;
  const cy = b * sin * y;
  const cz = c * z;
  return [cx, cy, cz];
}
const cart = coords.map(([x, y, z]) => fracToCartesian(x, y, z));
// Center molecule at origin
const centroid = cart.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]).map(v => v / cart.length);
const centered = cart.map(([x, y, z]) => [x - centroid[0], y - centroid[1], z - centroid[2]]);
// Scale for reasonable size
const scale = 0.5;
const scaled = centered.map(([x, y, z]) => [x * scale, y * scale, z * scale]);

// Compute 3NN edges
function compute3NNEdges(coords2) {
  const n = coords2.length;
  const edgesSet = new Set();
  for (let i = 0; i < n; i++) {
    const dists = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = coords2[i][0] - coords2[j][0];
      const dy = coords2[i][1] - coords2[j][1];
      const dz = coords2[i][2] - coords2[j][2];
      const dist2 = dx*dx + dy*dy + dz*dz;
      dists.push({ idx: j, d: dist2 });
    }
    dists.sort((a,b)=> a.d - b.d);
    for (let k = 0; k < 3 && k < dists.length; k++) {
      const j = dists[k].idx;
      if (i < j) edgesSet.add(i + '-' + j);
    }
  }
  return Array.from(edgesSet).map(str => str.split('-').map(Number));
}

const edges = compute3NNEdges(scaled);
const V = scaled.length;
const E = edges.length;
const F = E - V + 2;
console.log(`C70 topology: V=${V}, E=${E}, F≈${F}`);
console.log(`Edges: ${JSON.stringify(edges)}`);
if (V !== 70) console.error(`Warning: expected V=70, got ${V}`);
if (E !== 105) console.error(`Warning: expected E=105, got ${E}`);
if (Math.abs(F - 37) > 1) console.warn(`Warning: Euler F expected ~37, got ~${F}`);
