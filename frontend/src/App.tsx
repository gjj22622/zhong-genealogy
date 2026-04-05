import { Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/useAuth'

import HomePage from './pages/HomePage'
import TreePage from './pages/TreePage'
import SearchPage from './pages/SearchPage'
import StoryPage from './pages/StoryPage'
import LoginPage from './pages/LoginPage'

function App() {
  const { user, setUser, loading, logout } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>載入中...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} logout={logout} />} />
      <Route path="/tree" element={<TreePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
    </Routes>
  )
}

export default App
