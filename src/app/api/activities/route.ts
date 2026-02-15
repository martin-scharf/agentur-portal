import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { agentId, action, metadata } = body

    // Validierung
    if (!agentId || !action) {
      return NextResponse.json(
        { error: 'agentId und action sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Agent existiert, falls nicht, erstelle ihn
    let agent = await prisma.agent.findUnique({
      where: { agentId }
    })

    if (!agent) {
      // Erstelle Agent falls nicht vorhanden
      const agentNames: Record<string, string> = {
        boss: 'Boss',
        builder: 'Builder',
        scout: 'Scout',
        comms: 'Comms'
      }

      agent = await prisma.agent.create({
        data: {
          agentId,
          name: agentNames[agentId] || agentId,
          model: 'claude-sonnet-4',
          status: 'active',
          lastActive: new Date()
        }
      })
    } else {
      // Update lastActive
      await prisma.agent.update({
        where: { agentId },
        data: { lastActive: new Date() }
      })
    }

    // Erstelle Activity
    const activity = await prisma.activity.create({
      data: {
        agentId,
        action: 'completed_task',
        description: action,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Activity creation error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Activity' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { agent: { select: { name: true } } }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Activities' },
      { status: 500 }
    )
  }
}
