import React, { useEffect, useRef } from 'react'

interface PortedGameWrapperProps {
  gameName: '2048' | 'hextris'
}

export const PortedGameWrapper: React.FC<PortedGameWrapperProps> = ({ gameName }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const iframe = document.createElement('iframe')
    iframe.src = `/games/${gameName}/index.html`
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.borderRadius = '8px'
    iframe.sandbox.add('allow-same-origin', 'allow-scripts')

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframe)

    return () => {
      iframe.remove()
    }
  }, [gameName])

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
    />
  )
}
