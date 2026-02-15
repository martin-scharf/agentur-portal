'use client'

interface PipelineStage {
  status: string
  count: number
  label: string
  color: string
}

interface PipelineData {
  stages: PipelineStage[]
  totalLeads: number
}

const stageConfig: Record<string, { label: string; color: string; icon: string }> = {
  neu: { label: 'Neu', color: 'bg-gray-500', icon: '🆕' },
  recherche: { label: 'Recherche', color: 'bg-blue-500', icon: '🔍' },
  demo_erstellt: { label: 'Demo erstellt', color: 'bg-purple-500', icon: '🖥️' },
  kontaktiert: { label: 'Kontaktiert', color: 'bg-yellow-500', icon: '📧' },
  antwort: { label: 'Antwort', color: 'bg-green-500', icon: '💬' },
  termin: { label: 'Termin', color: 'bg-emerald-500', icon: '📅' },
  abgeschlossen: { label: 'Abgeschlossen', color: 'bg-emerald-600', icon: '✅' },
  verloren: { label: 'Verloren', color: 'bg-red-500', icon: '❌' },
}

export default function PipelineOverview({ data }: { data: PipelineData }) {
  if (!data || data.totalLeads === 0) {
    return (
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Pipeline</h3>
        <p className="text-gray-500 text-center py-8">Keine Leads in der Pipeline</p>
      </div>
    )
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">🎯 Pipeline</h3>
        <span className="text-sm text-gray-400">{data.totalLeads} Leads gesamt</span>
      </div>
      
      <div className="space-y-4">
        {data.stages.map((stage) => {
          const config = stageConfig[stage.status] || { label: stage.status, color: 'bg-gray-500', icon: '📌' }
          const percentage = data.totalLeads > 0 ? (stage.count / data.totalLeads) * 100 : 0
          
          return (
            <div key={stage.status} className="animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span className="text-sm text-gray-300">{config.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{stage.count}</span>
              </div>
              <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
