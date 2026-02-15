'use client'

interface Task {
  id: string
  taskId: string
  title: string
  status: string
  priority: string
  agent: {
    name: string
    agentId: string
  }
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ausstehend', color: 'bg-gray-500/20 text-gray-400' },
  active: { label: 'Aktiv', color: 'bg-blue-500/20 text-blue-400' },
  done: { label: 'Erledigt', color: 'bg-green-500/20 text-green-400' },
  failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-400' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Niedrig', color: 'text-gray-500' },
  normal: { label: 'Normal', color: 'text-gray-400' },
  high: { label: 'Hoch', color: 'text-orange-400' },
}

const agentIcons: Record<string, string> = {
  boss: '👔',
  scout: '🔍',
  builder: '🛠️',
  outreach: '📧',
  analyst: '📊',
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📝 Aufgaben</h3>
        <p className="text-gray-500 text-center py-8">Keine Aufgaben vorhanden</p>
      </div>
    )
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📝 Aufgaben</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {tasks.map((task) => {
          const status = statusConfig[task.status] || statusConfig.pending
          const priority = priorityConfig[task.priority] || priorityConfig.normal
          const icon = agentIcons[task.agent.agentId] || '🤖'

          return (
            <div
              key={task.id}
              className="p-4 bg-[#0a0a0f] rounded-lg hover:bg-[#15151f] transition-colors animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-gray-500">{task.taskId}</span>
                      <span className="text-gray-600">•</span>
                      <span className={priority.color}>{priority.label}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
