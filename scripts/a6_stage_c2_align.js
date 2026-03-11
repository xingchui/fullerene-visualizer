// Stage C.2 driver: symmetry alignment using c70.xyz as primary coordinates
// - Loads c70.xyz, computes mutual 3NN edges, searches for best fivefold alignment
// - Rotates coordinates around Z by 0..72 degrees, selects best alignment by edge preservation
// - Writes rotated coordinates to c70.xyz.aligned.xyz and outputs edge count after alignment
import fs from 'fs';
import path from 'path';

function parseXYZ(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  let idx = 0;
  if (lines.length > 0 && lines[0].trim().match(/^\d+$/)) idx = 2; else idx = 0;
  const coords = [];
  for (let i = idx; i < lines.length; i++) {
    const line = lines[i].trim(); if (!line) continue;
    const parts = line.split(/\s+/);
    const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number);
    if (nums.length >= 3 && nums.every(n => Number.isFinite(n))) coords.push([nums[0], nums[1], nums[2]]);
  }
  return coords;
}

function rotateZ(p, theta){ const c=Math.cos(theta), s=Math.sin(theta); return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]]; }

function dist2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2]; return dx*dx+dy*dy+dz*dz; }

function mutual3NNEdges(coords, k=3){
  const n = coords.length; const neigh = new Array(n);
  for (let i=0;i<n;i++){
    const d = [];
    for (let j=0;j<n;j++) if (i!==j){ d.push({idx:j, d: dist2(coords[i], coords[j])}); }
    d.sort((a,b)=> a.d - b.d);
    neigh[i] = d.slice(0, Math.min(k, d.length)).map(x => x.idx);
  }
  const set = new Set();
  for (let i=0;i<n;i++) for (const j of neigh[i]) if (neigh[j] && neigh[j].includes(i)) { const a = Math.min(i,j), b=Math.max(i,j); set.add(`${a}-${b}`); }
  return Array.from(set).map(e => e.split('-').map(Number));
}

function writeXYZ(filePath, coords){ const lines = []; lines.push(coords.length.toString()); lines.push('Aligned by stage C.2 symmetry alignment'); for (const [x,y,z] of coords){ lines.push(`C ${x} ${y} ${z}`); } fs.writeFileSync(filePath, lines.join('\n'), 'utf8'); }

const xyzIn = path.resolve('E:\\op\\op6','c70.xyz');
const xyzOut = path.resolve('E:\\op\\op6','c70.xyz.aligned.stage2.xyz');
const coords = parseXYZ(xyzIn);
if (!coords || coords.length < 70) { console.log('Not enough coords in XYZ input.'); process.exit(0); }
// Use simple 5-fold scan for best alignment based on edge preservation
// Convert to coordinates (already Cartesian?) If not, we assume coords are raw Cartesian
let best = {phi:0, edges:0};
let BestEdges = [];
for (let deg=0; deg<72; deg+=2){ const th = deg * Math.PI/180; const rotated = coords.map(p => rotateZ(p, th)); const edges = mutual3NNEdges(rotated, 3); if (edges.length > best.edges){ best = {phi: deg, edges: edges.length}; BestEdges = edges; } }
// Apply the best rotation to provide aligned coordinates
const aligned = coords.map(p => rotateZ(p, best.phi*Math.PI/180));
writeXYZ(xyzOut, aligned);
console.log('Stage C.2 alignment completed. Best phi deg:', best.phi, 'Aligned coords written to', xyzOut, 'Edges after rotation:', BestEdges.length);
