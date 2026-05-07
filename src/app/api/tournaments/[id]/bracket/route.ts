import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: params.id },
      include: {
        team1: { select: { id: true, name: true, tag: true } },
        team2: { select: { id: true, name: true, tag: true } },
      },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
    })

    const formatted = matches.map(m => ({
      id: m.id,
      round: m.round,
      matchNumber: m.matchNumber || 1,
      team1: m.team1 ? { name: m.team1.name, tag: m.team1.tag } : null,
      team2: m.team2 ? { name: m.team2.name, tag: m.team2.tag } : null,
      team1Id: m.team1Id,
      team2Id: m.team2Id,
      winnerId: m.winnerId,
      score: m.score,
      status: m.status,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[API/TOURNAMENTS/BRACKET]', error)
    return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 })
  }
}
