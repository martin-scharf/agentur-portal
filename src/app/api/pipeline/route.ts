import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: any = {}
  if (status) where.status = status

  const leads = await prisma.lead.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  // Get pipeline stats
  const stats = await prisma.lead.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  return NextResponse.json({
    leads,
    stats: stats.map(s => ({
      status: s.status,
      count: s._count.status
    }))
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const { firma, branche, adresse, telefon, email, website, priority } = data

  if (!firma || !branche) {
    return NextResponse.json({ error: 'Firma und Branche sind erforderlich' }, { status: 400 })
  }

  // Generate lead ID
  const year = new Date().getFullYear()
  const count = await prisma.lead.count({
    where: {
      leadId: { startsWith: `L-${year}` }
    }
  })
  const leadId = `L-${year}-${String(count + 1).padStart(3, '0')}`

  const lead = await prisma.lead.create({
    data: {
      leadId,
      firma,
      branche,
      adresse,
      telefon,
      email,
      website,
      status: 'neu',
      priority: priority || 'normal'
    }
  })

  return NextResponse.json({ id: lead.id, leadId })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...updateData } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
  }

  await prisma.lead.update({
    where: { id },
    data: updateData
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
  }

  await prisma.lead.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
