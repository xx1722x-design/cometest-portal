import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { SiteFooter } from '../components/SiteFooter'
import { SimulationCard } from '../components/SimulationCard'
import { getSimulationsByCategory } from '../config/simulationsData'

export function ChemistryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const chemistrySimulations = getSimulationsByCategory('physics_chemistry')

  return (
    <div className="portal-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="category-layout">
        <main className="category-main">
          {/* Hero section */}
          <div className="category-hero">
            <h1 className="category-hero__title">
              <span aria-hidden="true">⚛️</span> Physics & Chemistry Labs
            </h1>
            <p className="category-hero__subtitle">
              Interactive 3D simulations to explore the fundamental principles of matter and energy
            </p>
          </div>

          {/* Simulations Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
              padding: '20px',
              marginBottom: '40px',
            }}
          >
            {chemistrySimulations.map((sim) => (
              <SimulationCard
                key={sim.id}
                id={sim.id}
                title={sim.title}
                description={sim.description}
                icon={sim.icon}
                path={sim.path}
              />
            ))}
          </div>

          {/* Back to home button */}
          <div style={{ padding: '20px', textAlign: 'center' }}>
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

        {/* Right Sidebar */}
        <Sidebar />
      </div>

      <SiteFooter />
    </div>
  )
}
