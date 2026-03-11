// Node script to diagnose 3NN edges based on coordinates extracted from c70.ts
import fs from 'fs';
import path from 'path';
const tsPath = path.resolve('E:/op/op6', 'src', 'data', 'c70.ts');
let content = '';
try {
  content = fs.readFileSync(tsPath, 'utf8');
} catch (e) {
  console.error('Failed to read c70.ts at', tsPath, e);
  process.exit(1);
}
// Extract fractional coords blocks
const tripleRE = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
const coords = [];
let m;
while ((m = tripleRE.exec(content)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}
console.log('Total fractional coords found:', coords.length);
// Use all coordinates (70) for full diagnostic
const N = Math.min(coords.length, 70);
const a = 10.6, b = 10.6, c = 17.2;
const gamma = Math.PI * 2/3, cosG = Math.cos(gamma), sinG = Math.sin(gamma);
function fracToCart(x, y, z){ return [a*x + b*cosG*y, b*sinG*y, c*z]; }
const cart = coords.slice(0, N).map(([x,y,z]) => fracToCart(x,y,z));
const centroid = cart.reduce((acc,p)=>[acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v=>v/cart.length);
const centered = cart.map(([x,y,z]) => [x-centroid[0], y-centroid[1], z-centroid[2]]);
const scaled = centered.map(([x,y,z]) => [x*0.5, y*0.5, z*0.5]);
function compute3NNEdges(coords2){
  const n = coords2.length; const edgesSet = new Set();
  for (let i=0; i<n; i++){
    const dists=[]; for (let j=0;j<n;j++){ if (i===j) continue; const dx=coords2[i][0]-coords2[j][0]; const dy=coords2[i][1]-coords2[j][1]; const dz=coords2[i][2]-coords2[j][2]; const d2 = dx*dx+dy*dy+dz*dz; dists.push({idx:j, d:d2}); }
    dists.sort((a,b)=> a.d-b.d);
    for (let k=0; k<3 && k<dists.length; k++){ const j=dists[k].idx; if (i<j) edgesSet.add(i+'-'+j); }
  }
  return Array.from(edgesSet).map(s => s.split('-').map(Number));
}
const edges1 = compute3NNEdges(scaled);
console.log('Stage A2: 3NN edges count (first 60 coords):', edges1.length);
console.log('Edges sample:', edges1.slice(0, 20));
