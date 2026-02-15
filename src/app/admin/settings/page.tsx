'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Setting {
  id: string
  key: string
  value: string
}

const defaultSettings = [
  { key: 'company_name', label: 'Firmenname', placeholder: 'Deine Agentur GmbH' },
  { key: 'daily_lead_target', label: 'Tägliches Lead-Ziel', placeholder: '10', type: 'number' },
  { key: 'email_sender', label: 'E-Mail Absender', placeholder: 'team@agentur.de' },
  { key: 'email_signature', label: 'E-Mail Signatur', placeholder: 'Mit freundlichen Grüßen...', multiline: true },
  { key: 'demo_base_url', label: 'Demo Base URL', placeholder: 'https://demo.agentur.de' },
  { key: 'webhook_url', label: 'Webhook URL (optional)', placeholder: 'https://...' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        const settingsMap: Record<string, string> = {}
        data.forEach((s: Setting) => {
          settingsMap[s.key] = s.value
        })
        setSettings(settingsMap)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error('Fehler beim Speichern:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">⚙️ Einstellungen</h1>
          <p className="text-gray-400">Globale Konfiguration des Agentur-Portals</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
            <div className="space-y-6">
              {defaultSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {setting.label}
                  </label>
                  {setting.multiline ? (
                    <textarea
                      value={settings[setting.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
                      placeholder={setting.placeholder}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={setting.type || 'text'}
                      value={settings[setting.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                      placeholder={setting.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#2a2a3a] flex items-center justify-between">
              {saved && (
                <span className="text-green-400 text-sm flex items-center gap-2">
                  ✓ Einstellungen gespeichert
                </span>
              )}
              <div className="flex-1"></div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8 bg-[#12121a] border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ Gefahrenzone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Alle Aktivitäten löschen</p>
                <p className="text-sm text-gray-500">Entfernt alle Einträge aus dem Activity-Feed</p>
              </div>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors">
                Löschen
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Alle Tasks löschen</p>
                <p className="text-sm text-gray-500">Entfernt alle Tasks aus der Datenbank</p>
              </div>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors">
                Löschen
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
