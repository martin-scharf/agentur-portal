import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portal.local' },
    update: {},
    create: {
      email: 'admin@portal.local',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create default agents
  const agents = [
    { agentId: 'boss', name: 'Boss Agent', model: 'gpt-4', status: 'ready' },
    { agentId: 'scout', name: 'Scout Agent', model: 'gpt-4-turbo', status: 'ready' },
    { agentId: 'builder', name: 'Builder Agent', model: 'claude-3-sonnet', status: 'ready' },
    { agentId: 'outreach', name: 'Outreach Agent', model: 'gpt-4', status: 'idle' },
    { agentId: 'analyst', name: 'Analyst Agent', model: 'gpt-4-turbo', status: 'ready' },
  ]

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { agentId: agent.agentId },
      update: {},
      create: agent
    })
  }
  console.log('✅ Default agents created')

  // Create some initial settings
  const settings = [
    { key: 'company_name', value: 'Demo Agentur' },
    { key: 'daily_lead_target', value: '10' },
    { key: 'email_sender', value: 'team@demo-agentur.de' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }
  console.log('✅ Default settings created')

  // Create sample activities
  const sampleActivities = [
    { agentId: 'boss', action: 'started_task', description: 'Tägliche Analyse gestartet' },
    { agentId: 'scout', action: 'lead_found', description: 'Neuer Lead gefunden: Muster GmbH' },
    { agentId: 'builder', action: 'demo_created', description: 'Demo-Website für ABC Corp erstellt' },
  ]

  for (const activity of sampleActivities) {
    await prisma.activity.create({
      data: activity
    })
  }
  console.log('✅ Sample activities created')

  console.log('\n🎉 Seeding complete!')
  console.log('📧 Login: admin@portal.local')
  console.log('🔑 Password: admin123!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
