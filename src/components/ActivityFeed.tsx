'use client'

interface Activity {
  id: string
  agentId: string
  action: string
  description: string
  createdAt: string
  agent: {
    name: string
  }
}

const actionIcons: Record<string, string> = {
  started_task: '▶️',
  completed_task: '✅',
  error: '❌',
  lead_found: '🎯',
  email_sent: '📧',
  demo_created: '🖥️',
  api_call: '🔗',
}

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Heute'
    if (d.toDateString() === yesterday.toDateString()) return 'Gestern'
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  if (activities.length === 0) {
    return (
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Aktivitäten</h3>
        <p className="text-gray-500 text-center py-8">Noch keine Aktivitäten vorhanden</p>
      </div>
    )
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📋 Aktivitäten</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#0a0a0f] rounded-lg animate-fade-in">
            <span className="text-xl flex-shrink-0">
              {actionIcons[activity.action] || '📌'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{activity.agent.name}</span>
                <span>•</span>
                <span>{formatDate(activity.createdAt)}</span>
                <span>{formatTime(activity.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
