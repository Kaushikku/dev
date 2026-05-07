import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '3')

    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        views: true,
        game: { select: { name: true, slug: true, themeColor: true } },
        author: { select: { username: true, avatar: true } },
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('[API/NEWS]', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
