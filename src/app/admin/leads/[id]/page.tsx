'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Lead = {
  id: string;
  leadId: string;
  firma: string;
  name?: string;
  adresse?: string;
  email?: string;
  telefon?: string;
  status: string;
  demoUrl?: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<string, string> = {
  NEW: 'Neu',
  DEMO_READY: 'Demo erstellt',
  EMAIL_DRAFT: 'Email bereit',
  APPROVED: 'Freigegeben',
  SENT: 'Gesendet',
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string);
    }
  }, [params.id]);

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

  const handleApprove = async () => {
    if (!lead) return;
    
    if (!confirm('Email wirklich freigeben und senden?')) return;

    setApproving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('✅ Email freigegeben und versendet!');
        fetchLead(lead.id); // Reload
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Fehler beim Freigeben');
    } finally {
      setApproving(false);
    }
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

  const canApprove = lead.status === 'EMAIL_DRAFT' && lead.email && lead.emailSubject && lead.emailBody;

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
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {statusLabels[lead.status] || lead.status}
          </span>
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{lead.email || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefon</label>
            <p className="mt-1 text-gray-900">{lead.telefon || '—'}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <p className="mt-1 text-gray-900">{lead.adresse || '—'}</p>
          </div>
        </div>
      </div>

      {/* Demo-Website Vorschau */}
      {lead.demoUrl && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Demo-Website</h2>
          <a
            href={lead.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔗 Demo öffnen
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Email Vorschau */}
      {lead.emailSubject && lead.emailBody && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Akquise-Email Vorschau</h2>
          
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
              dangerouslySetInnerHTML={{ __html: lead.emailBody }}
            />
          </div>
        </div>
      )}

      {/* Freigabe-Button */}
      {canApprove && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-green-900">Email freigeben</h2>
          <p className="text-green-700 mb-4">
            Die Email ist bereit zum Versand. Nach der Freigabe wird sie automatisch an <strong>{lead.email}</strong> gesendet.
          </p>
          <button
            onClick={handleApprove}
            disabled={approving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {approving ? '⏳ Sende...' : '✅ Email freigeben & senden'}
          </button>
        </div>
      )}

      {lead.status === 'SENT' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-purple-900">✅ Email versendet</h2>
          <p className="text-purple-700">
            Die Email wurde erfolgreich an <strong>{lead.email}</strong> gesendet.
          </p>
        </div>
      )}
    </div>
  );
}
