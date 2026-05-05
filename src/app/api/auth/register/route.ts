import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AccountType } from '@prisma/client'

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.enum(['PLAYER', 'ORG', 'CREATOR']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, accountType } = registerSchema.parse(body)

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? 'Email already in use' : 'Username already taken' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create user + profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          accountType: accountType as AccountType,
        },
      })

      // Create wallet and subscription for every user
      await tx.wallet.create({ data: { userId: newUser.id } })
      await tx.subscription.create({ data: { userId: newUser.id } })

      // Create account-type specific profile
      if (accountType === 'PLAYER') {
        await tx.playerProfile.create({
          data: { userId: newUser.id, ign: username },
        })
      } else if (accountType === 'ORG') {
        await tx.orgProfile.create({
          data: {
            userId: newUser.id,
            orgName: username,
            slug: username.toLowerCase().replace(/\s+/g, '-'),
          },
        })
      } else if (accountType === 'CREATOR') {
        await tx.creatorProfile.create({
          data: { userId: newUser.id },
        })
      }

      return newUser
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          accountType: user.accountType,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
