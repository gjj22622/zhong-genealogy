import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>鐘氏族譜</h1>
      <p>傳承家族記憶，連結世代血脈</p>
      <nav style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/tree">族譜樹</Link>
        <Link to="/search">搜尋</Link>
        <Link to="/story">家族故事</Link>
        <Link to="/login">登入</Link>
      </nav>
    </div>
  )
}
