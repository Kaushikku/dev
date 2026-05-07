'use client'

import { useState } from 'react'
import { useGameTheme } from '@/context/GameThemeContext'
import { useQuery } from '@tanstack/react-query'

interface Props { gameSlug: string; gameId: string }

const WIKI_TYPES = ['CHARACTER', 'WEAPON', 'MAP', 'MECHANIC', 'ITEM']

export default function WikiTab({ gameSlug, gameId }: Props) {
  const theme = useGameTheme()
  const [activeType, setActiveType] = useState('CHARACTER')

  const { data: entries } = useQuery({
    queryKey: ['wiki', gameId, activeType],
    queryFn: async () => {
      const res = await fetch(`/api/wiki?gameId=${gameId}&type=${activeType}&limit=12`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const FALLBACK_ENTRIES = {
    CHARACTER: [
      { id: '1', name: 'Jett', description: 'Duelist · High mobility agent with wind-based abilities.', tags: ['Duelist', 'Entry'] },
      { id: '2', name: 'Sage', description: 'Sentinel · Healer and wall-builder, great for support roles.', tags: ['Sentinel', 'Support'] },
      { id: '3', name: 'Omen', description: 'Controller · Teleportation and smoke specialist.', tags: ['Controller', 'Flank'] },
      { id: '4', name: 'Reyna', description: 'Duelist · Fraggers dream — soul harvest on every kill.', tags: ['Duelist', 'Aggressive'] },
      { id: '5', name: 'Killjoy', description: 'Sentinel · Tech-based setup with turrets and lockdown ult.', tags: ['Sentinel', 'Setup'] },
      { id: '6', name: 'Breach', description: 'Initiator · Flash and stun combos to break defense.', tags: ['Initiator', 'Flash'] },
    ],
    WEAPON: [
      { id: '1', name: 'Vandal', description: 'Rifle · One-tap headshot machine. Best for duels at any range.', tags: ['Rifle', 'Accurate'] },
      { id: '2', name: 'Phantom', description: 'Rifle · Silenced, lower recoil. Best for close-mid range.', tags: ['Rifle', 'Silenced'] },
      { id: '3', name: 'Operator', description: 'Sniper · One-shot body kill. Dominates long angles.', tags: ['Sniper', 'High Risk'] },
      { id: '4', name: 'Classic', description: 'Sidearm · Free pistol. Right-click burst is deadly.', tags: ['Pistol', 'Free'] },
    ],
    MAP: [
      { id: '1', name: 'Ascent', description: 'Classic map with mid control being key to winning rounds.', tags: ['Competitive', 'Mid Control'] },
      { id: '2', name: 'Bind', description: 'No mid, two teleporters connect the sites uniquely.', tags: ['Competitive', 'Teleporters'] },
      { id: '3', name: 'Haven', description: 'Only map with 3 bomb sites — forces creative strategies.', tags: ['Competitive', '3 Sites'] },
    ],
  }

  const displayEntries = (entries && entries.length > 0)
    ? entries
    : (FALLBACK_ENTRIES as any)[activeType] || FALLBACK_ENTRIES.CHARACTER

  return (
    <div>
      {/* Type filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {WIKI_TYPES.map(type => (
          <button key={type} onClick={() => setActiveType(type)} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', fontSize: '12px', fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            background: activeType === type ? theme.primary : '#ffffff08',
            color: activeType === type ? '#0a0a0f' : '#64748b',
            boxShadow: activeType === type ? `0 0 16px ${theme.glow}` : 'none',
          }}>
            {type}
          </button>
        ))}
      </div>

      {/* Entries grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {displayEntries.map((e: any) => (
          <div key={e.id} style={{
            background: '#0a0a0f', border: `1px solid ${theme.primary}22`,
            borderRadius: '12px', padding: '16px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={el => {
              el.currentTarget.style.border = `1px solid ${theme.primary}66`
              el.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={el => {
              el.currentTarget.style.border = `1px solid ${theme.primary}22`
              el.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: `${theme.primary}22`, border: `1px solid ${theme.primary}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', marginBottom: '12px',
            }}>
              {activeType === 'CHARACTER' ? '👤' : activeType === 'WEAPON' ? '🔫' : activeType === 'MAP' ? '🗺️' : '📖'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>{e.name}</div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, marginBottom: '10px' }}>{e.description}</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(e.tags || []).map((tag: string) => (
                <span key={tag} style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: `${theme.primary}18`, color: theme.primary,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
