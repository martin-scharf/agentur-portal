import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.setting.findMany()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await req.json()

  // Upsert each setting
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'string') {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    }
  }

  return NextResponse.json({ success: true })
}
