import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const status = searchParams.get('status')
  const agentId = searchParams.get('agentId')

  const where: any = {}
  if (status) where.status = status
  if (agentId) where.agentId = agentId

  const tasks = await prisma.task.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        select: { name: true, agentId: true }
      }
    }
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { agentId, title, description, priority } = await req.json()

  if (!agentId || !title) {
    return NextResponse.json({ error: 'AgentID und Titel sind erforderlich' }, { status: 400 })
  }

  // Check if agent exists
  const agent = await prisma.agent.findUnique({ where: { agentId } })
  if (!agent) {
    return NextResponse.json({ error: 'Agent nicht gefunden' }, { status: 404 })
  }

  // Generate task ID
  const year = new Date().getFullYear()
  const count = await prisma.task.count({
    where: {
      taskId: { startsWith: `T-${year}` }
    }
  })
  const taskId = `T-${year}-${String(count + 1).padStart(3, '0')}`

  const task = await prisma.task.create({
    data: {
      taskId,
      agentId,
      title,
      description,
      priority: priority || 'normal',
      status: 'pending'
    }
  })

  return NextResponse.json({ id: task.id, taskId })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status, result } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
  }

  const updateData: any = {}
  
  if (status) {
    updateData.status = status
    if (status === 'active') {
      updateData.startedAt = new Date()
    } else if (status === 'done' || status === 'failed') {
      updateData.completedAt = new Date()
    }
  }
  
  if (result !== undefined) {
    updateData.result = result
  }

  await prisma.task.update({
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

  await prisma.task.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
