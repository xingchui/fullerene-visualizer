export function generateC70BondsFromCoords(coords: [number, number, number][]): number[][] {
  const n = coords.length;
  const edgesSet = new Set<string>();

  for (let i = 0; i < n; i++) {
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = coords[i][0] - coords[j][0];
      const dy = coords[i][1] - coords[j][1];
      const dz = coords[i][2] - coords[j][2];
      const dist2 = dx * dx + dy * dy + dz * dz;
      dists.push({ idx: j, d: dist2 });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < 3 && k < dists.length; k++) {
      const j = dists[k].idx;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      edgesSet.add(`${a}-${b}`);
    }
  }

  let edgesList = Array.from(edgesSet).map((pair) => {
    const [a, b] = pair.split('-').map(Number);
    return [a, b] as [number, number];
  });
  const TARGET_E = 105;
  if (edgesList.length < TARGET_E) {
    const existing = new Set<string>(edgesList.map((e) => `${e[0]}-${e[1]}`));
    const candidates: { i: number; j: number; d: number }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const key = `${i}-${j}`;
        if (existing.has(key)) continue;
        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const dist2 = dx * dx + dy * dy + dz * dz;
        candidates.push({ i, j, d: dist2 });
      }
    }
    candidates.sort((a, b) => a.d - b.d);
    for (const c of candidates) {
      if (edgesList.length >= TARGET_E) break;
      edgesList.push([c.i, c.j]);
      existing.add(`${c.i}-${c.j}`);
    }
  }
  return edgesList;
}
