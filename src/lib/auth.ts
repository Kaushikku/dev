import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Discord from 'next-auth/providers/discord'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          accountType: user.accountType,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.accountType = (user as any).accountType ?? 'PLAYER'
      }

      // Handle OAuth sign in — create user in DB if first time
      if (account && account.provider !== 'credentials' && user?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existing) {
          const username = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000)
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              username,
              accountType: 'PLAYER',
              avatar: user.image ?? null,
            },
          })
          await prisma.wallet.create({ data: { userId: newUser.id } })
          await prisma.subscription.create({ data: { userId: newUser.id } })
          await prisma.playerProfile.create({
            data: { userId: newUser.id, ign: username },
          })
          token.id = newUser.id
          token.accountType = 'PLAYER'
        } else {
          token.id = existing.id
          token.accountType = existing.accountType
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.accountType = token.accountType as any
      }
      return session
    },
  },
})
