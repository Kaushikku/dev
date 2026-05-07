import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') ?? '6')

    const where: any = {}
    if (status === 'live') {
      where.status = { in: ['ONGOING', 'REGISTRATION_OPEN', 'UPCOMING'] }
    } else if (status) {
      where.status = status.toUpperCase()
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      take: limit,
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        title: true,
        prizePool: true,
        currency: true,
        status: true,
        startDate: true,
        registrationDeadline: true,
        maxTeams: true,
        registeredTeams: true,
        bannerImage: true,
        region: true,
        game: {
          select: { name: true, logo: true, themeColor: true, slug: true },
        },
      },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('[API/TOURNAMENTS]', error)
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
  }
}
