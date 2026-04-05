import { Link } from 'react-router-dom'
import type { UserInfo } from '../lib/api'

interface Props {
  user: UserInfo | null
  logout: () => void
}

export default function HomePage({ user, logout }: Props) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>鐘氏族譜</h1>
      <p>傳承家族記憶，連結世代血脈</p>
      <nav style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/tree">族譜樹</Link>
        <Link to="/search">搜尋</Link>
        <Link to="/story">家族故事</Link>
        {user ? (
          <>
            <span>{user.display_name}</span>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit' }}>
              登出
            </button>
          </>
        ) : (
          <Link to="/login">登入</Link>
        )}
      </nav>
    </div>
  )
}
