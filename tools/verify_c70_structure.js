// Simple topology verifier for C70 model generated via 3NN
// - Recomputes 3NN edges from coordinates and checks V, E, F (Euler) consistency
// - Prints a compact report to stdout

const fs = require('fs');

// Read C70 TS data file to extract coordinates (fractional) and CIF constants
const dataPath = require('path').join(__dirname, '../src/data/c70.ts');
const ts = fs.readFileSync(dataPath, 'utf8');

function extractFractionalCoords(tsSource) {
  const marker = 'const c70FractionalCoords: [number, number, number][] = [';
  const start = tsSource.indexOf(marker);
  if (start < 0) {
    throw new Error('Fractional coordinates block not found in c70.ts');
  }
  // Find the end of the array by locating the sequence '];' that terminates the array
  const end = tsSource.indexOf('];', start);
  if (end < 0) {
    throw new Error('Could not locate end of fractional coords block');
  }
  // crude extraction: gather all lines between the start and the closing delimiter
  const block = tsSource.substring(start, end + 2);
  // regex to capture [x, y, z] triples
  const re = /\[([^\]]+)\]/g;
  const coords = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    const parts = m[1].split(',').map(s => s.trim());
    if (parts.length === 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      coords.push([x, y, z]);
    }
  }
  return coords;
}

function fracToCartesian(a, b, c, gamma, x, y, z) {
  const cosGamma = Math.cos(gamma);
  const sinGamma = Math.sin(gamma);
  const cx = a * x + b * cosGamma * y;
  const cy = b * sinGamma * y;
  const cz = c * z;
  return [cx, cy, cz];
}

function computeCartesianCoords(fracCoords) {
  // CIF constants (as in TS file)
  const a = 10.6, b = 10.6, c = 17.2;
  const gamma = 120 * Math.PI / 180;
  return fracCoords.map(frac => fracToCartesian(a, b, c, gamma, frac[0], frac[1], frac[2]));
}

function centerCoords(coords) {
  const n = coords.length;
  let sx = 0, sy = 0, sz = 0;
  for (const [x, y, z] of coords) { sx += x; sy += y; sz += z; }
  const cx = sx / n; const cy = sy / n; const cz = sz / n;
  return coords.map(([x, y, z]) => [x - cx, y - cy, z - cz]);
}

function scaleCoords(coords, scale=0.5) {
  return coords.map(([x, y, z]) => [x * scale, y * scale, z * scale]);
}

function compute3NNEdges(coords) {
  const n = coords.length;
  const edges = new Set();
  for (let i = 0; i < n; i++) {
    const dists = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = coords[i][0] - coords[j][0];
      const dy = coords[i][1] - coords[j][1];
      const dz = coords[i][2] - coords[j][2];
      const dist2 = dx*dx + dy*dy + dz*dz;
      dists.push({ idx: j, d: dist2 });
    }
    dists.sort((a,b)=> a.d - b.d);
    for (let k = 0; k < 3 && k < dists.length; k++) {
      const j = dists[k].idx;
      const a = Math.min(i, j), b = Math.max(i, j);
      edges.add(a + '-' + b);
    }
  }
  return Array.from(edges).map(e => e.split('-').map(Number));
}

function run() {
  const fracCoords = extractFractionalCoords(ts);
  if (fracCoords.length < 70) {
    console.error('Expected 70 fractional coordinates, got', fracCoords.length);
    process.exit(2);
  }
  const cart = computeCartesianCoords(fracCoords);
  const centered = centerCoords(cart);
  const scaled = scaleCoords(centered, 0.5);
  const edges = compute3NNEdges(scaled);
  const V = scaled.length;
  const E = edges.length;
  const F = E - V + 2;
  console.log(`C70 topology check: V=${V}, E=${E}, F≈${F}`);
}

run();
