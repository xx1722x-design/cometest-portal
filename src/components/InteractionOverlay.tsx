import { useGameStore } from '../hooks/useGameStore'
import { useState } from 'react'

export function InteractionOverlay() {
  const burgerCount = useGameStore((s) => s?.burgerCount) ?? 0
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  const zoneButtons = [
    {
      id: 'grill',
      label: '🔥 GRILL',
      description: 'Get Burgers',
      position: { left: '8%', bottom: '15%' },
      color: 'rgba(255, 107, 0, 0.9)',
      borderColor: 'rgb(255, 140, 0)'
    },
    {
      id: 'counter',
      label: '🏪 COUNTER',
      description: 'Serve & Earn',
      position: { right: '8%', bottom: '15%' },
      color: 'rgba(139, 69, 19, 0.9)',
      borderColor: 'rgb(180, 100, 40)'
    }
  ]

  return (
    <>
      {/* 부유형 인터랙션 버튼들 */}
      {zoneButtons.map((zone) => (
        <div
          key={zone.id}
          style={{
            position: 'absolute',
            ...zone.position,
            width: '120px',
            padding: '16px',
            backgroundColor: zone.color,
            border: `3px solid ${zone.borderColor}`,
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 50,
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: hoveredZone === zone.id
              ? `0 8px 20px rgba(0,0,0,0.4), inset 0 0 15px ${zone.borderColor}80`
              : '0 4px 12px rgba(0,0,0,0.3)',
            transform: hoveredZone === zone.id ? 'scale(1.08)' : 'scale(1)',
          }}
          onMouseEnter={() => setHoveredZone(zone.id)}
          onMouseLeave={() => setHoveredZone(null)}
        >
          <div style={{
            fontSize: '32px',
            marginBottom: '8px',
            filter: hoveredZone === zone.id ? 'brightness(1.3)' : 'brightness(1)'
          }}>
            {zone.label.split(' ')[0]}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#fff',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            fontFamily: "'Arial', sans-serif"
          }}>
            {zone.label.split(' ')[1]}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: '6px',
            fontFamily: "'Arial', sans-serif"
          }}>
            {zone.description}
          </div>
        </div>
      ))}

      {/* 게임 상태 팝업 (옵션) */}
      {burgerCount === 3 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '20px 30px',
          borderRadius: '15px',
          color: '#fff',
          fontSize: '14px',
          fontFamily: "'Arial', sans-serif",
          border: '2px solid rgba(200, 100, 50, 0.8)',
          textAlign: 'center',
          zIndex: 40,
          animation: 'pulse 1.5s infinite',
          backdropFilter: 'blur(5px)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
          <div style={{ fontWeight: 'bold' }}>Inventory Full!</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Go to counter to serve
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.05); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
