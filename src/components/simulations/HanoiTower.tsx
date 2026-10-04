import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

interface PegStack {
  id: number
  disks: number[]
}

export function HanoiTower() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.Camera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const pegMeshesRef = useRef<THREE.Mesh[]>([])
  const diskMeshesRef = useRef<THREE.Mesh[]>([])
  const diskGroupRef = useRef<THREE.Group | null>(null)

  const [numDisks, setNumDisks] = useState(3)
  const [moveCount, setMoveCount] = useState(0)
  const [pegs, setPegs] = useState<PegStack[]>([
    { id: 0, disks: Array.from({ length: 3 }, (_, i) => 3 - i) },
    { id: 1, disks: [] },
    { id: 2, disks: [] }
  ])
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null)
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoSpeed, setAutoSpeed] = useState(500)
  const [isAutoRunning, setIsAutoRunning] = useState(false)

  const diskColors = [
    '#FF6B6B', '#FF8E8E', '#FFA5A5',
    '#4ECDC4', '#6FD8D3', '#90E0DE',
    '#FFD93D', '#FFE066', '#FFEB99'
  ]

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 2, 6)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    rendererRef.current = renderer

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(8, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.6)
    pointLight.position.set(-5, 5, 5)
    scene.add(pointLight)

    // Board
    const boardGeom = new THREE.BoxGeometry(10, 0.5, 3)
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.4, roughness: 0.6 })
    const board = new THREE.Mesh(boardGeom, boardMat)
    board.position.y = -2
    board.castShadow = true
    board.receiveShadow = true
    scene.add(board)

    // Pegs
    pegMeshesRef.current = []
    for (let i = 0; i < 3; i++) {
      const pegGeom = new THREE.CylinderGeometry(0.25, 0.25, 4, 32)
      const pegMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, metalness: 0.5, roughness: 0.5 })
      const peg = new THREE.Mesh(pegGeom, pegMat)
      peg.position.x = i === 0 ? -3 : i === 1 ? 0 : 3
      peg.position.y = 0
      peg.castShadow = true
      peg.receiveShadow = true
      peg.userData.pegId = i
      scene.add(peg)
      pegMeshesRef.current.push(peg)
    }

    // Disk group for easy manipulation
    const diskGroup = new THREE.Group()
    scene.add(diskGroup)
    diskGroupRef.current = diskGroup

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onCanvasClick = (event: MouseEvent) => {
      if (!cameraRef.current || !rendererRef.current || isAutoRunning) return
      if (event.button !== 0) return // Only left-click

      const rect = canvasRef.current!.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, cameraRef.current)
      const intersects = raycaster.intersectObjects(pegMeshesRef.current)

      if (intersects.length > 0) {
        const pegId = intersects[0].object.userData.pegId
        handlePegClick(pegId)
      }
    }

    canvas.addEventListener('mousedown', onCanvasClick)

    // Handle window resize
    const handleResize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Render loop with gentle rotation
    let rotationAngle = 0
    const animate = () => {
      requestAnimationFrame(animate)

      rotationAngle += 0.0015
      camera.position.x = Math.sin(rotationAngle) * 6.5
      camera.position.z = Math.cos(rotationAngle) * 6.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      canvas.removeEventListener('mousedown', onCanvasClick)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [isAutoRunning])

  // Update disks in the scene
  useEffect(() => {
    if (!sceneRef.current || !diskGroupRef.current) return

    // Remove old disk meshes
    diskMeshesRef.current.forEach(mesh => diskGroupRef.current!.remove(mesh))
    diskMeshesRef.current = []

    // Add new disk meshes based on pegs state
    pegs.forEach((peg) => {
      peg.disks.forEach((diskSize, index) => {
        const diskGeom = new THREE.CylinderGeometry(diskSize * 0.4, diskSize * 0.4, 0.5, 32)
        const diskMat = new THREE.MeshStandardMaterial({
          color: diskColors[diskSize - 1],
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0x333333
        })
        const disk = new THREE.Mesh(diskGeom, diskMat)
        disk.position.x = peg.id === 0 ? -3 : peg.id === 1 ? 0 : 3
        disk.position.y = -1.2 + index * 0.6
        disk.position.z = 0
        disk.castShadow = true
        disk.receiveShadow = true
        disk.userData.diskSize = diskSize
        disk.userData.pegId = peg.id
        diskGroupRef.current!.add(disk)
        diskMeshesRef.current.push(disk)
      })
    })
  }, [pegs, numDisks])

  const handlePegClick = (pegId: number) => {
    if (isAutoRunning) return

    if (selectedPeg === null) {
      if (pegs[pegId].disks.length > 0) {
        setSelectedPeg(pegId)
      }
    } else if (selectedPeg === pegId) {
      setSelectedPeg(null)
    } else {
      const newPegs = pegs.map(p => ({ ...p, disks: [...p.disks] }))
      const sourcePeg = newPegs[selectedPeg]
      const targetPeg = newPegs[pegId]

      if (sourcePeg.disks.length > 0) {
        const disk = sourcePeg.disks[sourcePeg.disks.length - 1]
        if (targetPeg.disks.length === 0 || disk < targetPeg.disks[targetPeg.disks.length - 1]) {
          sourcePeg.disks.pop()
          targetPeg.disks.push(disk)
          setPegs(newPegs)
          setMoveCount(moveCount + 1)
          setSelectedPeg(null)

          if (newPegs[2].disks.length === numDisks) {
            setTimeout(() => alert(`Congratulations! You solved it in ${moveCount + 1} moves!\nOptimal: ${Math.pow(2, numDisks) - 1} moves`), 100)
          }
        } else {
          setSelectedPeg(null)
        }
      }
    }
  }

  const resetGame = () => {
    setMoveCount(0)
    setSelectedPeg(null)
    setAutoPlay(false)
    setIsAutoRunning(false)
    setPegs([
      { id: 0, disks: Array.from({ length: numDisks }, (_, i) => numDisks - i) },
      { id: 1, disks: [] },
      { id: 2, disks: [] }
    ])
  }

  const handleDiskCountChange = (count: number) => {
    setNumDisks(count)
    setMoveCount(0)
    setSelectedPeg(null)
    setAutoPlay(false)
    setIsAutoRunning(false)
    setPegs([
      { id: 0, disks: Array.from({ length: count }, (_, i) => count - i) },
      { id: 1, disks: [] },
      { id: 2, disks: [] }
    ])
  }

  // Auto-play solver
  useEffect(() => {
    if (!autoPlay || isAutoRunning) return

    setIsAutoRunning(true)
    let currentPegs = pegs.map(p => ({ ...p, disks: [...p.disks] }))
    let moveNum = moveCount

    const hanoi = (n: number, source: number, target: number, auxiliary: number, callback: () => void) => {
      if (n === 0) {
        callback()
        return
      }

      hanoi(n - 1, source, auxiliary, target, () => {
        const sourcePeg = currentPegs[source]
        const targetPeg = currentPegs[target]

        if (sourcePeg.disks.length > 0) {
          const disk = sourcePeg.disks.pop()!
          targetPeg.disks.push(disk)
          moveNum++
          setPegs(currentPegs.map(p => ({ ...p, disks: [...p.disks] })))
          setMoveCount(moveNum)
        }

        setTimeout(() => {
          hanoi(n - 1, auxiliary, target, source, callback)
        }, autoSpeed)
      })
    }

    hanoi(numDisks, 0, 2, 1, () => {
      setIsAutoRunning(false)
      setAutoPlay(false)
    })
  }, [autoPlay, isAutoRunning, numDisks, autoSpeed, pegs, moveCount])

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, display: 'flex', background: '#1a1a1a', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        {selectedPeg !== null && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 107, 107, 0.8)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Peg {selectedPeg + 1} selected
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div
        style={{
          background: '#2c2416',
          padding: '20px',
          borderTop: '2px solid #8b7355',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        {/* Left: Game Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
            Moves: {moveCount}
          </div>
          <div style={{ color: '#aaa', fontSize: '12px' }}>
            Optimal: {Math.pow(2, numDisks) - 1}
          </div>
        </div>

        {/* Center: Disk Count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Disks: {numDisks}</label>
          <input
            type="range"
            min="1"
            max="9"
            value={numDisks}
            onChange={(e) => handleDiskCountChange(Number(e.target.value))}
            disabled={isAutoRunning}
            style={{ width: '100%', cursor: isAutoRunning ? 'not-allowed' : 'pointer' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[1, 3, 5, 7, 9].map(n => (
              <button
                key={n}
                onClick={() => handleDiskCountChange(n)}
                disabled={isAutoRunning}
                style={{
                  padding: '4px 12px',
                  background: numDisks === n ? '#667eea' : '#555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAutoRunning ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <button
            onClick={resetGame}
            disabled={isAutoRunning}
            style={{
              padding: '10px 20px',
              background: '#4ecdc4',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '4px',
              cursor: isAutoRunning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Reset
          </button>

          <button
            onClick={() => navigate('/puzzle')}
            style={{
              padding: '10px 20px',
              background: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Auto-play Panel */}
      <div
        style={{
          background: '#1f1f1f',
          padding: '15px 20px',
          borderTop: '1px solid #444',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => {
              if (!isAutoRunning) {
                setAutoPlay(e.target.checked)
              }
            }}
            disabled={isAutoRunning}
            style={{ cursor: isAutoRunning ? 'not-allowed' : 'pointer' }}
          />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Auto Play</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px' }}>
          <label style={{ color: '#aaa', fontSize: '12px', minWidth: '80px' }}>Speed:</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={autoSpeed}
            onChange={(e) => setAutoSpeed(Number(e.target.value))}
            disabled={isAutoRunning}
            style={{ flex: 1, cursor: isAutoRunning ? 'not-allowed' : 'pointer' }}
          />
          <span style={{ color: '#aaa', fontSize: '12px', minWidth: '40px' }}>
            {autoSpeed}ms
          </span>
        </div>

        {isAutoRunning && (
          <div style={{ color: '#4ecdc4', fontSize: '12px', fontWeight: '600', animation: 'pulse 1s infinite' }}>
            ⏳ Auto-solving...
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{ background: '#1a1a1a', padding: '12px 20px', textAlign: 'center', color: '#aaa', fontSize: '12px', borderTop: '1px solid #333' }}>
        Left-click a peg to select a disk, then click another peg to move it. A larger disk cannot be placed on a smaller one.
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
