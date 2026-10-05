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
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * 800 + 100,
        y: Math.random() * 600 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        temperature: 20 + Math.random() * 30,
        radius: 8,
      })
    }
    particlesRef.current = particles
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const acX = 150
    const acY = 100
    const acRadius = 80

    const heaterX = 850
    const heaterY = 650
    const heaterRadius = 100

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw room border
      ctx.strokeStyle = '#ff8c42'
      ctx.lineWidth = 3
      ctx.strokeRect(80, 50, 800, 600)

      // Draw back wall (warm peach)
      ctx.fillStyle = '#ffdb99'
      ctx.fillRect(80, 50, 800, 30)
      ctx.fillStyle = '#ffcc77'
      ctx.font = '12px Arial'
      ctx.fillText('Back Wall', 400, 70)

      // Draw floor (darker tone)
      ctx.fillStyle = '#dd9966'
      ctx.fillRect(80, 620, 800, 30)

      // Draw AC (top-left)
      if (acOn) {
        ctx.fillStyle = '#4a9eff'
        ctx.shadowColor = '#2577ff'
        ctx.shadowBlur = 15
        ctx.fillRect(130, 40, 60, 30)
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Arial'
        ctx.fillText('AC', 155, 58)
      } else {
        ctx.fillStyle = '#3a4a5a'
        ctx.fillRect(130, 40, 60, 30)
        ctx.fillStyle = '#666'
        ctx.font = 'bold 12px Arial'
        ctx.fillText('AC', 155, 58)
      }

      // Draw Heater (bottom-right)
      if (heaterOn) {
        ctx.fillStyle = '#ff6b35'
        ctx.shadowColor = '#ff4422'
        ctx.shadowBlur = 15
        ctx.fillRect(810, 640, 60, 30)
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Arial'
        ctx.fillText('Heat', 825, 658)
      } else {
        ctx.fillStyle = '#6a3a2a'
        ctx.fillRect(810, 640, 60, 30)
        ctx.fillStyle = '#666'
        ctx.font = 'bold 12px Arial'
        ctx.fillText('Heat', 825, 658)
      }

      if (isRunning) {
        const particles = particlesRef.current

        particles.forEach((particle) => {
          // AC cooling effect
          if (acOn) {
            const distToAC = Math.hypot(particle.x - acX, particle.y - acY)
            if (distToAC < acRadius) {
              particle.temperature = Math.max(10, particle.temperature - 0.3)
              particle.vy += 1.5 // Push down
            }
          }

          // Heater heating effect
          if (heaterOn) {
            const distToHeater = Math.hypot(particle.x - heaterX, particle.y - heaterY)
            if (distToHeater < heaterRadius) {
              particle.temperature = Math.min(80, particle.temperature + 0.4)
              particle.vy -= 2 // Push up
            }
          }

          // Convection: hot particles rise, cold particles sink
          const tempInfluence = (particle.temperature - 30) / 50
          particle.vy -= tempInfluence * 0.5

          // Add slight random motion
          particle.vx += (Math.random() - 0.5) * 0.4
          particle.vy += (Math.random() - 0.5) * 0.2

          // Damping
          particle.vx *= 0.98
          particle.vy *= 0.98

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Boundary collision
          if (particle.x - particle.radius < 80) {
            particle.x = 80 + particle.radius
            particle.vx *= -0.8
          }
          if (particle.x + particle.radius > 880) {
            particle.x = 880 - particle.radius
            particle.vx *= -0.8
          }
          if (particle.y - particle.radius < 50) {
            particle.y = 50 + particle.radius
            particle.vy *= -0.8
          }
          if (particle.y + particle.radius > 650) {
            particle.y = 650 - particle.radius
            particle.vy *= -0.8
          }
        })

        // Draw particles
        particles.forEach((particle) => {
          let color: string
          if (particle.temperature < 20) {
            color = '#4a9eff' // Blue (cold)
          } else if (particle.temperature > 50) {
            color = '#ff4444' // Red (hot)
          } else {
            color = '#9966ff' // Purple (room temp)
          }

          ctx.fillStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, acOn, heaterOn])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#0a0a1a', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={750}
        style={{
          display: 'block',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '2px solid #ff8c42',
          borderRadius: '8px',
          boxShadow: '0 0 30px rgba(255, 140, 66, 0.3)',
        }}
      />

      {/* Top-Left Info Panel */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '20px',
          color: '#fff',
          fontFamily: "'Segoe UI', sans-serif",
          maxWidth: '380px',
          fontSize: '13px',
          lineHeight: '1.6',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
          zIndex: 100,
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#ff8c42', fontWeight: '700' }}>
          🌬️ Room Convection
        </h2>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          ❄️ Blue particles (cold) sink downward
        </p>
        <p style={{ margin: '8px 0', fontSize: '12px', color: '#aaa' }}>
          🔴 Red particles (hot) rise upward
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Watch how air circulates in the room when the AC and Heater are turned on!
        </p>
      </div>

      {/* Bottom Control Panel */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          bottom: '30px',
          width: '360px',
          backgroundColor: 'rgba(10, 10, 26, 0.95)',
          border: '2px solid #ff8c42',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: "'Segoe UI', sans-serif",
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(255, 140, 66, 0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Run Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
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
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#4a9eff',
                }}
              />
              ⏵ Run Simulation
            </label>
          </div>

          {/* AC Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={acOn}
                onChange={(e) => setAcOn(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#4a9eff',
                }}
              />
              ❄️ 에어컨 (AC)
            </label>
            <span style={{ fontSize: '12px', color: acOn ? '#4a9eff' : '#888' }}>
              {acOn ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Heater Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={heaterOn}
                onChange={(e) => setHeaterOn(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#ff6b35',
                }}
              />
              🔥 난로 (Heater)
            </label>
            <span style={{ fontSize: '12px', color: heaterOn ? '#ff6b35' : '#888' }}>
              {heaterOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => (window.location.href = '/chemistry')}
        style={{
          position: 'absolute',
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
      >
        ← Back
      </button>
    </div>
  )
}
