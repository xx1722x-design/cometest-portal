import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Index } from './pages/Index'
import { Game } from './pages/Game'
import { Store } from './pages/Store'
import { Category } from './pages/Category'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/game" element={<Game />} />
        <Route path="/store" element={<Store />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
