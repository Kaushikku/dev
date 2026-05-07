'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

const GAMES = ['All', 'BGMI', 'Valorant', 'CS2', 'Free Fire', 'Honor of Kings', 'COD Mobile', 'Apex Legends']
const STATUSES = ['All', 'ONGOING', 'REGISTRATION_OPEN', 'UPCOMING', 'COMPLETED']
const REGIONS = ['All', 'INDIA', 'GLOBAL', 'SEA', 'NA']
const SORT_OPTIONS = ['Latest', 'Prize Pool', 'Most Teams']

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
  ONGOING:           { bg: '#ff444422', color: '#ff6b6b', label: 'LIVE', pulse: true },
  REGISTRATION_OPEN: { bg: '#00ff8822', color: '#00ff88', label: 'REG OPEN' },
  UPCOMING:          { bg: '#3b82f622', color: '#60a5fa', label: 'UPCOMING' },
  COMPLETED:         { bg: '#ffffff11', color: '#64748b', label: 'ENDED' },
  DRAFT:             { bg: '#ffffff08', color: '#334155', label: 'DRAFT' },
}

const GAME_COLORS: Record<string, string> = {
  valorant: '#ff4655', bgmi: '#8fbc5a', cs2: '#f0a500',
  freefire: '#e74c3c', hok: '#9b59b6', codmobile: '#3498db', apex: '#cd3333',
}

const FALLBACK_TOURNAMENTS = [
  { id: '1', title: 'NexusGG BGMI Open S1', status: 'REGISTRATION_OPEN', prizePool: '50000', currency: 'INR', entryFee: '0', format: 'SINGLE_ELIMINATION', startDate: '2025-06-01', endDate: '2025-06-15', maxTeams: 64, registeredTeams: 38, region: 'INDIA', game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8fbc5a', logo: null }, org: { orgName: 'NexusGG', logo: null } },
  { id: '2', title: 'Valorant Clash Series', status: 'UPCOMING', prizePool: '25000', currency: 'INR', entryFee: '100', format: 'DOUBLE_ELIMINATION', startDate: '2025-07-01', endDate: '2025-07-07', maxTeams: 32, registeredTeams: 12, region: 'INDIA', game: { name: 'Valorant', slug: 'valorant', themeColor: '#ff4655', logo: null }, org: { orgName: 'ProLeague IN', logo: null } },
  { id: '3', title: 'CS2 India Championship', status: 'ONGOING', prizePool: '100000', currency: 'INR', entryFee: '200', format: 'SWISS', startDate: '2025-05-10', endDate: '2025-05-20', maxTeams: 16, registeredTeams: 16, region: 'INDIA', game: { name: 'CS2', slug: 'cs2', themeColor: '#f0a500', logo: null }, org: { orgName: 'ESL India', logo: null } },
  { id: '4', title: 'Free Fire Pro League', status: 'UPCOMING', prizePool: '75000', currency: 'INR', entryFee: '0', format: 'ROUND_ROBIN', startDate: '2025-06-20', endDate: '2025-06-30', maxTeams: 24, registeredTeams: 5, region: 'INDIA', game: { name: 'Free Fire', slug: 'freefire', themeColor: '#e74c3c', logo: null }, org: { orgName: 'Garena IN', logo: null } },
  { id: '5', title: 'HOK Masters Cup', status: 'REGISTRATION_OPEN', prizePool: '30000', currency: 'INR', entryFee: '50', format: 'SINGLE_ELIMINATION', startDate: '2025-06-10', endDate: '2025-06-12', maxTeams: 32, registeredTeams: 20, region: 'INDIA', game: { name: 'Honor of Kings', slug: 'hok', themeColor: '#9b59b6', logo: null }, org: { orgName: 'TiMi Studio', logo: null } },
  { id: '6', title: 'Apex Global Invitational', status: 'UPCOMING', prizePool: '500000', currency: 'INR', entryFee: '0', format: 'LEAGUE', startDate: '2025-08-01', endDate: '2025-08-15', maxTeams: 20, registeredTeams: 8, region: 'GLOBAL', game: { name: 'Apex Legends', slug: 'apex', themeColor: '#cd3333', logo: null }, org: { orgName: 'EA Sports', logo: null } },
]

export default function TournamentsPage() {
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['tournaments-list', gameFilter, statusFilter, regionFilter, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (gameFilter !== 'All') params.set('game', gameFilter.toLowerCase().replace(' ', ''))
      if (statusFilter !== 'All') params.set('status', statusFilter)
      if (regionFilter !== 'All') params.set('region', regionFilter)
      params.set('sort', sortBy)
      params.set('page', String(page))
      params.set('limit', '12')
      const res = await fetch(`/api/tournaments?${params}`)
      if (!res.ok) return { tournaments: [], total: 0 }
      return res.json()
    },
  })

  const allTournaments = (data?.tournaments && data.tournaments.length > 0)
    ? data.tournaments : FALLBACK_TOURNAMENTS

  const filtered = allTournaments.filter((t: any) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
        select { appearance: none; cursor: pointer; }
        select option { background: #13131f; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .t-card:hover { transform: translateY(-3px); border-color: #ffffff18 !important; box-shadow: 0 8px 30px #00000066 !important; }
        .filter-select:focus { outline: none; border-color: #00f5ff44 !important; }
        .view-btn:hover { opacity: 0.85; }
        .page-btn:hover { border-color: #00f5ff44 !important; color: #00f5ff !important; }
      `}} />

      {/* Navbar */}
      <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #ffffff0a', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="#00f5ff"/></svg>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
          </Link>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>Tournaments</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: '#e2e8f0', marginBottom: '8px' }}>
            🏆 Tournaments
          </h1>
          <p style={{ color: '#475569', fontSize: '15px' }}>Compete for glory and real prize pools</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, auto)', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search tournaments..."
              style={{
                background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '10px',
                padding: '10px 14px', color: '#e2e8f0', fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%',
              }}
            />
            {/* Game */}
            <select value={gameFilter} onChange={e => setGameFilter(e.target.value)} className="filter-select"
              style={{ background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
            {/* Status */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select"
              style={{ background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
              {STATUSES.map(s => <option key={s}>{s === 'All' ? 'All Status' : s.replace('_', ' ')}</option>)}
            </select>
            {/* Region */}
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="filter-select"
              style={{ background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
              {REGIONS.map(r => <option key={r}>{r === 'All' ? 'All Regions' : r}</option>)}
            </select>
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select"
              style={{ background: '#0a0a0f', border: '1px solid #ffffff0a', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
              {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ color: '#475569', fontSize: '13px', marginBottom: '20px' }}>
          Showing {filtered.length} tournament{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>Loading tournaments...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filtered.map((t: any) => {
              const s = STATUS_STYLE[t.status] || STATUS_STYLE.UPCOMING
              const color = t.game?.themeColor || GAME_COLORS[t.game?.slug] || '#00f5ff'
              const fillPct = Math.round((t.registeredTeams / t.maxTeams) * 100)

              return (
                <div key={t.id} className="t-card" style={{
                  background: 'linear-gradient(145deg, #13131f, #0f0f1a)',
                  border: '1px solid #ffffff0a', borderRadius: '16px',
                  overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer',
                }}>
                  {/* Color banner */}
                  <div style={{ height: '5px', background: color }} />

                  <div style={{ padding: '20px' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}22`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                          🎮
                        </div>
                        <span style={{ fontSize: '12px', color: color, fontWeight: 700 }}>{t.game?.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {s.pulse && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff4444', animation: 'pulse 1.5s infinite' }} />}
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>{t.title}</h3>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '16px' }}>
                      by {t.org?.orgName || 'NexusGG'} · {t.region}
                    </div>

                    {/* Prize pool */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#00ff88', fontFamily: "'Orbitron', monospace" }}>
                        ₹{parseInt(t.prizePool || '0').toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#334155' }}>Total Prize Pool</div>
                    </div>

                    {/* Info row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      {[
                        { label: 'FORMAT', value: t.format?.replace('_', ' ') || 'TBD' },
                        { label: 'ENTRY', value: parseInt(t.entryFee || '0') === 0 ? 'FREE' : `₹${t.entryFee}` },
                        { label: 'START', value: t.startDate?.slice(0, 10) || 'TBD' },
                        { label: 'REGION', value: t.region || 'INDIA' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#0a0a0f', borderRadius: '8px', padding: '8px 10px' }}>
                          <div style={{ fontSize: '9px', color: '#334155', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Team fill bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#475569' }}>Teams registered</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{t.registeredTeams}/{t.maxTeams}</span>
                      </div>
                      <div style={{ height: '4px', background: '#ffffff08', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct >= 90 ? '#ff4444' : color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/tournaments/${t.id}`} className="view-btn" style={{
                      display: 'block', textAlign: 'center', padding: '11px',
                      background: color, color: '#0a0a0f', borderRadius: '10px',
                      fontWeight: 800, fontSize: '13px', textDecoration: 'none',
                      letterSpacing: '0.5px', transition: 'opacity 0.2s',
                    }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {(data?.total || 0) > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
            {Array.from({ length: Math.ceil((data?.total || 0) / 12) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className="page-btn" style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: `1px solid ${page === i + 1 ? '#00f5ff' : '#ffffff14'}`,
                background: page === i + 1 ? '#00f5ff14' : 'transparent',
                color: page === i + 1 ? '#00f5ff' : '#64748b',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
