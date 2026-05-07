'use client'

import { createContext, useContext, useEffect } from 'react'

// ── Theme definitions ────────────────────────────────────────

export interface GameTheme {
  primary: string
  secondary: string
  accent: string
  glow: string
  gradient: string
  tabIndicator: string
}

export const GAME_THEMES: Record<string, GameTheme> = {
  bgmi: {
    primary: '#4a5c3a',
    secondary: '#2d3b26',
    accent: '#8fbc5a',
    glow: '#8fbc5a44',
    gradient: 'linear-gradient(135deg, #2d3b26 0%, #1a2518 100%)',
    tabIndicator: '#8fbc5a',
  },
  valorant: {
    primary: '#ff4655',
    secondary: '#0f1923',
    accent: '#ece8e1',
    glow: '#ff465544',
    gradient: 'linear-gradient(135deg, #0f1923 0%, #1a0a0f 100%)',
    tabIndicator: '#ff4655',
  },
  cs2: {
    primary: '#f0a500',
    secondary: '#1a1a2e',
    accent: '#e8e8e8',
    glow: '#f0a50044',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
    tabIndicator: '#f0a500',
  },
  hok: {
    primary: '#9b59b6',
    secondary: '#1a0a2e',
    accent: '#f1c40f',
    glow: '#9b59b644',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #0d0518 100%)',
    tabIndicator: '#9b59b6',
  },
  freefire: {
    primary: '#e74c3c',
    secondary: '#1a0a0a',
    accent: '#f39c12',
    glow: '#e74c3c44',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #0d0505 100%)',
    tabIndicator: '#e74c3c',
  },
  codmobile: {
    primary: '#3498db',
    secondary: '#1a1a1a',
    accent: '#ecf0f1',
    glow: '#3498db44',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    tabIndicator: '#3498db',
  },
  apex: {
    primary: '#cd3333',
    secondary: '#0a0a1a',
    accent: '#e0e0e0',
    glow: '#cd333344',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #050510 100%)',
    tabIndicator: '#cd3333',
  },
  default: {
    primary: '#00f5ff',
    secondary: '#0a0a0f',
    accent: '#e2e8f0',
    glow: '#00f5ff44',
    gradient: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)',
    tabIndicator: '#00f5ff',
  },
}

export function getGameTheme(slug: string): GameTheme {
  return GAME_THEMES[slug.toLowerCase()] ?? GAME_THEMES.default
}

// ── Context ──────────────────────────────────────────────────

const GameThemeContext = createContext<GameTheme>(GAME_THEMES.default)

export function GameThemeProvider({
  theme,
  children,
}: {
  theme: GameTheme
  children: React.ReactNode
}) {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--game-primary', theme.primary)
    root.style.setProperty('--game-secondary', theme.secondary)
    root.style.setProperty('--game-accent', theme.accent)
    root.style.setProperty('--game-glow', theme.glow)
    root.style.setProperty('--game-tab-indicator', theme.tabIndicator)
    return () => {
      root.style.removeProperty('--game-primary')
      root.style.removeProperty('--game-secondary')
      root.style.removeProperty('--game-accent')
      root.style.removeProperty('--game-glow')
      root.style.removeProperty('--game-tab-indicator')
    }
  }, [theme])

  return (
    <GameThemeContext.Provider value={theme}>
      {children}
    </GameThemeContext.Provider>
  )
}

export function useGameTheme(): GameTheme {
  return useContext(GameThemeContext)
}
