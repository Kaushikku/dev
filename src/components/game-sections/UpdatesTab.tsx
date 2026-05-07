'use client'

import { useGameTheme } from '@/context/GameThemeContext'
import { useQuery } from '@tanstack/react-query'

interface Props { gameSlug: string; gameId: string }

export default function UpdatesTab({ gameSlug, gameId }: Props) {
  const theme = useGameTheme()

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/news?gameId=${gameId}&limit=6`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const FALLBACK = [
    { id: '1', title: `Latest Patch Notes — Major Balance Update`, version: 'v9.04', date: 'May 2025', excerpt: 'Key changes to agent abilities, weapon balance, and map rotations in this update.', category: 'PATCH_NOTES' },
    { id: '2', title: 'Season 3 Ranked Changes Explained', version: 'v9.03', date: 'Apr 2025', excerpt: 'New rank distribution system and MMR adjustments rolling out this season.', category: 'NEWS' },
    { id: '3', title: 'Pro League Finals — Match Recap', version: null, date: 'Apr 2025', excerpt: 'Team Nexus takes the championship in a thrilling 5-map final series.', category: 'ESPORTS' },
  ]

  const displayArticles = (articles && articles.length > 0) ? articles : FALLBACK

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {displayArticles.map((a: any) => (
          <div key={a.id} style={{
            background: '#0a0a0f',
            border: `1px solid ${theme.primary}22`,
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `1px solid ${theme.primary}66`
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = `1px solid ${theme.primary}22`
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Top bar */}
            <div style={{ height: '3px', background: theme.primary }} />
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                {a.version && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '4px', color: theme.accent,
                    background: `${theme.primary}22`,
                    border: `1px solid ${theme.primary}44`,
                  }}>
                    {a.version}
                  </span>
                )}
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                  borderRadius: '4px', color: '#64748b', background: '#ffffff08',
                }}>
                  {a.category?.replace('_', ' ') || 'NEWS'}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.4 }}>
                {a.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                {a.excerpt || a.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#334155' }}>{a.date || a.publishedAt?.slice(0, 10)}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: theme.primary }}>Read More →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
