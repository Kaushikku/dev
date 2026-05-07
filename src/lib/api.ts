// ── Types ────────────────────────────────────────────────────

export interface Game {
  id: string
  name: string
  slug: string
  themeColor: string | null
  accentColor: string | null
  logo: string | null
  banner: string | null
  platform: string
  genre: string
  _count: { playerStats: number }
}

export interface Tournament {
  id: string
  title: string
  prizePool: string | null
  currency: string
  status: string
  startDate: string
  registrationDeadline: string
  maxTeams: number
  registeredTeams: number
  bannerImage: string | null
  region: string
  game: { name: string; logo: string | null; themeColor: string | null; slug: string }
}

export interface LeaderboardEntry {
  rank: number
  username: string
  avatar: string | null
  game: string
  gameSlug: string
  gameColor: string | null
  tournamentPoints: number
  kdRatio: number
  winRate: number
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: string
  publishedAt: string | null
  views: number
  game: { name: string; slug: string; themeColor: string | null } | null
  author: { username: string; avatar: string | null }
}

// ── Fetch helpers ────────────────────────────────────────────

const BASE = ''

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${BASE}/api/games`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Failed to fetch games')
  return res.json()
}

export async function fetchTournaments(status = 'live', limit = 6): Promise<Tournament[]> {
  const res = await fetch(`${BASE}/api/tournaments?status=${status}&limit=${limit}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch tournaments')
  return res.json()
}

export async function fetchLeaderboard(game = 'all', limit = 5): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/api/leaderboard?game=${game}&limit=${limit}`, {
    next: { revalidate: 120 },
  })
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json()
}

export async function fetchNews(limit = 3): Promise<Article[]> {
  const res = await fetch(`${BASE}/api/news?limit=${limit}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Failed to fetch news')
  return res.json()
}

// ── React Query keys ─────────────────────────────────────────

export const queryKeys = {
  games: ['games'] as const,
  tournaments: (status?: string) => ['tournaments', status] as const,
  leaderboard: (game?: string) => ['leaderboard', game] as const,
  news: ['news'] as const,
}
