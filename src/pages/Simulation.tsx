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
const LightRefractionLab = lazy(() =>
  import('../components/simulations/LightRefractionLab').then((m) => ({
    default: m.LightRefractionLab,
  }))
)
const HanoiTower = lazy(() =>
  import('../components/simulations/HanoiTower').then((m) => ({
    default: m.HanoiTower,
  }))
)
const RoomConvectionSimulator = lazy(() =>
  import('../components/simulations/RoomConvectionSimulator').then((m) => ({
    default: m.RoomConvectionSimulator,
  }))
)

// R3F Canvas requires client-side rendering
const Physics3DBallsSimulator = lazy(() =>
  import('../components/simulations/Physics3DBallsSimulator').then((m) => ({
    default: m.Physics3DBallsSimulator,
  }))
)

// Premium Advanced Cloth Physics
const AdvancedClothPhysicsSimulator = lazy(() =>
  import('../components/simulations/AdvancedClothPhysicsSimulator').then((m) => ({
    default: m.AdvancedClothPhysicsSimulator,
  }))
)

// Premium Fluid Particle System
const FluidParticleSystem = lazy(() =>
  import('../components/simulations/FluidParticleSystem').then((m) => ({
    default: m.FluidParticleSystem,
  }))
)

// Premium Ocean Water Simulation
const OceanWaterSimulation = lazy(() =>
  import('../components/simulations/OceanWaterSimulation').then((m) => ({
    default: m.OceanWaterSimulation,
  }))
)

// Premium Physics Blocks Simulation
const PhysicsBlocksSimulation = lazy(() =>
  import('../components/simulations/PhysicsBlocksSimulation').then((m) => ({
    default: m.PhysicsBlocksSimulation,
  }))
)

export function Simulation() {
  const navigate = useNavigate()
  const { simulationId } = useParams<{ simulationId: string }>()
  const { t } = useTranslation()

  const simulation = simulationId ? getSimulationById(simulationId) : null

  const handleBackClick = () => {
    if (simulation?.category === 'physics_chemistry') {
      navigate('/chemistry') // Physics & Chemistry simulations go back to chemistry page
    } else if (simulation?.category === 'optics_waves') {
      navigate('/optics')
    } else if (simulation?.category === 'puzzle') {
      navigate('/puzzle')
    } else if (simulation?.category === 'space_universe') {
      navigate('/astronomy')
    } else {
      navigate('/game')
    }
  }

  const renderSimulation = () => {
    switch (simulationId) {
      case 'physics-blocks-simulation':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Physics Simulation...</div>}>
            <PhysicsBlocksSimulation />
          </Suspense>
        )
      case 'ocean-water-simulation':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Ocean Simulation...</div>}>
            <OceanWaterSimulation />
          </Suspense>
        )
      case 'fluid-particle-system':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Fluid Simulation...</div>}>
            <FluidParticleSystem />
          </Suspense>
        )
      case 'advanced-cloth-physics':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Advanced Physics...</div>}>
            <AdvancedClothPhysicsSimulator />
          </Suspense>
        )
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
      case 'light-refraction':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <LightRefractionLab />
          </Suspense>
        )
      case 'hanoi-tower':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <HanoiTower />
          </Suspense>
        )
      case 'room-convection':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading Simulation...</div>}>
            <RoomConvectionSimulator />
          </Suspense>
        )
      case 'physics-3d-balls':
        return (
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading 3D Physics...</div>}>
            <Physics3DBallsSimulator />
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
          color: '#000000',
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
          e.currentTarget.style.color = '#000000'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.color = '#000000'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        ← {t('home_button')}
      </button>
    </div>
  )
}
