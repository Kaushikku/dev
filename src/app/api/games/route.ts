import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        themeColor: true,
        accentColor: true,
        logo: true,
        banner: true,
        platform: true,
        genre: true,
        _count: { select: { playerStats: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error('[API/GAMES]', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
