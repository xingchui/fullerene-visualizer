// Stage 4 — CIF-first fivefold symmetry alignment (pure JS, no TS)
// This script reads CIF fractional coordinates embedded in src/data/c70.ts, converts to Cartesian,
// computes mutual 3NN edges, searches for the best fivefold alignment by rotating around Z,
// and outputs the aligned coordinates and the edge set after alignment.

import fs from 'fs';
import path from 'path';

function fracToCartesian(x, y, z) {
  const a = 10.6, b = 10.6, c = 17.2; const gamma = Math.PI * 2 / 3;
  const cosG = Math.cos(gamma), sinG = Math.sin(gamma);
  const cx = a * x + b * cosG * y;
  const cy = b * sinG * y;
  const cz = c * z;
  return [cx, cy, cz];
}

function parseCIFCoordsFromCIF(tsPath) {
  const text = fs.readFileSync(tsPath, 'utf8');
  const marker = 'const c70FractionalCoords: [number, number, number][] = [';
  const start = text.indexOf(marker);
  if (start < 0) return [];
  const blockStart = text.indexOf('[', start);
  const end = text.indexOf(']', blockStart) + 1;
  const block = text.substring(blockStart, end);
  const r = /\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]/g;
  const coords = [];
  let m;
  while ((m = r.exec(block)) !== null) {
    coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  // clamp to 70
  return coords.length >= 70 ? coords.slice(0, 70) : coords;
}

function dist2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2]; return dx*dx+dy*dy+dz*dz; }
function mutual3NN(coords, k=3){
  const n = coords.length; const neigh = new Array(n);
  for (let i=0;i<n;i++){
    const d = [];
    for (let j=0;j<n;j++) if (i!==j){ d.push({idx:j, d: dist2(coords[i], coords[j])}); }
    d.sort((a,b)=> a.d - b.d);
    neigh[i] = d.slice(0, Math.min(k, d.length)).map(x => x.idx);
  }
  const set = new Set();
  for (let i=0;i<n;i++) for (const j of neigh[i]) if (neigh[j] && neigh[j].includes(i)) {
    const a = Math.min(i,j), b = Math.max(i,j);
    set.add(`${a}-${b}`);
  }
  const edges = Array.from(set).map(pair => pair.split('-').map(Number));
  return edges;
}

function rotateZ(p, theta){
  const c = Math.cos(theta), s = Math.sin(theta);
  return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]];
}

function countOverlap(baseEdges, edges) {
  const s = new Set(baseEdges.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`));
  let c=0; for (const [a,b] of edges) if (s.has(`${Math.min(a,b)}-${Math.max(a,b)}`)) c++;
  return c;
}

function main(){
  const tsPath = path.resolve('E:\\op\\op6','src','data','c70.ts');
  const cifFrac = parseCIFCoordsFromCIF(tsPath);
  if (!cifFrac || cifFrac.length < 70) { console.log('CIF fractional coords not found or insufficient.'); return; }
  // Convert CIF fractions to Cartesian
  const cifCart = cifFrac.map(fr => fracToCartesian(fr[0], fr[1], fr[2]));
  // Center and scale
  const n = cifCart.length;
  const centroid = cifCart.reduce((acc,p)=>[acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]);
  const cen = [centroid[0]/n, centroid[1]/n, centroid[2]/n];
  const centered = cifCart.map(p => [p[0]-cen[0], p[1]-cen[1], p[2]-cen[2]]);
  const scaled = centered.map(([x,y,z]) => [x*0.5,y*0.5,z*0.5]);

  // Base edges on original CIF coords
  const baseEdges = mutual3NN(scaled, 3);
  // Fivefold search
  let bestPhi = 0; let bestOverlap = -1; let bestEdges = baseEdges;
  for (let deg = 0; deg < 360; deg += 6){ const th = deg*Math.PI/180; const rotated = scaled.map(p => rotateZ(p, th)); const edges = mutual3NN(rotated, 3); const overlap = countOverlap(baseEdges, edges); if (overlap > bestOverlap){ bestOverlap = overlap; bestPhi = deg; bestEdges = edges; } }
  // Apply best rotation to coordinates
  const theta = bestPhi*Math.PI/180; const rotatedBest = scaled.map(p => rotateZ(p, theta));
  // Output result to a file for inspection
  const outPath = path.resolve('E:\\op\\op6','c70.xyz.stage4_aligned_phi'+bestPhi+'.xyz');
  const lines = [];
  lines.push(rotatedBest.length.toString()); lines.push('Stage4 CIF-fivefold-aligned');
  rotatedBest.forEach(p => lines.push(`C ${p[0]} ${p[1]} ${p[2]}`));
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Stage4 alignment complete. Aligned coords written to', outPath);
  console.log('Best phi (deg):', bestPhi, 'Overlaps with base edges:', bestOverlap);
}

main();
