# Email-Verlauf (Chat-History) Feature

## Überblick
Dieses Feature ermöglicht die Verwaltung von Email-Konversationen mit Leads in einem Chat-ähnlichen Interface.

## DB-Model: LeadMessage

```prisma
model LeadMessage {
  id        String    @id @default(cuid())
  leadId    String
  lead      Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  direction String    // "inbound" oder "outbound"
  from      String    // Absender Email
  to        String    // Empfänger Email
  subject   String?
  body      String    @db.Text
  status    String    @default("draft") // "draft", "approved", "sent"
  createdAt DateTime  @default(now())
  sentAt    DateTime?
}
```

## API Endpoints

### GET /api/leads/[id]/messages
Ruft alle Nachrichten eines Leads ab (chronologisch sortiert).

**Response:**
```json
[
  {
    "id": "msg_123",
    "leadId": "lead_456",
    "direction": "inbound",
    "from": "kunde@example.com",
    "to": "info@agentur.de",
    "subject": "Anfrage Website",
    "body": "Hallo, ich interessiere mich...",
    "status": "sent",
    "createdAt": "2026-02-15T10:00:00Z",
    "sentAt": "2026-02-15T10:00:00Z"
  }
]
```

### POST /api/leads/[id]/messages
Erstellt eine neue Nachricht (z.B. von Bot/COMMS).

**Request Body:**
```json
{
  "direction": "outbound",
  "from": "info@agentur.de",
  "to": "kunde@example.com",
  "subject": "Re: Anfrage Website",
  "body": "Vielen Dank für Ihre Anfrage...",
  "status": "draft"
}
```

**Erforderliche Felder:** `direction`, `from`, `to`, `body`

### PUT /api/leads/[id]/messages/[msgId]
Bearbeitet eine Nachricht (nur Entwürfe erlaubt).

**Request Body:**
```json
{
  "subject": "Aktualisierter Betreff",
  "body": "Aktualisierter Text..."
}
```

### POST /api/leads/[id]/messages/[msgId]/approve
Gibt eine Nachricht frei (Status: draft → approved).

**Response:**
```json
{
  "success": true,
  "message": { /* aktualisierte Message */ }
}
```

## UI Komponente: EmailHistory

Die `EmailHistory` Komponente zeigt den Email-Verlauf eines Leads in Chat-Form an:

- **Inbound Messages** (eingehend): Links, grauer Hintergrund
- **Outbound Messages** (ausgehend): Rechts, blauer Hintergrund
- **Status-Badges**: Entwurf (gelb), Freigegeben (grün), Gesendet (blau)
- **Bearbeiten**: Entwürfe können editiert werden
- **Freigeben**: Button "Freigeben & Senden" für Entwürfe

### Integration

```tsx
import EmailHistory from '@/components/EmailHistory';

<EmailHistory leadId={lead.id} />
```

## Workflow

1. **Eingehende Email** → Wird als LeadMessage (direction: "inbound", status: "sent") gespeichert
2. **COMMS erstellt Antwort** → Wird als LeadMessage (direction: "outbound", status: "draft") gespeichert
3. **Martin prüft & editiert** → PUT /api/leads/[id]/messages/[msgId]
4. **Martin gibt frei** → POST /api/leads/[id]/messages/[msgId]/approve → Status: "approved"
5. **Cron-Job versendet** → Sendet Email + aktualisiert Status auf "sent" + setzt sentAt

## Migration

```bash
npx prisma db push
```

## Deployment

Das Feature ist bereits:
- ✅ In Git committed (Commit: 7f5b68c)
- ✅ Auf GitHub gepusht
- ✅ Build-Test erfolgreich
- ✅ Bereit für Vercel Deployment

Vercel wird automatisch deployen bei nächstem Push (oder manuell triggern).

## TODO (Optional)

- [ ] Cron-Job zum automatischen Versand von "approved" Messages
- [ ] Email-Benachrichtigung bei neuen inbound Messages
- [ ] Attachments-Support
- [ ] Rich-Text Editor für Email-Body
- [ ] Email-Templates
