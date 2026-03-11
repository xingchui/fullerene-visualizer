// Check the rotated coordinates (phi=30) for Stage C.2 alignment: compute 3NN edges length
import fs from 'fs';
import path from 'path';

function parseXYZ(filePath){
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  let idx = 0; if (lines.length>0 && lines[0].trim().match(/^\d+$/)) idx = 2; else idx = 0;
  const coords = [];
  for (let i=idx; i<lines.length; i++){ const line = lines[i].trim(); if(!line) continue; const parts = line.split(/\s+/); const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number); if (nums.length>=3 && nums.every(n=>Number.isFinite(n))) coords.push([nums[0],nums[1],nums[2]]); else if (parts.length>=3){ const x = parseFloat(parts[0]); const y = parseFloat(parts[1]); const z = parseFloat(parts[2]); if (Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z)) coords.push([x,y,z]); } }
  return coords;
}

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
  for (let i=0;i<n;i++) for (const j of neigh[i]) if (neigh[j] && neigh[j].includes(i)) { const a = Math.min(i,j), b = Math.max(i,j); set.add(`${a}-${b}`); }
  return Array.from(set).map(e => e.split('-').map(Number));
}

const inXYZ = path.resolve('E:\\op\\op6','c70.xyz.aligned.stage2_phi30.xyz');
const coords = parseXYZ(inXYZ);
if (!coords || coords.length < 70){ console.log('Aligned XYZ not found or insufficient coordinates.'); process.exit(0); }
const edges = mutual3NNEdges(coords, 3);
console.log('Stage C.2 Align Check: rotated coords edge count =', edges.length);
