import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agents = await prisma.agent.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          tasks: true,
          activities: true
        }
      }
    }
  })

  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { agentId, name, model, status } = await req.json()

  if (!agentId || !name || !model) {
    return NextResponse.json({ error: 'AgentID, Name und Model sind erforderlich' }, { status: 400 })
  }

  // Check if agentId already exists
  const existing = await prisma.agent.findUnique({ where: { agentId } })
  if (existing) {
    return NextResponse.json({ error: 'Agent mit dieser ID existiert bereits' }, { status: 400 })
  }

  const agent = await prisma.agent.create({
    data: {
      agentId,
      name,
      model,
      status: status || 'ready',
    }
  })

  return NextResponse.json({ id: agent.id })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, name, model, status, currentTask } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
  }

  await prisma.agent.update({
    where: { id },
    data: {
      name,
      model,
      status,
      currentTask,
      lastActive: status === 'active' ? new Date() : undefined
    }
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

  // First get the agent to get the agentId
  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) {
    return NextResponse.json({ error: 'Agent nicht gefunden' }, { status: 404 })
  }

  // Delete related tasks and activities first
  await prisma.task.deleteMany({ where: { agentId: agent.agentId } })
  await prisma.activity.deleteMany({ where: { agentId: agent.agentId } })
  
  // Then delete the agent
  await prisma.agent.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
