import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'
import AgentCard from '@/components/AgentCard'
import ActivityFeed from '@/components/ActivityFeed'
import PipelineOverview from '@/components/PipelineOverview'
import TaskList from '@/components/TaskList'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getAgents() {
  return prisma.agent.findMany({
    orderBy: { name: 'asc' }
  })
}

async function getActivities() {
  return prisma.activity.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true } } }
  })
}

async function getTasks() {
  return prisma.task.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true, agentId: true } } }
  })
}

async function getPipelineData() {
  const leads = await prisma.lead.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const totalLeads = leads.reduce((sum, l) => sum + l._count.status, 0)
  
  const stages = leads.map(l => ({
    status: l.status,
    count: l._count.status,
    label: l.status,
    color: ''
  }))

  return { stages, totalLeads }
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  const [agents, activities, tasks, pipelineData] = await Promise.all([
    getAgents(),
    getActivities(),
    getTasks(),
    getPipelineData()
  ])

  const stats = {
    activeAgents: agents.filter(a => a.status === 'active' || a.status === 'ready').length,
    totalAgents: agents.length,
    activeTasks: tasks.filter(t => t.status === 'active' || t.status === 'pending').length,
    completedToday: tasks.filter(t => {
      const today = new Date().toDateString()
      return t.status === 'done' && new Date(t.completedAt || t.createdAt).toDateString() === today
    }).length
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Willkommen zurück! 👋
          </h1>
          <p className="text-gray-400">
            Hier ist der aktuelle Status deines Agentur-Systems.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🤖</span>
              <span className="text-gray-400 text-sm">Aktive Agenten</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.activeAgents}<span className="text-gray-500 text-lg">/{stats.totalAgents}</span>
            </p>
          </div>
          
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📋</span>
              <span className="text-gray-400 text-sm">Offene Aufgaben</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeTasks}</p>
          </div>
          
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-400 text-sm">Heute erledigt</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.completedToday}</p>
          </div>
          
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-gray-400 text-sm">Leads in Pipeline</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{pipelineData.totalLeads}</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">🤖 Agenten-Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.length > 0 ? (
              agents.map((agent) => (
                <AgentCard key={agent.id} agent={{
                  ...agent,
                  lastActive: agent.lastActive?.toISOString() || null
                }} />
              ))
            ) : (
              <div className="col-span-full bg-[#12121a] border border-[#2a2a3a] rounded-xl p-8 text-center">
                <p className="text-gray-500">Keine Agenten konfiguriert. Füge Agenten in den Einstellungen hinzu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskList tasks={tasks.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString()
          }))} />
          
          <div className="space-y-6">
            <PipelineOverview data={pipelineData} />
            <ActivityFeed activities={activities.map(a => ({
              ...a,
              createdAt: a.createdAt.toISOString()
            }))} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
