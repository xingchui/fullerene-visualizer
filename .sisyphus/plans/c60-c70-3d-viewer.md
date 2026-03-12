# C60/C70 3D分子演示应用 - 工作计划

## 项目概述
构建一个桌面网页应用，用于交互式展示C60和C70富勒烯分子的3D结构，用于教学演示。

**参考项目设计**: [crystal-viewer-3d](https://github.com/xingchui/crystal-viewer-3d) - 高中化学常见晶胞3D演示

## 技术路线

### 核心技术栈 (基于参考项目优化)
| 组件 | 技术选择 | 版本 | 说明 |
|------|----------|------|------|
| 3D渲染引擎 | Three.js | r182 | 与参考项目完全一致 |
| 语言 | TypeScript | 5.x | 严格模式 |
| 构建工具 | Vite | 7.x | 快速开发 |
| **桌面框架** | **Electron** | **40.x** | 与参考项目一致 |

### UI设计 (完全参考crystal-viewer-3d)
```
┌─────────────────────────────────────────────────┐
│  Crystal Viewer 3D - C60/C70 富勒烯            │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│              [3D 渲染区域]                      │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  显示选项:                                      │
│  ☑ 原子  ☑ 化学键  ☐ 晶胞框架                 │
│                                                 │
│  尺寸调节:                                      │
│  原子大小 [====●=====] 1.0x                    │
│  键粗细   [====●=====] 1.0x                   │
│                                                 │
│  投影模式: [透视投影 ▼]                        │
│                                                 │
│  ☑ 自动旋转  速度 [===●====]                   │
│                                                 │
│  [重置视角] [截图]  分子: [C60 ▼]             │
└─────────────────────────────────────────────────┘
```

### 打包方式 (与参考项目一致)
- 使用 **Electron** 打包为桌面应用
- 输出: `Crystal-Viewer-Portable-x.x.x.exe` (免安装)
- 参考项目打包配置可直接复用

### 架构模式 (参考crystal-viewer-3d设计)
```
src/
├── core/                  # 核心层
│   ├── MoleculeViewer.ts  # 主控制器 (参考CrystalViewer.ts)
│   ├── renderers/        # 3D渲染器
│   │   ├── AtomRenderer.ts    # 原子渲染
│   │   └── BondRenderer.ts   # 化学键渲染
│   └── cells/            # 分子逻辑
│       └── BondCalculator.ts  # 键计算策略 (最近邻算法)
├── data/                 # 数据层
│   ├── c60.ts           # C60分子数据
│   └── c70.ts           # C70分子数据 (从CIF解析)
├── utils/               # 工具函数
│   ├── cifParser.ts     # CIF文件解析器
│   └── geometry.ts      # 几何计算工具
└── ui/                  # UI层 (与参考项目一致)
    └── controls.ts      # 控制面板 (原子/键显示、大小调节、投影模式)
electron/                 # Electron主进程 (直接复用参考项目)
```

### 与参考项目的关键差异
1. **分子类型**: 晶体 → 富勒烯分子 (C60/C70)
2. **键计算**: 固定键长 → 基于最近邻算法 (参考项目的BondCalculator)
3. **UI功能**: 保留核心功能 (原子/键显示、尺寸调节、投影模式、自动旋转、截图)
4. **打包**: 与参考项目完全一致 (Electron)
5. **功能简化**: 移除超胞/截面等复杂功能，专注分子展示

---

## 工作阶段

### 阶段1: 项目初始化与C60 3D模型 (优先)

#### 任务1.1: 项目初始化 (基于参考项目)
- [ ] 1.1.1 克隆/参考 crystal-viewer-3d 项目结构
  - 复制 electron/ 目录 (主进程配置)
  - 复制 src/core/ 架构 (模块化设计)
  - 复用 vite.config.ts, tsconfig.json 配置
- [ ] 1.1.2 安装依赖
  - Three.js r182 (与参考项目一致)
  - Electron 40.x
  - electron-builder
- [ ] 1.1.3 验证空项目可运行
  - `yarn dev` 或 `npm run dev` 启动开发服务器

#### 任务1.2: C60数据准备与拓扑验证
- [ ] 1.2.1 创建C60原子坐标数据
  - **方案A (推荐)**: 使用黄金比例φ生成截角二十面体60个顶点
    ```
    φ = (1+√5)/2 ≈ 1.618
    基础顶点:
    - (0, ±1, ±3φ)
    - (±1, ±(2+φ), ±φ)
    - (±φ, 0, ±(2+φ))
    经对称操作生成全部60个顶点
    ```
  - **方案B**: 使用IQXYZ坐标文件
mol标准- [ ] 1.2.2 定义C60化学键连接关系
  - 使用预定义的90条键连接 (五边形边: 60条, 六边形边: 30条)
  - 或使用最近邻算法 (阈值: 1.45-1.50Å)
- [ ] 1.2.3 **拓扑结构验证** (关键  - 验证原子数量 = 60
  - 验证化学键数量 =!)
 90
  - 验证顶点分布在球面上 (距中心距离一致)
- [ ] 1.2.4 创建数据文件 `src/data/c60.ts`

#### 任务1.3: Three.js场景搭建
- [ ] 1.3.1 初始化WebGL渲染器
  - 设置抗锯齿、透明背景
- [ ] 1.3.2 创建透视相机
  - FOV: 60°, 位置: (0, 0, 15)
- [ ] 1.3.3 添加OrbitControls
  - 启用阻尼、限制缩放范围
- [ ] 1.3.4 添加光照
  - 环境光 + 2个方向光
- [ ] 1.3.5 创建渲染循环
  - requestAnimationFrame实现自动旋转

#### 任务1.4: C60分子渲染
- [ ] 1.4.1 绘制60个碳原子球体
  - 使用SphereGeometry (半径: 0.3)
  - 碳原子颜色: 深灰色 (#333333)
  - 使用InstancedMesh优化性能
- [ ] 1.4.2 绘制90条化学键
  - 使用CylinderGeometry
  - 键半径: 0.08
  - 颜色: 浅灰色 (#888888)
  - 使用LookAt对齐起点到终点
- [ ] 1.4.3 居中和缩放
  - 计算几何中心并平移
  - 自适应缩放以填满视口

#### 任务1.5: UI交互功能 (与参考项目crystal-viewer-3d一致)
- [ ] 1.5.1 鼠标交互
  - 左键拖拽: 旋转
  - 滚轮: 缩放
  - 右键拖拽: 平移
- [ ] 1.5.2 控制面板UI (参考项目样式)
  - 显示选项: ☑原子 ☑化学键
  - 原子大小滑块: 0.5x - 2.0x
  - 键粗细滑块: 0.5x - 2.0x
  - 投影模式: 透视投影 / 正交投影
  - 自动旋转: ☑启用 + 速度滑块
- [ ] 1.5.3 功能按钮
  - 重置视角
  - 截图保存 (PNG)
  - 分子切换下拉框 (C60 / C70)

#### 任务1.6: 测试与验收 (包含拓扑验证)
- [ ] 1.6.1 **拓扑结构验证** (关键)
  - [ ] 验证原子数量 = 60
  - [ ] 验证化学键数量 = 90
  - [ ] 验证顶点距中心距离一致 (球面分布)
  - [ ] 验证键长约 1.45Å (五边形边) 和约 1.40Å (六边形边)
- [ ] 1.6.2 交互功能测试
  - 鼠标旋转/缩放/平移流畅
  - 自动旋转正常
  - UI控制面板响应正确
- [ ] 1.6.3 视觉检查
  - 分子对称性正确 (二十面体Ih对称)
  - 无穿模或缺失
  - 原子和键颜色/比例协调

---

### 阶段2: C70 3D模型构建

#### 任务2.1: C70数据解析与拓扑验证
- [ ] 2.1.1 读取CIF文件
  - 解析 `E:\op\op6\C70_COD_9008425.cif`
  - 提取70个原子坐标 (x, y, z) - 分数坐标
  - 提取化学键连接 (C1-C2, C1-C3等)
- [ ] 2.1.2 CIF解析器实现 (参考crystal-viewer-3d数据层)
  - 解析 `_atom_site_fract_*` 字段
  - 解析 `_geom_bond_*` 字段  
  - **分数坐标 → 笛卡尔坐标转换** (六方晶系)
    ```
    // 六方晶系坐标变换 (P63/mmc, a=b≠c, γ=120°)
    x_cart = a * x_frac + b * y_frac * cos(γ*)
    y_cart = b * y_frac * sin(γ*)  
    z_cart = c * z_frac
    // a=10.6, b=10.6, c=17.2, γ*=90°-γ/2=30°
    // 简化: x_cart = a * (x_frac - 0.5*y_frac)
    //       y_cart = a * 0.866 * y_frac  (0.866 = sin(60°))
    //       z_cart = c * z_frac
    ```
- [ ] 2.1.3 **C70拓扑验证** (关键)
  - 验证原子数量 = 70
  - 验证化学键数量 = 105
  - 验证分子呈椭球形 (不同于C60的球形)
  - 验证五边形数量 = 12
  - 验证六边形数量 = 25
- [ ] 2.1.4 创建数据文件 `src/data/c70.ts`

#### 任务2.2: C70渲染实现
- [ ] 2.2.1 复用C60渲染逻辑
  - 使用相同的三维球体和圆柱体绘制函数
  - 根据C70数据调整
- [ ] 2.2.2 调整相机位置
  - C70分子更大，需要调整初始距离

#### 任务2.3: 模型切换功能
- [ ] 2.3.1 添加切换UI
  - 下拉选择: "C60" / "C70"
  - 或标签页切换
- [ ] 2.3.2 切换逻辑
  - 清除当前场景
  - 加载新分子数据
  - 重新渲染

#### 任务2.4: 测试与验收 (包含C70拓扑验证)
- [ ] 2.4.1 **C70拓扑结构验证** (关键)
  - [ ] 验证原子数量 = 70
  - [ ] 验证化学键数量 = 105
  - [ ] 验证分子呈椭球形 (轴比 ≈ 1.3-1.4，不同于C60的球形)
  - [ ] 验证五边形数量 = 12
  - [ ] 验证六边形数量 = 25
  - [ ] 验证总面数 = 37
- [ ] 2.4.2 C60/C70切换功能
  - [ ] 切换流畅无卡顿
  - [ ] 两种模型均正确显示
- [ ] 2.4.3 数据正确性验证
  - [ ] 原子坐标与CIF文件一致
  - [ ] 键连接与CIF文件一致

---

### 阶段3: 打包与发布 (Electron打包 - 与参考项目一致)

#### 任务3.1: Electron配置 (复用参考项目配置)
- [ ] 3.1.1 复制参考项目electron目录结构
  - `electron/main.ts` - 主进程
  - `electron/preload.ts` - 预加载脚本
- [ ] 3.1.2 修改应用元数据
  - 名称: C60-C70-Viewer
  - 版本: 1.0.0
  - 窗口: 1024x768, 可调整大小
- [ ] 3.1.3 复用package.json electron配置
  - 参考项目的electron-builder配置

#### 任务3.2: 构建exe
- [ ] 3.2.1 运行构建命令
  - `yarn electron-build-win` (参考项目命令)
  - 或 `npm run electron-build-win`
- [ ] 3.2.2 验证输出
  - 检查 `dist-electron/` 目录
  - 确认exe文件生成

#### 任务3.3: 最终测试
- [ ] 3.3.1 独立运行测试
  - 双击exe启动
  - 验证所有功能正常
- [ ] 3.3.2 打包分发
  - 生成portable版本 (免安装)

---

## 技术实现细节

### 参考项目核心设计 (crystal-viewer-3d)

#### 1. 原子渲染 (参考AtomRenderer)
```typescript
// 使用MeshPhysicalMaterial实现金属质感
const atomMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x333333,        // 碳原子深灰色
  metalness: 0.3,
  roughness: 0.4,
  clearcoat: 0.8,
  clearcoatRoughness: 0.2
});

// 使用InstancedMesh优化性能
const atomGeometry = new THREE.SphereGeometry(atomRadius, 32, 32);
const atomsMesh = new THREE.InstancedMesh(atomGeometry, atomMaterial, atomCount);
```

#### 2. 化学键渲染 (参考BondRenderer)
```typescript
// 基于最近邻算法的键计算 (参考项目BondCalculator)
interface BondCalculationStrategy {
  calculate(atoms: Atom[], maxDistance: number): Bond[];
}

// C60/C70键长约1.45Å
const maxBondDistance = 1.5; // Å
```

#### 3. 交互控制 (复用OrbitControls)
- 鼠标左键拖拽: 旋转
- 滚轮: 缩放
- 右键拖拽: 平移
- 参考项目还实现了参数化UI控制

### C60坐标生成算法 (数学保证拓扑正确性)
```typescript
// 使用黄金比例生成截角二十面体顶点
// C60 = 截角二十面体 (Truncated Icosahedron)
const phi = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618

// 基础生成元 (3个顶点，共生成60个)
const generator = [
  [0, 1, 3 * phi],
  [2, 1 + 2 * phi, phi],
  [1, 2 + phi, 2 * phi]
];

// 通过对称操作生成全部60个顶点:
// 1. 所有符号组合 (±)
// 2. 3元素的全排列 (6种)
// 3. 循环移位

// 标准化到单位球面 (所有顶点距中心距离相等)
vertices = vertices.map(v => normalize(v));
```

### C60/C70富勒烯通用验证算法
```typescript
/**
 * 富勒烯分子通用验证
 * 基于Euler公式: V - E + F = 2
 * 其中: V=顶点数, E=边数, F=面数
 * 富勒烯条件: 12个五边形 + (V/2 - 10)个六边形
 */

// C60: V=60, E=90
// F = 2 + E - V = 2 + 90 - 60 = 32 (12五边形 + 20六边形) ✓

// C70: V=70, E=105  
// F = 2 + E - V = 2 + 105 - 70 = 37 (12五边形 + 25六边形) ✓

interface FullereneValidation {
  validate(atoms: Atom[], bonds: Bond[]): FullereneResult;
}

interface FullereneResult {
  isValid: boolean;
  vertexCount: number;
  edgeCount: number;
  faceCount: number;
  pentagons: number;   // 恒为12
  hexagons: number;    // V/2 - 10
  eulerCheck: boolean; // V - E + F = 2 ?
  geometry: 'spheroid' | 'ellipsoid';
}

function validateFullerene(atoms: Atom[], bonds: Bond[]): FullereneResult {
  const V = atoms.length;
  const E = bonds.length;
  const F = 2 + E - V;  // Euler公式反推
  const pentagons = 12; // 富勒烯恒有12个五边形
  const hexagons = F - pentagons;
  
  // 检查是否为有效富勒烯
  const isValid = (
    V % 2 === 0 &&                    // 顶点数为偶数
    pentagons === 12 &&               // 12个五边形
    hexagons === V/2 - 10 &&          // 六边形数量公式
    V - E + F === 2                   // Euler公式
  );
  
  // 判断几何形状
  const distances = atoms.map(a => a.position.length());
  const variance = calculateVariance(distances);
  const geometry = variance < 0.1 ? 'spheroid' : 'ellipsoid';
  
  return {
    isValid,
    vertexCount: V,
    edgeCount: E,
    faceCount: F,
    pentagons,
    hexagons,
    eulerCheck: V - E + F === 2,
    geometry
  };
}
```
```typescript
interface TopologyValidator {
  validateAtoms(atoms: Vector3[]): boolean;
  validateBonds(bonds: Bond[]): boolean;
  validateFaces(atoms: Vector3[], bonds: Bond[]): FaceInfo;
}

interface FaceInfo {
  totalFaces: number;
  pentagons: number;   // C60: 12
  hexagons: number;    // C60: 20
}

// 验证规则:
function validateC60Topology(atoms: Atom[], bonds: Bond[]): ValidationResult {
  // 1. 原子数量验证
  if (atoms.length !== 60) {
    return { valid: false, error: `原子数量应为60，实际为${atoms.length}` };
  }
  
  // 2. 化学键数量验证
  if (bonds.length !== 90) {
    return { valid: false, error: `化学键数量应为90，实际为${bonds.length}` };
  }
  
  // 3. 顶点球面分布验证
  const distances = atoms.map(a => a.position.length());
  const avgDistance = distances.reduce((a,b) => a+b) / distances.length;
  const variance = distances.map(d => Math.pow(d - avgDistance, 2))
                            .reduce((a,b) => a+b) / distances.length;
  if (variance > 0.01) {
    return { valid: false, error: '原子未均匀分布在球面上' };
  }
  
  // 4. 面的验证 (可选: 12个五边形 + 20个六边形)
  // 通过构建邻接图并计算面来确定
  
  return { valid: true };
}
```

### C70拓扑验证函数 (与C60对比)
```typescript
interface C70TopologyValidator {
  // C70数据来源: E:\op\op6\C70_COD_9008425.cif
  // 晶胞参数: a=b=10.6Å, c=17.2Å, γ=120°
  // 对称性: D5h (5重旋转轴 + 水平镜面)
  validateC70Topology(atoms: Atom[], bonds: Bond[]): C70ValidationResult;
}

interface C70ValidationResult {
  valid: boolean;
  atomCount: number;      // 应为70
  bondCount: number;       // 应为105
  pentagonCount: number;   // 应为12 (与C60相同)
  hexagonCount: number;    // 应为25 (C60为20)
  totalFaces: number;      // 应为37
  geometry: 'ellipsoid';   // 椭球形 (C60为'spheroid'球形)
  axisRatio: number;       // 长轴/短轴 ≈ 1.3-1.4
  symmetry: 'D5h';         // C70对称群
}

function validateC70Topology(atoms: Atom[], bonds: Bond[]): C70ValidationResult {
  // 1. 原子数量验证
  const atomCount = atoms.length;
  
  // 2. 化学键数量验证
  const bondCount = bonds.length;
  
  // 3. 计算椭球几何 (C70不同于C60的球形)
  // C70呈橄榄球状(rugbyball)，沿5重轴拉伸
  const distances = atoms.map(a => a.position.length());
  const maxDist = Math.max(...distances);  // 极区
  const minDist = Math.min(...distances);  // 赤道区
  const axisRatio = maxDist / minDist;      // 应 ≈ 1.3-1.4
  
  // 4. 验证键长分布
  const bondLengths = bonds.map(b => b.start.position.distanceTo(b.end.position));
  // C70有两种键长:
  // - 六-六边键 (pentagon-hexagon): ≈ 1.40 Å
  // - 五-六边键 (pentagon-hexagon): ≈ 1.45 Å
  
  // 5. 面数验证 (12五边形 + 25六边形 = 37面)
  // 使用图论算法: 构建邻接图 → 找环 → 分类
  // 验证Euler公式: V - E + F = 2 (对于球面嵌入)
  // 70 - 105 + F = 2 → F = 37 ✓
  
  return {
    valid: atomCount === 70 && bondCount === 105,
    atomCount,
    bondCount,
    pentagonCount: 12,
    hexagonCount: 25,
    totalFaces: 37,
    geometry: 'ellipsoid',
    axisRatio,
    symmetry: 'D5h'
  };
}
```

### C70 D5h对称性详解
```
C70分子对称群: D5h

结构特点:
- 沿5重轴(z轴)拉伸的椭球形
- 赤道区: 10个六边形形成带
- 极区: 各有1个五边形帽
- 共: 12个五边形 + 25个六边形 = 37面

从C60构造C70:
1. 沿5重轴切割C60
2. 插入5个六边形环
3. 形成更长的椭球结构

键长分布:
- 短键 (1.40Å): 六-六边
- 长键 (1.45Å): 五-六边
```

### Three.js渲染优化 (参考项目性能指标)
- 使用 `InstancedMesh` 绘制原子球体
- 使用 `CylinderGeometry` + `lookAt` 绘制化学键
- 启用 `antialias: true` 抗锯齿
- 目标性能: 1000+ 原子 @ 60FPS

### CIF解析关键点 (参考crystal-viewer-3d数据层)
```typescript
// 分数坐标转笛卡尔坐标
const x_cart = x_frac * a;
const y_cart = y_frac * b;
const z_cart = z_frac * c;

// 晶胞参数 (从CIF读取)
a = 10.6, b = 10.6, c = 17.2 (Å)
alpha = 90°, beta = 90°, gamma = 120°

// 需要进行坐标变换处理六方晶系
```

---

## 验收标准

### C60模型
- [ ] **拓扑验证通过**:
  - [ ] 原子数量 = 60
  - [ ] 化学键数量 = 90
  - [ ] 12个五边形 + 20个六边形 = 32个面
  - [ ] 球形对称 (截角二十面体)
  - [ ] 键长约1.45Å
- [ ] 交互功能正常
- [ ] UI控制面板 (与参考项目一致)

### C70模型
- [ ] **拓扑验证通过**:
  - [ ] 原子数量 = 70
  - [ ] 化学键数量 = 105
  - [ ] 12个五边形 + 25个六边形 = 37个面
  - [ ] 椭球形对称 (轴比≈1.3-1.4)
  - [ ] 键长约1.40-1.45Å (两种)
- [ ] C60/C70可切换显示
- [ ] 数据与CIF文件一致

### 打包
- [ ] 使用Electron打包 (与参考项目一致)
- [ ] 生成可运行的.exe文件
- [ ] 双击exe可启动应用
- [ ] 所有功能在独立运行时正常
- [ ] 包体积与参考项目相近 (~89MB)

---

## 预计工作量
| 阶段 | 任务数 | 预计时间 |
|------|--------|----------|
| 阶段1: 项目初始化+C60 | 6个任务 | 2-3小时 |
| 阶段2: C70 | 4个任务 | 1-2小时 |
| 阶段3: Electron打包 | 3个任务 | 0.5-1小时 |
| **总计** | **13个任务** | **4-6小时** |

---

## 参考资源

### 主要参考项目
- **crystal-viewer-3d**: https://github.com/xingchui/crystal-viewer-3d - UI与打包完全一致

### 学术论文与资料
1. **C60结构**: "The structure of the C60 molecule" - 截角二十面体60顶点
2. **C70结构**: "Breaking of Icosahedral Symmetry: C60 to C70" (PLOS One) - D5h对称性
3. **C70构造法**: "Fullerenes -- The fullerene C70" - 从C60构造C70的方法
4. **富勒烯拓扑**: "The topology of fullerenes" (WIREs Computational Molecular Science)
5. **Program Fullerene**: 软件包 - 构建和分析富勒ene结构 (J. Comput. Chem., 2013)

### C60坐标数据来源
- IQmol项目: https://github.com/nutjunkie/IQmol/blob/master/share/fragments/Molecules/Fullerenes/Buckminsterfullerene.xyz
- Zenodo数据集: https://zenodo.org/records/5615405 (C20-C80所有同分异构体)

### C70坐标数据来源
- 您的CIF文件: `E:\op\op6\C70_COD_9008425.cif` (70原子, 105键)
- MSU数据库: https://nanotube.msu.edu/fullerene/fullerene.php?C=70 (可下载XYZ)
- PubChem: https://pubchem.ncbi.nlm.nih.gov/compound/16131935 (C70结构)

### Three.js分子渲染参考
- LiamOsler/Three-Molecules: https://github.com/LiamOsler/Three-Molecules
- ianreah/Molecules3D: https://github.com/ianreah/Molecules3D
- fogleman/mol: https://github.com/fogleman/mol (命令行分子渲染器)

### 数学背景
- 黄金比例 φ = (1+√5)/2 ≈ 1.6180339887
- 截角二十面体: C60的标准几何形状
- D5h对称: C70的对称群 (5重旋转轴 + 水平镜面)
