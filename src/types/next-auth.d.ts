import { AccountType } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      accountType: AccountType
    } & DefaultSession['user']
  }
}
