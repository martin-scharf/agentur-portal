'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Lead = {
  id: string;
  leadId: string;
  firma: string;
  name?: string;
  branche?: string;
  adresse?: string;
  email?: string;
  telefon?: string;
  websiteUrl?: string;
  description?: string;
  status: string;
  demoUrl?: string;
  emailSubject?: string;
  emailBody?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Neu', color: 'bg-gray-100 text-gray-800' },
  DEMO_READY: { label: 'Demo erstellt', color: 'bg-blue-100 text-blue-800' },
  EMAIL_DRAFT: { label: 'Email bereit', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Freigegeben', color: 'bg-green-100 text-green-800' },
  SENT: { label: 'Gesendet', color: 'bg-purple-100 text-purple-800' },
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Action states
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Editable fields
  const [editEmail, setEditEmail] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string);
    }
  }, [params.id]);

  // Sync editable fields when lead changes
  useEffect(() => {
    if (lead) {
      setEditEmail(lead.email || '');
      setEditSubject(lead.emailSubject || '');
      setEditBody(lead.emailBody || '');
      setHasChanges(false);
    }
  }, [lead]);

  const fetchLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
      } else {
        alert('Lead nicht gefunden');
        router.push('/admin/leads');
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Demo-Website erstellen
  const handleCreateDemo = async () => {
    if (!lead) return;
    
    if (!confirm('Demo-Website für diesen Lead erstellen lassen?')) return;

    setCreatingDemo(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/create-demo`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Demo erstellt!\n\n${data.demoUrl}`);
        
        // Auto-generate email after demo is ready
        await handleGenerateEmail(lead.id);
        
        fetchLead(lead.id);
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Create demo failed:', error);
      alert('Fehler beim Erstellen der Demo');
    } finally {
      setCreatingDemo(false);
    }
  };

  // 2. Email-Entwurf generieren
  const handleGenerateEmail = async (leadId?: string) => {
    const id = leadId || lead?.id;
    if (!id) return;

    setGeneratingEmail(true);
    try {
      const res = await fetch(`/api/leads/${id}/generate-email`, {
        method: 'POST',
      });

      if (res.ok) {
        if (!leadId) {
          // Only show alert if manually triggered
          alert('✅ Email-Entwurf generiert!');
          fetchLead(id);
        }
      } else {
        const error = await res.json();
        console.error('Generate email error:', error.error);
      }
    } catch (error) {
      console.error('Generate email failed:', error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  // 3. Änderungen speichern
  const handleSaveChanges = async () => {
    if (!lead) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editEmail,
          emailSubject: editSubject,
          emailBody: editBody,
        }),
      });

      if (res.ok) {
        alert('✅ Änderungen gespeichert!');
        fetchLead(lead.id);
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // 4. Email freigeben & senden
  const handleSendEmail = async () => {
    if (!lead) return;
    
    if (!editEmail) {
      alert('❌ Bitte Email-Adresse eingeben!');
      return;
    }

    if (!confirm(`Email wirklich an ${editEmail} senden?`)) return;

    // Save any pending changes first
    if (hasChanges) {
      await handleSaveChanges();
    }

    setSending(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('✅ Email freigegeben und versendet!');
        fetchLead(lead.id);
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Send failed:', error);
      alert('Fehler beim Senden');
    } finally {
      setSending(false);
    }
  };

  // Track changes
  const handleEmailChange = (value: string) => {
    setEditEmail(value);
    setHasChanges(true);
  };

  const handleSubjectChange = (value: string) => {
    setEditSubject(value);
    setHasChanges(true);
  };

  const handleBodyChange = (value: string) => {
    setEditBody(value);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Lade Lead...</div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  const statusInfo = statusLabels[lead.status] || { label: lead.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/leads')}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Zurück zur Übersicht
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{lead.firma}</h1>
            <p className="text-gray-500">{lead.leadId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          {['NEW', 'DEMO_READY', 'EMAIL_DRAFT', 'SENT'].map((step, idx) => {
            const stepLabels: Record<string, string> = {
              NEW: '1. Neu',
              DEMO_READY: '2. Demo',
              EMAIL_DRAFT: '3. Email',
              SENT: '4. Gesendet',
            };
            const steps = ['NEW', 'DEMO_READY', 'EMAIL_DRAFT', 'APPROVED', 'SENT'];
            const currentIdx = steps.indexOf(lead.status);
            const stepIdx = steps.indexOf(step);
            const isActive = stepIdx <= currentIdx;
            const isCurrent = step === lead.status || (lead.status === 'APPROVED' && step === 'SENT');

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isActive
                      ? isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isActive && !isCurrent ? '✓' : idx + 1}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {stepLabels[step]}
                </span>
                {idx < 3 && (
                  <div className={`w-16 h-1 mx-4 rounded ${stepIdx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Firmenbeschreibung */}
      {lead.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-900">Über das Unternehmen</h2>
          <p className="text-gray-800 leading-relaxed">{lead.description}</p>
          {lead.branche && (
            <p className="mt-2 text-blue-700 font-medium">Branche: {lead.branche}</p>
          )}
        </div>
      )}

      {/* STEP 1: Website erstellen (nur bei NEW) */}
      {lead.status === 'NEW' && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 text-indigo-900">🚀 Demo-Website erstellen</h2>
          <p className="text-indigo-700 mb-4">
            Erstelle eine personalisierte Demo-Website für {lead.firma}. 
            Der BUILDER-Agent wird automatisch eine moderne, mobilfreundliche Website generieren.
          </p>
          <button
            onClick={handleCreateDemo}
            disabled={creatingDemo}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            {creatingDemo ? (
              <>
                <span className="animate-spin">⏳</span> Website wird erstellt...
              </>
            ) : (
              <>
                🏗️ Demo-Website erstellen lassen
              </>
            )}
          </button>
        </div>
      )}

      {/* Bestehende Website */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Bestehende Website</h2>
        {lead.websiteUrl ? (
          <div>
            <a
              href={lead.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              🌐 {lead.websiteUrl}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">🎯 Keine Website vorhanden</p>
            <p className="text-yellow-700 text-sm mt-1">Das ist unser Verkaufsargument! Wir helfen beim Aufbau einer professionellen Web-Präsenz.</p>
          </div>
        )}
      </div>

      {/* Demo-Website (wenn vorhanden) */}
      {lead.demoUrl && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">✨ Demo-Website</h2>
          <a
            href={lead.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🔗 {lead.demoUrl}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Kontaktdaten */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Kontaktdaten</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kontaktperson</label>
            <p className="mt-1 text-gray-900">{lead.name || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Firma</label>
            <p className="mt-1 text-gray-900">{lead.firma}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefon</label>
            <p className="mt-1 text-gray-900">{lead.telefon || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <p className="mt-1 text-gray-900">{lead.adresse || '—'}</p>
          </div>
        </div>
      </div>

      {/* STEP 3: Email-Bearbeitung (bei EMAIL_DRAFT oder später) */}
      {(lead.status === 'EMAIL_DRAFT' || lead.status === 'APPROVED') && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📧 Akquise-Email bearbeiten</h2>
            {hasChanges && (
              <span className="text-orange-600 text-sm font-medium">● Ungespeicherte Änderungen</span>
            )}
          </div>
          
          {/* Empfänger Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empfänger Email-Adresse *
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@beispiel.de"
            />
          </div>

          {/* Betreff */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
            <input
              type="text"
              value={editSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email-Betreff..."
            />
          </div>

          {/* Email Body */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht (HTML erlaubt)</label>
            <textarea
              value={editBody}
              onChange={(e) => handleBodyChange(e.target.value)}
              rows={15}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Email-Inhalt..."
            />
          </div>

          {/* Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorschau</label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-2 pb-2 border-b border-gray-200">
                <span className="text-gray-500 text-sm">An:</span> <span className="font-medium">{editEmail || '—'}</span>
              </div>
              <div className="mb-2 pb-2 border-b border-gray-200">
                <span className="text-gray-500 text-sm">Betreff:</span> <span className="font-medium">{editSubject || '—'}</span>
              </div>
              <div 
                className="prose max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: editBody.replace(/\n/g, '<br/>') || '<em class="text-gray-400">Kein Inhalt</em>' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveChanges}
              disabled={saving || !hasChanges}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ Speichert...' : '💾 Änderungen speichern'}
            </button>
          </div>
        </div>
      )}

      {/* Email-Vorschau (read-only für SENT) */}
      {lead.status === 'SENT' && lead.emailSubject && lead.emailBody && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📧 Gesendete Email</h2>
          
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <span className="text-gray-500 text-sm">An:</span> <span className="font-medium">{lead.email}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              {lead.emailSubject}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
            <div 
              className="p-4 bg-gray-50 rounded border border-gray-200 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: lead.emailBody.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>
      )}

      {/* STEP 4: Freigabe & Versand (bei EMAIL_DRAFT) */}
      {lead.status === 'EMAIL_DRAFT' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 text-green-900">✅ Email freigeben & senden</h2>
          <p className="text-green-700 mb-4">
            Prüfe den Email-Entwurf oben und passe ihn bei Bedarf an. 
            Nach der Freigabe wird die Email an <strong>{editEmail || 'keine Email'}</strong> gesendet.
          </p>
          <button
            onClick={handleSendEmail}
            disabled={sending || !editEmail || !editSubject || !editBody}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            {sending ? (
              <>
                <span className="animate-spin">⏳</span> Sende...
              </>
            ) : (
              <>
                📤 Email freigeben & senden
              </>
            )}
          </button>
          {!editEmail && (
            <p className="mt-2 text-red-600 text-sm">⚠️ Bitte Email-Adresse eingeben!</p>
          )}
        </div>
      )}

      {/* Erfolgs-Banner (SENT) */}
      {lead.status === 'SENT' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-purple-900">🎉 Email erfolgreich versendet!</h2>
          <p className="text-purple-700">
            Die Akquise-Email wurde an <strong>{lead.email}</strong> gesendet.
          </p>
          {lead.sentAt && (
            <p className="text-purple-600 text-sm mt-2">
              Versendet am: {new Date(lead.sentAt).toLocaleString('de-DE')}
            </p>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Erstellt: {new Date(lead.createdAt).toLocaleString('de-DE')}</p>
        <p>Aktualisiert: {new Date(lead.updatedAt).toLocaleString('de-DE')}</p>
      </div>
    </div>
  );
}
