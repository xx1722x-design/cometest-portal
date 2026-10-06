import React, { useEffect, useRef, useState } from 'react'

interface PortedGameWrapperProps {
  gameName: '2048' | 'hextris' | 'tetris' | 'pacman' | 'snake'
}

export const PortedGameWrapper: React.FC<PortedGameWrapperProps> = ({ gameName }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const iframe = document.createElement('iframe') as HTMLIFrameElement
    iframe.src = `/games/${gameName}/index.html`
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.borderRadius = '0'
    iframe.sandbox.add('allow-same-origin', 'allow-scripts')
    ;(iframeRef as any).current = iframe

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframe)

    return () => {
      iframe.remove()
    }
  }, [gameName])

  const handleStartClick = () => {
    setIsStarted(true)
    if (iframeRef.current) {
      setTimeout(() => {
        iframeRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#0a0a1a',
        position: 'relative',
      }}
    >
      {!isStarted && (
        <div
          onClick={handleStartClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#00ff88',
              marginBottom: '30px',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
              textAlign: 'center',
            }}
          >
            {gameName === '2048' ? '2048' : 'HEXTRIS'}
          </div>

          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '40px',
              animation: 'pulse 1.5s infinite',
              textAlign: 'center',
            }}
          >
            CLICK TO START
          </div>

          <div
            style={{
              fontSize: '24px',
              color: '#aaaaaa',
              marginTop: '40px',
              textAlign: 'center',
              maxWidth: '500px',
              lineHeight: '1.8',
            }}
          >
            <div style={{ marginBottom: '15px' }}>⬅️ ➡️ Arrow Keys to Move</div>
            {gameName === 'hextris' && <div>↩️ Rotate | ⬆️ Drop</div>}
            {gameName === '2048' && <div>⬆️ ⬇️ Arrow Keys to Play</div>}
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
