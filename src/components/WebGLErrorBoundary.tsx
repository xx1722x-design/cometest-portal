import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    const message = error.message || 'WebGL initialization failed'
    return { hasError: true, errorMessage: message }
  }

  componentDidCatch(error: Error) {
    console.error('[WebGLErrorBoundary] Error caught:', error)
  }

  componentDidMount() {
    // WebGL 컨텍스트 생성 실패 감지
    const originalWarn = console.warn
    const originalError = console.error
    const self = this

    const checkWebGLError = (message: string) => {
      if (
        message.includes('WebGL') ||
        message.includes('WEBGL_lose_context') ||
        message.includes('Failed to create WebGL context') ||
        message.includes('webgl context is lost')
      ) {
        self.setState({
          hasError: true,
          errorMessage: message,
        })
      }
    }

    console.warn = function (this: any, ...args: any[]) {
      const message = args.join(' ')
      checkWebGLError(message)
      originalWarn.apply(console, args)
    }

    console.error = function (this: any, ...args: any[]) {
      const message = args.join(' ')
      checkWebGLError(message)
      originalError.apply(console, args)
    }

    // Canvas 컨텍스트 생성 실패 감지
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: any, contextType: string, ...args: any[]) {
      const context = originalGetContext.apply(this, [contextType, ...args] as any)

      if ((contextType === 'webgl' || contextType === 'webgl2') && !context) {
        self.setState({
          hasError: true,
          errorMessage: `Failed to create ${contextType} context`,
        })
        return null
      }

      return context
    } as any

    return () => {
      console.warn = originalWarn
      console.error = originalError
      HTMLCanvasElement.prototype.getContext = originalGetContext
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* 우주 느낌의 배경 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                  linear-gradient(135deg,
                    #0a0a1a 0%,
                    #1a0a2e 25%,
                    #16213e 50%,
                    #0f3460 75%,
                    #0a0a1a 100%)
                `,
                zIndex: 0,
              }}
            />

            {/* 파티클 배경 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                overflow: 'hidden',
              }}
            >
              {Array.from({ length: 50 }).map((_, i) => {
                const randomX = Math.random() * 100
                const randomY = Math.random() * 100
                const randomSize = Math.random() * 2 + 0.5
                const randomDelay = Math.random() * 5
                const randomDuration = Math.random() * 10 + 15

                return (
                  <div
                    key={`particle-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${randomX}%`,
                      top: `${randomY}%`,
                      width: `${randomSize}px`,
                      height: `${randomSize}px`,
                      backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
                      borderRadius: '50%',
                      boxShadow: `0 0 ${randomSize * 2}px rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, 0.8)`,
                      animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
                    } as React.CSSProperties}
                  />
                )
              })}
            </div>

            {/* 내용 */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🌌</div>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '24px', fontWeight: '600' }}>
                3D Graphics Not Available
              </h2>
              <p
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '14px',
                  color: '#a0a0a0',
                  lineHeight: '1.6',
                }}
              >
                WebGL context creation failed or is disabled on your browser.
              </p>
              <p
                style={{
                  margin: '0.5rem 0 1.5rem 0',
                  fontSize: '12px',
                  color: '#808080',
                }}
              >
                {this.state.errorMessage}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6d28d9'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Retry
              </button>
            </div>

            <style>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px) translateX(0px);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                90% {
                  opacity: 1;
                }
                100% {
                  transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default WebGLErrorBoundary
