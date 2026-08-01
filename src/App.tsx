import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'

// 动态计算正交投影视锥体，确保与透视投影相同的画面比例
function OrthoFrustumCamera() {
  const { size } = useThree()
  const aspect = size.width / size.height
  const distance = 12 // 与透视相机相同的距离
  const fov = 60 // 与透视相机相同的视野角度

  // 计算视锥体尺寸，匹配透视投影的画面范围
  const halfHeight = distance * Math.tan(THREE.MathUtils.degToRad(fov / 2))
  const halfWidth = halfHeight * aspect

  return (
    <OrthographicCamera 
      makeDefault 
      position={[0, 0, distance]}
      left={-halfWidth}
      right={halfWidth}
      top={halfHeight}
      bottom={-halfHeight}
      near={0.1}
      far={1000}
    />
  )
}
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { c60Data } from './data/c60'
import { c70Data } from './data/c70'
import { c20Data } from './data/c20'
import { c76Data } from './data/c76'
import { c78Data } from './data/c78'
import { c80Data } from './data/c80'
import { c84Data } from './data/c84'
import { MoleculeData, FULLERENE_FORMULAS } from './data/types'

// Component to verify camera type and log debug info
// Debug component - only active in development
function CameraDebug() {
  // Only run in development mode
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  const { camera } = useThree()
  
  useEffect(() => {
    console.log('Camera type:', camera.type)
    console.log('Is OrthographicCamera:', camera instanceof THREE.OrthographicCamera)
    console.log('Is PerspectiveCamera:', camera instanceof THREE.PerspectiveCamera)
    
    if (camera instanceof THREE.OrthographicCamera) {
      console.log('Orthographic camera properties:', {
        left: camera.left,
        right: camera.right,
        top: camera.top,
        bottom: camera.bottom,
        near: camera.near,
        far: camera.far,
        position: camera.position.toArray()
      })
    }
  }, [camera])
  
  return null
}

// Molecule type definition
export type MoleculeType = 'C20' | 'C60' | 'C70' | 'C76' | 'C78' | 'C80' | 'C84'

// Molecule data map - initialized once with all data
const MOLECULE_DATA_MAP: Record<MoleculeType, MoleculeData> = {
  C20: c20Data,
  C60: c60Data,
  C70: c70Data,
  C76: c76Data,
  C78: c78Data,
  C80: c80Data,
  C84: c84Data
}

// Custom hook for getting molecule data - uses cached data
function useMoleculeData(molecule: MoleculeType): MoleculeData {
  return MOLECULE_DATA_MAP[molecule]
}

// C70 预设视角配置 - 用于富勒烯3D演示
export interface CameraPreset {
  name: string
  nameCn: string
  position: [number, number, number]
  description: string
}

// C70 富勒烯的经典展示视角
export const C70_PRESETS: CameraPreset[] = [
  {
    name: 'side_view',
    nameCn: '侧视图',
    position: [0, 0, 15],
    description: '展示C70的橄榄球形状'
  },
  {
    name: 'top_view',
    nameCn: '顶视图',
    position: [0, 15, 0],
    description: '从五边形极点俯视'
  },
  {
    name: 'equator_view',
    nameCn: '赤道视图',
    position: [15, 0, 0],
    description: '从赤道方向观看'
  },
  {
    name: 'corner_view',
    nameCn: '角落视角',
    position: [10, 8, 10],
    description: '对角线方向全景'
  },
  {
    name: 'pentagon_face',
    nameCn: '五边形面',
    position: [0, 12, 8],
    description: '正对五边形极点'
  },
  {
    name: 'threequarter',
    nameCn: '3/4视角',
    position: [8, 6, 12],
    description: '经典立体展示角度'
  }
]

// Atom component
function CarbonAtom({ 
  position, 
  color = '#2D3436',
  radius = 0.28,
  onClick,
  isHighlighted = false
}: { 
  position: [number, number, number]
  color?: string 
  radius?: number
  onClick?: () => void
  isHighlighted?: boolean
}) {
  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={isHighlighted ? '#E74C3C' : color} 
        roughness={0.4} 
        metalness={0.1}
        emissive={isHighlighted ? '#C0392B' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.2 : 0}
      />
    </mesh>
  )
}

// Bond component - 使用Three.js quaternion正确计算方向
function Bond({ 
  start, 
  end, 
  color = '#636E72',
  radius = 0.08
}: { 
  start: [number, number, number]
  end: [number, number, number]
  color?: string
  radius?: number
}) {
  // Memoize position and rotation calculations
  const { position, quaternion, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    
    const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const len = startVec.distanceTo(endVec)
    const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize()
    
    const up = new THREE.Vector3(0, 1, 0)
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
    
    return { 
      position: midpoint.toArray(), 
      quaternion: quat, 
      length: len 
    }
  }, [start, end, radius])
  
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  )
}

// Scene component
function MoleculeScene({ 
  molecule,
  highlightedAtom,
  onAtomClick,
  showAtoms,
  showBonds,
  atomScale,
  bondScale,
  controlsRef,
  autoRotate,
  rotateSpeed,
  projectionMode,
}: { 
  molecule: 'C20' | 'C60' | 'C70' | 'C76' | 'C78' | 'C80' | 'C84'
  highlightedAtom: number | null
  onAtomClick: (id: number) => void
  showAtoms: boolean
  showBonds: boolean
  atomScale: number
  bondScale: number
  controlsRef?: React.RefObject<any>
  autoRotate?: boolean
  rotateSpeed?: number
  projectionMode: 'perspective' | 'orthographic'
}) {
  const data = useMoleculeData(molecule)
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#dfe6e9" />
      
      {showAtoms && data.atoms.map((atom, idx) => (
        <CarbonAtom 
          key={`atom-${idx}`}
          position={atom.position}
          radius={0.28 * atomScale}
          onClick={() => onAtomClick(atom.id)}
          isHighlighted={highlightedAtom === atom.id}
        />
      ))}
      
      {showBonds && data.bonds.map((bond, idx) => (
        <Bond 
          key={`bond-${idx}`}
          start={data.atoms[bond.atom1Index].position}
          end={data.atoms[bond.atom2Index].position}
          radius={0.08 * bondScale}
        />
      ))}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
        autoRotate={autoRotate}
        autoRotateSpeed={rotateSpeed}
      />
    </>
  )
}

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<any>(null)
  const [molecule, setMolecule] = useState<'C20' | 'C60' | 'C70' | 'C76' | 'C78' | 'C80' | 'C84'>('C20')
  const [highlightedAtom, setHighlightedAtom] = useState<number | null>(null)
  const [projectionMode, setProjectionMode] = useState<'perspective' | 'orthographic'>('perspective')
  
  // UI State - matching crystal-viewer-3d
  const [showAtoms, setShowAtoms] = useState(true)
  const [showBonds, setShowBonds] = useState(true)
  const [atomScale, setAtomScale] = useState(1.0)
  const [bondScale, setBondScale] = useState(1.0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotateSpeed, setRotateSpeed] = useState(1.0)
  const [currentPreset, setCurrentPreset] = useState<string>('threequarter')

  const handleAtomClick = (id: number) => {
    setHighlightedAtom(highlightedAtom === id ? null : id)
  }

  // 切换到预设视角
  const goToPreset = useCallback((preset: CameraPreset) => {
    if (controlsRef.current) {
      // 停止自动旋转
      setAutoRotate(false)
      
      // 平滑过渡到预设位置
      const camera = controlsRef.current.object
      if (camera) {
        camera.position.set(...preset.position)
        camera.lookAt(0, 0, 0)
        controlsRef.current.update()
      }
      setCurrentPreset(preset.name)
    }
  }, [])

  const resetView = () => {
    window.location.reload()
  }

  // Screenshot function
  const takeScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${molecule}_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }, [molecule])

  const data = useMoleculeData(molecule)

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      {/* Header - 浅色主题 */}
      <header style={{ 
        padding: '10px 20px', 
        background: '#ffffff', 
        color: '#2d3436',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #dfe6e9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Fullerene Molecular Visualization</h1>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Molecule Selector */}
          <select 
            value={molecule} 
            onChange={(e) => {
              setMolecule(e.target.value as 'C20' | 'C60' | 'C70' | 'C76' | 'C78' | 'C80' | 'C84')
              setHighlightedAtom(null)
            }}
            style={{ 
              padding: '5px 10px', 
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #dfe6e9',
              background: '#ffffff',
              color: '#2d3436',
              cursor: 'pointer'
            }}
          >
            <option value="C20">C20 (富勒烯)</option>
            <option value="C60">C60 (富勒烯)</option>
            <option value="C70">C70 (富勒烯)</option>
            <option value="C76">C76 (富勒烯)</option>
            <option value="C78">C78 (富勒烯)</option>
            <option value="C80">C80 (富勒烯)</option>
            <option value="C84">C84 (富勒烯)</option>
          </select>
        </div>
      </header>

      {/* 3D Canvas - 使用浅色背景使分子更突出 */}
      <div style={{ flex: 1, background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)', position: 'relative' }}>
        {projectionMode === 'perspective' ? (
          <Canvas 
            camera={{ position: [0, 0, 12], fov: 60 }}
            gl={{ antialias: true }}
          >
            {/* 添加背景色 */}
            <color attach="background" args={['#F8F9FA']} />
            
            {/* 添加环境光使分子更亮 */}
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#b8c5d6" />
            <MoleculeScene 
              molecule={molecule}
              highlightedAtom={highlightedAtom}
              onAtomClick={handleAtomClick}
              showAtoms={showAtoms}
              showBonds={showBonds}
              atomScale={atomScale}
              bondScale={bondScale}
              projectionMode={projectionMode}
            />
          </Canvas>
        ) : (
          <Canvas 
            gl={{ antialias: true }}
          >
            <OrthoFrustumCamera />
            <CameraDebug />
            
            {/* 添加背景色 */}
            <color attach="background" args={['#F8F9FA']} />
            
            {/* 添加环境光使分子更亮 */}
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#b8c5d6" />
            
            <MoleculeScene 
              molecule={molecule}
              highlightedAtom={highlightedAtom}
              onAtomClick={handleAtomClick}
              showAtoms={showAtoms}
              showBonds={showBonds}
              atomScale={atomScale}
              bondScale={bondScale}
              projectionMode={projectionMode}
            />
          </Canvas>
        )}

        {/* Control Panel - Left Side - 浅色主题 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#2d3436',
          padding: '20px',
          borderRadius: '12px',
          minWidth: '220px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #dfe6e9'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid #dfe6e9', paddingBottom: '10px', fontWeight: 600 }}>
            显示选项
          </h3>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showAtoms} 
              onChange={(e) => setShowAtoms(e.target.checked)}
              style={{ marginRight: '10px', width: '16px', height: '16px' }}
            />
            原子
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showBonds} 
              onChange={(e) => setShowBonds(e.target.checked)}
              style={{ marginRight: '10px', width: '16px', height: '16px' }}
            />
            化学键
          </label>

          <h3 style={{ margin: '20px 0 15px 0', fontSize: '16px', borderBottom: '1px solid #dfe6e9', paddingBottom: '10px', fontWeight: 600 }}>
            尺寸调节
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>原子大小</span>
              <span>{atomScale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1"
              value={atomScale}
              onChange={(e) => setAtomScale(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>键粗细</span>
              <span>{bondScale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1"
              value={bondScale}
              onChange={(e) => setBondScale(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <h3 style={{ margin: '20px 0 15px 0', fontSize: '16px', borderBottom: '1px solid #dfe6e9', paddingBottom: '10px', fontWeight: 600 }}>
            投影模式
          </h3>
          
          <select 
            value={projectionMode}
            onChange={(e) => setProjectionMode(e.target.value as 'perspective' | 'orthographic')}
            style={{ 
              width: '100%',
              padding: '8px', 
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #dfe6e9',
              background: '#ffffff',
              color: '#2d3436',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            <option value="perspective">透视投影</option>
            <option value="orthographic">正交投影</option>
          </select>

          <h3 style={{ margin: '20px 0 15px 0', fontSize: '16px', borderBottom: '1px solid #dfe6e9', paddingBottom: '10px', fontWeight: 600 }}>
            动画
          </h3>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoRotate} 
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginRight: '10px', width: '16px', height: '16px' }}
            />
            自动旋转
          </label>
          
          {autoRotate && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>速度</span>
                <span>{rotateSpeed.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={rotateSpeed}
                onChange={(e) => setRotateSpeed(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={resetView}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #dfe6e9',
                background: '#ffffff',
                color: '#2d3436',
                cursor: 'pointer'
              }}
            >
              重置视角
            </button>
            <button 
              onClick={takeScreenshot}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #dfe6e9',
                background: '#ffffff',
                color: '#2d3436',
                cursor: 'pointer'
              }}
            >
              截图
            </button>
          </div>
        </div>

        {/* Info Panel - Right Side - 浅色主题 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#2d3436',
          padding: '15px',
          borderRadius: '12px',
          minWidth: '180px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #dfe6e9'
        }}>
          <h3 style={{ marginBottom: '10px', borderBottom: '1px solid #dfe6e9', paddingBottom: '5px', fontSize: '16px', fontWeight: 600 }}>
            分子信息
          </h3>
          <p style={{ margin: '5px 0' }}>分子: <strong>{molecule}</strong></p>
          <p style={{ margin: '5px 0' }}>原子数: <strong>{data.atomCount}</strong></p>
          <p style={{ margin: '5px 0' }}>化学键: <strong>{data.bondCount}</strong></p>
          <p style={{ margin: '5px 0' }}>五边形数: <strong>12</strong></p>
          <p style={{ margin: '5px 0' }}>六边形数: <strong>{(data.atomCount / 2) - 10}</strong></p>
          <p style={{ margin: '5px 0' }}>投影: <strong>{projectionMode === 'perspective' ? '透视' : '正交'}</strong></p>
          {highlightedAtom && (
            <p style={{ color: '#e74c3c', marginTop: '8px' }}>
              已选中: 原子 #{highlightedAtom}
            </p>
          )}
          <p style={{ marginTop: '15px', fontSize: '12px', color: '#636e72' }}>
            拖拽旋转 | 滚轮缩放 | 右键平移<br/>
            点击原子查看详情
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
