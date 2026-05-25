import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: {
        playerProfile: {
          include: {
            stats: {
              include: { game: { select: { name: true, slug: true, themeColor: true } } },
            },
            achievements: true,
            teams: {
              include: {
                team: {
                  include: {
                    tournaments: {
                      include: {
                        tournament: {
                          select: {
                            id: true, title: true, startDate: true,
                            prizePool: true, currency: true,
                            game: { select: { name: true, slug: true, themeColor: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user || !user.playerProfile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Build tournament history
    const tournamentHistory: any[] = []
    user.playerProfile.teams.forEach(membership => {
      membership.team.tournaments.forEach(tt => {
        tournamentHistory.push({
          id: tt.tournament.id,
          title: tt.tournament.title,
          game: tt.tournament.game,
          date: tt.tournament.startDate,
          placement: tt.placement,
          prizeWon: tt.prizeWon,
          team: membership.team.name,
          status: tt.status,
        })
      })
    })

    // Calculate totals
    const totalEarned = tournamentHistory.reduce((sum, t) => sum + (parseFloat(t.prizeWon || '0')), 0)
    const totalTournaments = tournamentHistory.length

    return NextResponse.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      region: user.region,
      accountType: user.accountType,
      createdAt: user.createdAt,
      playerProfile: {
        id: user.playerProfile.id,
        ign: user.playerProfile.ign,
        country: user.playerProfile.country,
        rank: user.playerProfile.rank,
        mainGame: user.playerProfile.mainGame,
        secondaryGames: user.playerProfile.secondaryGames,
        gameIds: user.playerProfile.gameIds,
        stats: user.playerProfile.stats,
        achievements: user.playerProfile.achievements,
      },
      tournamentHistory: tournamentHistory.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      totalEarned,
      totalTournaments,
    })
  } catch (error) {
    console.error('[API/PROFILE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const body = await req.json()
    const { bio, avatar, mainGame, ign, rank, gameIds, secondaryGames } = body

    const user = await prisma.user.findUnique({ where: { username: params.username } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.user.update({
      where: { id: user.id },
      data: { bio: bio ?? undefined, avatar: avatar ?? undefined },
    })

    if (user.accountType === 'PLAYER') {
      await prisma.playerProfile.update({
        where: { userId: user.id },
        data: {
          ign: ign ?? undefined,
          rank: rank ?? undefined,
          mainGame: mainGame ?? undefined,
          gameIds: gameIds ?? undefined,
          secondaryGames: secondaryGames ?? undefined,
        },
      })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('[API/PROFILE/PATCH]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
