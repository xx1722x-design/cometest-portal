import { useGameStore } from '../hooks/useGameStore'

export function HUD() {
  const money = useGameStore((s) => s?.money) ?? 0
  const burgerCount = useGameStore((s) => s?.burgerCount) ?? 0
  const maxBurgers = useGameStore((s) => s?.maxBurgers) ?? 3

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
    return `$${val}`
  }

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      height: '60px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 50,
      gap: '12px'
    }}>
      {/* 💰 Money Widget */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(255, 140, 0, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255, 140, 0, 0.5)',
        borderRadius: '20px',
        paddingLeft: '12px',
        paddingRight: '16px',
        paddingTop: '10px',
        paddingBottom: '10px',
        flex: 1,
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.3),
          inset 0 0 20px rgba(255, 140, 0, 0.1)
        `,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          fontSize: '28px',
          lineHeight: '1',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
        }}>
          💰
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            fontFamily: "'Arial', sans-serif"
          }}>
            MONEY
          </div>
          <div style={{
            fontSize: '16px',
            color: '#fff',
            fontWeight: 'bold',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.5px'
          }}>
            {formatMoney(money)}
          </div>
        </div>
      </div>

      {/* 🍔 Burgers Widget */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(200, 100, 50, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(200, 100, 50, 0.5)',
        borderRadius: '20px',
        paddingLeft: '12px',
        paddingRight: '16px',
        paddingTop: '10px',
        paddingBottom: '10px',
        flex: 0.9,
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.3),
          inset 0 0 20px rgba(200, 100, 50, 0.1)
        `,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          fontSize: '28px',
          lineHeight: '1',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
        }}>
          🍔
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            fontFamily: "'Arial', sans-serif"
          }}>
            BURGERS
          </div>
          {/* 인벤토리 게이지 */}
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              gap: '3px',
              width: '50px'
            }}>
              {Array.from({ length: maxBurgers }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '8px',
                    borderRadius: '3px',
                    backgroundColor: i < burgerCount
                      ? '#FFA500'
                      : 'rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
            <span style={{
              fontSize: '11px',
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: "'Courier New', monospace"
            }}>
              {burgerCount}/{maxBurgers}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
