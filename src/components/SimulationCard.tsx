import { useNavigate } from 'react-router-dom'

interface SimulationCardProps {
  id: string
  title: string
  description: string
  icon: string
  path: string
}

export function SimulationCard({ id, title, description, icon, path }: SimulationCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(path)}
      style={{
        cursor: 'pointer',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top half: Gradient background with icon */}
      <div
        style={{
          width: '100%',
          paddingTop: '100%',
          position: 'relative',
          backgroundColor: 'var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Bottom half: White background with text */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#fff' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0f0f0',
            padding: '6px 12px',
            borderRadius: '16px',
            width: 'fit-content',
            fontSize: '12px',
            fontWeight: '600',
            color: '#667eea',
          }}
        >
          <span>🎮</span>
          3D Simulation
        </div>
      </div>
    </div>
  )
}
