import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import TreePage from './pages/TreePage'
import SearchPage from './pages/SearchPage'
import StoryPage from './pages/StoryPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tree" element={<TreePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App
