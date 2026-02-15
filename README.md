# Agentur Command Center

Ein KI-Agenten Management Portal für die Verwaltung von automatisierten Vertriebsprozessen.

## Features

- 📊 **Dashboard** - Übersicht über alle Agenten, Tasks und Pipeline
- 🤖 **Agenten-Verwaltung** - Status und Konfiguration von KI-Agenten
- 🔑 **API-Key Management** - Sichere Speicherung mit AES-256-GCM Verschlüsselung
- 🎯 **Lead-Pipeline** - Verfolgung von Leads durch den Vertriebsprozess
- 📋 **Task-Management** - Aufgabenverwaltung für Agenten
- 📝 **Activity-Feed** - Live-Protokoll aller Aktivitäten

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 7
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Encryption:** AES-256-GCM

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Environment Variables

Erstelle eine `.env` Datei:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXTAUTH_SECRET="dein-geheimer-schluessel"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="64-zeichen-hex-string"
```

**Encryption Key generieren:**
```bash
openssl rand -hex 32
```

### 3. Datenbank initialisieren

```bash
npm run db:push
npm run db:seed
```

### 4. Development Server starten

```bash
npm run dev
```

## Default Login

- **Email:** admin@portal.local
- **Passwort:** admin123!

## Deployment (Vercel)

### Via Vercel CLI

```bash
vercel
```

### Environment Variables auf Vercel

Setze folgende Environment Variables im Vercel Dashboard:

- `DATABASE_URL` - Neon PostgreSQL Connection String
- `NEXTAUTH_SECRET` - Sicherer Secret Key
- `NEXTAUTH_URL` - Production URL (z.B. https://agentur-portal.vercel.app)
- `ENCRYPTION_KEY` - 64-Zeichen Hex String für API-Key Verschlüsselung

### Nach dem Deployment

Führe das Seed-Script aus, um den Admin-User zu erstellen:

```bash
npm run db:seed
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/admin/api-keys` | GET, POST, PUT, PATCH, DELETE | API-Key Management |
| `/api/admin/agents` | GET, POST, PUT, DELETE | Agenten-Verwaltung |
| `/api/admin/settings` | GET, PUT | Einstellungen |
| `/api/activity` | GET, POST | Activity-Feed |
| `/api/tasks` | GET, POST, PUT, DELETE | Task-Management |
| `/api/pipeline` | GET, POST, PUT, DELETE | Lead-Pipeline |

## Projektstruktur

```
src/
├── app/
│   ├── admin/
│   │   ├── agents/
│   │   ├── api-keys/
│   │   └── settings/
│   ├── api/
│   │   ├── activity/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── pipeline/
│   │   └── tasks/
│   ├── dashboard/
│   └── login/
├── components/
│   ├── ActivityFeed.tsx
│   ├── AgentCard.tsx
│   ├── DashboardLayout.tsx
│   ├── PipelineOverview.tsx
│   ├── Sidebar.tsx
│   └── TaskList.tsx
└── lib/
    ├── auth.ts
    ├── db.ts
    └── encryption.ts
```

## Lizenz

Privat - Alle Rechte vorbehalten
