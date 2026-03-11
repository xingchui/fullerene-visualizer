// Symmetry tests for C70 topology using 3NN-derived coordinates
// - Extract fractional coords from src/data/c70.ts
// - Convert to Cartesian, center, scale
// - Build mutual 3NN edges (as a baseline for symmetry tests)
// - Apply 5-fold rotations around Z and XY-mirror, map rotated/mirrored points back to originals by nearest neighbor
// - Check if edge sets are preserved under any rotation/mirror (approximate symmetry test)

import fs from 'fs';
import path from 'path';

function readC70FractionalCoords(tsPath) {
  const ts = fs.readFileSync(tsPath, 'utf8');
  const re = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
  const coords = [];
  let m;
  while ((m = re.exec(ts)) !== null) {
    coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  return coords;
}

// New: attempt to load coordinates from c70.xyz as primary source (Stage C1 bootstrap)
function loadXYZCoordsDefault(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
    // Heuristic: skip first two (count + comment) if present
    let idx = 2;
    if (content.length > 0 && content[0].trim().match(/^\d+$/)) idx = 2; // typical .xyz
  const coords = [];
    for (let i = idx; i < content.length; i++) {
      const line = content[i].trim(); if (!line) continue;
      const parts = line.split(/\s+/);
      const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number);
      if (nums.length >= 3 && nums.every(n => Number.isFinite(n))) coords.push([nums[0], nums[1], nums[2]]);
      else if (parts.length >= 3) {
        const x = Number.parseFloat(parts[0]); const y = Number.parseFloat(parts[1]); const z = Number.parseFloat(parts[2]);
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) coords.push([x,y,z]);
      }
    }
    if (coords.length >= 70) return coords;
  } catch (e) {
    // ignore
  }
  return null;
}

function fracToCart(x, y, z) {
  const a = 10.6, b = 10.6, c = 17.2;
  const gamma = (2 * Math.PI) / 3; // 120 degrees
  const cosG = Math.cos(gamma);
  const sinG = Math.sin(gamma);
  const cx = a * x + b * cosG * y;
  const cy = b * sinG * y;
  const cz = c * z;
  return [cx, cy, cz];
}

function centerAndScale(cart) {
  const n = cart.length;
  const centroid = cart.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0,0,0]);
  const cen = [centroid[0]/n, centroid[1]/n, centroid[2]/n];
  const centered = cart.map(([x,y,z]) => [x - cen[0], y - cen[1], z - cen[2]]);
  const scaled = centered.map(([x,y,z]) => [x*0.5, y*0.5, z*0.5]);
  return scaled;
}

function rotateAroundZ(p, theta, center=[0,0,0]) {
  const [cx, cy] = [center[0], center[1]];
  const x = p[0] - cx;
  const y = p[1] - cy;
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  const xr = x * cosT - y * sinT;
  const yr = x * sinT + y * cosT;
  return [xr + cx, yr + cy, p[2]];
}

function dist2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2]; return dx*dx+dy*dy+dz*dz; }

function computeMutual3NN(coords, k=3){
  const n = coords.length;
  const neigh = new Array(n);
  for (let i=0;i<n;i++){
    const d = [];
    for (let j=0;j<n;j++) if (i!==j){ d.push({idx:j, d: dist2(coords[i], coords[j])}); }
    d.sort((a,b)=> a.d - b.d);
    neigh[i] = d.slice(0, Math.min(k, d.length)).map(x => x.idx);
  }
  const set = new Set();
  for (let i=0;i<n;i++){
    for (const j of neigh[i]){
      if (neigh[j] && neigh[j].includes(i)){
        const a = Math.min(i,j), b = Math.max(i,j);
        set.add(`${a}-${b}`);
      }
    }
  }
  return Array.from(set).map(e => e.split('-').map(Number));
}

function toEdgeSet(edges){ return new Set(edges.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`)); }

function testSymmetry(coords, edges){
  const edgeSet = toEdgeSet(edges);
  const n = coords.length;
  // 5-fold rotations
  const results = [];
  for (let r=0; r<5; r++){
    const theta = (2*Math.PI/5) * r;
    const rotated = coords.map(p => rotateAroundZ(p, theta));
    // mapping: rotated index -> nearest original index by distance
    const mapping = rotated.map((rp) => {
      let best=0, bestD=Infinity;
      for (let i=0;i<coords.length;i++){
        const d = dist2(rp, coords[i]);
        if (d < bestD){ bestD = d; best = i; }
      }
      return best;
    });
    // check edge preservation under permutation
    let ok = true;
    for (const [a,b] of edges){
      const ta = mapping[a], tb = mapping[b];
      const x = Math.min(ta, tb), y = Math.max(ta, tb);
      if (!edgeSet.has(`${x}-${y}`)) { ok = false; break; }
    }
    results.push({angle: theta, ok, mapping});
  }
  // Mirror symmetry: reflect across XY plane
  const mirrored = coords.map(p => [p[0], p[1], -p[2]]);
  const mapMirror = mirrored.map((rp) => {
    let best=0, bestD=Infinity;
    for (let i=0;i<coords.length;i++){
      const d = dist2(rp, coords[i]);
      if (d < bestD){ bestD = d; best = i; }
    }
    return best;
  });
  let mirrorOk = true;
  for (const [a,b] of edges){
    const ta = mapMirror[a], tb = mapMirror[b];
    const x = Math.min(ta, tb), y = Math.max(ta, tb);
    if (!edgeSet.has(`${x}-${y}`)) { mirrorOk = false; break; }
  }
  return { fivefold: results.filter(r => r.ok).length > 0, mirror: mirrorOk, details: results, mirrorMap: mapMirror };
}

// Load coordinates and run symmetry checks
let coords = readC70FractionalCoords(path.resolve('src','data','c70.ts'));
let useXYZ = false;
let xyzCoords = loadXYZCoordsDefault(path.resolve('E:\\op\\op6','c70.xyz'));
if (xyzCoords && xyzCoords.length >= 70) {
  // Convert to the same coordinate framing used in symmetry tests (no CIF transform; assume Cartesian)
  coords = xyzCoords;
  useXYZ = true;
}
const symmetry = (() => {
  // Convert to mutual 3NN edges based on current coords
  const edges = computeMutual3NN(coords);
  return testSymmetry(coords, edges);
})();
console.log('Symmetry test results (Stage C preliminary):', symmetry);
