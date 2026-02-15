'use client'

interface Agent {
  id: string
  agentId: string
  name: string
  model: string
  status: string
  currentTask: string | null
  lastActive: string | null
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  ready: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  active: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  idle: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
}

const agentIcons: Record<string, string> = {
  boss: '👔',
  scout: '🔍',
  builder: '🛠️',
  outreach: '📧',
  analyst: '📊',
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const colors = statusColors[agent.status] || statusColors.idle
  const icon = agentIcons[agent.agentId] || '🤖'

  const formatLastActive = (date: string | null) => {
    if (!date) return 'Noch nie'
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `vor ${minutes} Min.`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `vor ${hours} Std.`
    return d.toLocaleDateString('de-DE')
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 hover:border-[#3a3a4a] transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.model}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${colors.bg} ${colors.text}`}>
          <span className={`w-2 h-2 rounded-full ${colors.dot} ${agent.status === 'active' ? 'animate-pulse' : ''}`}></span>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>
      
      {agent.currentTask && (
        <div className="mb-4 p-3 bg-[#0a0a0f] rounded-lg">
          <p className="text-sm text-gray-400">
            <span className="text-gray-500">Aktuelle Aufgabe:</span><br />
            <span className="text-white">{agent.currentTask}</span>
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Letzte Aktivität</span>
        <span className="text-gray-400">{formatLastActive(agent.lastActive)}</span>
      </div>
    </div>
  )
}
