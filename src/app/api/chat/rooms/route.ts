import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chat/rooms — list my rooms
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const memberships = await prisma.chatMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            members: {
              include: { user: { select: { id: true, username: true, avatar: true } } },
            },
            messages: {
              orderBy: { sentAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    const rooms = await Promise.all(
      memberships.map(async m => ({
        id: m.room.id,
        name: m.room.name,
        type: m.room.type,
        myRole: m.role,
        members: m.room.members.map(mem => ({
          id: mem.user.id,
          username: mem.user.username,
          avatar: mem.user.avatar,
          role: mem.role,
        })),
        lastMessage: m.room.messages[0] || null,
        unreadCount: m.lastReadAt
          ? await prisma.message.count({
              where: { roomId: m.room.id, sentAt: { gt: m.lastReadAt }, senderId: { not: session.user.id } },
            })
          : 0,
      })),
    )

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('[API/CHAT/ROOMS GET]', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST /api/chat/rooms — create room
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, type, inviteUsernames } = await req.json()

    const room = await prisma.chatRoom.create({
      data: {
        name: name || null,
        type: type || 'PRIVATE',
        createdById: session.user.id,
        isEncrypted: true,
        members: {
          create: [
            { userId: session.user.id, role: 'OWNER' },
          ],
        },
      },
    })

    // Invite other users
    if (inviteUsernames?.length > 0) {
      const users = await prisma.user.findMany({
        where: { username: { in: inviteUsernames } },
      })
      for (const user of users) {
        await prisma.chatMember.create({
          data: { roomId: room.id, userId: user.id, role: 'MEMBER' },
        })
      }
    }

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('[API/CHAT/ROOMS POST]', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
