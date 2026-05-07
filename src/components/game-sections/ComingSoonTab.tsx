'use client'

import { useGameTheme } from '@/context/GameThemeContext'

interface Props {
  tabName: string
  icon: string
  description: string
}

export default function ComingSoonTab({ tabName, icon, description }: Props) {
  const theme = useGameTheme()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '20px',
        background: `${theme.primary}18`, border: `2px solid ${theme.primary}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', marginBottom: '24px',
        boxShadow: `0 0 30px ${theme.glow}`,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '24px', fontWeight: 900, color: '#e2e8f0',
        fontFamily: "'Orbitron', monospace", marginBottom: '12px',
        letterSpacing: '1px',
      }}>
        {tabName}
      </h3>
      <p style={{ color: '#475569', fontSize: '15px', maxWidth: '400px', lineHeight: 1.6, marginBottom: '24px' }}>
        {description}
      </p>
      <div style={{
        padding: '8px 20px', borderRadius: '20px',
        background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`,
        color: theme.primary, fontSize: '12px', fontWeight: 700, letterSpacing: '1px',
      }}>
        🚧 COMING SOON
      </div>
    </div>
  )
}
