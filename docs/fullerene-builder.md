# 富勒烯 3D 构建工具

## 富勒烯构建器 (Fullerene Builder)

本工具用于从预计算坐标构建富勒烯分子的 3D 可视化模型。

---

## 使用方法

### 1. 获取富勒烯坐标

从以下数据库获取预计算的富勒烯坐标：

| 数据库 | 网址 | 说明 |
|--------|------|------|
| Nanoten | https://nanoten.com/science/fullerene/ | C60-C80 优化坐标 |
| Zenodo | https://zenodo.org/records/5615405 | 完整富勒烯库 |
| Bayreuth | https://www.mathe2.uni-bayreuth.de/frib/html2/fullerene/ | D5h 对称结构 |

### 2. 运行构建脚本

```bash
# 分析富勒烯拓扑结构
node scripts/analyze_c70_faces.mjs

# 输出五边形和六边形列表
```

---

## 通用公式

对于任意富勒烯 Cₙ (n ≥ 20):

| 属性 | 公式 | 示例 C₇₀ |
|------|------|----------|
| 原子数 V | n | 70 |
| 边数 E | 3n/2 | 105 |
| 面数 F | n/2 + 2 | 37 |
| 五边形 | 12 | 12 |
| 六边形 | n/2 - 10 | 25 |
| 欧拉 | V - E + F = 2 | 2 ✅ |

---

## 核心算法

### Bond 生成 (Mutual 3NN + Edge Fill)

```javascript
// 1. 计算所有原子对距离
for (let i = 0; i < n; i++) {
  dists[i] = [];
  for (let j = 0; j < n; j++) {
    if (i === j) continue;
    const d2 = distanceSquared(coords[i], coords[j]);
    dists[i].push({ idx: j, d: d2 });
  }
  dists[i].sort((a, b) => a.d - b.d);
}

// 2. 保留双向最近邻 (Mutual k-NN)
const edgeSet = new Set();
for (let i = 0; i < n; i++) {
  for (let t = 0; t < 3; t++) {
    const j = dists[i][t].idx;
    const isMutual = dists[j].some(p => p.idx === i);
    if (isMutual && i < j) {
      edgeSet.add(`${i}-${j}`);
    }
  }
}

// 3. Edge Fill: 补充到恰好 (3n-6)/2 条边
const TARGET_E = (3 * n - 6) / 2;
while (edges.length < TARGET_E) {
  // 添加最近的非边原子对
}
```

### 环检测 (Face Finding)

```javascript
// 找所有 5-6 环
function findAllSmallCycles(adj) {
  const faces = new Map();
  
  function findCyclesFrom(start, current, path) {
    for (const next of adj[current]) {
      if (next === start && path.length >= 4) {
        const cycle = [...path].sort((a, b) => a - b);
        const size = cycle.length;
        if (size === 5 || size === 6) {
          faces.set(cycle.join('-'), { size, atoms: cycle });
        }
      } else if (!path.includes(next) && path.length < 6) {
        findCyclesFrom(start, next, [...path, next]);
      }
    }
  }
  
  for (let i = 0; i < n; i++) {
    findCyclesFrom(i, i, [i]);
  }
  
  return Array.from(faces.values());
}
```

---

## 示例输出

### C70 验证结果

```
Vertices: 70, Bonds: 105
All atoms degree = 3 ✓

Found 12 pentagons and 25 hexagons
Total faces: 37
Euler: 70 - 105 + 37 = 2 (should be 2)
```

### 五边形列表

| Pentagon | Atoms |
|----------|-------|
| 1 | [0, 1, 10, 11, 15] |
| 2 | [2, 9, 19, 29, 39] |
| 3 | [3, 4, 37, 38, 48] |
| 4 | [6, 49, 52, 66, 67] |
| 5 | [7, 8, 20, 21, 25] |
| 6 | [13, 16, 62, 63, 68] |
| 7 | [17, 18, 30, 31, 35] |
| 8 | [23, 26, 58, 59, 64] |
| 9 | [27, 28, 40, 41, 45] |
| 10 | [33, 36, 54, 55, 60] |
| 11 | [43, 46, 50, 51, 56] |
| 12 | [53, 57, 61, 65, 69] |

---

## 常见富勒烯坐标源

| 富勒烯 | 对称性 | 推荐来源 |
|--------|--------|----------|
| C60 | Ih | 任何数据库 |
| C70 | D5h | Nanoten |
| C76 | D2 | Zenodo |
| C78 | C2v | Zenodo |
| C80 | Ih/D5d | Zenodo |
| C84 | D2 | Zenodo |

---

## 构建流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     富勒烯构建流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │ 1. 获取  │ -> │ 2. 生成  │ -> │ 3. 验证  │            │
│  │ 坐标     │    │ Bonds    │    │ 拓扑     │            │
│  └──────────┘    └──────────┘    └──────────┘            │
│       │               │               │                   │
│       v               v               v                   │
│  预计算坐标    Mutual 3NN     V - E + F = 2              │
│  数据库        Edge Fill       12 五边形                  │
│                                 N/2-10 六边形             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 经验总结

### ❌ 失败方法

1. **几何公式构造** - 用黄金比例 φ 生成顶点
2. **简单拉伸** - C60 1.32x 拉伸
3. **手动对称** - D5h 手动坐标

### ✅ 成功方法

1. **预计算坐标** - 从权威数据库获取
2. **Mutual 3NN** - 保留双向最近邻
3. **拓扑验证** - 欧拉公式验证

---

*Generated: 2026-03-09*
