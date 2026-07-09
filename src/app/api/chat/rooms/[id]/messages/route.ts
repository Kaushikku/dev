import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify membership
    const member = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId: session.user.id } },
    })
    if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = 50

    const messages = await prisma.message.findMany({
      where: { roomId: params.id, isDeleted: false },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    })

    // Update lastRead
    await prisma.chatMember.update({
      where: { roomId_userId: { roomId: params.id, userId: session.user.id } },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    })
  } catch (error) {
    console.error('[API/MESSAGES GET]', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const member = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId: session.user.id } },
    })
    if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { content, type } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

    const message = await prisma.message.create({
      data: {
        roomId: params.id,
        senderId: session.user.id,
        contentEncrypted: content, // content arrives pre-encrypted from client
        type: type || 'TEXT',
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('[API/MESSAGES POST]', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
