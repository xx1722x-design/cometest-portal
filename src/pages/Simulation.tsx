import { lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSimulationById } from '../config/simulationsData'

const SolarSystemSimulator = lazy(() =>
  import('../components/simulations/SolarSystemSimulator').then((m) => ({ default: m.SolarSystemSimulator }))
)
const MoonPhaseSimulator = lazy(() =>
  import('../components/simulations/MoonPhaseSimulator').then((m) => ({ default: m.MoonPhaseSimulator }))
)
const CandleExtinguishingSimulator = lazy(() =>
  import('../components/simulations/CandleExtinguishingSimulator').then((m) => ({
    default: m.CandleExtinguishingSimulator,
  }))
)
const StatesOfWaterSimulator = lazy(() =>
  import('../components/simulations/StatesOfWaterSimulator').then((m) => ({
    default: m.StatesOfWaterSimulator,
  }))
)
const StatesOfMatter = lazy(() =>
  import('../components/simulations/StatesOfMatter').then((m) => ({ default: m.StatesOfMatter }))
)

export function Simulation() {
  const navigate = useNavigate()
  const { simulationId } = useParams<{ simulationId: string }>()
  const { t } = useTranslation()

  const simulation = simulationId ? getSimulationById(simulationId) : null

  const handleBackClick = () => {
    if (simulation?.category === 'physics_chemistry') {
      navigate('/chemistry')
    } else {
      navigate('/game')
    }
  }

  const renderSimulation = () => {
    switch (simulationId) {
      case 'solar-system':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <SolarSystemSimulator />
          </Suspense>
        )
      case 'moon-phases':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <MoonPhaseSimulator />
          </Suspense>
        )
      case 'candle-extinguishing':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <CandleExtinguishingSimulator />
          </Suspense>
        )
      case 'states-of-water':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <StatesOfWaterSimulator />
          </Suspense>
        )
      case 'states-of-matter':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <StatesOfMatter />
          </Suspense>
        )
      default:
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Simulation not found</div>
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: "'Arial', sans-serif",
        backgroundColor: '#0a0a1a',
        position: 'relative',
      }}
    >
      {/* Simulation rendering */}
      {renderSimulation()}

      {/* Back button */}
      <button
        onClick={handleBackClick}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← {t('home_button')}
      </button>
    </div>
  )
}
