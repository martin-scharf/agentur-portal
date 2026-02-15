'use client';

import { useEffect, useState } from 'react';

type LeadMessage = {
  id: string;
  leadId: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  subject?: string;
  body: string;
  status: 'draft' | 'approved' | 'sent';
  createdAt: string;
  sentAt?: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Entwurf', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Freigegeben', color: 'bg-green-100 text-green-800' },
  sent: { label: 'Gesendet', color: 'bg-blue-100 text-blue-800' },
};

interface EmailHistoryProps {
  leadId: string;
}

export default function EmailHistory({ leadId }: EmailHistoryProps) {
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [leadId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message: LeadMessage) => {
    setEditingMessageId(message.id);
    setEditBody(message.body);
    setEditSubject(message.subject || '');
  };

  const handleSaveEdit = async (messageId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editSubject,
          body: editBody,
        }),
      });

      if (res.ok) {
        alert('✅ Nachricht gespeichert!');
        setEditingMessageId(null);
        fetchMessages();
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleApprove = async (messageId: string) => {
    if (!confirm('Diese Nachricht wirklich freigeben & zum Versand markieren?')) return;

    try {
      const res = await fetch(`/api/leads/${leadId}/messages/${messageId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('✅ Nachricht freigegeben! (Versand erfolgt durch Cron-Job)');
        fetchMessages();
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Fehler beim Freigeben');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">💬 Email-Verlauf</h2>
        <div className="animate-pulse text-gray-500">Lade Nachrichten...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">💬 Email-Verlauf</h2>
        <div className="text-gray-500 text-center py-8">
          Noch keine Nachrichten vorhanden
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">💬 Email-Verlauf</h2>
      
      <div className="space-y-4">
        {messages.map((message) => {
          const isInbound = message.direction === 'inbound';
          const isEditing = editingMessageId === message.id;
          const statusInfo = statusLabels[message.status] || { label: message.status, color: 'bg-gray-100 text-gray-800' };

          return (
            <div
              key={message.id}
              className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-2xl w-full rounded-lg p-4 ${
                  isInbound
                    ? 'bg-gray-100 border border-gray-300'
                    : 'bg-blue-50 border border-blue-300'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">
                      {isInbound ? 'Von:' : 'An:'} {isInbound ? message.from : message.to}
                    </span>
                    {!isInbound && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Subject */}
                {isEditing ? (
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Betreff</label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="Betreff..."
                    />
                  </div>
                ) : (
                  message.subject && (
                    <div className="font-semibold text-gray-800 mb-2">
                      {message.subject}
                    </div>
                  )
                )}

                {/* Body */}
                {isEditing ? (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nachricht</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={8}
                      className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                      placeholder="Nachricht..."
                    />
                  </div>
                ) : (
                  <div 
                    className="text-gray-800 text-sm whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: message.body.replace(/\n/g, '<br/>') 
                    }}
                  />
                )}

                {/* Sent Time */}
                {message.sentAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Gesendet: {new Date(message.sentAt).toLocaleString('de-DE')}
                  </div>
                )}

                {/* Actions (nur für Entwürfe) */}
                {message.status === 'draft' && message.direction === 'outbound' && (
                  <div className="mt-3 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          💾 Speichern
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                        >
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(message)}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          ✏️ Bearbeiten
                        </button>
                        <button
                          onClick={() => handleApprove(message.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ✅ Freigeben & Senden
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
