import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, type UserInfo } from '../lib/api'

interface Props {
  onLogin: (user: UserInfo) => void
}

export default function LoginPage({ onLogin }: Props) {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [familyCode, setFamilyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let user: UserInfo
      if (isRegister) {
        user = await register(email, password, displayName, familyCode)
      } else {
        user = await login(email, password)
      }
      onLogin(user)
      navigate('/tree')
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{isRegister ? '註冊' : '登入'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {isRegister && (
          <input
            type="text"
            placeholder="顯示名稱"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {isRegister && (
          <input
            type="text"
            placeholder="家族註冊碼"
            value={familyCode}
            onChange={e => setFamilyCode(e.target.value)}
            required
            style={inputStyle}
          />
        )}

        {error && <p style={{ color: '#c62828', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? '處理中...' : isRegister ? '註冊' : '登入'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        {isRegister ? '已有帳號？' : '還沒有帳號？'}
        <button
          onClick={() => { setIsRegister(!isRegister); setError('') }}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          {isRegister ? '登入' : '註冊'}
        </button>
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '1rem',
  fontFamily: 'inherit',
}

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
