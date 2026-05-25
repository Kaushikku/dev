'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import BracketViewer from '@/components/tournaments/BracketViewer'

const TABS = ['Overview', 'Bracket', 'Teams', 'Rules', 'Stream']

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ONGOING:           { bg: '#ff444422', color: '#ff6b6b', label: '🔴 LIVE' },
  REGISTRATION_OPEN: { bg: '#00ff8822', color: '#00ff88', label: '🟢 REGISTRATION OPEN' },
  UPCOMING:          { bg: '#3b82f622', color: '#60a5fa', label: '🔵 UPCOMING' },
  COMPLETED:         { bg: '#ffffff11', color: '#64748b', label: '⚪ COMPLETED' },
}

const FALLBACK_TOURNAMENT = {
  id: '1', title: 'NexusGG BGMI Open Season 1',
  description: 'The biggest BGMI tournament on NexusGG. Open to all players across India. Top teams compete for a massive prize pool.',
  status: 'REGISTRATION_OPEN', prizePool: '50000', currency: 'INR',
  entryFee: '0', format: 'SINGLE_ELIMINATION', region: 'INDIA',
  startDate: '2025-06-01', endDate: '2025-06-15',
  registrationDeadline: '2025-05-28',
  maxTeams: 64, registeredTeams: 38,
  rules: `1. All players must be registered on NexusGG.\n2. Team size: 4 players + 1 substitute.\n3. Match format: Best of 3 maps.\n4. No cheats, hacks, or exploits allowed.\n5. Results must be reported within 15 minutes of match completion.\n6. Admins have final say in all disputes.`,
  prizeBreakdown: { '1st': 25000, '2nd': 15000, '3rd': 7000, '4th': 3000 },
  streamUrl: null, bannerImage: null,
  game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8fbc5a', logo: null },
  org: { orgName: 'NexusGG', logo: null },
  teams: [
    { teamId: 't1', team: { name: 'Team Alpha', tag: 'ALPH' }, status: 'APPROVED', placement: null },
    { teamId: 't2', team: { name: 'ProGamingIN', tag: 'PGI' }, status: 'APPROVED', placement: null },
    { teamId: 't3', team: { name: 'Storm Rising', tag: 'SR' }, status: 'APPROVED', placement: null },
    { teamId: 't4', team: { name: 'Clutch Kings', tag: 'CK' }, status: 'PENDING', placement: null },
  ],
}

export default function TournamentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('Overview')
  const [registering, setRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regError, setRegError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [showRegModal, setShowRegModal] = useState(false)

  const { data: tournament, isLoading, refetch } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${id}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  const { data: bracketData } = useQuery({
    queryKey: ['bracket', id],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${id}/bracket`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: activeTab === 'Bracket',
  })

  const t = tournament || FALLBACK_TOURNAMENT
  const color = t.game?.themeColor || '#00f5ff'
  const status = STATUS_STYLE[t.status] || STATUS_STYLE.UPCOMING
  const isFree = parseInt(t.entryFee || '0') === 0
  const isFull = t.registeredTeams >= t.maxTeams
  const isOpen = t.status === 'REGISTRATION_OPEN' || t.status === 'UPCOMING'
  const deadlinePassed = t.registrationDeadline && new Date(t.registrationDeadline) < new Date()

  async function handleRegister() {
    if (!session) { window.location.href = '/login'; return }
    if (!teamName.trim()) { setRegError('Please enter a team name'); return }
    setRegistering(true)
    setRegError('')
    try {
      const res = await fetch(`/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      })
      const data = await res.json()
      if (!res.ok) { setRegError(data.error || 'Registration failed'); return }
      setRegSuccess(true)
      setShowRegModal(false)
      refetch()
    } catch {
      setRegError('Something went wrong. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  if (isLoading) return (
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
        .tab-btn:hover { color: ${color} !important; }
        .tab-btn.active { color: ${color} !important; border-bottom-color: ${color} !important; }
        .reg-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .tab-content { animation: fadeIn 0.25s ease; }
        .modal-overlay { position: fixed; inset: 0; background: #00000088; display: flex; align-items: center; justify-content: center; z-index: 999; }
        input:focus { outline: none; border-color: ${color}66 !important; }
      `}} />

      {/* Navbar */}
      <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #ffffff0a', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="#00f5ff"/></svg>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
          </Link>
          <span style={{ color: '#334155' }}>›</span>
          <Link href="/tournaments" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>Tournaments</Link>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
        </div>
      </nav>

      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${color}22 0%, #0a0a0f 60%)`,
        borderBottom: `1px solid ${color}22`, padding: '40px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', fontSize: '140px', opacity: 0.05, fontFamily: "'Orbitron', monospace", pointerEvents: 'none' }}>🏆</div>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: `${color}22`, color }}>
              {t.game?.name}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: status.bg, color: status.color }}>
              {status.label}
            </span>
            <span style={{ fontSize: '12px', color: '#475569' }}>{t.region}</span>
          </div>

          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, color: '#ffffff', marginBottom: '8px', lineHeight: 1.2 }}>
            {t.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', maxWidth: '600px' }}>{t.description}</p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Register button */}
            {regSuccess ? (
              <div style={{ padding: '12px 24px', background: '#00ff8822', border: '1px solid #00ff8844', borderRadius: '10px', color: '#00ff88', fontWeight: 700, fontSize: '14px' }}>
                ✅ Successfully Registered!
              </div>
            ) : isOpen && !isFull && !deadlinePassed ? (
              <button onClick={() => session ? setShowRegModal(true) : window.location.href = '/login'}
                className="reg-btn"
                style={{
                  padding: '12px 28px', background: color, color: '#0a0a0f',
                  border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 0 24px ${color}44`, transition: 'all 0.2s',
                }}>
                {session ? (isFree ? '⚡ Register Free' : `Register — ₹${t.entryFee}`) : '🔐 Login to Register'}
              </button>
            ) : (
              <div style={{ padding: '12px 24px', background: '#ffffff08', border: '1px solid #ffffff14', borderRadius: '10px', color: '#475569', fontWeight: 700, fontSize: '14px' }}>
                {isFull ? '🚫 Tournament Full' : deadlinePassed ? '⏰ Registration Closed' : '🏁 Tournament Ended'}
              </div>
            )}

            <button
              onClick={() => navigator.share?.({ title: t.title, url: window.location.href }) || navigator.clipboard?.writeText(window.location.href)}
              style={{ padding: '12px 20px', background: 'transparent', border: `1px solid ${color}33`, borderRadius: '10px', color, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ background: '#0d0d1a', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'PRIZE POOL', value: `₹${parseInt(t.prizePool || '0').toLocaleString('en-IN')}`, highlight: true },
              { label: 'TEAMS', value: `${t.registeredTeams}/${t.maxTeams}` },
              { label: 'FORMAT', value: t.format?.replace(/_/g, ' ') || 'TBD' },
              { label: 'ENTRY FEE', value: parseInt(t.entryFee || '0') === 0 ? 'FREE' : `₹${t.entryFee}` },
              { label: 'START DATE', value: t.startDate?.slice(0, 10) || 'TBD' },
              { label: 'DEADLINE', value: t.registrationDeadline?.slice(0, 10) || 'TBD' },
              { label: 'HOSTED BY', value: t.org?.orgName || 'NexusGG' },
            ].map(({ label, value, highlight }) => (
              <div key={label}>
                <div style={{ fontSize: '9px', color: '#334155', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: highlight ? '#00ff88' : '#94a3b8', fontFamily: highlight ? "'Orbitron', monospace" : 'inherit' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#0a0a0f', borderBottom: '1px solid #ffffff08', position: 'sticky', top: '56px', zIndex: 90 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '14px 18px', background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? color : 'transparent'}`,
                color: activeTab === tab ? color : '#475569',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="tab-content" key={activeTab}>

          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '16px' }}>About This Tournament</h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>{t.description}</p>

                {/* Prize breakdown */}
                {t.prizeBreakdown && (
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px' }}>🏆 Prize Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(t.prizeBreakdown).map(([place, amount]: any, i) => (
                        <div key={place} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 16px', borderRadius: '10px',
                          background: i === 0 ? `${color}18` : '#0a0a0f',
                          border: `1px solid ${i === 0 ? color + '33' : '#ffffff0a'}`,
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: i === 0 ? color : '#94a3b8' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'} {place} Place
                          </span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: i === 0 ? '#00ff88' : '#64748b', fontFamily: "'Orbitron', monospace" }}>
                            ₹{Number(amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>📊 Registration</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>Teams Registered</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{t.registeredTeams}/{t.maxTeams}</span>
                    </div>
                    <div style={{ height: '6px', background: '#ffffff08', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px', transition: 'width 0.5s',
                        width: `${(t.registeredTeams / t.maxTeams) * 100}%`,
                        background: t.registeredTeams >= t.maxTeams ? '#ff4444' : color,
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>
                    Deadline: {t.registrationDeadline?.slice(0, 10) || 'TBD'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BRACKET */}
          {activeTab === 'Bracket' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '20px' }}>Tournament Bracket</h2>
              <BracketViewer matches={bracketData || []} primaryColor={color} />
            </div>
          )}

          {/* TEAMS */}
          {activeTab === 'Teams' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '20px' }}>
                Registered Teams ({t.teams?.length || t.registeredTeams})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {(t.teams || []).map((reg: any, i: number) => (
                  <div key={reg.teamId || i} style={{
                    background: '#13131f', border: `1px solid ${color}22`,
                    borderRadius: '10px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `${color}22`, border: `1px solid ${color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 900, color,
                    }}>
                      {reg.team?.tag || '??'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{reg.team?.name || 'Unknown Team'}</div>
                      <div style={{ fontSize: '10px', color: reg.status === 'APPROVED' ? '#00ff88' : '#f59e0b', fontWeight: 600 }}>
                        {reg.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES */}
          {activeTab === 'Rules' && (
            <div style={{ maxWidth: '700px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '20px' }}>📋 Tournament Rules</h2>
              <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '12px', padding: '24px' }}>
                {(t.rules || 'Rules will be announced soon.').split('\n').map((rule: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    {rule.trim() && <>
                      <span style={{ color, fontWeight: 700, minWidth: '20px', fontSize: '13px' }}>→</span>
                      <span style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{rule.replace(/^\d+\.\s*/, '')}</span>
                    </>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STREAM */}
          {activeTab === 'Stream' && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📺</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Stream</h3>
              {t.streamUrl ? (
                <a href={t.streamUrl} target="_blank" rel="noreferrer" style={{ color, fontSize: '14px' }}>{t.streamUrl}</a>
              ) : (
                <p style={{ color: '#475569' }}>Stream link will be added when the tournament goes live.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#13131f', border: `1px solid ${color}33`,
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', margin: '16px',
          }}>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', color: '#e2e8f0', marginBottom: '8px' }}>Register for Tournament</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{t.title}</p>

            <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              TEAM NAME
            </label>
            <input
              value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="Enter your team name..."
              style={{
                width: '100%', background: '#0a0a0f', border: '1px solid #ffffff14',
                borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0',
                fontSize: '14px', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px',
                transition: 'border 0.2s',
              }}
            />

            {regError && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{regError}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowRegModal(false)} style={{
                flex: 1, padding: '11px', background: 'transparent',
                border: '1px solid #ffffff14', borderRadius: '10px',
                color: '#64748b', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={handleRegister} disabled={registering} className="reg-btn" style={{
                flex: 2, padding: '11px', background: color,
                border: 'none', borderRadius: '10px', color: '#0a0a0f',
                fontWeight: 800, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
              }}>
                {registering ? 'Registering...' : isFree ? '⚡ Register Free' : `Pay ₹${t.entryFee} & Register`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
