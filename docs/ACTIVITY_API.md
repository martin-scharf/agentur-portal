# Activity API Documentation

## POST /api/activities

Erstelle eine neue Bot-Activity für den Activity-Feed im Dashboard.

### Request

```bash
POST /api/activities
Content-Type: application/json

{
  "agentId": "builder",      // required: "boss" | "builder" | "scout" | "comms"
  "action": "Task completed", // required: Beschreibung der Aktivität
  "metadata": {               // optional: Zusätzliche Daten als JSON
    "leadId": "L-2026-001",
    "duration": 45
  }
}
```

### Response

```json
{
  "id": "clxyz123",
  "agentId": "builder",
  "action": "completed_task",
  "description": "Task completed",
  "metadata": "{\"leadId\":\"L-2026-001\",\"duration\":45}",
  "createdAt": "2026-02-15T14:30:00.000Z"
}
```

### Beispiele

#### 1. Builder beendet Template-Design
```bash
curl -X POST https://agentur-portal.vercel.app/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "builder",
    "action": "6 Branchen-Templates redesigned",
    "metadata": {"templates": 6, "category": "design"}
  }'
```

#### 2. Boss findet neue Leads
```bash
curl -X POST https://agentur-portal.vercel.app/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "boss",
    "action": "3 neue Leads recherchiert",
    "metadata": {"leads": ["L-2026-010", "L-2026-011", "L-2026-012"]}
  }'
```

#### 3. Scout analysiert Website
```bash
curl -X POST https://agentur-portal.vercel.app/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "scout",
    "action": "Website-Analyse für Zimmerei Schmidt",
    "metadata": {"score": 65, "leadId": "L-2026-005"}
  }'
```

## GET /api/activities

Hole die letzten 50 Activities.

### Request

```bash
GET /api/activities
```

### Response

```json
[
  {
    "id": "clxyz123",
    "agentId": "builder",
    "action": "completed_task",
    "description": "6 Branchen-Templates redesigned",
    "metadata": "{\"templates\":6}",
    "createdAt": "2026-02-15T14:30:00.000Z",
    "agent": {
      "name": "Builder"
    }
  },
  ...
]
```

## Integration in Bot-Workflows

Nach jeder wichtigen Bot-Aktion:

```typescript
// Am Ende eines Bot-Tasks
await fetch(`${process.env.PORTAL_URL}/api/activities`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'builder',
    action: 'Demo-Website erstellt für Schmidt Zimmerei',
    metadata: {
      leadId: 'L-2026-005',
      demoUrl: 'https://demo-schmidt-zimmerei.vercel.app',
      duration: 120
    }
  })
})
```
