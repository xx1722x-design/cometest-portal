import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  temperature: number
  radius: number
}

export function RoomConvectionSimulator() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [acOn, setAcOn] = useState(false)
  const [heaterOn, setHeaterOn] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = []
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * 500 + 250,
        y: Math.random() * 380 + 160,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        temperature: 30 + Math.random() * 20,
        radius: 4,
      })
    }
    particlesRef.current = particles
  }, [])

  // Draw 3D wireframe cube in isometric view
  const drawIsometricBox = (ctx: CanvasRenderingContext2D) => {
    const centerX = 500
    const centerY = 350
    const width = 500
    const height = 380
    const depth = 300

    // Isometric projection
    const scale = 0.707 // cos(45°)
    const dx = width * scale / 2
    const dy = height / 2
    const dz = depth * scale / 2

    // 8 vertices of the cube
    const vertices = [
      // Front face
      [centerX - dx, centerY + dy, 0], // 0: bottom-left-front
      [centerX + dx, centerY + dy, 0], // 1: bottom-right-front
      [centerX + dx, centerY - dy, 0], // 2: top-right-front
      [centerX - dx, centerY - dy, 0], // 3: top-left-front
      // Back face
      [centerX - dx + dz, centerY + dy, 0], // 4: bottom-left-back
      [centerX + dx + dz, centerY + dy, 0], // 5: bottom-right-back
      [centerX + dx + dz, centerY - dy, 0], // 6: top-right-back
      [centerX - dx + dz, centerY - dy, 0], // 7: top-left-back
    ]

    // Draw edges
    ctx.strokeStyle = '#ff8c42'
    ctx.lineWidth = 2.5
    ctx.globalAlpha = 0.8

    const edges = [
      // Front face
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      // Back face
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      // Connecting edges
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ]

    edges.forEach(([start, end]) => {
      const [x1, y1] = vertices[start]
      const [x2, y2] = vertices[end]
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

    ctx.globalAlpha = 1

    // Draw semi-transparent interior
    ctx.fillStyle = '#ff8c42'
    ctx.globalAlpha = 0.04
    ctx.fillRect(centerX - dx, centerY - dy, width, height)
    ctx.globalAlpha = 1
  }

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const roomCenterX = 500
    const roomCenterY = 350
    const roomBoundsLeft = 250
    const roomBoundsRight = 750
    const roomBoundsTop = 160
    const roomBoundsBottom = 540

    // AC position: top-left
    const acX = 320
    const acY = 190
    const acRadius = 60

    // Heater position: bottom-right
    const heaterX = 680
    const heaterY = 490
    const heaterRadius = 70

    // Only activate convection if AC or Heater is ON
    const convectionActive = acOn || heaterOn

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw 3D wireframe box
      drawIsometricBox(ctx)

      if (isRunning) {
        const particles = particlesRef.current

        particles.forEach((particle) => {
          const distToAC = Math.hypot(particle.x - acX, particle.y - acY)
          const distToHeater = Math.hypot(particle.x - heaterX, particle.y - heaterY)

          // Reset velocities if convection is not active
          if (!convectionActive) {
            particle.vx *= 0.92
            particle.vy *= 0.92
            // Only minimal thermal motion (Brownian)
            particle.vx += (Math.random() - 0.5) * 0.1
            particle.vy += (Math.random() - 0.5) * 0.1
          } else {
            // AC cooling and gentle downward push (REDUCED SPEED)
            if (acOn && distToAC < acRadius) {
              particle.temperature = Math.max(15, particle.temperature - 0.3)
              const forceStrength = (1 - distToAC / acRadius) * 0.8
              particle.vy += forceStrength * 0.4 // Much gentler
            }

            // Heater heating and gentle upward push (REDUCED SPEED)
            if (heaterOn && distToHeater < heaterRadius) {
              particle.temperature = Math.min(75, particle.temperature + 0.4)
              const forceStrength = (1 - distToHeater / heaterRadius) * 0.9
              particle.vy -= forceStrength * 0.5 // Much gentler
            }

            // Natural convection (REDUCED)
            const naturalConvection = (particle.temperature - 35) / 50
            particle.vy -= naturalConvection * 0.25 // Reduced from 0.8

            // Gentle circular vector field (REDUCED)
            const dx = particle.x - roomCenterX
            const dy = particle.y - roomCenterY
            const dist = Math.hypot(dx, dy)
            if (dist > 0) {
              const perpX = -dy / dist
              const perpY = dx / dist
              const circulationStrength = 0.12 // Reduced from 0.3
              particle.vx += perpX * circulationStrength
              particle.vy += perpY * circulationStrength * 0.25
            }

            // Brownian motion
            particle.vx += (Math.random() - 0.5) * 0.15
            particle.vy += (Math.random() - 0.5) * 0.1

            // Gentle damping
            particle.vx *= 0.98
            particle.vy *= 0.98
          }

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Soft boundary collision
          const margin = particle.radius + 3
          if (particle.x - margin < roomBoundsLeft) {
            particle.x = roomBoundsLeft + margin
            particle.vx *= -0.7
          }
          if (particle.x + margin > roomBoundsRight) {
            particle.x = roomBoundsRight - margin
            particle.vx *= -0.7
          }
          if (particle.y - margin < roomBoundsTop) {
            particle.y = roomBoundsTop + margin
            particle.vy *= -0.7
          }
          if (particle.y + margin > roomBoundsBottom) {
            particle.y = roomBoundsBottom - margin
            particle.vy *= -0.7
          }
        })

        // Draw particles with smooth colors
        particles.forEach((particle) => {
          let color: string
          if (particle.temperature < 20) {
            color = '#4a9eff'
          } else if (particle.temperature < 35) {
            color = '#9966ff'
          } else if (particle.temperature < 50) {
            color = '#ffcc66'
          } else {
            color = '#ff4444'
          }

          ctx.fillStyle = color
          ctx.globalAlpha = 0.8
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        })
      }

      // Draw AC indicator (only if in active zone)
      if (acOn) {
        ctx.fillStyle = '#4a9eff'
        ctx.shadowColor = '#2577ff'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(acX, acY, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.fillStyle = '#2a3a4a'
        ctx.beginPath()
        ctx.arc(acX, acY, 22, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw Heater indicator (only if in active zone)
      if (heaterOn) {
        ctx.fillStyle = '#ff6b35'
        ctx.shadowColor = '#ff4422'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(heaterX, heaterY, 24, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.fillStyle = '#4a2a1a'
        ctx.beginPath()
        ctx.arc(heaterX, heaterY, 24, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, acOn, heaterOn])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Centered Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        style={{
          display: 'block',
          border: '3px solid #ff8c42',
          borderRadius: '8px',
          boxShadow: '0 0 40px rgba(255, 140, 66, 0.4)',
        }}
      />

      {/* Top-Left Info Panel */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.92)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '16px',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          width: '280px',
          fontSize: '12px',
          lineHeight: '1.5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#ff8c42', fontWeight: '700' }}>
          🌬️ Room Convection
        </h2>
        <p style={{ margin: '6px 0', fontSize: '11px', color: '#aaa' }}>
          Turn AC ON: Cold air sinks
        </p>
        <p style={{ margin: '6px 0', fontSize: '11px', color: '#aaa' }}>
          Turn Heater ON: Hot air rises
        </p>
        <p style={{ margin: '6px 0', fontSize: '11px', color: '#888' }}>
          Both OFF = No convection
        </p>
      </div>

      {/* Bottom-Left Control Panel */}
      <div
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '30px',
          width: '310px',
          backgroundColor: 'rgba(10, 10, 26, 0.92)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '16px',
          fontFamily: "'Segoe UI', sans-serif",
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              checked={isRunning}
              onChange={(e) => setIsRunning(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#4a9eff',
              }}
            />
            ⏵ Run Simulation
          </label>

          <label
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={acOn}
                onChange={(e) => setAcOn(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#4a9eff',
                }}
              />
              ❄️ 에어컨 (AC)
            </span>
            <span style={{ fontSize: '11px', color: acOn ? '#4a9eff' : '#666' }}>
              {acOn ? 'ON' : 'OFF'}
            </span>
          </label>

          <label
            style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={heaterOn}
                onChange={(e) => setHeaterOn(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#ff6b35',
                }}
              />
              🔥 난로 (Heater)
            </span>
            <span style={{ fontSize: '11px', color: heaterOn ? '#ff6b35' : '#666' }}>
              {heaterOn ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => (window.location.href = '/chemistry')}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← Back
      </button>
    </div>
  )
}
