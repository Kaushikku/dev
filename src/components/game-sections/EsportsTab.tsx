'use client'

import { useGameTheme } from '@/context/GameThemeContext'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

interface Props { gameSlug: string; gameId: string }

export default function EsportsTab({ gameSlug, gameId }: Props) {
  const theme = useGameTheme()

  const { data: tournaments } = useQuery({
    queryKey: ['esports-tournaments', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments?gameId=${gameId}&limit=6`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const FALLBACK = [
    { id: '1', title: 'NexusGG Open Series', status: 'REGISTRATION_OPEN', prizePool: '50000', maxTeams: 64, registeredTeams: 38, startDate: '2025-06-01' },
    { id: '2', title: 'Pro League Season 3', status: 'UPCOMING', prizePool: '200000', maxTeams: 16, registeredTeams: 8, startDate: '2025-07-15' },
    { id: '3', title: 'Monthly Ranked Cup', status: 'ONGOING', prizePool: '10000', maxTeams: 32, registeredTeams: 32, startDate: '2025-05-10' },
  ]

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    ONGOING:           { bg: '#ff444422', color: '#ff6b6b',  label: '🔴 LIVE' },
    REGISTRATION_OPEN: { bg: `${theme.primary}22`, color: theme.primary, label: '🟢 OPEN' },
    UPCOMING:          { bg: '#7c3aed22', color: '#a78bfa',  label: '🟣 SOON' },
    COMPLETED:         { bg: '#ffffff11', color: '#64748b',  label: '⚪ ENDED' },
  }

  const displayTournaments = (tournaments && tournaments.length > 0) ? tournaments : FALLBACK

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {displayTournaments.map((t: any) => {
          const s = STATUS_STYLE[t.status] || STATUS_STYLE.UPCOMING
          return (
            <div key={t.id} style={{
              background: '#0a0a0f',
              border: `1px solid ${theme.primary}22`,
              borderRadius: '12px', overflow: 'hidden',
            }}>
              <div style={{ height: '3px', background: theme.primary }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: '11px', color: '#334155' }}>{t.startDate?.slice(0, 10)}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{t.title}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: theme.primary, fontFamily: "'Orbitron', monospace", marginBottom: '4px' }}>
                  ₹{parseInt(t.prizePool || '0').toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '16px' }}>
                  👥 {t.registeredTeams}/{t.maxTeams} teams registered
                </div>
                <Link href={`/tournaments/${t.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '8px',
                  border: `1px solid ${theme.primary}44`, borderRadius: '8px',
                  color: theme.primary, fontSize: '13px', fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  View Tournament →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
