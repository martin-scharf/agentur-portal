'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Agent {
  id: string
  agentId: string
  name: string
  model: string
  status: string
  currentTask: string | null
  lastActive: string | null
  createdAt: string
  _count?: {
    tasks: number
    activities: number
  }
}

const statusOptions = [
  { value: 'ready', label: 'Bereit', color: 'bg-green-500' },
  { value: 'active', label: 'Aktiv', color: 'bg-blue-500' },
  { value: 'idle', label: 'Idle', color: 'bg-yellow-500' },
  { value: 'error', label: 'Fehler', color: 'bg-red-500' },
]

const agentIcons: Record<string, string> = {
  boss: '👔',
  scout: '🔍',
  builder: '🛠️',
  outreach: '📧',
  analyst: '📊',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({ agentId: '', name: '', model: '', status: 'ready' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents')
      const data = await res.json()
      setAgents(data)
    } catch (e) {
      console.error('Fehler beim Laden:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const method = editingAgent ? 'PUT' : 'POST'
      const body = editingAgent 
        ? { id: editingAgent.id, ...formData }
        : formData

      const res = await fetch('/api/admin/agents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setShowModal(false)
      setEditingAgent(null)
      setFormData({ agentId: '', name: '', model: '', status: 'ready' })
      fetchAgents()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Agent wirklich löschen? Alle zugehörigen Tasks und Aktivitäten werden ebenfalls gelöscht.')) return

    try {
      await fetch('/api/admin/agents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchAgents()
    } catch (e) {
      console.error('Fehler beim Löschen:', e)
    }
  }

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({ 
      agentId: agent.agentId, 
      name: agent.name, 
      model: agent.model, 
      status: agent.status 
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingAgent(null)
    setFormData({ agentId: '', name: '', model: 'gpt-4', status: 'ready' })
    setShowModal(true)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Nie'
    return new Date(date).toLocaleString('de-DE')
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🤖 Agenten</h1>
            <p className="text-gray-400">Verwalte KI-Agenten und deren Status</p>
          </div>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors"
          >
            + Neuer Agent
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">Noch keine Agenten konfiguriert</p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors"
            >
              Ersten Agent anlegen
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => {
              const statusOption = statusOptions.find(s => s.value === agent.status) || statusOptions[0]
              const icon = agentIcons[agent.agentId] || '🤖'
              
              return (
                <div
                  key={agent.id}
                  className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 hover:border-[#3a3a4a] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{icon}</span>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1.5 ${statusOption.color}/20 text-white`}>
                            <span className={`w-2 h-2 rounded-full ${statusOption.color}`}></span>
                            {statusOption.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>ID: <code className="text-gray-400">{agent.agentId}</code></span>
                          <span>•</span>
                          <span>Model: <code className="text-gray-400">{agent.model}</code></span>
                          {agent._count && (
                            <>
                              <span>•</span>
                              <span>{agent._count.tasks} Tasks</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm mr-4">
                        <p className="text-gray-500">Letzte Aktivität</p>
                        <p className="text-gray-400">{formatDate(agent.lastActive)}</p>
                      </div>
                      <button
                        onClick={() => openEditModal(agent)}
                        className="p-2 hover:bg-[#1a1a2a] rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {agent.currentTask && (
                    <div className="mt-4 p-3 bg-[#0a0a0f] rounded-lg">
                      <p className="text-sm text-gray-400">
                        <span className="text-gray-500">Aktuelle Aufgabe:</span> {agent.currentTask}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingAgent ? 'Agent bearbeiten' : 'Neuer Agent'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Agent ID</label>
                  <input
                    type="text"
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                    placeholder="z.B. boss, scout, builder"
                    required
                    disabled={!!editingAgent}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                    placeholder="z.B. Boss Agent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                    required
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-[#1a1a2a] hover:bg-[#2a2a3a] text-white font-medium rounded-lg transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Speichern...' : 'Speichern'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
