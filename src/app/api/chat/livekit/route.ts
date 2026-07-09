import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { roomId } = await req.json()

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      // Return mock token for development without LiveKit
      return NextResponse.json({
        token: 'mock-livekit-token',
        url: 'wss://mock.livekit.io',
        warning: 'LiveKit not configured. Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to .env',
      })
    }

    // Dynamic import to avoid build errors if package not installed
    const { AccessToken } = await import('livekit-server-sdk')

    const token = new AccessToken(apiKey, apiSecret, {
      identity: session.user.id,
      name: session.user.name || session.user.id,
    })

    token.addGrant({
      roomJoin: true,
      room: `nexusgg-${roomId}`,
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      token: await token.toJwt(),
      url: process.env.LIVEKIT_URL || 'wss://your-project.livekit.cloud',
    })
  } catch (error) {
    console.error('[LIVEKIT TOKEN]', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
