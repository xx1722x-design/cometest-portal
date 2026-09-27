import { useState } from 'react'
import { useGameStore } from '../hooks/useGameStore'

interface FABProps {
  id: string
  icon: string
  label: string
  sublabel: string
  position: 'left' | 'right'
}

function FloatingButton({ icon, label, sublabel, position }: FABProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const positionStyle = position === 'left'
    ? { left: '20px' }
    : { right: '20px' }

  const bgColor = position === 'left'
    ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.9), rgba(255, 140, 0, 0.8))'
    : 'linear-gradient(135deg, rgba(200, 100, 50, 0.9), rgba(180, 80, 30, 0.8))'

  const borderColor = position === 'left'
    ? 'rgba(255, 160, 0, 0.8)'
    : 'rgba(220, 120, 60, 0.8)'

  const hoverShadow = position === 'left'
    ? `0 12px 24px rgba(255, 107, 0, 0.4), inset 0 0 20px rgba(255, 200, 100, 0.2)`
    : `0 12px 24px rgba(200, 100, 50, 0.4), inset 0 0 20px rgba(220, 150, 100, 0.2)`

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        bottom: '80px',
        width: '100px',
        height: '100px',
        background: bgColor,
        border: `2.5px solid ${borderColor}`,
        borderRadius: '25px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 40,
        boxShadow: isHovered || isPressed
          ? hoverShadow
          : `0 6px 16px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)`,
        transform: isPressed
          ? 'scale(0.92)'
          : isHovered
            ? 'scale(1.08) translateY(-4px)'
            : 'scale(1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* 상단 하이라이트 */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '30%',
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
        borderRadius: '25px 25px 0 0',
        pointerEvents: 'none'
      }} />

      {/* 내용 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px'
      }}>
        <div style={{
          fontSize: '36px',
          lineHeight: '1',
          filter: isHovered
            ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
          transition: 'filter 0.25s ease'
        }}>
          {icon}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#fff',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            fontFamily: "'Arial', sans-serif",
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'Arial', sans-serif",
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            {sublabel}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FloatingActionButtons() {
  const burgerCount = useGameStore((s) => s?.burgerCount) ?? 0

  return (
    <>
      {/* 🔥 Grill Button */}
      <FloatingButton
        id="grill"
        icon="🔥"
        label="GRILL"
        sublabel="Get Burger"
        position="left"
      />

      {/* 🏪 Counter Button */}
      <FloatingButton
        id="counter"
        icon="🏪"
        label="COUNTER"
        sublabel="Serve"
        position="right"
      />

      {/* 📦 Inventory Alert */}
      {burgerCount === 3 && (
        <div style={{
          position: 'absolute',
          bottom: '200px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          border: '2px solid rgba(200, 100, 50, 0.8)',
          borderRadius: '15px',
          padding: '16px 24px',
          textAlign: 'center',
          zIndex: 35,
          backdropFilter: 'blur(10px)',
          animation: 'pulse-alert 1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '20px',
            marginBottom: '6px'
          }}>
            🔔
          </div>
          <div style={{
            fontSize: '12px',
            color: '#fff',
            fontWeight: 'bold',
            fontFamily: "'Arial', sans-serif",
            letterSpacing: '0.5px'
          }}>
            Inventory Full!
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: "'Arial', sans-serif",
            marginTop: '4px'
          }}>
            Go serve customers
          </div>

          <style>{`
            @keyframes pulse-alert {
              0%, 100% {
                transform: translateX(-50%) scale(1);
              }
              50% {
                transform: translateX(-50%) scale(1.05);
              }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
