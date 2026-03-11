# 富勒烯 3D 可视化工具帮助文档

## 概述

本工具提供富勒烯（Fullerene）碳笼分子的 3D 可视化，支持多种常见富勒烯结构。每个结构都经过拓扑验证，确保符合欧拉公式 V - E + F = 2。

---

## 支持的结构

### 富勒烯列表

| 结构 | 原子数 | 化学键数 | 面数 | 五边形 | 六边形 | 对称性 | 数据来源 |
|------|--------|----------|------|--------|--------|--------|----------|
| **C20** | 20 | 30 | 14 | 12 | 2 | Ih | CCL 数据库 |
| **C60** | 60 | 90 | 32 | 12 | 20 | Ih | CCL 数据库 |
| **C70** | 70 | 105 | 37 | 12 | 25 | D5h | Nanoten |
| **C76** | 76 | 114 | 40 | 12 | 26 | D2 | CCL 数据库 |
| **C78** | 78 | 117 | 41 | 12 | 27 | D3 | CCL 数据库 |
| **C80** | 80 | 120 | 42 | 12 | 28 | D5d | CCL 数据库 |
| **C84** | 84 | 126 | 44 | 12 | 32 | D2 | J. Phys. Chem. C 2009 |

### 拓扑验证

所有结构都经过欧拉公式验证：

```
V - E + F = 2
```

其中：
- V = 顶点数（原子数）
- E = 边数（化学键数）
- F = 面数（五边形 + 六边形）

### 通用公式

对于含有 n 个碳原子的富勒烯（n ≥ 20）：

| 属性 | 公式 | 说明 |
|------|------|------|
| 原子数 V | n | 碳原子数量 |
| 化学键数 E | 3n/2 | 每个原子平均成键 3 个 |
| 面数 F | n/2 + 2 | 12 个五边形 + (n/2-10) 个六边形 |
| 五边形数 | 12 | 恒定不变 |
| 六边形数 | n/2 - 10 | n ≥ 60 时有效 |

---

## 坐标数据来源

### 1. CCL 数据库（推荐）

**网址**: https://server.ccl.net/cca/data/fullerenes/

提供多种富勒烯的精确 .cart3d 坐标格式。

**常用文件**:
- `c20.cart3d` - C20 坐标
- `c60.cart3d` - C60 坐标
- `c70.cart3d` - C70 坐标
- `c76.cart3d` - C76 坐标
- `c78a.cart3d` - C78 (D3) 坐标
- `c80.cart3d` - C80 坐标

**格式示例** (.cart3d):
```
C   0.000000  0.000000  0.000000
C   1.458558  0.000000  0.000000
C   2.250000  1.299038  0.000000
...
```

### 2. Nanoten 数据库

**网址**: https://nanotube.msu.edu/fullerene/

提供优化的几何结构坐标，支持多种格式（XYZ, PDB, FHI-aims 等）。

**推荐用途**: C70 的 D5h 对称结构

### 3. Zenodo 数据库

**网址**: https://zenodo.org/records/5615405

提供从 C20 到 C80 的所有富勒烯同分异构体的坐标数据。

**说明**: 包含完整的富勒烯库，适合研究多种同分异构体。

### 4. 科学文献

对于特定同分异构体，可能需要从科学文献获取：

- **C84 D2(22)**: J. Phys. Chem. C 2009, 113, 5141-5149
- **C84 其他异构体**: 参考相关富勒烯研究文献

---

## 使用方法

### 启动应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 应用界面

1. **选择分子**: 从下拉菜单选择要查看的富勒烯结构
2. **3D 交互**:
   - 鼠标拖拽旋转
   - 滚轮缩放
   - 右键平移
3. **显示选项**:
   - 显示/隐藏原子
   - 显示/隐藏化学键
   - 调节原子大小
   - 调节键粗细
4. **投影模式**: 透视投影 / 正交投影
5. **动画**: 自动旋转开关及速度调节

---

## 添加新的富勒ene 结构

### 步骤 1: 获取坐标

1. 访问 CCL 数据库或其他权威来源
2. 下载对应富勒烯的 .cart3d 或 XYZ 格式坐标
3. 确保坐标是精确的预计算坐标（不是近似几何）

### 步骤 2: 创建数据文件

在 `src/data/` 目录创建新文件（如 `c90.ts`）：

```typescript
// src/data/c90.ts

import { MoleculeData, FULLERENE_FORMULAS } from './types'
import { generateBondsByMutualKN, createMoleculeData, validateAndLog } from './fullerenes'

const SCALE = 3.5

// 解析坐标数据
function generateC90VerticesExact(scale: number = SCALE): [number, number, number][] {
  const rawCoords: [number, number, number][] = [
    // 从 .cart3d 文件读取的坐标
    [x1, y1, z1],
    [x2, y2, z2],
    // ... 共 90 个坐标
  ]

  // 居中
  let cx = 0, cy = 0, cz = 0
  for (const c of rawCoords) {
    cx += c[0]; cy += c[1]; cz += c[2]
  }
  cx /= 90; cy /= 90; cz /= 90

  // 缩放
  return rawCoords.map(c => [
    (c[0] - cx) * SCALE / 4.5,
    (c[1] - cy) * SCALE / 4.5,
    (c[2] - cz) * SCALE / 4.5
  ])
}

const c90Vertices = generateC90VerticesExact()
const TARGET_BONDS = FULLERENE_FORMULAS.edges(90)  // 135
const c90Bonds = generateBondsByMutualKN(c90Vertices, 3, TARGET_BONDS)

export const c90Data: MoleculeData = createMoleculeData(
  'C90',
  'C90',
  c90Vertices,
  c90Bonds
)

validateAndLog('C90', c90Vertices, c90Bonds)

export type { Atom, Bond, MoleculeData } from './types'
```

### 步骤 3: 更新 App.tsx

在分子选择器中添加新选项：

```typescript
import { c90Data } from './data/c90'

// 在 molecule 类型中添加
type Molecule = 'C20' | 'C60' | 'C70' | 'C76' | 'C78' | 'C80' | 'C84' | 'C90'

// 在 select 元素中添加
<option value="C90">C90 (富勒烯)</option>
```

### 步骤 4: 验证

```bash
npm run build
```

验证拓扑：
```
C90: 90 atoms, 135 bonds, 47 faces
Euler: 90 - 135 + 47 = 2 ✓
```

---

## 核心算法

### 化学键生成 (Mutual 3-NN)

使用 mutual k-最近邻算法生成化学键：

1. **计算距离**: 计算所有原子对之间的欧氏距离
2. **找 k-NN**: 为每个原子找到 k 个最近邻（k=3）
3. **Mutual 检查**: 只保留双向连接的原子对
4. **Edge Fill**: 补充到目标边数

```typescript
function generateBondsByMutualKN(vertices, k=3, targetEdges) {
  // 1. 为每个顶点找到 k 个最近邻
  const neighbors = new Map()
  
  for (let i = 0; i < vertices.length; i++) {
    const distances = vertices
      .map((v, idx) => ({ idx, dist: distance(vertices[i], v) }))
      .filter(d => d.idx !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k)
    
    neighbors.set(i, distances.map(d => d.idx))
  }
  
  // 2. 只保留 mutual（双向）连接
  const bonds = []
  for (let i = 0; i < vertices.length; i++) {
    for (const j of neighbors.get(i)) {
      if (i < j && neighbors.get(j).includes(i)) {
        bonds.push({ atom1: i, atom2: j })
      }
    }
  }
  
  return bonds
}
```

---

## 常见问题

### Q: 为什么需要精确坐标？

A: 富勒烯的拓扑结构非常敏感。使用近似几何会导致键长不正确、键角不合理，无法生成正确的化学键连接。

### Q: 如何验证拓扑是否正确？

A: 运行 `npm run build` 后，终端会输出拓扑验证结果：
```
C60: 60 atoms, 90 bonds, 32 faces
Euler: 60 - 90 + 32 = 2 ✓
```

### Q: 可以添加其他富勒烯吗？

A: 可以。按照"添加新的富勒ene 结构"章节的步骤操作即可。

---

## 参考资料

- [CCL 富勒烯数据库](https://server.ccl.net/cca/data/fullerenes/)
- [Nanoten 富勒烯数据库](https://nanotube.msu.edu/fullerene/)
- [Zenodo 富勒烯库](https://zenodo.org/records/5615405)
- [维基百科 - 富勒烯](https://en.wikipedia.org/wiki/Fullerene)
- [欧拉公式与多面体](https://en.wikipedia.org/wiki/Euler_characteristic)

---

*文档版本: 1.1*  
*更新时间: 2026-03-11*
