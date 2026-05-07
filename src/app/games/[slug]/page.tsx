'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GameThemeProvider, getGameTheme } from '@/context/GameThemeContext'
import { useGameTheme } from '@/context/GameThemeContext'
import Link from 'next/link'

// Tab imports
import UpdatesTab from '@/components/game-sections/UpdatesTab'
import EsportsTab from '@/components/game-sections/EsportsTab'
import WikiTab from '@/components/game-sections/WikiTab'
import ComingSoonTab from '@/components/game-sections/ComingSoonTab'

// ── Tab config ───────────────────────────────────────────────

const TABS = [
  { id: 'updates',     label: 'Updates',      icon: '📋' },
  { id: 'esports',     label: 'Esports',      icon: '🏆' },
  { id: 'wiki',        label: 'Wiki',         icon: '📖' },
  { id: 'tiers',       label: 'Meta & Tiers', icon: '⭐' },
  { id: 'settings',    label: 'Pro Settings', icon: '⚙️' },
  { id: 'maps',        label: 'Maps',         icon: '🗺️' },
  { id: 'scrimmage',   label: 'Scrimmage',    icon: '⚔️' },
  { id: 'coaches',     label: 'Coaches',      icon: '🎓' },
  { id: 'lftlfp',      label: 'LFT/LFP',     icon: '🔍' },
  { id: 'clips',       label: 'Clips',        icon: '🎬' },
  { id: 'predictions', label: 'Predictions',  icon: '🔮' },
  { id: 'live',        label: 'Live Match',   icon: '🔴' },
  { id: 'forum',       label: 'Forum',        icon: '💬' },
]

const COMING_SOON_CONFIGS: Record<string, { icon: string; description: string }> = {
  tiers:       { icon: '⭐', description: 'Community and pro tier lists for every patch. Vote on the best picks and see what the pros are running.' },
  settings:    { icon: '⚙️', description: 'Pro player sensitivity, crosshair, and config settings. Copy setups from the best players.' },
  maps:        { icon: '🗺️', description: 'Interactive map callouts, strategy guides, and lineup spots for every map in the pool.' },
  scrimmage:   { icon: '⚔️', description: 'Find scrimmage partners, schedule practice matches, and track your team\'s scrim record.' },
  coaches:     { icon: '🎓', description: 'Connect with certified coaches for VOD reviews, 1-on-1 sessions, and team coaching.' },
  lftlfp:      { icon: '🔍', description: 'Looking for team? Looking for players? Post your profile and find your perfect squad.' },
  clips:       { icon: '🎬', description: 'Share your best plays, watch community highlights, and build your fragmovie reputation.' },
  predictions: { icon: '🔮', description: 'Predict match outcomes, earn prediction points, and climb the prediction leaderboard.' },
  live:        { icon: '🔴', description: 'Watch live tournament matches, see real-time scores, and follow ongoing series.' },
  forum:       { icon: '💬', description: 'Discuss strats, share content, and connect with the community in game-specific forums.' },
}

const GAME_EMOJIS: Record<string, string> = {
  bgmi: '🔫', valorant: '⚡', cs2: '💣', freefire: '🔥',
  hok: '⚔️', clashroyale: '👑', codmobile: '🎯', apex: '🚀', default: '🎮',
}

// ── Inner page (has access to theme context) ─────────────────

function GamePageInner({ game, slug }: { game: any; slug: string }) {
  const theme = useGameTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'updates'

  function setTab(tabId: string) {
    router.push(`/games/${slug}?tab=${tabId}`, { scroll: false })
  }

  function renderTab() {
    const props = { gameSlug: slug, gameId: game?.id || slug }
    switch (activeTab) {
      case 'updates':  return <UpdatesTab {...props} />
      case 'esports':  return <EsportsTab {...props} />
      case 'wiki':     return <WikiTab {...props} />
      default: {
        const config = COMING_SOON_CONFIGS[activeTab]
        if (config) {
          const tabLabel = TABS.find(t => t.id === activeTab)?.label || activeTab
          return <ComingSoonTab tabName={tabLabel} icon={config.icon} description={config.description} />
        }
        return <UpdatesTab {...props} />
      }
    }
  }

  const gameName = game?.name || slug.toUpperCase()
  const emoji = GAME_EMOJIS[slug] || GAME_EMOJIS.default

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }

        .tab-btn { cursor: pointer; background: none; border: none; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: ${theme.primary} !important; }
        .tab-btn.active { color: ${theme.primary} !important; border-bottom-color: ${theme.primary} !important; }

        .tabs-scroll::-webkit-scrollbar { height: 3px; }
        .tabs-scroll::-webkit-scrollbar-thumb { background: ${theme.primary}44; border-radius: 2px; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-content { animation: slideIn 0.25s ease forwards; }

        .stat-card:hover { border-color: ${theme.primary}44 !important; }
      `}} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #ffffff0a', padding: '0 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,26 2,26" fill="none" stroke="#00f5ff" strokeWidth="2"/>
              <circle cx="16" cy="16" r="3" fill="#00f5ff"/>
            </svg>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, color: '#00f5ff' }}>NEXUSGG</span>
          </Link>
          <span style={{ color: '#334155' }}>›</span>
          <Link href="/games" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>Games</Link>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: theme.primary, fontSize: '13px', fontWeight: 700 }}>{gameName}</span>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{
        background: theme.gradient,
        borderBottom: `1px solid ${theme.primary}22`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(${theme.primary}08 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          fontSize: '160px', opacity: 0.06, pointerEvents: 'none',
          fontFamily: "'Orbitron', monospace",
        }}>
          {emoji}
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px', position: 'relative', zIndex: 1 }}>
          {/* Game identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '16px',
              background: `${theme.primary}22`, border: `2px solid ${theme.primary}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', boxShadow: `0 0 30px ${theme.glow}`,
            }}>
              {emoji}
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Orbitron', monospace", fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 900, color: '#ffffff', letterSpacing: '1px',
                textShadow: `0 0 30px ${theme.glow}`,
              }}>
                {gameName}
              </h1>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: theme.primary, fontWeight: 600 }}>
                  {game?.platform || 'PC'} · {game?.genre?.replace('_', ' ') || 'FPS'}
                </span>
                {game?.isActive !== false && (
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                    background: '#00ff8822', color: '#00ff88', fontWeight: 700,
                  }}>
                    ● ACTIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Active Players', value: game?._count?.playerStats?.toLocaleString('en-IN') || '2,400' },
              { label: 'Tournaments', value: game?._count?.tournaments?.toLocaleString() || '12' },
              { label: 'Articles', value: game?._count?.articles?.toLocaleString() || '48' },
              { label: 'Clips', value: game?._count?.clips?.toLocaleString() || '320' },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card" style={{
                background: '#00000033', border: `1px solid ${theme.primary}18`,
                borderRadius: '10px', padding: '12px 20px', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: theme.primary, fontFamily: "'Orbitron', monospace" }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        background: '#0a0a0f',
        borderBottom: `1px solid #ffffff08`,
        position: 'sticky', top: '56px', zIndex: 90,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="tabs-scroll" style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setTab(tab.id)}
                style={{
                  padding: '14px 16px',
                  fontSize: '13px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  color: activeTab === tab.id ? theme.primary : '#475569',
                  borderBottom: `2px solid ${activeTab === tab.id ? theme.primary : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="tab-content" key={activeTab}>
          {renderTab()}
        </div>
      </div>
    </>
  )
}

// ── Main page (fetches data, provides theme) ─────────────────

export default function GamePage() {
  const params = useParams()
  const slug = params.slug as string
  const theme = getGameTheme(slug)

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', slug],
    queryFn: async () => {
      const res = await fetch(`/api/games/${slug}`)
      if (res.status === 404) return null
      if (!res.ok) throw new Error('Failed to fetch game')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <GameThemeProvider theme={theme}>
        <div style={{
          minHeight: '100vh', background: '#0a0a0f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>
              {GAME_EMOJIS[slug] || '🎮'}
            </div>
            <div style={{ color: theme.primary, fontFamily: "'Orbitron', monospace", fontSize: '14px', letterSpacing: '2px' }}>
              LOADING...
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        </div>
      </GameThemeProvider>
    )
  }

  if (isError || game === null) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎮</div>
        <h1 style={{ color: '#e2e8f0', fontFamily: "'Orbitron', monospace", marginBottom: '8px' }}>Game Not Found</h1>
        <p style={{ color: '#475569', marginBottom: '24px' }}>"{slug}" hasn't been added to NexusGG yet.</p>
        <Link href="/" style={{ color: '#00f5ff', textDecoration: 'none', fontWeight: 700 }}>← Back to Home</Link>
      </div>
    )
  }

  return (
    <GameThemeProvider theme={theme}>
      <Suspense>
        <GamePageInner game={game} slug={slug} />
      </Suspense>
    </GameThemeProvider>
  )
}
