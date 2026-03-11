// Stage C.2: symmetry-driven alignment attempt for C70 using XYZ-derived coords
// This script loads E:\op\op6\c70.xyz, computes 5 rotations (72° increments),
// evaluates how many mutual 3NN edges are preserved under each rotation, and
// selects the rotation with the best preservation. It then outputs the rotation
// angle and the resulting edge preservation count.

import fs from 'fs';
import path from 'path';
const xyzPath = 'E:\\op\\op6\\c70.xyz';

function parseXYZ(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  let start = 2;
  if (lines.length > 0 && lines[0].trim().match(/^[0-9]+$/)) start = 2;
  const coords = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim(); if (!line) continue; const parts = line.split(/\s+/);
    const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number);
    if (nums.length >= 3 && nums.every(n => Number.isFinite(n))) coords.push([nums[0], nums[1], nums[2]]);
    else if (parts.length >= 3) {
      const x = parseFloat(parts[0]), y = parseFloat(parts[1]), z = parseFloat(parts[2]); if (Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z)) coords.push([x,y,z]);
    }
  }
  return coords;
}

function rotateAroundZ(p, theta, center=[0,0,0]) {
  const x = p[0] - center[0], y = p[1] - center[1];
  const c = Math.cos(theta), s = Math.sin(theta);
  const xr = x*c - y*s, yr = x*s + y*c;
  return [xr + center[0], yr + center[1], p[2]];
}

function dist2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2]; return dx*dx+dy*dy+dz*dz; }

function load5Rotations(coords){ // returns best rotation index and preserved edge count
  // compute current mutual 3NN edges under base coords
  const edgeSrc = mutual3NN(coords, 3);
  const edgeSet = new Set(edgeSrc.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`));
  let best = {idx:0, preserved:0};
  for (let r=0; r<5; r++){
    const theta = (2*Math.PI/5)*r;
    const rotated = coords.map(p => rotateAroundZ(p, theta));
    // nearest original mapping
    const mapping = rotated.map(rp => {
      let bestI = 0, bestD = Infinity; for (let i=0;i<coords.length;i++){ const d = dist2(rp, coords[i]); if (d<bestD){ bestD=d; bestI=i; } } return bestI;
    });
    let preserved = 0; for (const [a,b] of edgeSrc){ const ta = mapping[a], tb = mapping[b]; const x = Math.min(ta,tb), y = Math.max(ta,tb); if (edgeSet.has(`${x}-${y}`)) preserved++; }
    if (preserved > best.preserved) best = {idx: r, preserved};
  }
  return best;
}

function mutual3NN(coords, k=3){
  const n = coords.length;
  const neigh = new Array(n);
  for (let i=0;i<n;i++){
    const dists = [];
    for (let j=0;j<n;j++) if (i!==j){ dists.push({idx:j, d: dist2(coords[i], coords[j])}); }
    dists.sort((a,b)=> a.d - b.d);
    neigh[i] = dists.slice(0, Math.min(k, dists.length)).map(x => x.idx);
  }
  const edges = [];
  const seen = new Set();
  for (let i=0;i<n;i++){
    for (const j of neigh[i]){
      if (neigh[j] && neigh[j].includes(i)){
        const a = Math.min(i,j), b = Math.max(i,j);
        const key = `${a}-${b}`;
        if (!seen.has(key)) { edges.push([a,b]); seen.add(key);}        
      }
    }
  }
  return edges;
}

try {
  const coords = parseXYZ(xyzPath);
  if (coords.length < 70) { console.log('Not enough coordinates in XYZ file.'); process.exit(0); }
  // Compute best rotation index
  const best = load5Rotations(coords.slice(0,70));
  console.log('Best5NN rotation index:', best.idx, 'preserved count (mutual 3NN edges):', best.preserved);
} catch (e) {
  console.error('Error during symmetry alignment stage 2:', e);
}
