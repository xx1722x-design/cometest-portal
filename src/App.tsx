import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Index } from './pages/Index'
import { Game } from './pages/Game'
import { GameList } from './pages/GameList'
import { Store } from './pages/Store'
import { Category } from './pages/Category'
import { Simulation } from './pages/Simulation'
import { ChemistryPage } from './pages/ChemistryPage'
import { OpticsPage } from './pages/OpticsPage'
import { PuzzlePage } from './pages/PuzzlePage'
import { AstronomyPage } from './pages/AstronomyPage'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { About } from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/game" element={<GameList />} />
        <Route path="/simulation/:simulationId" element={<Simulation />} />
        <Route path="/chemistry" element={<ChemistryPage />} />
        <Route path="/optics" element={<OpticsPage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/astronomy" element={<AstronomyPage />} />
        <Route path="/store" element={<Store />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
