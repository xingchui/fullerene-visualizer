// Node ES module to verify final 105-edge completion for C70 via 3NN base
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tsPath = path.resolve(__dirname, '../src/data/c70.ts');
const ts = fs.readFileSync(tsPath, 'utf8');
// Extract fractional coordinates from c70.ts
const tripleRE = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
const coords = [];
let m;
while ((m = tripleRE.exec(ts)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}
const N = coords.length;
const a = 10.6, b = 10.6, c = 17.2, gamma = Math.PI * 2/3;
const cosG = Math.cos(gamma), sinG = Math.sin(gamma);
function fracToCart(x,y,z){ return [a*x + b*cosG*y, b*sinG*y, c*z]; }
const cart = coords.map(([x,y,z]) => fracToCart(x,y,z));
const centroid = cart.reduce((acc,p)=>[acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v=>v/cart.length);
const centered = cart.map(([x,y,z]) => [x-centroid[0], y-centroid[1], z-centroid[2]]);
const scaled = centered.map(([x,y,z]) => [x*0.5, y*0.5, z*0.5]);
function compute3NNEdges(coords2){
  const n = coords2.length; const edgesSet = new Set();
  for (let i=0;i<n;i++){
    const dists = [];
    for (let j=0;j<n;j++) if (i!==j){ const dx=coords2[i][0]-coords2[j][0]; const dy=coords2[i][1]-coords2[j][1]; const dz=coords2[i][2]-coords2[j][2]; dists.push({idx:j, d: dx*dx+dy*dy+dz*dz}); }
    dists.sort((a,b)=> a.d-b.d);
    for (let k=0;k<3 && k<dists.length; k++){ const j=dists[k].idx; if (i<j) edgesSet.add(i+'-'+j); }
  }
  return Array.from(edgesSet).map(str => str.split('-').map(Number));
}
let edges = compute3NNEdges(scaled);
const V = scaled.length;
let E = edges.length; let F = E - V + 2;
console.log(`Pre-fill: V=${V}, E=${E}, F≈${F}`);
function fillToTargetEdges(coords2, currentEdges, target){
  let edgeList = currentEdges.slice();
  const edgeSet = new Set(edgeList.map(e => `${e[0]}-${e[1]}`));
  if (edgeList.length < target) {
    const n = coords2.length;
    const candidates = [];
    for (let i=0;i<n;i++){
      for (let j=i+1;j<n;j++){
        const key = `${i}-${j}`;
        if (edgeSet.has(key)) continue;
        const dx = coords2[i][0]-coords2[j][0];
        const dy = coords2[i][1]-coords2[j][1];
        const dz = coords2[i][2]-coords2[j][2];
        const dist2 = dx*dx+dy*dy+dz*dz;
        candidates.push({i,j,d:dist2});
      }
    }
    candidates.sort((a,b)=> a.d - b.d);
    for (const c of candidates){ if (edgeList.length >= target) break; edgeList.push([c.i,c.j]); edgeSet.add(`${c.i}-${c.j}`); }
  }
  return edgeList;
}
const edgesFilled = fillToTargetEdges(scaled, edges, 105);
const Efilled = edgesFilled.length; const Ffilled = Efilled - V + 2;
console.log(`Final: V=${V}, E=${Efilled}, F≈${Ffilled}`);
console.log(`First 20 filled edges: ${JSON.stringify(edgesFilled.slice(0,20))}`);
export {};
