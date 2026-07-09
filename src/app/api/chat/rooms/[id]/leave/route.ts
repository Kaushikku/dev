import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.chatMember.delete({
      where: { roomId_userId: { roomId: params.id, userId: session.user.id } },
    })

    return NextResponse.json({ message: 'Left room' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 })
  }
}