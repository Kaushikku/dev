'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type AccountType = 'PLAYER' | 'ORG' | 'CREATOR'
type Tab = 'login' | 'signup'

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 10,
}))

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [accountType, setAccountType] = useState<AccountType>('PLAYER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    username: '', email: '', password: '', confirm: '',
  })

  useEffect(() => { setMounted(true) }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email: loginForm.email,
      password: loginForm.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) return setError('Invalid email or password')
    const session = await fetch('/api/auth/session').then(r => r.json())
    router.push(`/profile/${session?.user?.name}`)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (signupForm.password !== signupForm.confirm)
      return setError('Passwords do not match')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        accountType,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error)
    await signIn('credentials', {
      email: signupForm.email,
      password: signupForm.password,
      redirect: false,
    })
    const session = await fetch('/api/auth/session').then(r => r.json())
    router.push(`/profile/${session?.user?.name}`)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        input { outline: none; font-family: 'DM Sans', sans-serif; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #13131f inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(1); opacity: 0.15; }
          50% { opacity: 0.4; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeIn 0.4s ease forwards; }
        .neon-btn:hover:not(:disabled) { background: #00f5ff !important; color: #0a0a0f !important; box-shadow: 0 0 30px #00f5ff88 !important; }
        .neon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .oauth-btn:hover { border-color: #00f5ff88 !important; background: #ffffff08 !important; }
        .account-card:hover { border-color: #00f5ff66 !important; }
        .tab-btn:hover { color: #00f5ff !important; }
        input:focus { border-color: #00f5ff66 !important; box-shadow: 0 0 0 2px #00f5ff1a !important; }
      `}} />

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Particles */}
        {mounted && PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? '#00f5ff' : p.id % 3 === 1 ? '#7c3aed' : '#ffffff',
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            opacity: 0.2,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, #00f5ff18 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed18 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Card */}
        <div className="auth-card" style={{
          width: '100%',
          maxWidth: '440px',
          margin: '24px 16px',
          background: 'linear-gradient(145deg, #13131f 0%, #0f0f1a 100%)',
          border: '1px solid #ffffff14',
          borderRadius: '20px',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: "'Orbitron', monospace",
              fontSize: '26px',
              fontWeight: 900,
              color: '#00f5ff',
              letterSpacing: '2px',
              textShadow: '0 0 20px #00f5ff66',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/>
                <polygon points="16,8 25,24 7,24" fill="#00f5ff22"/>
                <circle cx="16" cy="16" r="3" fill="#00f5ff"/>
              </svg>
              NEXUSGG
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>
              India's Esports Platform
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: '#0a0a0f',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
            border: '1px solid #ffffff0a',
          }}>
            {(['login', 'signup'] as Tab[]).map(t => (
              <button key={t} className="tab-btn" onClick={() => { setTab(t); setError('') }} style={{
                flex: 1,
                padding: '9px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: tab === t ? 'linear-gradient(135deg, #00f5ff18, #7c3aed18)' : 'transparent',
                color: tab === t ? '#00f5ff' : '#64748b',
                borderBottom: tab === t ? '2px solid #00f5ff' : '2px solid transparent',
              }}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#ff444418',
              border: '1px solid #ff444444',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#ff6b6b',
              fontSize: '13px',
              marginBottom: '16px',
            }}>{error}</div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <NexusInput label="Email" type="email" value={loginForm.email}
                onChange={v => setLoginForm(p => ({ ...p, email: v }))} placeholder="you@email.com" />
              <NexusInput label="Password" type="password" value={loginForm.password}
                onChange={v => setLoginForm(p => ({ ...p, password: v }))} placeholder="••••••••" />
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '20px' }}>
                <a href="/forgot-password" style={{ color: '#00f5ff', fontSize: '12px', textDecoration: 'none', opacity: 0.8 }}>
                  Forgot Password?
                </a>
              </div>
              <NeonButton loading={loading}>Login</NeonButton>
              <Divider />
              <OAuthButtons />
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup}>
              <NexusInput label="Username" type="text" value={signupForm.username}
                onChange={v => setSignupForm(p => ({ ...p, username: v }))} placeholder="player123" />
              <NexusInput label="Email" type="email" value={signupForm.email}
                onChange={v => setSignupForm(p => ({ ...p, email: v }))} placeholder="you@email.com" />
              <NexusInput label="Password" type="password" value={signupForm.password}
                onChange={v => setSignupForm(p => ({ ...p, password: v }))} placeholder="Min 8 characters" />
              <NexusInput label="Confirm Password" type="password" value={signupForm.confirm}
                onChange={v => setSignupForm(p => ({ ...p, confirm: v }))} placeholder="••••••••" />

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                  ACCOUNT TYPE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { type: 'PLAYER', label: 'Player', icon: '🎮' },
                    { type: 'ORG', label: 'Org', icon: '🏆' },
                    { type: 'CREATOR', label: 'Creator', icon: '🎥' },
                  ].map(({ type, label, icon }) => (
                    <button key={type} type="button" className="account-card"
                      onClick={() => setAccountType(type as AccountType)}
                      style={{
                        padding: '12px 8px',
                        border: accountType === type ? '1px solid #00f5ff' : '1px solid #ffffff14',
                        borderRadius: '10px',
                        background: accountType === type ? '#00f5ff12' : '#ffffff04',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: accountType === type ? '0 0 16px #00f5ff22' : 'none',
                      }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
                      <div style={{ color: accountType === type ? '#00f5ff' : '#64748b', fontSize: '11px', fontWeight: 600 }}>{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <NeonButton loading={loading}>Create Account</NeonButton>
              <Divider />
              <OAuthButtons />
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#334155', fontSize: '11px', marginTop: '24px' }}>
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </>
  )
}

function NexusInput({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
        {label.toUpperCase()}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width: '100%',
          background: '#13131f',
          border: '1px solid #ffffff14',
          borderRadius: '10px',
          padding: '11px 14px',
          color: '#e2e8f0',
          fontSize: '14px',
          transition: 'all 0.2s',
        }}
      />
    </div>
  )
}

function NeonButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button type="submit" disabled={loading} className="neon-btn" style={{
      width: '100%',
      padding: '12px',
      background: 'transparent',
      border: '1px solid #00f5ff',
      borderRadius: '10px',
      color: '#00f5ff',
      fontSize: '15px',
      fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: '0.5px',
      boxShadow: '0 0 20px #00f5ff22',
    }}>
      {loading ? 'Please wait...' : children}
    </button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
      <div style={{ flex: 1, height: '1px', background: '#ffffff0a' }} />
      <span style={{ color: '#334155', fontSize: '12px', fontWeight: 500 }}>Or continue with</span>
      <div style={{ flex: 1, height: '1px', background: '#ffffff0a' }} />
    </div>
  )
}

function OAuthButtons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {[
        {
          provider: 'google', label: 'Google',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          ),
        },
        {
          provider: 'discord', label: 'Discord',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          ),
        },
      ].map(({ provider, label, icon }) => (
        <button key={provider} type="button" className="oauth-btn"
          onClick={() => signIn(provider, { callbackUrl: '/dashboard' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: '#ffffff06',
            border: '1px solid #ffffff12',
            borderRadius: '10px',
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
          {icon} {label}
        </button>
      ))}
    </div>
  )
}
