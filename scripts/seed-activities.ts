import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedActivities() {
  console.log('🌱 Seeding activities...')

  // Hole alle Agenten
  const agents = await prisma.agent.findMany()
  
  if (agents.length === 0) {
    console.log('⚠️  Keine Agenten gefunden. Erstelle zuerst Agenten!')
    return
  }

  // Lösche alte Test-Aktivitäten (optional)
  await prisma.activity.deleteMany()

  const now = new Date()
  const activities = [
    {
      agentId: 'builder',
      action: 'completed_task',
      description: 'Lead-Übersicht umgebaut und optimiert',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000) // vor 5 min
    },
    {
      agentId: 'boss',
      action: 'completed_task',
      description: 'Template-Bilder für 3 Leads generiert',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000) // vor 10 min
    },
    {
      agentId: 'builder',
      action: 'completed_task',
      description: '5 Website-Templates neu designed',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000) // vor 30 min
    },
    {
      agentId: 'scout',
      action: 'lead_found',
      description: '2 neue Leads in Frankfurt gefunden',
      createdAt: new Date(now.getTime() - 45 * 60 * 1000) // vor 45 min
    },
    {
      agentId: 'boss',
      action: 'started_task',
      description: 'Email-Kampagne für 5 Leads gestartet',
      createdAt: new Date(now.getTime() - 60 * 60 * 1000) // vor 1h
    },
    {
      agentId: 'builder',
      action: 'demo_created',
      description: 'Demo-Website für Bäckerei Müller erstellt',
      createdAt: new Date(now.getTime() - 90 * 60 * 1000) // vor 1.5h
    },
    {
      agentId: 'scout',
      action: 'lead_found',
      description: 'Lead qualifiziert: Restaurant "Zum Löwen"',
      createdAt: new Date(now.getTime() - 120 * 60 * 1000) // vor 2h
    },
    {
      agentId: 'boss',
      action: 'email_sent',
      description: '3 Follow-up Emails versendet',
      createdAt: new Date(now.getTime() - 180 * 60 * 1000) // vor 3h
    },
    {
      agentId: 'builder',
      action: 'api_call',
      description: 'OpenAI API für Logo-Generierung genutzt',
      createdAt: new Date(now.getTime() - 240 * 60 * 1000) // vor 4h
    },
    {
      agentId: 'scout',
      action: 'completed_task',
      description: 'Google Maps Scraping: 15 Leads gefunden',
      createdAt: new Date(now.getTime() - 300 * 60 * 1000) // vor 5h
    },
  ]

  // Filter nur existierende Agenten
  const existingAgentIds = new Set(agents.map(a => a.agentId))
  const validActivities = activities.filter(a => existingAgentIds.has(a.agentId))

  // Füge Aktivitäten ein
  for (const activity of validActivities) {
    await prisma.activity.create({
      data: activity
    })
  }

  console.log(`✅ ${validActivities.length} Aktivitäten eingefügt!`)
}

seedActivities()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
