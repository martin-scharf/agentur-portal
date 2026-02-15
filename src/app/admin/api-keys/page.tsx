'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface ApiKey {
  id: string
  name: string
  service: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
  keyPreview?: string
}

const serviceIcons: Record<string, string> = {
  openai: '🧠',
  anthropic: '🤖',
  brave: '🔍',
  resend: '📧',
  neon: '🗄️',
  vercel: '▲',
  github: '🐙',
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [formData, setFormData] = useState({ name: '', service: '', key: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/admin/api-keys')
      const data = await res.json()
      setApiKeys(data)
    } catch (e) {
      console.error('Fehler beim Laden:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const method = editingKey ? 'PUT' : 'POST'
      const body = editingKey 
        ? { id: editingKey.id, ...formData }
        : formData

      const res = await fetch('/api/admin/api-keys', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setShowModal(false)
      setEditingKey(null)
      setFormData({ name: '', service: '', key: '' })
      fetchKeys()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('API-Key wirklich löschen?')) return

    try {
      await fetch('/api/admin/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchKeys()
    } catch (e) {
      console.error('Fehler beim Löschen:', e)
    }
  }

  const handleToggleActive = async (key: ApiKey) => {
    try {
      await fetch('/api/admin/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key.id, isActive: !key.isActive })
      })
      fetchKeys()
    } catch (e) {
      console.error('Fehler beim Aktualisieren:', e)
    }
  }

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key)
    setFormData({ name: key.name, service: key.service, key: '' })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingKey(null)
    setFormData({ name: '', service: '', key: '' })
    setShowModal(true)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🔑 API-Keys</h1>
            <p className="text-gray-400">Verwalte API-Schlüssel für externe Dienste</p>
          </div>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors"
          >
            + Neuer Key
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">Noch keine API-Keys hinterlegt</p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors"
            >
              Ersten Key anlegen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{serviceIcons[key.service] || '🔐'}</span>
                    <div>
                      <h3 className="font-semibold text-white">{key.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-gray-500">{key.service}</span>
                        {key.keyPreview && (
                          <>
                            <span className="text-gray-600">•</span>
                            <code className="text-gray-400 bg-[#0a0a0f] px-2 py-0.5 rounded">
                              {key.keyPreview}
                            </code>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        key.isActive
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {key.isActive ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <button
                      onClick={() => openEditModal(key)}
                      className="p-2 hover:bg-[#1a1a2a] rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingKey ? 'API-Key bearbeiten' : 'Neuer API-Key'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                    placeholder="z.B. OpenAI Production"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                    required
                  >
                    <option value="">Service wählen...</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="brave">Brave Search</option>
                    <option value="resend">Resend</option>
                    <option value="neon">Neon DB</option>
                    <option value="vercel">Vercel</option>
                    <option value="github">GitHub</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API-Key {editingKey && '(leer lassen um beizubehalten)'}
                  </label>
                  <input
                    type="password"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                    placeholder="sk-..."
                    required={!editingKey}
                  />
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
