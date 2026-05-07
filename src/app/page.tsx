'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchGames, fetchTournaments, fetchLeaderboard, fetchNews, queryKeys } from '@/lib/api'

// ── Static fallback data shown before DB is populated ───────

const FALLBACK_GAMES = [
  { id: '1', name: 'BGMI', slug: 'bgmi', themeColor: '#8B9A2E', logo: null, banner: null, platform: 'MOBILE', genre: 'BATTLE_ROYALE', _count: { playerStats: 0 } },
  { id: '2', name: 'Valorant', slug: 'valorant', themeColor: '#FF4655', logo: null, banner: null, platform: 'PC', genre: 'FPS', _count: { playerStats: 0 } },
  { id: '3', name: 'CS2', slug: 'cs2', themeColor: '#F9A825', logo: null, banner: null, platform: 'PC', genre: 'FPS', _count: { playerStats: 0 } },
  { id: '4', name: 'Free Fire', slug: 'freefire', themeColor: '#FF6B35', logo: null, banner: null, platform: 'MOBILE', genre: 'BATTLE_ROYALE', _count: { playerStats: 0 } },
  { id: '5', name: 'Honor of Kings', slug: 'hok', themeColor: '#9B59B6', logo: null, banner: null, platform: 'MOBILE', genre: 'MOBA', _count: { playerStats: 0 } },
  { id: '6', name: 'Clash Royale', slug: 'clashroyale', themeColor: '#3498DB', logo: null, banner: null, platform: 'MOBILE', genre: 'STRATEGY', _count: { playerStats: 0 } },
]

const GAME_EMOJIS: Record<string, string> = {
  bgmi: '🔫', valorant: '⚡', cs2: '💣', freefire: '🔥',
  hok: '⚔️', clashroyale: '👑', default: '🎮',
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ONGOING: { bg: '#ff444422', color: '#ff6b6b', label: '🔴 LIVE' },
  REGISTRATION_OPEN: { bg: '#00f5ff22', color: '#00f5ff', label: '🟢 OPEN' },
  UPCOMING: { bg: '#7c3aed22', color: '#a78bfa', label: '🟣 UPCOMING' },
  COMPLETED: { bg: '#ffffff11', color: '#64748b', label: '⚪ ENDED' },
}

// ── Navbar ───────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid #ffffff0a' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/>
            <polygon points="16,8 25,24 7,24" fill="#00f5ff22"/>
            <circle cx="16" cy="16" r="3" fill="#00f5ff"/>
          </svg>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 900, color: '#00f5ff', letterSpacing: '2px', textShadow: '0 0 16px #00f5ff66' }}>
            NEXUSGG
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} className="desktop-nav">
          {['Home', 'Tournaments', 'Leaderboard', 'News', 'Live'].map(item => (
            <Link key={item} href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
              style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s', letterSpacing: '0.3px' }}
              className="nav-link">
              {item === 'Live' ? '🔴 Live' : item}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', padding: '6px' }}>🔔</button>
          <Link href="/login" style={{
            padding: '8px 20px', background: 'transparent', border: '1px solid #00f5ff',
            borderRadius: '8px', color: '#00f5ff', fontSize: '13px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '0.5px', transition: 'all 0.2s',
            boxShadow: '0 0 16px #00f5ff22',
          }} className="join-btn">
            Join Free
          </Link>
          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger"
            style={{ display: 'none', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '22px' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#0f0f1a', borderTop: '1px solid #ffffff0a',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {['Home', 'Tournaments', 'Leaderboard', 'News', 'Live'].map(item => (
            <Link key={item} href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #ffffff08' }}>
              {item}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

// ── Hero Section ─────────────────────────────────────────────

function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const floatingGames = ['🔫', '⚡', '💣', '🔥', '⚔️']

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%)',
    }}>
      {/* Animated grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #00f5ff12 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed12 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Floating game icons */}
      {mounted && floatingGames.map((emoji, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + i * 20}%`,
          top: `${20 + (i % 2) * 40}%`,
          fontSize: '32px',
          opacity: 0.15,
          animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.4}s`,
          pointerEvents: 'none',
          filter: 'blur(0.5px)',
        }}>
          {emoji}
        </div>
      ))}

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: '800px' }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
          background: '#00f5ff14', border: '1px solid #00f5ff33',
          color: '#00f5ff', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
          marginBottom: '24px',
        }}>
          🏆 INDIA'S #1 ESPORTS PLATFORM
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900,
          fontFamily: "'Orbitron', monospace", lineHeight: 1.1,
          color: '#ffffff', marginBottom: '20px', letterSpacing: '-1px',
        }}>
          India's{' '}
          <span style={{ color: '#00f5ff', textShadow: '0 0 40px #00f5ff88' }}>#1</span>
          {' '}Esports Hub
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#64748b', marginBottom: '40px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 40px' }}>
          Tournaments, Stats, Teams — All in One Place. Compete, climb, and conquer.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/tournaments" style={{
            padding: '14px 32px', background: '#00f5ff', color: '#0a0a0f',
            borderRadius: '10px', fontWeight: 800, fontSize: '15px',
            textDecoration: 'none', letterSpacing: '0.5px',
            boxShadow: '0 0 30px #00f5ff66', transition: 'all 0.2s',
          }} className="hero-btn-primary">
            🏆 Explore Tournaments
          </Link>
          <Link href="/login" style={{
            padding: '14px 32px', background: 'transparent',
            border: '1px solid #ffffff22', color: '#e2e8f0',
            borderRadius: '10px', fontWeight: 700, fontSize: '15px',
            textDecoration: 'none', transition: 'all 0.2s',
          }} className="hero-btn-secondary">
            Create Profile →
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '60px', flexWrap: 'wrap' }}>
          {[
            { val: '50K+', label: 'Players' },
            { val: '₹10L+', label: 'Prize Money' },
            { val: '200+', label: 'Tournaments' },
            { val: '6', label: 'Games' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00f5ff', fontFamily: "'Orbitron', monospace" }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, letterSpacing: '1px', marginTop: '4px' }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Game Hub ─────────────────────────────────────────────────

function GameHub() {
  const { data: games, isLoading } = useQuery({
    queryKey: queryKeys.games,
    queryFn: fetchGames,
  })

  const displayGames = (games && games.length > 0) ? games : FALLBACK_GAMES

  return (
    <section style={{ padding: '80px 24px', background: '#0a0a0f' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader title="Choose Your Game" subtitle="Pick your battlefield and start competing" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {displayGames.map(game => (
            <Link key={game.id} href={`/games/${game.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{
                background: 'linear-gradient(145deg, #13131f, #0f0f1a)',
                border: '1px solid #ffffff0a',
                borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.3s ease', position: 'relative',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  const color = game.themeColor || '#00f5ff'
                  el.style.border = `1px solid ${color}44`
                  el.style.boxShadow = `0 0 30px ${color}22`
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.border = '1px solid #ffffff0a'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Banner */}
                <div style={{
                  height: '100px',
                  background: game.themeColor
                    ? `linear-gradient(135deg, ${game.themeColor}33, ${game.themeColor}11)`
                    : 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  {GAME_EMOJIS[game.slug] || GAME_EMOJIS.default}
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.5px' }}>
                    {game.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>
                    {game.platform} · {game.genre.replace('_', ' ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {game._count.playerStats > 0 ? `${game._count.playerStats.toLocaleString()} players` : 'Be the first!'}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                      borderRadius: '6px', color: game.themeColor || '#00f5ff',
                      background: `${game.themeColor || '#00f5ff'}18`,
                      border: `1px solid ${game.themeColor || '#00f5ff'}33`,
                    }}>
                      Enter →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Tournaments Section ───────────────────────────────────────

function TournamentsSection() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: queryKeys.tournaments('live'),
    queryFn: () => fetchTournaments('live', 6),
  })

  const FALLBACK_TOURNAMENTS = [
    { id: '1', title: 'NexusGG BGMI Open', prizePool: '50000', currency: 'INR', status: 'REGISTRATION_OPEN', startDate: new Date().toISOString(), registrationDeadline: new Date().toISOString(), maxTeams: 64, registeredTeams: 38, bannerImage: null, region: 'INDIA', game: { name: 'BGMI', logo: null, themeColor: '#8B9A2E', slug: 'bgmi' } },
    { id: '2', title: 'Valorant Clash Series', prizePool: '25000', currency: 'INR', status: 'UPCOMING', startDate: new Date().toISOString(), registrationDeadline: new Date().toISOString(), maxTeams: 32, registeredTeams: 12, bannerImage: null, region: 'INDIA', game: { name: 'Valorant', logo: null, themeColor: '#FF4655', slug: 'valorant' } },
    { id: '3', title: 'CS2 India Championship', prizePool: '100000', currency: 'INR', status: 'ONGOING', startDate: new Date().toISOString(), registrationDeadline: new Date().toISOString(), maxTeams: 16, registeredTeams: 16, bannerImage: null, region: 'INDIA', game: { name: 'CS2', logo: null, themeColor: '#F9A825', slug: 'cs2' } },
  ]

  const displayTournaments = (tournaments && tournaments.length > 0) ? tournaments : FALLBACK_TOURNAMENTS

  return (
    <section style={{ padding: '80px 24px', background: '#0d0d1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader title="Live & Upcoming Tournaments" subtitle="Compete for real prize pools" />

        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }} className="scroll-row">
          {displayTournaments.map(t => {
            const statusStyle = STATUS_STYLES[t.status] || STATUS_STYLES.UPCOMING
            return (
              <div key={t.id} style={{
                minWidth: '280px', flex: '0 0 280px',
                background: 'linear-gradient(145deg, #13131f, #0f0f1a)',
                border: '1px solid #ffffff0a', borderRadius: '16px',
                overflow: 'hidden', transition: 'all 0.2s',
              }}
                className="tournament-card"
              >
                {/* Top color bar */}
                <div style={{ height: '4px', background: t.game.themeColor || '#00f5ff' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{GAME_EMOJIS[t.game.slug] || '🎮'}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                      background: statusStyle.bg, color: statusStyle.color,
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', lineHeight: 1.3 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '16px' }}>
                    {t.game.name} · {t.region}
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#00f5ff', fontFamily: "'Orbitron', monospace", marginBottom: '4px' }}>
                    ₹{t.prizePool ? parseInt(t.prizePool).toLocaleString() : '0'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '16px' }}>Prize Pool</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      👥 {t.registeredTeams}/{t.maxTeams} teams
                    </span>
                    <Link href={`/tournaments/${t.id}`} style={{
                      fontSize: '12px', fontWeight: 700, padding: '6px 14px',
                      borderRadius: '8px', color: '#00f5ff', background: '#00f5ff14',
                      border: '1px solid #00f5ff33', textDecoration: 'none',
                    }}>
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/tournaments" style={{
            padding: '12px 32px', border: '1px solid #ffffff14',
            borderRadius: '10px', color: '#94a3b8', fontSize: '14px',
            fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
          }} className="view-all-btn">
            View All Tournaments
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Leaderboard Section ───────────────────────────────────────

function LeaderboardSection() {
  const { data: leaders, isLoading } = useQuery({
    queryKey: queryKeys.leaderboard('all'),
    queryFn: () => fetchLeaderboard('all', 5),
  })

  const FALLBACK_LEADERS = [
    { rank: 1, username: 'ProGamer_XY', avatar: null, game: 'BGMI', gameSlug: 'bgmi', gameColor: '#8B9A2E', tournamentPoints: 4280, kdRatio: 8.4, winRate: 72 },
    { rank: 2, username: 'ValorantKing', avatar: null, game: 'Valorant', gameSlug: 'valorant', gameColor: '#FF4655', tournamentPoints: 3950, kdRatio: 6.2, winRate: 65 },
    { rank: 3, username: 'HeadshotMaster', avatar: null, game: 'CS2', gameSlug: 'cs2', gameColor: '#F9A825', tournamentPoints: 3720, kdRatio: 5.8, winRate: 61 },
    { rank: 4, username: 'FFLegend_IN', avatar: null, game: 'Free Fire', gameSlug: 'freefire', gameColor: '#FF6B35', tournamentPoints: 3100, kdRatio: 7.1, winRate: 58 },
    { rank: 5, username: 'NexusChamp', avatar: null, game: 'BGMI', gameSlug: 'bgmi', gameColor: '#8B9A2E', tournamentPoints: 2890, kdRatio: 5.5, winRate: 54 },
  ]

  const displayLeaders = (leaders && leaders.length > 0) ? leaders : FALLBACK_LEADERS
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <section style={{ padding: '80px 24px', background: '#0a0a0f' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <SectionHeader title="Top Players" subtitle="The best of NexusGG" />

        <div style={{ background: 'linear-gradient(145deg, #13131f, #0f0f1a)', border: '1px solid #ffffff0a', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #ffffff08', color: '#334155', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
            <span>#</span><span>PLAYER</span><span>GAME</span><span style={{ textAlign: 'right' }}>KD</span><span style={{ textAlign: 'right' }}>PTS</span>
          </div>

          {displayLeaders.map((p, i) => (
            <div key={p.rank} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px',
              gap: '12px', padding: '14px 20px',
              borderBottom: i < displayLeaders.length - 1 ? '1px solid #ffffff05' : 'none',
              transition: 'background 0.2s',
            }}
              className="leaderboard-row"
            >
              <span style={{ fontSize: '18px' }}>{medals[i]}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.gameColor || '#00f5ff'}44, ${p.gameColor || '#00f5ff'}22)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', border: `1px solid ${p.gameColor || '#00f5ff'}33`,
                }}>
                  {p.username[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{p.username}</span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                color: p.gameColor || '#00f5ff', background: `${p.gameColor || '#00f5ff'}18`,
                alignSelf: 'center', display: 'inline-block',
              }}>
                {p.game}
              </span>
              <span style={{ textAlign: 'right', fontSize: '13px', color: '#94a3b8', alignSelf: 'center' }}>{p.kdRatio.toFixed(1)}</span>
              <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#00f5ff', alignSelf: 'center', fontFamily: "'Orbitron', monospace" }}>{p.tournamentPoints.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/leaderboard" style={{
            padding: '12px 32px', border: '1px solid #ffffff14',
            borderRadius: '10px', color: '#94a3b8', fontSize: '14px',
            fontWeight: 600, textDecoration: 'none',
          }}>
            View Full Leaderboard
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── News Section ──────────────────────────────────────────────

function NewsSection() {
  const { data: articles } = useQuery({
    queryKey: queryKeys.news,
    queryFn: () => fetchNews(3),
  })

  const FALLBACK_ARTICLES = [
    { id: '1', title: 'BGMI Pro League Season 3 Prize Pool Announced', slug: 'bgmi-pro-s3', excerpt: 'The biggest BGMI tournament returns with a massive ₹50 lakh prize pool.', coverImage: null, category: 'ESPORTS', publishedAt: new Date().toISOString(), views: 1240, game: { name: 'BGMI', slug: 'bgmi', themeColor: '#8B9A2E' }, author: { username: 'NexusEditor', avatar: null } },
    { id: '2', title: 'Valorant Patch 9.0 — Complete Agent Tier List', slug: 'val-patch-9-tier', excerpt: 'Everything you need to know about the latest Valorant update.', coverImage: null, category: 'GUIDE', publishedAt: new Date().toISOString(), views: 892, game: { name: 'Valorant', slug: 'valorant', themeColor: '#FF4655' }, author: { username: 'ProAnalyst', avatar: null } },
    { id: '3', title: 'Top 5 Indian CS2 Teams to Watch in 2025', slug: 'india-cs2-teams', excerpt: 'Indian CS2 is rising — here are the squads making waves globally.', coverImage: null, category: 'NEWS', publishedAt: new Date().toISOString(), views: 654, game: { name: 'CS2', slug: 'cs2', themeColor: '#F9A825' }, author: { username: 'SceneWatcher', avatar: null } },
  ]

  const displayArticles = (articles && articles.length > 0) ? articles : FALLBACK_ARTICLES

  return (
    <section style={{ padding: '80px 24px', background: '#0d0d1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeader title="Latest News" subtitle="Stay ahead of the scene" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {displayArticles.map(a => (
            <Link key={a.id} href={`/news/${a.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(145deg, #13131f, #0f0f1a)',
                border: '1px solid #ffffff0a', borderRadius: '16px',
                overflow: 'hidden', transition: 'all 0.2s', height: '100%',
              }} className="news-card">
                {/* Thumbnail */}
                <div style={{
                  height: '140px',
                  background: a.game
                    ? `linear-gradient(135deg, ${a.game.themeColor}22, ${a.game.themeColor}08)`
                    : 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  {GAME_EMOJIS[a.game?.slug || ''] || '📰'}
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {a.game && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        color: a.game.themeColor || '#00f5ff',
                        background: `${a.game.themeColor || '#00f5ff'}18`,
                      }}>
                        {a.game.name}
                      </span>
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                      color: '#64748b', background: '#ffffff08',
                    }}>
                      {a.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4, marginBottom: '8px' }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                    {a.excerpt}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#334155' }}>
                      by {a.author.username}
                    </span>
                    <span style={{ fontSize: '11px', color: '#00f5ff', fontWeight: 600 }}>
                      Read More →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: '#070709', borderTop: '1px solid #ffffff08', padding: '60px 24px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/>
                <circle cx="16" cy="16" r="3" fill="#00f5ff"/>
              </svg>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
            </div>
            <p style={{ color: '#334155', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
              India's premier esports platform. Compete. Connect. Conquer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['🐦', '💬', '📸', '▶️'].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: '#ffffff08', border: '1px solid #ffffff0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platform', links: ['Tournaments', 'Leaderboard', 'Teams', 'News', 'Wiki'] },
            { title: 'Games', links: ['BGMI', 'Valorant', 'CS2', 'Free Fire', 'Honor of Kings'] },
            { title: 'Company', links: ['About', 'Contact', 'Privacy Policy', 'Terms of Service'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginBottom: '16px', letterSpacing: '1px' }}>
                {title.toUpperCase()}
              </div>
              {links.map(link => (
                <a key={link} href="#" style={{ display: 'block', color: '#334155', fontSize: '13px', marginBottom: '8px', textDecoration: 'none', transition: 'color 0.2s' }}
                  className="footer-link">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #ffffff08', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ color: '#1e293b', fontSize: '12px' }}>© 2025 NexusGG. All rights reserved.</span>
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
            background: '#00f5ff12', color: '#00f5ff', border: '1px solid #00f5ff22',
          }}>
            🇮🇳 Made for Indian Gamers
          </span>
        </div>
      </div>
    </footer>
  )
}

// ── Shared components ─────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: '#e2e8f0', fontFamily: "'Orbitron', monospace", marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ color: '#475569', fontSize: '15px' }}>{subtitle}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
        a { color: inherit; }

        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-20px) rotate(10deg); }
        }

        .nav-link:hover { color: #00f5ff !important; background: #00f5ff0a !important; }
        .join-btn:hover { background: #00f5ff !important; color: #0a0a0f !important; }
        .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px #00f5ffaa !important; }
        .hero-btn-secondary:hover { border-color: #ffffff44 !important; background: #ffffff08 !important; }
        .tournament-card:hover { transform: translateY(-4px); border-color: #00f5ff33 !important; box-shadow: 0 8px 30px #00000066 !important; }
        .news-card:hover { transform: translateY(-4px); border-color: #ffffff18 !important; }
        .leaderboard-row:hover { background: #ffffff04 !important; }
        .footer-link:hover { color: #94a3b8 !important; }
        .view-all-btn:hover { border-color: #00f5ff33 !important; color: #00f5ff !important; }

        .scroll-row::-webkit-scrollbar { height: 4px; }
        .scroll-row::-webkit-scrollbar-track { background: #ffffff08; border-radius: 2px; }
        .scroll-row::-webkit-scrollbar-thumb { background: #00f5ff44; border-radius: 2px; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}} />
      <Navbar />
      <main>
        <Hero />
        <GameHub />
        <TournamentsSection />
        <LeaderboardSection />
        <NewsSection />
      </main>
      <Footer />
    </>
  )
}
