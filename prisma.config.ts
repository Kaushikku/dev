import 'dotenv/config'
import path from 'path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.resolve(__dirname, './prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
})