import { useState } from 'react'
import { useGameStore } from '../hooks/useGameStore'

declare global {
  interface ImportMeta {
    env: {
      MODE: string
    }
  }
}

interface PCDashboardHUDProps {
  money: number
  burgerCount: number
}

export function PCDashboardHUD({ money, burgerCount }: PCDashboardHUDProps) {
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null)
  const rotateCameraClockwise = useGameStore((s) => s?.rotateCameraClockwise) || (() => {})
  const zoomIn = useGameStore((s) => s?.zoomIn) || (() => {})
  const zoomOut = useGameStore((s) => s?.zoomOut) || (() => {})
  const kickOutAllNPCs = useGameStore((s) => s?.kickOutAllNPCs) || (() => {})

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
    return `$${val}`
  }

  return (
    <>
      {/* 상단 자원 바 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, rgba(30, 30, 35, 0.95), rgba(20, 20, 25, 0.8))',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid rgba(255, 140, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '30px',
        paddingRight: '30px',
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        {/* 좌측: 게임 타이틀 */}
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '1px',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
          marginRight: 'auto',
          whiteSpace: 'nowrap'
        }}>
          🍽️ All-You-Can-Tycoon
        </div>

        {/* 중앙: 자원 디스플레이 */}
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* 💰 Money */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            border: '2px solid rgba(255, 140, 0, 0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            transform: hoveredPanel === 'money' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hoveredPanel === 'money'
              ? '0 8px 24px rgba(255, 140, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
            onMouseEnter={() => setHoveredPanel('money')}
            onMouseLeave={() => setHoveredPanel(null)}
          >
            <div style={{ fontSize: '36px' }}>💰</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                MONEY
              </div>
              <div style={{
                fontSize: '22px',
                color: '#FFD700',
                fontWeight: 'bold',
                fontFamily: "'Courier New', monospace"
              }}>
                {formatMoney(money)}
              </div>
            </div>
          </div>

          {/* 🍔 Burgers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 24px',
            backgroundColor: 'rgba(200, 100, 50, 0.1)',
            border: '2px solid rgba(200, 100, 50, 0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            transform: hoveredPanel === 'burgers' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hoveredPanel === 'burgers'
              ? '0 8px 24px rgba(200, 100, 50, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
            onMouseEnter={() => setHoveredPanel('burgers')}
            onMouseLeave={() => setHoveredPanel(null)}
          >
            <div style={{ fontSize: '36px' }}>🍔</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                INVENTORY
              </div>
              <div style={{
                fontSize: '22px',
                color: '#fff',
                fontWeight: 'bold',
                fontFamily: "'Courier New', monospace"
              }}>
                {burgerCount} / 3
              </div>
              {/* 미니 게이지 */}
              <div style={{
                display: 'flex',
                gap: '3px',
                marginTop: '4px'
              }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '14px',
                      height: '6px',
                      borderRadius: '2px',
                      backgroundColor: i < burgerCount
                        ? '#FF6B35'
                        : 'rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 조작 팁 + 카메라 제어 버튼 */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* 줌 인 버튼 */}
          <button
            onClick={zoomIn}
            style={{
              padding: '8px 10px',
              backgroundColor: 'rgba(100, 200, 255, 0.15)',
              border: '1.5px solid rgba(100, 200, 255, 0.6)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.25)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.4)'
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.15)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Zoom In"
          >
            ➕
          </button>

          {/* 줌 아웃 버튼 */}
          <button
            onClick={zoomOut}
            style={{
              padding: '8px 10px',
              backgroundColor: 'rgba(100, 200, 255, 0.15)',
              border: '1.5px solid rgba(100, 200, 255, 0.6)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.25)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.4)'
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 200, 255, 0.15)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Zoom Out"
          >
            ➖
          </button>

          {/* 회전 버튼 */}
          <button
            onClick={rotateCameraClockwise}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 140, 0, 0.15)',
              border: '1.5px solid rgba(255, 140, 0, 0.6)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.25)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 140, 0, 0.4)'
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.15)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Rotate 90° clockwise"
          >
            🔄
          </button>

          {/* 조작 팁 */}
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'right',
            fontFamily: "'Arial', sans-serif"
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              🖱️ Drag / 🔍 Wheel
            </div>
            <div style={{ fontSize: '11px' }}>
              Rotate Camera & Zoom
            </div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              ⌨️ WASD to Move Player
            </div>
          </div>
        </div>
      </div>

      {/* 우측 사이드 패널 */}
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '100px',
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 50
      }}>
        {/* 게임 상태 패널 */}
        <div style={{
          backgroundColor: 'rgba(30, 30, 35, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 140, 0, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            GAME STATUS
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: '#fff'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span>📊 Phase:</span>
              <span style={{ color: '#FFD700' }}>Phase 2</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span>👥 Customers:</span>
              <span style={{ color: '#FF6B35' }}>9</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>⏱️ Playtime:</span>
              <span style={{ color: '#90EE90' }}>∞</span>
            </div>
          </div>
        </div>

        {/* 도움말 패널 */}
        <div style={{
          backgroundColor: 'rgba(30, 30, 35, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(200, 100, 50, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            HOW TO PLAY
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            <div>🔥 <strong>Grill:</strong> Make burgers</div>
            <div>🏪 <strong>Counter:</strong> Serve & earn</div>
            <div>💰 <strong>Money:</strong> Expand business</div>
          </div>
        </div>
      </div>

      {/* 좌측 하단: FPS 및 개발자 정보 (개발 중에만) */}
      {(import.meta.env as any).MODE === 'development' && (
        <div style={{
          position: 'fixed',
          left: '20px',
          bottom: '20px',
          backgroundColor: 'rgba(30, 30, 35, 0.8)',
          border: '1px solid rgba(100, 100, 100, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: "'Courier New', monospace",
          zIndex: 50
        }}>
          <div>Burger3D Web v0.1.0</div>
          <div>Press F12 for DevTools</div>
        </div>
      )}

      {/* 우측 하단: 손님 내쫒기 버튼 */}
      <button
        onClick={kickOutAllNPCs}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          padding: '10px 16px',
          backgroundColor: 'rgba(220, 50, 50, 0.2)',
          border: '1.5px solid rgba(220, 50, 50, 0.7)',
          borderRadius: '8px',
          color: '#ff6b6b',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 50
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(220, 50, 50, 0.35)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 50, 50, 0.4)'
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(220, 50, 50, 0.2)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        title="모든 손님을 내쫒기"
      >
        🚪 Kick Out All
      </button>
    </>
  )
}
