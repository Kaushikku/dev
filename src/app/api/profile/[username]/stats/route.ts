import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const gameSlug = searchParams.get('game')

    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: { playerProfile: true },
    })

    if (!user?.playerProfile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const where: any = { playerProfileId: user.playerProfile.id }
    if (gameSlug) where.game = { slug: gameSlug }

    const stats = await prisma.playerStat.findMany({
      where,
      include: { game: { select: { name: true, slug: true, themeColor: true } } },
    })

    // Rank progression (mock data — real data would come from a rank_history table)
    const rankProgression = [
      { month: 'Jan', rank: 1800 },
      { month: 'Feb', rank: 1950 },
      { month: 'Mar', rank: 1870 },
      { month: 'Apr', rank: 2100 },
      { month: 'May', rank: 2250 },
    ]

    // Tournament placements breakdown
    const placements = await prisma.tournamentTeam.groupBy({
      by: ['placement'],
      where: {
        team: { members: { some: { playerProfileId: user.playerProfile.id } } },
        placement: { not: null },
      },
      _count: { placement: true },
    })

    const placementData = [
      { name: '1st', count: placements.find(p => p.placement === 1)?._count.placement || 0 },
      { name: '2nd', count: placements.find(p => p.placement === 2)?._count.placement || 0 },
      { name: '3rd', count: placements.find(p => p.placement === 3)?._count.placement || 0 },
      { name: 'Top 8', count: placements.filter(p => (p.placement || 0) > 3 && (p.placement || 0) <= 8).reduce((s, p) => s + p._count.placement, 0) },
    ]

    return NextResponse.json({ stats, rankProgression, placementData })
  } catch (error) {
    console.error('[API/PROFILE/STATS]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
