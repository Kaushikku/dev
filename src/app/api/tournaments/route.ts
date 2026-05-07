import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const game = searchParams.get('game')
    const region = searchParams.get('region')
    const sort = searchParams.get('sort') || 'Latest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const gameId = searchParams.get('gameId')

    const where: any = {}

    if (gameId) {
      where.gameId = gameId
    } else if (game) {
      where.game = { slug: game.toLowerCase() }
    }

    if (status && status !== 'All') {
      if (status === 'live') {
        where.status = { in: ['ONGOING', 'REGISTRATION_OPEN', 'UPCOMING'] }
      } else {
        where.status = status.toUpperCase()
      }
    }

    if (region && region !== 'All') {
      where.region = region.toUpperCase()
    }

    const orderBy: any =
      sort === 'Prize Pool' ? { prizePool: 'desc' } :
      sort === 'Most Teams' ? { registeredTeams: 'desc' } :
      { startDate: 'desc' }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy,
        select: {
          id: true,
          title: true,
          prizePool: true,
          currency: true,
          entryFee: true,
          status: true,
          format: true,
          startDate: true,
          endDate: true,
          registrationDeadline: true,
          maxTeams: true,
          registeredTeams: true,
          bannerImage: true,
          region: true,
          game: { select: { name: true, logo: true, themeColor: true, slug: true } },
          org: { select: { orgName: true, logo: true } },
        },
      }),
      prisma.tournament.count({ where }),
    ])

    return NextResponse.json({ tournaments, total, page, limit })
  } catch (error) {
    console.error('[API/TOURNAMENTS]', error)
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
  }
}
