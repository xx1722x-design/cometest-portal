import React from 'react'

interface MobileFrameProps {
  children: React.ReactNode
  width?: number
  height?: number
}

export function MobileFrame({ children, width = 375, height = 812 }: MobileFrameProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#000',
      borderRadius: '50px',
      border: '8px solid #1a1a1a',
      boxShadow: `
        0 0 0 8px #111,
        0 25px 50px rgba(0, 0, 0, 0.8),
        inset 0 0 0 0.5px rgba(255, 255, 255, 0.1)
      `,
      overflow: 'hidden',
      zIndex: 1000
    }}>
      {/* 상단 노치 */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '150px',
        height: '28px',
        backgroundColor: '#000',
        borderRadius: '0 0 40px 40px',
        zIndex: 2,
        border: '8px solid #1a1a1a',
        borderTop: 'none'
      }} />

      {/* 내부 콘텐츠 영역 */}
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000'
      }}>
        {children}
      </div>

      {/* 하단 홈 인디케이터 */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '2px',
        zIndex: 2
      }} />
    </div>
  )
}
