// Stage C.2: apply the best symmetry alignment found from Stage C.3 (phi=30 deg as example)
import fs from 'fs';
import path from 'path';

function rotateZ(p, theta){ const c=Math.cos(theta), s=Math.sin(theta); return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]]; }
function parseXYZ(filePath){
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  let idx = 0; if (lines.length>0 && lines[0].trim().match(/^\d+$/)) idx = 2; else idx = 0;
  const coords = [];
  for (let i = idx; i < lines.length; i++){ const t = lines[i].trim(); if(!t) continue; const parts = t.split(/\s+/); const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number); if (nums.length>=3 && nums.every(n=>Number.isFinite(n))) coords.push([nums[0], nums[1], nums[2]]); else if (parts.length>=3){ const x=Number.parseFloat(parts[0]); const y=Number.parseFloat(parts[1]); const z=Number.parseFloat(parts[2]); if (Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z)) coords.push([x,y,z]); } }
  return coords;
}

const xyzIn = path.resolve('E:\\op\\op6','c70.xyz');
const xyzOut = path.resolve('E:\\op\\op6','c70.xyz.aligned.stage2_phi30.xyz');
const coords = parseXYZ(xyzIn);
if (!coords || coords.length < 70){ console.log('Insufficient coords in XYZ input.'); process.exit(0); }
const theta = 30 * Math.PI/180;
const rotated = coords.map(p => rotateZ(p, theta));
let lines = [];
lines.push(rotated.length.toString());
lines.push('Aligned by stage C.2 symmetry alignment (phi=30deg)');
for (let i=0;i<rotated.length;i++){ const [x,y,z] = rotated[i]; lines.push(`C ${x} ${y} ${z}`); }
fs.writeFileSync(xyzOut, lines.join('\n'), 'utf8');
console.log('Stage C.2 apply: rotated by 30 deg; output written to', xyzOut);
