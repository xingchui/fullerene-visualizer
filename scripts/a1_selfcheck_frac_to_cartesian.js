// Node script to self-check fractional-to-Cartesian coordinates for C70
import fs from 'fs';
import path from 'path';
const tsPath = path.resolve('E:/op/op6', 'src', 'data', 'c70.ts');

let content;
try {
  content = fs.readFileSync(tsPath, 'utf8');
} catch (e) {
  console.error('Failed to read c70.ts at', tsPath, e);
  process.exit(1);
}

// Regex to capture [x, y, z] triples in the fractional coordinates array
const tripleRE = /\[\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\]/g;
const coords = [];
let m;
while ((m = tripleRE.exec(content)) !== null) {
  coords.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
}

console.log('Found fractional coordinates count:', coords.length);
if (coords.length === 0) {
  console.error('No coordinates found. Ensure the c70.ts contains the fractional coords array.');
  process.exit(2);
}

// Use conversion constants as in c70.ts
const a = 10.6, b = 10.6, c = 17.2;
const gamma = Math.PI * 2 / 3; // 120 degrees
const cosG = Math.cos(gamma);
const sinG = Math.sin(gamma);
function fracToCart(x, y, z) {
  const cx = a * x + b * cosG * y;
  const cy = b * sinG * y;
  const cz = c * z;
  return [cx, cy, cz];
}

const carts = coords.map(([x, y, z]) => fracToCart(x, y, z));

// Center at origin
const centroid = carts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]).map(v => v / carts.length);
const centered = carts.map(([x, y, z]) => [x - centroid[0], y - centroid[1], z - centroid[2]]);
// Scale for reasonable size
const scaled = centered.map(([x, y, z]) => [x * 0.5, y * 0.5, z * 0.5]);

console.log('Sample first 5 Cartesian coords:', scaled.slice(0, 5));
console.log('Total transformed coords:', scaled.length);
console.log('Done.');
