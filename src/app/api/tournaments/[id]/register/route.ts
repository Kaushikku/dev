import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { teamName } = await req.json()
    if (!teamName?.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: { teams: true },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Validation checks
    if (tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'UPCOMING') {
      return NextResponse.json({ error: 'Registration is not open for this tournament' }, { status: 400 })
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 })
    }

    if (tournament.registrationDeadline && new Date(tournament.registrationDeadline) < new Date()) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 })
    }

    // Get player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!playerProfile) {
      return NextResponse.json({ error: 'Player profile not found. Please complete your profile first.' }, { status: 400 })
    }

    // Find or create a team
    let team = await prisma.team.findFirst({
      where: { name: teamName.trim(), gameId: tournament.gameId },
    })

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: teamName.trim(),
          tag: teamName.trim().substring(0, 4).toUpperCase(),
          gameId: tournament.gameId,
          region: tournament.region,
        },
      })

      // Add player as team member
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          playerProfileId: playerProfile.id,
          role: 'IGL',
        },
      })
    }

    // Check if team already registered
    const existing = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: params.id, teamId: team.id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'This team is already registered for this tournament' }, { status: 400 })
    }

    // Register team
    await prisma.$transaction([
      prisma.tournamentTeam.create({
        data: {
          tournamentId: params.id,
          teamId: team.id,
          status: 'PENDING',
        },
      }),
      prisma.tournament.update({
        where: { id: params.id },
        data: { registeredTeams: { increment: 1 } },
      }),
      prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'TOURNAMENT_UPDATE',
          title: 'Registration Successful!',
          body: `Your team "${team.name}" has been registered for ${tournament.title}. Good luck!`,
          actionUrl: `/tournaments/${params.id}`,
        },
      }),
    ])

    return NextResponse.json({
      message: 'Registration successful!',
      teamName: team.name,
      status: 'PENDING',
    })
  } catch (error) {
    console.error('[API/TOURNAMENTS/REGISTER]', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
