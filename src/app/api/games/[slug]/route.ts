import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.slug },
      include: {
        subSections: true,
        _count: {
          select: {
            tournaments: true,
            playerStats: true,
            articles: true,
            clips: true,
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('[API/GAMES/SLUG]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
