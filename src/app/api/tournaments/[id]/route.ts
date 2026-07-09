import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        game: { select: { name: true, slug: true, themeColor: true, logo: true } },
        org: { select: { orgName: true, logo: true } },
        teams: {
          include: { team: { select: { name: true, id: true, tag: true } } },
          orderBy: { registeredAt: 'asc' },
        },
        matches: {
          include: {
            team1: { select: { id: true, name: true, tag: true } },
            team2: { select: { id: true, name: true, tag: true } },
          },
          orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('[API/TOURNAMENTS/ID]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}