'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const ACHIEVEMENT_ICONS: Record<string, string> = {
  FIRST_WIN: '🏆', TOURNAMENT_WINNER: '👑', TOP_FRAGGER: '💀',
  MVP: '⭐', STREAK_5: '🔥', STREAK_10: '🔥', VETERAN: '🎖️',
  LEGEND: '🐉', CUSTOM: '🎯',
}

const ALL_ACHIEVEMENTS = [
  { type: 'FIRST_WIN',         name: 'First Victory',      desc: 'Win your first tournament match' },
  { type: 'TOURNAMENT_WINNER', name: 'Champion',           desc: 'Win a tournament' },
  { type: 'TOP_FRAGGER',       name: 'Top Fragger',        desc: 'Finish with most kills in a match' },
  { type: 'MVP',               name: 'MVP',                desc: 'Be voted MVP of a tournament' },
  { type: 'STREAK_5',          name: 'On Fire',            desc: 'Win 5 matches in a row' },
  { type: 'STREAK_10',         name: 'Unstoppable',        desc: 'Win 10 matches in a row' },
  { type: 'VETERAN',           name: 'Veteran',            desc: 'Play in 10+ tournaments' },
  { type: 'LEGEND',            name: 'Legend',             desc: 'Reach top 10 on India leaderboard' },
]

const GAME_COLORS: Record<string, string> = {
  valorant: '#ff4655', bgmi: '#8fbc5a', cs2: '#f0a500',
  freefire: '#e74c3c', hok: '#9b59b6', codmobile: '#3498db', apex: '#cd3333',
}

const FALLBACK_PROFILE = {
  id: '1', username: 'ProGamer_XY', avatar: null, bio: 'Full-time gamer. BGMI Diamond. Competing since 2022. Open to scrim requests.',
  region: 'INDIA', accountType: 'PLAYER', createdAt: '2022-06-01',
  playerProfile: {
    ign: 'ProGamer#9999', rank: 'Diamond', mainGame: 'bgmi',
    secondaryGames: ['valorant', 'cs2'],
    gameIds: { bgmi: 'PG9999', valorant: 'ProGamer#IN1', cs2: 'STEAM_123' },
    stats: [
      { id: '1', game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8fbc5a' }, kills: 4820, deaths: 1240, wins: 142, matchesPlayed: 380, kdRatio: 3.89, winRate: 37.4, tournamentPoints: 4280 },
      { id: '2', game: { name: 'Valorant', slug: 'valorant', themeColor: '#ff4655' }, kills: 2100, deaths: 890, wins: 65, matchesPlayed: 180, kdRatio: 2.36, winRate: 36.1, tournamentPoints: 1820 },
    ],
    achievements: [
      { id: '1', achievementType: 'TOURNAMENT_WINNER', earnedAt: '2024-03-15' },
      { id: '2', achievementType: 'TOP_FRAGGER', earnedAt: '2024-01-20' },
      { id: '3', achievementType: 'STREAK_5', earnedAt: '2023-11-10' },
      { id: '4', achievementType: 'VETERAN', earnedAt: '2023-08-01' },
    ],
  },
  tournamentHistory: [
    { id: '1', title: 'NexusGG BGMI Open S1', game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8fbc5a' }, date: '2025-05-01', placement: 1, prizeWon: '25000', team: 'Team Alpha', status: 'APPROVED' },
    { id: '2', title: 'BGMI Monthly Cup', game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8fbc5a' }, date: '2025-03-10', placement: 3, prizeWon: '7000', team: 'Team Alpha', status: 'APPROVED' },
    { id: '3', title: 'Valorant Clash Series', game: { name: 'Valorant', slug: 'valorant', themeColor: '#ff4655' }, date: '2025-02-20', placement: 2, prizeWon: '8000', team: 'Nexus Squad', status: 'APPROVED' },
    { id: '4', title: 'CS2 India Open', game: { name: 'CS2', slug: 'cs2', themeColor: '#f0a500' }, date: '2024-12-05', placement: null, prizeWon: '0', team: 'India Fraggers', status: 'APPROVED' },
  ],
  totalEarned: 40000,
  totalTournaments: 4,
}

const FALLBACK_STATS = {
  rankProgression: [
    { month: 'Jan', rank: 1800 }, { month: 'Feb', rank: 1950 },
    { month: 'Mar', rank: 1870 }, { month: 'Apr', rank: 2100 }, { month: 'May', rank: 2250 },
  ],
  placementData: [
    { name: '1st', count: 3 }, { name: '2nd', count: 2 },
    { name: '3rd', count: 4 }, { name: 'Top 8', count: 6 },
  ],
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { data: session } = useSession()
  const [activeGame, setActiveGame] = useState<string>('')
  const [historyPage, setHistoryPage] = useState(1)
  const [following, setFollowing] = useState(false)
  const PER_PAGE = 5

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  const { data: statsData } = useQuery({
    queryKey: ['profile-stats', username, activeGame],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}/stats${activeGame ? `?game=${activeGame}` : ''}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  const p = profile || FALLBACK_PROFILE
  const stats = statsData || FALLBACK_STATS
  const isOwnProfile = session?.user?.name === username

  const games = p.playerProfile?.stats || []
  const currentGameSlug = activeGame || games[0]?.game?.slug || 'bgmi'
  const currentStats = games.find((s: any) => s.game?.slug === currentGameSlug) || games[0]
  const primaryColor = GAME_COLORS[currentGameSlug] || '#00f5ff'

  const earnedTypes = new Set((p.playerProfile?.achievements || []).map((a: any) => a.achievementType))

  const paginatedHistory = (p.tournamentHistory || []).slice((historyPage - 1) * PER_PAGE, historyPage * PER_PAGE)
  const totalPages = Math.ceil((p.tournamentHistory || []).length / PER_PAGE)

  async function handleFollow() {
    if (!session) { window.location.href = '/login'; return }
    const res = await fetch(`/api/profile/${username}/follow`, { method: 'POST' })
    const data = await res.json()
    setFollowing(data.following)
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00f5ff', fontFamily: "'Orbitron', monospace", letterSpacing: '2px' }}>LOADING...</div>
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
        .game-tab:hover { color: ${primaryColor} !important; }
        .game-tab.active { color: ${primaryColor} !important; border-bottom-color: ${primaryColor} !important; }
        .follow-btn:hover { opacity: 0.85; }
        .history-row:hover { background: #ffffff04 !important; }
        .achievement-badge:hover { transform: scale(1.05); }
        .page-btn:hover { border-color: #ffffff33 !important; }
      `}} />

      {/* Navbar */}
      <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #ffffff0a', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="#00f5ff"/></svg>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
          </Link>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{username}</span>
        </div>
      </nav>

      {/* Banner */}
      <div style={{
        height: '200px',
        background: `linear-gradient(135deg, ${primaryColor}33 0%, #0a0a0f 70%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${primaryColor}08 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div style={{ position: 'absolute', right: '5%', bottom: '-10px', fontSize: '160px', opacity: 0.05, fontFamily: "'Orbitron', monospace" }}>
          {p.playerProfile?.mainGame?.toUpperCase() || 'GG'}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Profile header */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          {/* Avatar */}
          <div style={{
            position: 'absolute', top: '-50px', left: '0',
            width: '96px', height: '96px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${primaryColor}44, ${primaryColor}22)`,
            border: `3px solid ${primaryColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', boxShadow: `0 0 24px ${primaryColor}44`,
            overflow: 'hidden',
          }}>
            {p.avatar ? <img src={p.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎮'}
          </div>

          <div style={{ paddingTop: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '28px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                {p.username}
              </h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                {p.playerProfile?.ign && (
                  <span style={{ fontSize: '13px', color: primaryColor, fontWeight: 600 }}>
                    IGN: {p.playerProfile.ign}
                  </span>
                )}
                {p.playerProfile?.rank && (
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', background: `${primaryColor}22`, color: primaryColor, fontWeight: 700 }}>
                    {p.playerProfile.rank}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#475569' }}>🇮🇳 {p.region}</span>
              </div>
              {p.bio && <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '500px', lineHeight: 1.5 }}>{p.bio}</p>}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {isOwnProfile ? (
                <Link href="/dashboard/profile/edit" style={{
                  padding: '9px 20px', border: `1px solid ${primaryColor}44`,
                  borderRadius: '10px', color: primaryColor, fontSize: '13px',
                  fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  ✏️ Edit Profile
                </Link>
              ) : (
                <>
                  <button onClick={handleFollow} className="follow-btn" style={{
                    padding: '9px 20px', background: following ? 'transparent' : primaryColor,
                    border: `1px solid ${primaryColor}`, borderRadius: '10px',
                    color: following ? primaryColor : '#0a0a0f', fontSize: '13px',
                    fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                  }}>
                    {following ? '✓ Following' : '+ Follow'}
                  </button>
                  <Link href={`/messages/${p.username}`} style={{
                    padding: '9px 20px', border: '1px solid #ffffff14',
                    borderRadius: '10px', color: '#94a3b8', fontSize: '13px',
                    fontWeight: 700, textDecoration: 'none',
                  }}>
                    💬 Message
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Tournaments', value: p.totalTournaments },
              { label: 'Earned', value: `₹${(p.totalEarned || 0).toLocaleString('en-IN')}` },
              { label: 'Points', value: currentStats?.tournamentPoints?.toLocaleString('en-IN') || '0' },
              { label: 'Member Since', value: new Date(p.createdAt).getFullYear() },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '8px 16px', background: '#13131f',
                border: '1px solid #ffffff0a', borderRadius: '20px',
                fontSize: '13px', color: '#94a3b8',
              }}>
                <span style={{ color: primaryColor, fontWeight: 700 }}>{value}</span>
                {' '}{label}
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <Section title="📊 Game Stats">
          {/* Game tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #ffffff08', marginBottom: '24px', overflowX: 'auto' }}>
            {games.map((s: any) => (
              <button key={s.game.slug}
                className={`game-tab ${currentGameSlug === s.game.slug ? 'active' : ''}`}
                onClick={() => setActiveGame(s.game.slug)}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${currentGameSlug === s.game.slug ? primaryColor : 'transparent'}`,
                  color: currentGameSlug === s.game.slug ? primaryColor : '#475569',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}>
                {s.game.name}
              </button>
            ))}
          </div>

          {currentStats && (
            <>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {[
                  { label: 'K/D Ratio', value: currentStats.kdRatio?.toFixed(2) || '0.00', highlight: true },
                  { label: 'Win Rate', value: `${currentStats.winRate?.toFixed(1) || '0'}%` },
                  { label: 'Matches', value: currentStats.matchesPlayed?.toLocaleString() || '0' },
                  { label: 'Total Kills', value: currentStats.kills?.toLocaleString() || '0' },
                  { label: 'Tournament Pts', value: currentStats.tournamentPoints?.toLocaleString('en-IN') || '0', highlight: true },
                  { label: 'Wins', value: currentStats.wins?.toLocaleString() || '0' },
                ].map(({ label, value, highlight }) => (
                  <div key={label} style={{
                    background: '#13131f', border: `1px solid ${highlight ? primaryColor + '33' : '#ffffff0a'}`,
                    borderRadius: '12px', padding: '16px', textAlign: 'center',
                    boxShadow: highlight ? `0 0 16px ${primaryColor}18` : 'none',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: highlight ? primaryColor : '#e2e8f0', fontFamily: "'Orbitron', monospace", marginBottom: '4px' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.5px' }}>{label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Rank progression */}
                <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.5px' }}>RANK PROGRESSION</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={stats.rankProgression}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#13131f', border: `1px solid ${primaryColor}44`, borderRadius: '8px', color: '#e2e8f0' }} />
                      <Line type="monotone" dataKey="rank" stroke={primaryColor} strokeWidth={2} dot={{ fill: primaryColor, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Tournament placements */}
                <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.5px' }}>TOURNAMENT PLACEMENTS</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.placementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#13131f', border: `1px solid ${primaryColor}44`, borderRadius: '8px', color: '#e2e8f0' }} />
                      <Bar dataKey="count" fill={primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* Tournament History */}
        <Section title="🏆 Tournament History">
          <div style={{ background: '#13131f', border: '1px solid #ffffff0a', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 100px 1fr', gap: '12px', padding: '10px 16px', borderBottom: '1px solid #ffffff08', color: '#334155', fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
              <span>TOURNAMENT</span><span>GAME</span><span>DATE</span><span style={{ textAlign: 'center' }}>PLACE</span><span style={{ textAlign: 'right' }}>PRIZE</span><span>TEAM</span>
            </div>
            {paginatedHistory.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>No tournament history yet</div>
            ) : paginatedHistory.map((t: any, i: number) => (
              <div key={t.id} className="history-row" style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 100px 1fr',
                gap: '12px', padding: '14px 16px', alignItems: 'center',
                borderBottom: i < paginatedHistory.length - 1 ? '1px solid #ffffff05' : 'none',
                transition: 'background 0.2s',
              }}>
                <Link href={`/tournaments/${t.id}`} style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                  {t.title}
                </Link>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', color: t.game?.themeColor || '#00f5ff', background: `${t.game?.themeColor || '#00f5ff'}18`, display: 'inline-block' }}>
                  {t.game?.name}
                </span>
                <span style={{ fontSize: '12px', color: '#475569' }}>{t.date?.slice(0, 10)}</span>
                <span style={{ textAlign: 'center', fontSize: '14px' }}>
                  {t.placement === 1 ? '🥇' : t.placement === 2 ? '🥈' : t.placement === 3 ? '🥉' : t.placement ? `#${t.placement}` : '—'}
                </span>
                <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, color: parseFloat(t.prizeWon || '0') > 0 ? '#00ff88' : '#334155', fontFamily: "'Orbitron', monospace" }}>
                  {parseFloat(t.prizeWon || '0') > 0 ? `₹${parseInt(t.prizeWon).toLocaleString('en-IN')}` : '—'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{t.team}</span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setHistoryPage(i + 1)} className="page-btn" style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: `1px solid ${historyPage === i + 1 ? primaryColor : '#ffffff14'}`,
                  background: historyPage === i + 1 ? `${primaryColor}18` : 'transparent',
                  color: historyPage === i + 1 ? primaryColor : '#64748b',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* Achievements */}
        <Section title="🎖️ Achievements">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {ALL_ACHIEVEMENTS.map(ach => {
              const earned = earnedTypes.has(ach.type)
              const earnedData = (p.playerProfile?.achievements || []).find((a: any) => a.achievementType === ach.type)
              return (
                <div key={ach.type} className="achievement-badge" style={{
                  background: earned ? `${primaryColor}12` : '#0a0a0f',
                  border: `1px solid ${earned ? primaryColor + '44' : '#ffffff08'}`,
                  borderRadius: '12px', padding: '16px', textAlign: 'center',
                  transition: 'transform 0.2s', opacity: earned ? 1 : 0.4,
                  filter: earned ? 'none' : 'grayscale(100%)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {earned ? (ACHIEVEMENT_ICONS[ach.type] || '🎯') : '🔒'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: earned ? '#e2e8f0' : '#334155', marginBottom: '4px' }}>{ach.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>{ach.desc}</div>
                  {earned && earnedData && (
                    <div style={{ fontSize: '10px', color: primaryColor, marginTop: '6px', fontWeight: 600 }}>
                      {new Date(earnedData.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Linked Game IDs */}
        <Section title="🎮 Linked Game Accounts">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {Object.entries(p.playerProfile?.gameIds || {}).map(([game, id]) => (
              <div key={game} style={{
                background: '#13131f', border: `1px solid ${GAME_COLORS[game] || '#ffffff14'}22`,
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${GAME_COLORS[game] || '#ffffff'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>🎮</div>
                <div>
                  <div style={{ fontSize: '12px', color: GAME_COLORS[game] || '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
                    {game.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{id as string}</div>
                </div>
              </div>
            ))}
            {Object.keys(p.playerProfile?.gameIds || {}).length === 0 && (
              <p style={{ color: '#334155', fontSize: '13px' }}>No game accounts linked yet.</p>
            )}
          </div>
        </Section>

        <div style={{ height: '60px' }} />
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
