'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Lead = {
  id: string;
  leadId: string;
  firma: string;
  name?: string;
  adresse?: string;
  email?: string;
  telefon?: string;
  description?: string;
  leadSource?: string;
  leadSourceUrl?: string;
  status: string;
  demoUrl?: string;
  createdAt: string;
  hasUnreadReply?: boolean;
  lastReplyAt?: string | null;
};

const statusLabels: Record<string, string> = {
  NEW: 'Neu',
  DEMO_READY: 'Demo erstellt',
  EMAIL_DRAFT: 'Email bereit',
  APPROVED: 'Freigegeben',
  SENT: 'Gesendet',
};

const statusColors: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-800',
  DEMO_READY: 'bg-blue-100 text-blue-800',
  EMAIL_DRAFT: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SENT: 'bg-purple-100 text-purple-800',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Lade Leads...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead-Verwaltung</h1>
        <button
          onClick={() => router.push('/admin/leads/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Neuer Lead
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead-ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Firma / Beschreibung
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontakt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className={`hover:bg-gray-50 ${
                  lead.hasUnreadReply 
                    ? 'bg-orange-50 border-l-4 border-orange-500' 
                    : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {lead.leadId}
                    {lead.hasUnreadReply && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500 text-white animate-pulse">
                        Neue Antwort!
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{lead.firma}</div>
                  {lead.leadSource && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        📍 {lead.leadSource}
                      </span>
                      {lead.leadSourceUrl && (
                        <a
                          href={lead.leadSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  {lead.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {lead.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{lead.name || '—'}</div>
                  {lead.email && (
                    <div className="text-xs text-gray-400">{lead.email}</div>
                  )}
                  {lead.adresse && (
                    <div className="text-xs text-gray-400 mt-1">{lead.adresse}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[lead.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[lead.status] || lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <button
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    className="hover:underline"
                  >
                    Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Leads vorhanden. Erstelle deinen ersten Lead!
          </div>
        )}
      </div>
    </div>
  );
}
