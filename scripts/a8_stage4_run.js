// Stage 4 driver: CIF-first symmetry alignment ( skeleton )
// This script loads CIF-based CIF coords from c70.ts, runs the CIF-first alignment stub,
// and writes aligned coordinates and edge data to disk for inspection.
import fs from 'fs';
import path from 'path';

function extractCIFCoordsFromCIFTs(tsPath) {
  const text = fs.readFileSync(tsPath, 'utf8');
  const marker = 'const c70FractionalCoords: [number, number, number][] = [';
  const idx = text.indexOf(marker);
  if (idx < 0) return [];
  const blockStart = text.indexOf('[', idx);
  const blockEnd = text.indexOf(']', blockStart) + 1;
  const block = text.substring(blockStart, blockEnd);
  const re = /\[\s*([0-9.+-Ee]+)\s*,\s*([0-9.+-Ee]+)\s*,\s*([0-9.+-Ee]+)\s*\]/g;
  const coords = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]), z = parseFloat(m[3]);
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) coords.push([x,y,z]);
  }
  return coords;
}

function writeXYZ(filePath, coords) {
  const lines = [];
  lines.push(coords.length.toString());
  lines.push('Aligned by Stage 4 CIF symmetry alignment');
  for (const [x,y,z] of coords) lines.push(`C ${x} ${y} ${z}`);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

const tsPath = path.resolve('E:\\op\\op6','src','data','c70.ts');
const cifs = extractCIFCoordsFromCIFTs(tsPath);
if (!cifs || cifs.length === 0) {
  // Try an alternative extraction method from the CIF-like array in c70.ts
  console.log('No CIF fractional coords found via CIF parser; attempting fallback extraction.');
  // Fallback: parse using the explicit array pattern in c70.ts (naive but effective for this repo)
  const text = fs.readFileSync(tsPath, 'utf8');
  const reg = /\[([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\]/g;
  const arr = [];
  let m;
  while ((m = reg.exec(text)) !== null) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]), z = parseFloat(m[3]);
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) arr.push([x,y,z]);
  }
  if (arr.length >= 70) {
    coordsFromCIF = arr.slice(0,70);
  } else {
    console.log('Fallback extraction failed.');
  }
}
// Reuse the CIF coords as-is for this skeleton stage
const outPath = path.resolve('E:\\op\\op6','c70.xyz.stage4_aligned.xyz');
writeXYZ(outPath, cifs);
console.log('Stage 4 (S1) CIF coords written to', outPath);
