import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const agentId = searchParams.get('agentId')

  const where: any = {}
  if (agentId) {
    where.agentId = agentId
  }

  const activities = await prisma.activity.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        select: { name: true }
      }
    }
  })

  return NextResponse.json(activities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { agentId, action, description, metadata } = await req.json()

  if (!agentId || !action || !description) {
    return NextResponse.json({ error: 'AgentID, Action und Description sind erforderlich' }, { status: 400 })
  }

  // Check if agent exists
  const agent = await prisma.agent.findUnique({ where: { agentId } })
  if (!agent) {
    return NextResponse.json({ error: 'Agent nicht gefunden' }, { status: 404 })
  }

  const activity = await prisma.activity.create({
    data: {
      agentId,
      action,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null
    }
  })

  // Update agent's lastActive
  await prisma.agent.update({
    where: { agentId },
    data: { lastActive: new Date() }
  })

  return NextResponse.json({ id: activity.id })
}
