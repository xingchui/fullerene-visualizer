// Compare C70.xyz coordinates with CIF-derived fractional coordinates (to Cartesian) in c70.ts
// If mismatch detected, print summary and generate a patch plan to switch to XYZ as primary source.

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve('E:\\op\\op6');
const c70TsPath = path.join(repoRoot, 'src', 'data', 'c70.ts');
const xyzPath = path.join(repoRoot, 'c70.xyz');

function parseXYZ(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  // Find first line as count if numeric
  let start = 2;
  if (lines.length > 0) {
    const first = lines[0].trim();
    if (!first || isNaN(parseInt(first))) start = 0; // assume not standard XYZ
  }
  const coords = [];
  for (let i = start; i < lines.length; i++) {
    const s = lines[i].trim(); if (!s) continue;
    const parts = s.split(/\s+/);
    const nums = parts.filter(p => p && !/^[A-Za-z]+$/.test(p)).map(Number);
    if (nums.length >= 3 && nums.every(n => Number.isFinite(n))) coords.push([nums[0], nums[1], nums[2]]);
    else if (parts.length >= 3) {
      const x = parseFloat(parts[0]), y = parseFloat(parts[1]), z = parseFloat(parts[2]);
      if ([x,y,z].every(v => Number.isFinite(v))) coords.push([x,y,z]);
    }
  }
  return coords;
}

function parseCIFCoords(ts) {
  // Extract array named c70FractionalCoords if present, then parse triples
  const marker = 'const c70FractionalCoords: [number, number, number][] = [';
  const idx = ts.indexOf(marker);
  if (idx < 0) return null;
  const after = ts.slice(idx);
  const endIdx = after.indexOf(']') + 1; // end of array literal
  const block = after.substring(0, endIdx);
  const tripleRE = /\[\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\]/g;
  const coords = [];
  let m;
  while ((m = tripleRE.exec(block)) !== null) {
    coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  return coords;
}

function fracToCartesian(x, y, z) {
  const a = 10.6, b = 10.6, c = 17.2; const gamma = Math.PI * 2/3; const cosG = Math.cos(gamma); const sinG = Math.sin(gamma);
  const cx = a * x + b * cosG * y;
  const cy = b * sinG * y;
  const cz = c * z;
  return [cx, cy, cz];
}

// Read CIF-like coordinates
let cifCoords = null;
try {
  const cifText = fs.readFileSync(c70TsPath, 'utf8');
  cifCoords = parseCIFCoords(cifText);
} catch (e) {
  cifCoords = null;
}

const xyzCoords = parseXYZ(xyzPath);
let cifToCartesian = null;
if (cifCoords && cifCoords.length) {
  cifToCartesian = cifCoords.map(frac => fracToCartesian(frac[0], frac[1], frac[2]));
}

function compareArrays(a, b) {
  if (!a || !b || a.length !== b.length) return { equal: false, maxDiff: Infinity };
  let maxDiff = 0;
  for (let i = 0; i < a.length; i++) {
    const dx = a[i][0] - b[i][0];
    const dy = a[i][1] - b[i][1];
    const dz = a[i][2] - b[i][2];
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (d > maxDiff) maxDiff = d;
  }
  return { equal: maxDiff < 1e-6, maxDiff };
}

if (xyzCoords.length >= 70) {
  const coordsToCompare = xyzCoords.slice(0, 70);
  if (cifToCartesian && cifToCartesian.length >= 70) {
    const res = compareArrays(coordsToCompare, cifToCartesian.slice(0, 70));
    console.log('Comparison (XYZ vs CIF-derived Cartesian) identical? ', res.equal ? 'YES' : 'NO', 'Max diff:', res.maxDiff);
  } else {
    console.log('No CIF-derived Cartesian coords found for comparison.');
  }
} else {
  console.log('XYZ file does not contain enough coordinates; length=', xyzCoords.length);
}
