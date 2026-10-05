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

  // Initialize particles with high density
  useEffect(() => {
    const particles: Particle[] = []
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * 600 + 200,
        y: Math.random() * 450 + 125,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        temperature: 30 + Math.random() * 20,
        radius: 5,
      })
    }
    particlesRef.current = particles
  }, [])

  // Animation loop with proper convection circulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const roomLeft = 200
    const roomRight = 800
    const roomTop = 125
    const roomBottom = 575
    const roomWidth = roomRight - roomLeft
    const roomHeight = roomBottom - roomTop
    const centerX = (roomLeft + roomRight) / 2
    const centerY = (roomTop + roomBottom) / 2

    // AC position: top-left
    const acX = roomLeft + 60
    const acY = roomTop + 40
    const acRadius = 70

    // Heater position: bottom-right
    const heaterX = roomRight - 60
    const heaterY = roomBottom - 40
    const heaterRadius = 80

    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (isRunning) {
        const particles = particlesRef.current

        particles.forEach((particle) => {
          // Calculate distance from AC and Heater
          const distToAC = Math.hypot(particle.x - acX, particle.y - acY)
          const distToHeater = Math.hypot(particle.x - heaterX, particle.y - heaterY)

          // AC cooling and downward push
          if (acOn && distToAC < acRadius) {
            particle.temperature = Math.max(15, particle.temperature - 0.5)
            const forceStrength = (1 - distToAC / acRadius) * 2
            particle.vy += forceStrength * 1.5 // Push DOWN
          }

          // Heater heating and upward push
          if (heaterOn && distToHeater < heaterRadius) {
            particle.temperature = Math.min(75, particle.temperature + 0.6)
            const forceStrength = (1 - distToHeater / heaterRadius) * 2.5
            particle.vy -= forceStrength * 2 // Push UP
          }

          // Natural convection: hot air rises, cold air sinks
          const naturalConvection = (particle.temperature - 35) / 40
          particle.vy -= naturalConvection * 0.8

          // Circulation loop: create a circular vector field
          const dx = particle.x - centerX
          const dy = particle.y - centerY
          const dist = Math.hypot(dx, dy)
          if (dist > 0) {
            // Perpendicular vector (for circular motion)
            const perpX = -dy / dist
            const perpY = dx / dist

            // Clockwise circulation (from user perspective)
            const circulationStrength = 0.3
            particle.vx += perpX * circulationStrength
            particle.vy += perpY * circulationStrength * 0.5
          }

          // Temperature-based color creates natural buoyancy zones
          if (particle.temperature < 25) {
            particle.vy += 0.2 // Cold sink naturally
          } else if (particle.temperature > 50) {
            particle.vy -= 0.3 // Hot rise naturally
          }

          // Brownian motion for realism
          particle.vx += (Math.random() - 0.5) * 0.3
          particle.vy += (Math.random() - 0.5) * 0.2

          // Damping
          particle.vx *= 0.97
          particle.vy *= 0.97

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Boundary collision with damping
          const margin = particle.radius + 5
          if (particle.x - margin < roomLeft) {
            particle.x = roomLeft + margin
            particle.vx *= -0.85
          }
          if (particle.x + margin > roomRight) {
            particle.x = roomRight - margin
            particle.vx *= -0.85
          }
          if (particle.y - margin < roomTop) {
            particle.y = roomTop + margin
            particle.vy *= -0.85
          }
          if (particle.y + margin > roomBottom) {
            particle.y = roomBottom - margin
            particle.vy *= -0.85
          }
        })

        // Draw particles with proper temperature colors
        particles.forEach((particle) => {
          let color: string
          if (particle.temperature < 20) {
            color = '#4a9eff' // Cold blue
          } else if (particle.temperature < 35) {
            color = '#9966ff' // Cool purple
          } else if (particle.temperature < 50) {
            color = '#ffcc66' // Warm yellow
          } else {
            color = '#ff4444' // Hot red
          }

          ctx.fillStyle = color
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        })
      }

      // Draw room wireframe (non-overlapping clean frame)
      ctx.strokeStyle = '#ff8c42'
      ctx.lineWidth = 2.5
      ctx.strokeRect(roomLeft, roomTop, roomWidth, roomHeight)

      // Draw back wall gradient
      const backWallGrad = ctx.createLinearGradient(roomLeft, roomTop, roomLeft, roomTop + 20)
      backWallGrad.addColorStop(0, '#ffdb99')
      backWallGrad.addColorStop(1, '#ffcc77')
      ctx.fillStyle = backWallGrad
      ctx.fillRect(roomLeft, roomTop, roomWidth, 20)

      // Draw floor
      ctx.fillStyle = '#dd9966'
      ctx.fillRect(roomLeft, roomBottom - 15, roomWidth, 15)

      // Draw AC indicator (top-left corner)
      if (acOn) {
        ctx.fillStyle = '#4a9eff'
        ctx.shadowColor = '#2577ff'
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(acX, acY, 25, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('❄️', acX, acY)
      }

      // Draw Heater indicator (bottom-right corner)
      if (heaterOn) {
        ctx.fillStyle = '#ff6b35'
        ctx.shadowColor = '#ff4422'
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(heaterX, heaterY, 28, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🔥', heaterX, heaterY)
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

      {/* Top-Left Info Panel - Floating without overlap */}
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
          ❄️ Colder air sinks
        </p>
        <p style={{ margin: '6px 0', fontSize: '11px', color: '#aaa' }}>
          🔥 Hotter air rises
        </p>
        <p style={{ margin: '6px 0', fontSize: '11px', color: '#aaa' }}>
          💨 Room-scale circulation loop
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
          {/* Run Button */}
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

          {/* AC Toggle */}
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

          {/* Heater Toggle */}
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
