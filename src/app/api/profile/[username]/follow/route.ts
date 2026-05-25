import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const target = await prisma.user.findUnique({ where: { username: params.username } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === session.user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

    // Check if already following — use notifications table as follow tracker for now
    const existing = await prisma.notification.findFirst({
      where: {
        userId: target.id,
        type: 'SYSTEM',
        body: `follow:${session.user.id}`,
      },
    })

    if (existing) {
      await prisma.notification.delete({ where: { id: existing.id } })
      return NextResponse.json({ following: false, message: 'Unfollowed' })
    }

    await prisma.notification.create({
      data: {
        userId: target.id,
        type: 'SYSTEM',
        title: 'New Follower',
        body: `follow:${session.user.id}`,
        actionUrl: `/profile/${session.user.name}`,
      },
    })

    return NextResponse.json({ following: true, message: 'Following' })
  } catch (error) {
    console.error('[API/FOLLOW]', error)
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
  }
}
