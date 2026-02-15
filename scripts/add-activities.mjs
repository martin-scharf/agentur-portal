import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const activities = [
  {
    agentId: 'builder',
    action: '6 Branchen-Templates redesigned',
    metadata: { category: 'development', templates: 6 }
  },
  {
    agentId: 'builder',
    action: 'KI-Bilder für alle Templates generiert',
    metadata: { category: 'design', ai: true }
  },
  {
    agentId: 'builder',
    action: 'Lead-Übersicht mit Freigabe-Workflow eingebaut',
    metadata: { category: 'feature', feature: 'lead-approval' }
  },
  {
    agentId: 'boss',
    action: '2 Leads recherchiert: Schmidt Zimmerei, Tieben Bedachungen',
    metadata: { category: 'research', leads: 2 }
  },
  {
    agentId: 'builder',
    action: 'Demo-Websites für Leads erstellt',
    metadata: { category: 'development', type: 'demos' }
  },
  {
    agentId: 'builder',
    action: 'Email-Templates überarbeitet, Absender: Jeanette',
    metadata: { category: 'content', type: 'email-templates' }
  }
]

async function main() {
  console.log('🚀 Füge echte Bot-Aktivitäten hinzu...')
  
  // Stelle sicher, dass Agenten existieren
  const agents = ['boss', 'builder', 'scout', 'comms']
  const agentNames = {
    boss: 'Boss',
    builder: 'Builder',
    scout: 'Scout',
    comms: 'Comms'
  }

  for (const agentId of agents) {
    const existing = await prisma.agent.findUnique({ where: { agentId } })
    if (!existing) {
      await prisma.agent.create({
        data: {
          agentId,
          name: agentNames[agentId],
          model: 'claude-sonnet-4',
          status: 'active',
          lastActive: new Date()
        }
      })
      console.log(`✅ Agent ${agentId} erstellt`)
    }
  }

  // Füge Activities hinzu
  for (const activity of activities) {
    const created = await prisma.activity.create({
      data: {
        agentId: activity.agentId,
        action: 'completed_task',
        description: activity.action,
        metadata: JSON.stringify(activity.metadata),
        createdAt: new Date() // Heute
      }
    })
    console.log(`✅ Activity: ${activity.action}`)
  }

  // Update lastActive für alle Agenten
  await prisma.agent.updateMany({
    where: { agentId: { in: ['boss', 'builder'] } },
    data: { lastActive: new Date() }
  })

  console.log('🎉 Fertig! Alle Activities eingetragen.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
