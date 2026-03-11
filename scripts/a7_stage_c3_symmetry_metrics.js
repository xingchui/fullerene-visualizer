// Stage C.3: symmetry metrics for C70 using XYZ as main coordinates
// This script computes a coarse symmetry score across 0..72 degrees and reports the best alignment.
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
  for (let i=0;i<n;i++) for (const j of neigh[i]) if (neigh[j] && neigh[j].includes(i)) { const a = Math.min(i,j), b = Math.max(i,j); set.add(`${a}-${b}`); }
  return Array.from(set).map(e => e.split('-').map(Number));
}

function edgeMidpoints(coords, edges){
  return edges.map(([a,b]) => {
    const ca = coords[a], cb = coords[b];
    return [(ca[0]+cb[0])/2, (ca[1]+cb[1])/2, (ca[2]+cb[2])/2];
  });
}

function symmetryScoreForPhi(coords, edges, phiDeg){
  const th = phiDeg * Math.PI/180;
  const rotated = coords.map(p => rotateZ(p, th));
  // Map rotated edges
  const rotatedEdges = mutual3NNEdges(rotated, 3);
  const mid = edgeMidpoints(rotated, rotatedEdges);
  const counts = new Array(5).fill(0);
  for (const m of mid){ const ang = Math.atan2(m[1], m[0]); let a = ang<0? ang+2*Math.PI : ang; const idx = Math.floor(a/(2*Math.PI/5)); counts[idx] += 1; }
  const total = rotatedEdges.length; const target = total/5;
  const score = counts.reduce((acc,c)=> acc + Math.pow(c - target, 2), 0);
  return {score, rotatedEdges};
}

function extractCIFFractionalFromCIF(filePath){
  const text = fs.readFileSync(filePath, 'utf8');
  const marker = 'const c70FractionalCoords: [number, number, number][] = [';
  const start = text.indexOf(marker);
  if (start < 0) return null;
  const open = text.indexOf('[', start);
  let idx = open + 1;
  let depth = 1;
  while (idx < text.length && depth > 0) {
    const ch = text[idx++];
    if (ch === '[') depth++;
    else if (ch === ']') depth--;
  }
  const block = text.substring(open, idx);
  const triples = [];
  const re = /\[[^\]]+\]/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const inner = m[0].slice(1,-1).trim();
    const parts = inner.split(',').map(s => s.trim());
    if (parts.length === 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) triples.push([x,y,z]);
    }
  }
  return triples as [number,number,number][];
}

function main(){
  // Try CIF-based coordinates first
  const cifPath = path.resolve('E:\\op\\op6','src','data','c70.ts');
  const cifFrac = extractCIFFractionalFromCIF(cifPath);
  let coords;
  if (cifFrac && cifFrac.length >= 70) {
    // CIF fractional coords -> Cartesian (use same fracToCartesian as earlier)
    const a = 10.6, b = 10.6, c = 17.2, gamma = Math.PI * 2/3; const cosG = Math.cos(gamma); const sinG = Math.sin(gamma);
    const toCart = (x:number,y:number,z:number) => [a*x + b*cosG*y, b*sinG*y, c*z] as [number,number,number];
    coords = cifFrac.map(fr => toCart(fr[0], fr[1], fr[2]));
  }
  if (!coords) {
    // Fallback to XYZ reader if CIF extraction fails
    const inXYZ = path.resolve('E:\\op\\op6','c70.xyz');
    coords = parseXYZ(inXYZ);
  }
  if (!coords || coords.length < 70){ console.log('Insufficient coords in CIF/XYZ input.'); return; }
  const edges = mutual3NNEdges(coords, 3);
  // compute stage C.3 symmetry metric by sampling phi in [0, 72) with step 2 degrees
  let best = {phi: 0, score: Infinity};
  for (let deg=0; deg<72; deg+=2){
    const th = deg * Math.PI/180;
    const rotated = coords.map(p => rotateZ(p, th));
    const rotatedEdges = mutual3NNEdges(rotated, 3);
    // midpoints and azimuth histogram
    const mid = rotatedEdges.map(([a,b]) => {
      const ca = rotated[a], cb = rotated[b];
      return [(ca[0]+cb[0])/2, (ca[1]+cb[1])/2, (ca[2]+cb[2])/2];
    });
    const counts = new Array(5).fill(0);
    for (const mpt of mid){
      const ang = Math.atan2(mpt[1], mpt[0]);
      const a = ang < 0 ? ang + 2*Math.PI : ang;
      const idx = Math.floor(a / (2*Math.PI/5));
      counts[idx]++;
    }
    const total = rotatedEdges.length;
    const target = total / 5;
    const score = counts.reduce((acc,c)=> acc + Math.pow(c - target, 2), 0);
    if (score < best.score){ best = {phi: deg, score, counts}; }
  }
  console.log('Stage C.3 symmetry metrics: best phi (deg):', best.phi, 'score:', best.score, 'bin counts:', best.counts);
}

main();
