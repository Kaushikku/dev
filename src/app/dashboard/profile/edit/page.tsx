'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GAMES = ['bgmi', 'valorant', 'cs2', 'freefire', 'hok', 'codmobile', 'apex']
const GAME_LABELS: Record<string, string> = {
  bgmi: 'BGMI', valorant: 'Valorant', cs2: 'CS2',
  freefire: 'Free Fire', hok: 'Honor of Kings',
  codmobile: 'COD Mobile', apex: 'Apex Legends',
}

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    bio: '',
    ign: '',
    rank: '',
    mainGame: 'bgmi',
    gameIds: {} as Record<string, string>,
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status])

  useEffect(() => {
    if (!session?.user?.name) return
    fetch(`/api/profile/${session.user.name}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) return
        setForm({
          bio: data.bio || '',
          ign: data.playerProfile?.ign || '',
          rank: data.playerProfile?.rank || '',
          mainGame: data.playerProfile?.mainGame || 'bgmi',
          gameIds: (data.playerProfile?.gameIds as Record<string, string>) || {},
        })
      })
  }, [session])

  async function handleSave() {
    if (!session?.user?.name) return
    setSaving(true)
    setError('')
    setSuccess(false)

    const res = await fetch(`/api/profile/${session.user.name}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error || 'Failed to save'); return }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00f5ff', fontFamily: "'Orbitron', monospace" }}>LOADING...</div>
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #00f5ff44 !important; }
        select option { background: #13131f; }
        .save-btn:hover:not(:disabled) { background: #00f5ff !important; color: #0a0a0f !important; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}} />

      {/* Navbar */}
      <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #ffffff0a', padding: '0 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="#00f5ff"/></svg>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
          </Link>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Edit Profile</span>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', fontWeight: 900, color: '#e2e8f0' }}>
            Edit Profile
          </h1>
          <Link href={`/profile/${session?.user?.name}`} style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
            ← View Profile
          </Link>
        </div>

        {success && (
          <div style={{ background: '#00ff8818', border: '1px solid #00ff8844', borderRadius: '10px', padding: '12px 16px', color: '#00ff88', fontSize: '14px', marginBottom: '20px' }}>
            ✅ Profile saved successfully!
          </div>
        )}
        {error && (
          <div style={{ background: '#ff444418', border: '1px solid #ff444444', borderRadius: '10px', padding: '12px 16px', color: '#ff6b6b', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card title="👤 Basic Info">
          <FormField label="BIO">
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell the community about yourself..."
              rows={3}
              style={{
                width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14',
                borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
                fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                resize: 'vertical', transition: 'border 0.2s',
              }}
            />
          </FormField>
        </Card>

        {/* Player Info */}
        <Card title="🎮 Player Info">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="IN-GAME NAME (IGN)">
              <Input value={form.ign} onChange={v => setForm(p => ({ ...p, ign: v }))} placeholder="Your IGN" />
            </FormField>
            <FormField label="RANK">
              <Input value={form.rank} onChange={v => setForm(p => ({ ...p, rank: v }))} placeholder="e.g. Diamond, Platinum" />
            </FormField>
          </div>
          <FormField label="MAIN GAME">
            <select
              value={form.mainGame}
              onChange={e => setForm(p => ({ ...p, mainGame: e.target.value }))}
              style={{
                width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14',
                borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
                fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border 0.2s',
              }}
            >
              {GAMES.map(g => <option key={g} value={g}>{GAME_LABELS[g]}</option>)}
            </select>
          </FormField>
        </Card>

        {/* Game IDs */}
        <Card title="🔗 Link Game Accounts">
          <p style={{ color: '#475569', fontSize: '13px', marginBottom: '16px' }}>
            Add your in-game IDs so teams and players can find and verify you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {GAMES.map(game => (
              <div key={game} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '80px', fontSize: '12px', fontWeight: 700,
                  color: '#64748b', letterSpacing: '0.5px', flexShrink: 0,
                }}>
                  {GAME_LABELS[game]}
                </div>
                <Input
                  value={form.gameIds[game] || ''}
                  onChange={v => setForm(p => ({ ...p, gameIds: { ...p.gameIds, [game]: v } }))}
                  placeholder={`Your ${GAME_LABELS[game]} ID`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Save button */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href={`/profile/${session?.user?.name}`} style={{
            padding: '12px 24px', border: '1px solid #ffffff14', borderRadius: '10px',
            color: '#64748b', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
          }}>
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving} className="save-btn" style={{
            padding: '12px 32px', background: 'transparent', border: '1px solid #00f5ff',
            borderRadius: '10px', color: '#00f5ff', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
          }}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>
    </>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>{title}</h3>
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14',
        borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
        fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border 0.2s',
      }}
    />
  )
}
