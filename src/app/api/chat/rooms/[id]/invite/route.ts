import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { username } = await req.json()
    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const existing = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId: target.id } },
    })
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

    await prisma.chatMember.create({
      data: { roomId: params.id, userId: target.id, role: 'MEMBER' },
    })

    return NextResponse.json({ message: `${username} added to room` })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  }
}