// Compare two 3NN strategies on coordinates extracted from c70.ts
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
const tripleRE = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
const coords = [];
let m;
while ((m = tripleRE.exec(content)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}
// Use all available coords (up to 70)
const N = Math.min(coords.length, 70);
const a = 10.6, b = 10.6, c = 17.2, gamma = Math.PI * 2/3;
const cosG = Math.cos(gamma), sinG = Math.sin(gamma);
function fracToCart(x,y,z){ return [a*x + b*cosG*y, b*sinG*y, c*z]; }
const cart = coords.slice(0, N).map(([x,y,z]) => fracToCart(x,y,z));
const centroid = cart.reduce((acc,p)=>[acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v=>v/cart.length);
const centered = cart.map(([x,y,z]) => [x-centroid[0], y-centroid[1], z-centroid[2]]);
const scaled = centered.map(([x,y,z]) => [x*0.5, y*0.5, z*0.5]);
function edgesFrom3NN(coords){
  const n = coords.length; const edges = new Set();
  for (let i=0;i<n;i++){
    const dists = [];
    for (let j=0;j<n;j++) if (i!==j){ const dx=coords[i][0]-coords[j][0]; const dy=coords[i][1]-coords[j][1]; const dz=coords[i][2]-coords[j][2]; dists.push({idx:j, d: dx*dx+dy*dy+dz*dz}); }
    dists.sort((a,b)=> a.d-b.d);
    for (let k=0;k<3 && k<dists.length; k++){ const j=dists[k].idx; if (i<j) edges.add(i+'-'+j); }
  }
  return Array.from(edges).map(str => str.split('-').map(Number));
}
function edgesFromMutual3NN(coords){
  const n = coords.length; const top3 = [];
  for (let i=0;i<n;i++){
    const dists=[]; for (let j=0;j<n;j++) if (i!==j){ const dx=coords[i][0]-coords[j][0]; const dy=coords[i][1]-coords[j][1]; const dz=coords[i][2]-coords[j][2]; dists.push({idx:j, d: dx*dx+dy*dy+dz*dz}); }
    dists.sort((a,b)=> a.d-b.d); top3.push(dists.slice(0,3).map(x=>x.idx));
  }
  const edges = new Set();
  for (let i=0;i<n;i++){
    for (const j of top3[i]){
      const mutual = top3[j] && top3[j].includes(i);
      if (mutual && i<j) edges.add(i+'-'+j);
      else if (i<j && top3[i].includes(j)) edges.add(i+'-'+j);
    }
  }
  return Array.from(edges).map(str => str.split('-').map(Number));
}
const edges1 = edgesFrom3NN(scaled);
const edges2 = edgesFromMutual3NN(scaled);
console.log('Stage A3: Strategy1 edges', edges1.length);
console.log('Stage A3: Strategy2 edges (mutual-ish)', edges2.length);
