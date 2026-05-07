import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameSlug = searchParams.get('game') ?? 'all'
    const limit = parseInt(searchParams.get('limit') ?? '5')

    const where: any = {}
    if (gameSlug !== 'all') {
      where.game = { slug: gameSlug }
    }

    const stats = await prisma.playerStat.findMany({
      where,
      take: limit,
      orderBy: { tournamentPoints: 'desc' },
      select: {
        tournamentPoints: true,
        kdRatio: true,
        winRate: true,
        game: { select: { name: true, slug: true, themeColor: true } },
        playerProfile: {
          select: {
            ign: true,
            user: { select: { username: true, avatar: true } },
          },
        },
      },
    })

    const leaderboard = stats.map((s, i) => ({
      rank: i + 1,
      username: s.playerProfile.ign || s.playerProfile.user.username,
      avatar: s.playerProfile.user.avatar,
      game: s.game.name,
      gameSlug: s.game.slug,
      gameColor: s.game.themeColor,
      tournamentPoints: s.tournamentPoints,
      kdRatio: s.kdRatio,
      winRate: s.winRate,
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('[API/LEADERBOARD]', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
