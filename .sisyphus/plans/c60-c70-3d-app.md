# C60/C70 3D分子可视化教学应用

## TL;DR

> **快速摘要**: 构建一个Electron桌面应用，使用React + Three.js实现C60和C70分子的3D可视化。分两阶段实施：先完成C60模型，成功后再实现C70。
> 
> **交付成果**:
> - 可运行的Electron桌面应用
> - C60 3D分子模型（完整交互功能）
> - C70 3D分子模型（完整交互功能）
> - 完整的单元测试覆盖
> 
> **预估工作量**: Medium
> **并行执行**: 部分任务可并行
> **关键路径**: 项目初始化 → C60核心渲染 → C60交互功能 → C70模型 → 测试完善

---

## 上下文

### 原始需求
构建一个网页应用，用于教学演示C60和C70的3D可视化。分步实施，先做C60 3D模型，成功后再做C70 3D模型。

### 访谈总结
**关键讨论**:
- **前端框架**: React + Three.js (React Three Fiber)
- **部署方式**: Electron桌面应用
- **功能需求**: 
  - 3D渲染：旋转、缩放、平移
  - 信息面板：分子名称、原子数、化学键数
  - 点击原子显示详情
  - 全屏模式
  - 截图保存功能
  - 投影模式切换：透视投影 + 正交投影
- **C70数据源**: Crystallography Open Database CIF文件 (E:\op\op6\C70_COD_9008425.cif)

**技术选型**:
- **渲染引擎**: Three.js (React Three Fiber)
- **桌面框架**: Electron
- **测试框架**: Vitest + React Testing Library
- **打包工具**: Vite + electron-builder

### Metis评审
未进行Metis评审（超时），但基于需求分析，以下边界已明确：
- **Scope Creep防护**: 不包含分子动力学模拟、VR支持、动画轨迹
- **技术边界**: 纯前端实现，无需后端服务

---

## 工作目标

### 核心目标
创建一个用于化学教学演示的桌面应用，能够以3D方式可视化展示C60和C70富勒烯分子结构。

### 具体交付物
- Electron桌面应用安装包/可执行文件
- C60分子3D模型（60个碳原子位置，90个化学键）
- C70分子3D模型（70个碳原子位置，105个化学键）
- 完整的交互控制（旋转/缩放/平移）
- 信息展示面板
- 截图保存功能
- 投影模式切换
- 单元测试覆盖

### 完成定义
- [ ] Electron应用成功启动并显示窗口
- [ ] C60模型正确渲染（60个球体表示碳原子，90个圆柱表示化学键）
- [ ] 鼠标拖拽可旋转模型
- [ ] 滚轮可缩放模型
- [ ] 信息面板显示"60个原子，90个化学键"
- [ ] 点击任意原子显示其编号
- [ ] 可切换透视/正交投影
- [ ] 可保存截图到本地
- [ ] 可进入/退出全屏模式
- [ ] 切换到C70模型同样功能正常
- [ ] 单元测试通过

### 必须有
- 流畅的60fps渲染性能
- 跨窗口兼容（Windows/Mac）
- 清晰的中文界面

### 必须没有 (防护栏)
- 不包含VR/AR功能
- 不包含分子动力学模拟
- 不支持VRML/X3D导入（超出范围）
- 不实现服务器端渲染

---

## 验证策略

### 测试决策
- **测试基础设施**: YES
- **自动化测试**: TDD (测试驱动开发)
- **测试框架**: Vitest + React Testing Library
- **E2E测试**: 不需要（Electron桌面应用，手动验证窗口显示）

### TDD启用
每个功能遵循 RED-GREEN-REFACTOR：

**任务结构**:
1. **RED**: 先写失败测试
2. **GREEN**: 最小代码实现通过
3. **REFACTOR**: 重构优化

**测试基础设施任务**:
- [ ] 0. 搭建测试环境
  - 安装: `npm install -D vitest @testing-library/react jsdom`
  - 配置: 创建 `vitest.config.ts`
  - 验证: `npm test` → 显示测试帮助信息
  - 示例: 创建 `src/__tests__/example.test.tsx`
  - 验证: `npm test` → 1个测试通过

### Agent执行QA场景 (强制要求 - 每个任务)

> 无论是否启用TDD，每个任务必须包含Agent执行QA场景。
> 这些场景描述执行代理如何通过运行程序直接验证交付物。

**验证工具**:

| 类型 | 工具 | 验证方式 |
|------|------|---------|
| **桌面应用** | Bash (Electron) | 启动应用，检查窗口显示，验证进程退出码 |
| **3D渲染** | Playwright | 打开应用，截图验证渲染内容 |
| **交互功能** | Playwright | 模拟点击、拖拽，验证响应 |
| **截图功能** | Bash | 验证截图文件是否生成 |

**场景要求**:
- **选择器**: 具体CSS选择器 (`.canvas-container`, `.info-panel`, 不使用"画布"等模糊描述)
- **数据**: 具体的测试数据 (`C60`, `90`, 不使用"[数字]"等占位符)
- **断言**: 精确值 (`原子数: 60`, 不使用"显示正确"等模糊描述)
- **失败指标**: 明确的失败判断条件
- **证据路径**: 具体的文件路径 (`.sisyphus/evidence/task-N-scenario.png`)

---

## 执行策略

### 并行执行波次

```
Wave 1 (立即启动):
├── 任务1: 项目初始化
├── 任务2: 测试环境搭建
└── 任务3: C60分子坐标数据

Wave 2 (Wave 1后):
├── 任务4: 3D渲染核心 - 原子
├── 任务5: 3D渲染核心 - 化学键
└── 任务6: 3D交互控制

Wave 3 (Wave 2后):
├── 任务7: 信息面板组件
├── 任务8: 投影模式切换
├── 任务9: 截图功能
└── 任务10: 全屏模式

Wave 4 (Wave 3后):
├── 任务11: Atom点击交互
└── 任务12: C60完整测试验证

Wave 5 (C60成功后):
├── 任务13: C70分子坐标数据
├── 任务14: C70 3D渲染
└── 任务15: C70功能验证

Wave 6 (最后):
├── 任务16: Electron打包配置
└── 任务17: 最终验证
```

### 依赖矩阵

| 任务 | 依赖 | 阻塞 | 可并行 |
|------|------|------|--------|
| 1 | None | 4,5,6,7,8,9,10,11,12,13,14,15,16 | 2,3 |
| 2 | None | 12 | 1,3 |
| 3 | None | 4,5 | 1,2 |
| 4 | 1,3 | 12 | 5,6 |
| 5 | 1,3 | 12 | 4,6 |
| 6 | 1 | 12 | 4,5 |
| 7 | 4,5,6 | 12 | 8,9,10,11 |
| 8 | 7 | 12 | 7,9,10,11 |
| 9 | 7 | 12 | 7,8,10,11 |
| 10 | 7 | 12 | 7,8,9,11 |
| 11 | 7 | 12 | 7,8,9,10 |
| 12 | 4,5,6,7,8,9,10,11 | None | None |
| 13 | 12 | 14,15 | None |
| 14 | 13 | 15 | None |
| 15 | 14 | None | None |
| 16 | 12,15 | 17 | None |
| 17 | 16 | None | None |

### 代理分配

| Wave | 任务 | 推荐代理 |
|------|------|---------|
| 1 | 1,2,3 | task(category="quick", ...) |
| 2 | 4,5,6 | task(category="visual-engineering", ...) |
| 3 | 7,8,9,10,11 | task(category="visual-engineering", ...) |
| 4 | 12 | task(category="unspecified-high", ...) |
| 5 | 13,14,15 | task(category="visual-engineering", ...) |
| 6 | 16,17 | task(category="unspecified-high", ...) |

---

## TODOs

- [ ] 1. 初始化Electron + React + Vite项目

  **What to do**:
  - 使用 `npm create electron-vite` 或手动配置
  - 安装依赖: electron, react, react-dom, three, @react-three/fiber, @react-three/drei
  - 配置Vite + Electron集成
  - 设置开发脚本和构建脚本
  - 创建基本应用结构

  **Must NOT do**:
  - 不要添加不需要的依赖
  - 不要使用过大的模板

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 项目初始化是标准配置任务
  - **Skills**: []
    - 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocked By**: None (can start immediately)
  - **Blocks**: Tasks 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16

  **References**:
  - 官方文档: `https://electron-vite.dev/` - Electron + Vite集成方案
  - 示例项目: `electron-vite/electron-vite-react` - 参考结构

  **Acceptance Criteria**:

  - [ ] npm install 成功完成
  - [ ] npm run dev 启动开发服务器
  - [ ] Electron窗口成功打开，显示React应用
  - [ ] `npm run build` 构建成功

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 开发服务器启动验证
    Tool: Bash
    Preconditions: npm install 已完成
    Steps:
      1. cd 到项目目录
      2. 运行: npm run dev
      3. 等待10秒
      4. 验证进程运行中
      5. 终止进程
    Expected Result: 开发服务器成功启动，无报错
    Evidence: 终端输出包含 "ready" 或 "started"
  ```

  **Commit**: YES
  - Message: `init: Electron + React + Vite项目骨架`
  - Files: package.json, vite.config.ts, electron/main.ts, src/App.tsx
  - Pre-commit: 无

---

- [ ] 2. 搭建测试环境 (Vitest + RTL)

  **What to do**:
  - 安装: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
  - 创建: `vitest.config.ts`
  - 创建: `src/__tests__/example.test.tsx` (验证测试可用)
  - 配置: 测试脚本 `"test": "vitest"`

  **Must NOT do**:
  - 不要跳过测试配置直接写代码

  **Recommended Agent Profile**:
  - **Category**: quick
    - Reason: 标准测试配置

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocked By**: None
  - **Blocks**: Task 12

  **References**:
  - 官方文档: `https://vitest.dev/` - Vitest配置
  - React Testing Library: `https://testing-library.com/docs/react-testing-library/intro/`

  **Acceptance Criteria**:

  - [ ] 测试框架依赖安装成功
  - [ ] vitest.config.ts 配置文件存在
  - [ ] `npm test` 运行显示测试结果
  - [ ] 示例测试通过

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 测试环境验证
    Tool: Bash
    Preconditions: 测试依赖已安装
    Steps:
      1. 运行: npm test -- --run
      2. 验证退出码为0
    Expected Result: 测试通过
    Evidence: 终端显示 "X tests passed"
  ```

  **Commit**: YES
  - Message: `test: 配置Vitest测试环境`
  - Files: vitest.config.ts, package.json

---

- [ ] 3. C60分子坐标数据

  **What to do**:
  - 研究C60 (富勒烯) 的原子坐标
  - C60是截角二十面体 (Truncated Iicosahedron)
  - 60个碳原子位置
  - 使用黄金比例 φ = (1+√5)/2 计算坐标:
    - 顶点位置: (±1, ±1, ±1)
    - 矩形中心: (0, ±1/φ, ±φ)
    - 五边形中心: (±1/φ, ±φ, 0)
    - 六边形中心: (±φ, 0, ±1/φ)
  - 计算90个化学键的连接关系（键长约1.4-1.5Å）
  - 创建数据文件: `src/data/c60.ts`

  **Must NOT do**:
  - 不要手动输入60个坐标（容易出错）
  - 不要使用不准确的近似坐标

  **Recommended Agent Profile**:
  - **Category**: ultrabrain
    - Reason: 需要计算几何结构
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocked By**: None
  - **Blocks**: Tasks 4, 5

  **References**:
  - 维基百科: C60富勒烯结构 - 截角二十面体几何
  - 数学公式: 黄金比例 φ = (1+√5)/2 ≈ 1.618
    - C60顶点基于正十二面体/正二十面体的截角

  **Acceptance Criteria**:

  - [ ] 60个原子坐标数据文件存在
  - [ ] 数据格式正确 (x, y, z坐标)
  - [ ] 90个化学键连接关系正确
  - [ ] 原子分布在球面上，形状正确（足球形）

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C60数据验证
    Tool: Bash (Node.js)
    Preconditions: c60.ts文件存在
    Steps:
      1. 运行Node.js脚本验证坐标数量
      2. 验证原子数量为60
      3. 验证化学键数量为90
    Expected Result: 数据正确
    Evidence: 控制台输出验证结果
  ```

  **Commit**: YES
  - Message: `data: 添加C60分子坐标数据`
  - Files: src/data/c60.ts

---

- [ ] 4. 3D渲染核心 - 原子球体

  **What to do**:
  - 使用React Three Fiber创建3D场景
  - 创建CarbonAtom组件（碳原子球体）
  - 渲染60个碳原子
  - 设置原子半径、颜色（灰色/黑色）
  - 设置材质（Phong或Standard材质）
  - 添加光照

  **Must NOT do**:
  - 不要把所有逻辑写在一个组件里

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
    - Reason: 3D渲染需要图形学知识
  - **Skills**: [three.js, react]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocked By**: Tasks 1, 3
  - **Blocks**: Task 12

  **References**:
  - React Three Fiber文档: `https://docs.pmnd.rs/react-three-fiber/`
  - Three.js球体: `THREE.SphereGeometry`

  **Acceptance Criteria**:

  - [ ] Canvas组件正确渲染
  - [ ] 60个球体显示在场景中
  - [ ] 球体颜色为碳原子颜色（深灰色）
  - [ ] 光照正确，立体感明显

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C60原子渲染验证
    Tool: Playwright
    Preconditions: Electron应用运行中，C60已加载
    Steps:
      1. 打开应用窗口
      2. 等待3D场景加载
      3. 截图保存
      4. 验证截图包含球体结构
    Expected Result: 显示60个球体组成的C60结构
    Evidence: .sisyphus/evidence/task-4-c60-atoms.png
  ```

  **Commit**: YES
  - Message: `feat: C60原子3D渲染`
  - Files: src/components/CarbonAtom.tsx, src/components/Scene.tsx

---

- [ ] 5. 3D渲染核心 - 化学键

  **What to do**:
  - 创建Bond组件（化学键圆柱体）
  - 根据原子坐标计算键的位置和方向
  - 使用CylinderGeometry绘制键
  - 设置键的颜色（灰色）和半径
  - 连接相关的原子对

  **Must NOT do**:
  - 不要硬编码键的位置

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
    - Reason: 需要计算几何变换
  - **Skills**: [three.js]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocked By**: Tasks 1, 3
  - **Blocks**: Task 12

  **References**:
  - Three.js圆柱体: `THREE.CylinderGeometry`
  - 向量计算: 两点确定圆柱位置和旋转

  **Acceptance Criteria**:

  - [ ] 90个化学键显示
  - [ ] 键连接正确的原子
  - [ ] 键方向正确

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C60化学键渲染验证
    Tool: Playwright
    Preconditions: 应用运行中
    Steps:
      1. 打开应用
      2. 截图验证
    Expected Result: 球体之间有圆柱连接
    Evidence: .sisyphus/evidence/task-5-c60-bonds.png
  ```

  **Commit**: YES
  - Message: `feat: C60化学键3D渲染`
  - Files: src/components/Bond.tsx

---

- [ ] 6. 3D交互控制

  **What to do**:
  - 使用@react-three/drei的OrbitControls
  - 支持鼠标拖拽旋转
  - 支持滚轮缩放
  - 支持右键平移
  - 配置合适的旋转、缩放限制

  **Must NOT do**:
  - 不要禁用过深导致无法操作

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
  - **Skills**: [three.js]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocked By**: Task 1
  - **Blocks**: Task 12

  **References**:
  - `@react-three/drei` OrbitControls文档

  **Acceptance Criteria**:

  - [ ] 拖拽鼠标可旋转模型
  - [ ] 滚轮可放大/缩小
  - [ ] 旋转流畅，无卡顿
  - [ ] 有缩放上下限

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 3D交互验证
    Tool: Playwright
    Preconditions: 应用运行中
    Steps:
      1. 打开应用
      2. 鼠标拖拽旋转
      3. 滚轮缩放
      4. 验证模型响应操作
    Expected Result: 交互响应正常
    Evidence: 无报错
  ```

  **Commit**: YES
  - Message: `feat: 添加3D交互控制`
  - Files: src/components/Scene.tsx

---

- [ ] 7. 信息面板组件

  **What to do**:
  - 创建InfoPanel组件
  - 显示分子名称 (C60 / C70)
  - 显示原子数量 (60 / 70)
  - 显示化学键数量 (90 / 105)
  - 切换分子下拉选择
  - 样式美观，符合教学演示风格

  **Must NOT do**:
  - 不要遮挡3D视图

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
  - **Skills**: [react, css]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10, 11)
  - **Blocked By**: Tasks 4, 5, 6
  - **Blocks**: Task 12

  **References**:
  - React组件设计模式

  **Acceptance Criteria**:

  - [ ] 面板显示在界面角落
  - [ ] 显示"分子: C60"
  - [ ] 显示"原子数: 60"
  - [ ] 显示"化学键: 90"
  - [ ] 面板不遮挡3D视图

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 信息面板验证
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 打开应用
      2. 截图
      3. 验证面板文本
    Expected Result: 显示正确信息
    Evidence: .sisyphus/evidence/task-7-info-panel.png
  ```

  **Commit**: YES
  - Message: `feat: 添加信息展示面板`
  - Files: src/components/InfoPanel.tsx

---

- [ ] 8. 投影模式切换

  **What to do**:
  - 实现透视投影 (PerspectiveCamera)
  - 实现正交投影 (OrthographicCamera)
  - 添加切换按钮/开关
  - 记录用户偏好

  **Must NOT do**:
  - 切换时不要闪烁

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
  - **Skills**: [three.js]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9, 10, 11)
  - **Blocked By**: Tasks 4, 5, 6
  - **Blocks**: Task 12

  **References**:
  - Three.js相机文档

  **Acceptance Criteria**:

  - [ ] 默认使用透视投影
  - [ ] 可切换到正交投影
  - [ ] 切换后3D视图正确渲染
  - [ ] 切换按钮可点击

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 投影切换验证
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 打开应用（透视模式）
      2. 点击投影切换按钮
      3. 截图
    Expected Result: 投影模式改变
    Evidence: .sisyphus/evidence/task-8-projection.png
  ```

  **Commit**: YES
  - Message: `feat: 添加投影模式切换`
  - Files: src/components/Scene.tsx, src/components/Controls.tsx

---

- [ ] 9. 截图保存功能

  **What to do**:
  - 使用Three.js的renderer.domElement.toDataURL
  - 添加截图按钮
  - 保存为PNG格式
  - 自动命名 (c60_截图_时间.png)
  - 选择保存路径

  **Must NOT do**:
  - 不要每次截图都弹窗询问路径（使用默认路径）

  **Recommended Agent Profile**:
  - **Category**: visual-engineering
  - **Skills**: [electron, three.js]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 10, 11)
  - **Blocked By**: Tasks 4, 5, 6
  - **Blocks**: Task 12

  **References**:
  - Electron dialog API: `dialog.showSaveDialog`

  **Acceptance Criteria**:

  - [ ] 截图按钮存在
  - [ ] 点击后弹出保存对话框
  - [ ] PNG文件成功保存
  - [ ] 包含完整3D内容

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 截图功能验证
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 打开应用
      2. 点击截图按钮
      3. 验证文件生成
    Expected Result: 图片文件存在且可读
    Evidence: 验证文件存在
  ```

  **Commit**: YES
  - Message: `feat: 添加截图保存功能`
  - Files: src/utils/screenshot.ts

---

- [ ] 10. 全屏模式

  **What to do**:
  - 使用HTML5 Fullscreen API
  - 添加全屏按钮
  - 支持退出全屏 (ESC键或按钮)
  - 全屏时隐藏UI（仅显示3D）

  **Must NOT do**:
  - 全屏后不要无法退出

  **Recommended Agent Profile**:
  - **Category**: visual-engineering

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9, 11)
  - **Blocked By**: Tasks 4, 5, 6
  - **Blocks**: Task 12

  **References**:
  - HTML5 Fullscreen API文档

  **Acceptance Criteria**:

  - [ ] 全屏按钮存在
  - [ ] 点击后进入全屏
  - [ ] 全屏时仅显示3D画布
  - [ ] ESC可退出全屏

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 全屏模式验证
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 打开应用
      2. 点击全屏按钮
      3. 验证全屏状态
    Expected Result: 全屏显示
    Evidence: .sisyphus/evidence/task-10-fullscreen.png
  ```

  **Commit**: YES
  - Message: `feat: 添加全屏模式`
  - Files: src/components/Controls.tsx

---

- [ ] 11. 原子点击交互

  **What to do**:
  - 使用Raycaster检测点击
  - onClick事件处理
  - 显示点击原子的信息（编号）
  - 添加高亮效果
  - 弹窗或面板显示详情

  **Must NOT do**:
  - 不要影响渲染性能

  **Recommended Agent Profile**:
  - **Category**: visual-engineering

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9, 10)
  - **Blocked By**: Tasks 4, 5, 6
  - **Blocks**: Task 12

  **References**:
  - Three.js Raycaster文档

  **Acceptance Criteria**:

  - [ ] 点击原子有响应
  - [ ] 显示原子编号（1-60）
  - [ ] 高亮效果可见

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: 原子点击验证
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 打开应用
      2. 点击某个原子
      3. 验证显示详情
    Expected Result: 显示原子信息
    Evidence: .sisyphus/evidence/task-11-atom-click.png
  ```

  **Commit**: YES
  - Message: `feat: 添加原子点击交互`
  - Files: src/components/CarbonAtom.tsx

---

- [ ] 12. C60完整测试验证

  **What to do**:
  - 运行所有单元测试
  - 集成测试所有组件
  - 手动验证完整功能流程
  - 性能测试（60fps）

  **Must NOT do**:
  - 不要跳过任何失败测试

  **Recommended Agent Profile**:
  - **Category**: unspecified-high

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 4, 5, 6, 7, 8, 9, 10, 11
  - **Blocks**: Tasks 13, 14, 15

  **References**:
  - 测试文件: src/__tests__/

  **Acceptance Criteria**:

  - [ ] npm test 通过
  - [ ] 所有功能手动验证通过
  - [ ] 60fps渲染性能

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C60完整验证
    Tool: Playwright + Bash
    Preconditions: 所有组件完成
    Steps:
      1. npm test -- --run
      2. 启动应用
      3. 完整功能测试
    Expected Result: 全部通过
    Evidence: 测试报告
  ```

  **Commit**: YES
  - Message: `test: C60完整功能测试`
  - Files: All test files

---

- [ ] 13. C70分子坐标数据

  **What to do**:
  - 使用CIF文件 `E:\op\op6\C70_COD_9008425.cif` 作为数据源
  - 解析CIF格式：提取70个碳原子分数坐标
  - 将分数坐标转换为笛卡尔坐标（使用晶胞参数a=10.6Å, b=10.6Å, c=17.2Å, γ=120°）
  - 解析105个化学键连接关系（键长1.45Å）
  - 创建数据文件: `src/data/c70.ts`

  **CIF文件信息**:
  - 来源: Crystallography Open Database (COD ID: 9008425)
  - 晶胞参数: a=10.6000Å, b=10.6000Å, c=17.2000Å, γ=120°
  - 原子数: 70个碳原子 (C1-C70)
  - 化学键: 105个 (键长1.45Å)
  - 空间群: P63/m m c

  **Must NOT do**:
  - 不要手动输入70个坐标（使用CIF解析）
  - 不要使用不准确的近似坐标

  **Recommended Agent Profile**:
  - **Category**: ultrabrain
    - Reason: 需要解析CIF格式并进行坐标转换

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 12
  - **Blocks**: Tasks 14, 15

  **References**:
  - CIF数据文件: `E:\op\op6\C70_COD_9008425.cif`
  - 晶胞转换公式: 分数坐标 → 笛卡尔坐标
    - x_cart = x * a
    - y_cart = y * b * cos(γ) - z * c * sin(γ) * (b/a的方向余弦)
    - 简化为六方晶系: 使用标准转换公式

  **Acceptance Criteria**:

  - [ ] 70个原子坐标正确解析
  - [ ] 分数坐标转换为笛卡尔坐标正确
  - [ ] 105个化学键连接关系正确
  - [ ] 结构为橄榄球形

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C70 CIF数据验证
    Tool: Bash (Node.js)
    Preconditions: c70.ts文件存在
    Steps:
      1. 运行Node.js脚本验证坐标数量
      2. 验证原子数量为70
      3. 验证化学键数量为105
      4. 验证坐标在合理范围内
    Expected Result: 数据正确
    Evidence: 控制台输出验证结果
  ```

  **Commit**: YES
  - Message: `data: 解析CIF文件添加C70分子坐标数据`
  - Files: src/data/c70.ts

---

- [ ] 14. C70 3D渲染

  **What to do**:
  - 复用C60的渲染组件
  - 传入C70数据
  - 确保渲染正确
  - 验证形状为橄榄球

  **Must NOT do**:
  - 不要重新写渲染逻辑

  **Recommended Agent Profile**:
  - **Category**: visual-engineering

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 13
  - **Blocks**: Task 15

  **Acceptance Criteria**:

  - [ ] 70个原子显示
  - [ ] 105个化学键显示
  - [ ] 形状为橄榄球形

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: C70渲染验证
    Tool: Playwright
    Preconditions: C70数据加载
    Steps:
      1. 切换到C70
      2. 截图验证
    Expected Result: 显示C70结构
    Evidence: .sisyphus/evidence/task-14-c70.png
  ```

  **Commit**: YES
  - Message: `feat: 添加C70 3D渲染`
  - Files: src/data/c70.ts

---

- [ ] 15. C70功能验证

  **What to do**:
  - 验证C70所有功能
  - 信息面板显示70原子/105键
  - 交互功能正常
  - 截图正常

  **Must NOT do**:
  - 不要遗漏任何功能

  **Recommended Agent Profile**:
  - **Category**: unspecified-high

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 14
  - **Blocks**: Task 16

  **Acceptance Criteria**:

  - [ ] 所有功能在C70模式下正常

  **Commit**: YES
  - Message: `test: C70功能验证`
  - Files: N/A

---

- [ ] 16. Electron打包配置

  **What to do**:
  - 配置electron-builder
  - 设置应用名称、图标
  - 配置Windows/Mac构建
  - 设置打包输出目录

  **Must NOT do**:
  - 不要打包过大的调试信息

  **Recommended Agent Profile**:
  - **Category**: quick

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 12, 15
  - **Blocks**: Task 17

  **References**:
  - electron-builder文档

  **Acceptance Criteria**:

  - [ ] electron-builder配置正确
  - [ ] 构建脚本可用
  - [ ] 可生成安装包

  **Commit**: YES
  - Message: `config: Electron打包配置`
  - Files: electron-builder.json

---

- [ ] 17. 最终验证

  **What to do**:
  - 构建生产版本
  - 运行.exe/.app文件
  - 最终功能验证
  - 清理临时文件

  **Must NOT do**:
  - 不要遗留调试代码

  **Recommended Agent Profile**:
  - **Category**: unspecified-high

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 16
  - **Blocks**: None (final)

  **Acceptance Criteria**:

  - [ ] 可执行文件运行正常
  - [ ] 所有功能验证通过

  **Commit**: YES
  - Message: `chore: 最终版本发布`
  - Files: All

---

## 提交策略

| 任务后 | 消息 | 文件 | 验证 |
|--------|------|------|------|
| 1 | `init: Electron + React + Vite项目骨架` | package.json, vite.config.ts | npm run dev |
| 2 | `test: 配置Vitest测试环境` | vitest.config.ts | npm test |
| 3 | `data: 添加C60分子坐标数据` | src/data/c60.ts | 验证数据 |
| 4 | `feat: C60原子3D渲染` | src/components/* | 截图验证 |
| 5 | `feat: C60化学键3D渲染` | src/components/Bond.tsx | 截图验证 |
| 6 | `feat: 添加3D交互控制` | src/components/Scene.tsx | 手动测试 |
| 7 | `feat: 添加信息展示面板` | src/components/InfoPanel.tsx | 截图验证 |
| 8 | `feat: 添加投影模式切换` | src/components/Scene.tsx | 手动测试 |
| 9 | `feat: 添加截图保存功能` | src/utils/screenshot.ts | 文件验证 |
| 10 | `feat: 添加全屏模式` | src/components/Controls.tsx | 手动测试 |
| 11 | `feat: 添加原子点击交互` | src/components/CarbonAtom.tsx | 手动测试 |
| 12 | `test: C60完整功能测试` | src/__tests__/ | npm test |
| 13 | `data: 添加C70分子坐标数据` | src/data/c70.ts | 验证数据 |
| 14 | `feat: 添加C70 3D渲染` | src/components/* | 截图验证 |
| 15 | `test: C70功能验证` | N/A | 手动测试 |
| 16 | `config: Electron打包配置` | electron-builder.json | 构建测试 |
| 17 | `chore: 最终版本发布` | All | 运行exe |

---

## 成功标准

### 验证命令
```bash
npm run dev  # 开发模式启动
npm test    # 运行测试
npm run build  # 生产构建
```

### 最终检查清单
- [ ] 所有"必须有"项存在
- [ ] 所有"必须没有"项不存在
- [ ] 所有测试通过
- [ ] C60模型完整可用
- [ ] C70模型完整可用
- [ ] Electron应用成功打包
