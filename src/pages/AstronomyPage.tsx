import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { SimulationCard } from '../components/SimulationCard'
import { getSimulationsByCategory } from '../config/simulationsData'

export function AstronomyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const astronomySimulations = getSimulationsByCategory('space_universe')

  return (
    <div className="portal-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        {/* Hero section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '0 0 16px 0' }}>
            <span style={{ marginRight: '12px' }}>🌌</span> Space & Universe
          </h1>
          <p style={{ fontSize: '16px', color: '#aaa', margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Explore the cosmos with interactive 3D simulations of celestial bodies, orbits, and astronomical phenomena
          </p>
        </div>

        {/* Simulations Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto 40px',
          }}
        >
          {astronomySimulations.map((sim) => (
            <SimulationCard
              key={sim.id}
              id={sim.id}
              title={sim.title}
              description={sim.description}
              icon={sim.icon}
              path={sim.path}
              isTranslationKey={sim.isTranslationKey}
            />
          ))}
        </div>

        {/* Back to home button */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a67d8'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ← {t('home_button')}
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
