# Deployment Anleitung

## Problem

Die Neon-Datenbank ist aktuell nicht erreichbar. Das kann folgende Gründe haben:
- Die Datenbank ist pausiert (Neon pausiert inaktive Free-Tier DBs)
- Der Connection-String ist nicht korrekt
- Die Datenbank existiert noch nicht

## Schritte zum Deployment

### 1. Neon Datenbank prüfen/erstellen

1. Gehe zu https://console.neon.tech
2. Prüfe ob die Datenbank `agentur_portal` existiert
3. Falls nicht, erstelle eine neue Datenbank
4. Kopiere den Connection String

### 2. Environment Variables vorbereiten

Generiere einen sicheren Encryption Key:
```bash
openssl rand -hex 32
```

Generiere einen NextAuth Secret:
```bash
openssl rand -base64 32
```

### 3. GitHub Repository erstellen

```bash
# Im Projekt-Verzeichnis
cd /Users/bot/Documents/agentur-portal

# Falls gh CLI authentifiziert ist:
gh repo create agentur-portal --private --source=. --push

# Alternativ manuell:
# 1. Erstelle Repo auf github.com
# 2. git remote add origin https://github.com/martin-scharf/agentur-portal.git
# 3. git push -u origin main
```

### 4. Vercel Deployment

**Option A: Via Vercel Dashboard**
1. Gehe zu https://vercel.com
2. "Import Project" → GitHub Repo auswählen
3. Environment Variables setzen:
   - `DATABASE_URL` = Neon Connection String
   - `NEXTAUTH_SECRET` = Generierter Secret
   - `NEXTAUTH_URL` = https://agentur-portal.vercel.app (oder custom domain)
   - `ENCRYPTION_KEY` = Generierter 64-Zeichen Hex String
4. Deploy!

**Option B: Via Vercel CLI**
```bash
vercel login
vercel --prod
```

### 5. Nach dem Deployment

Datenbank-Schema und Seed-Daten einrichten:

```bash
# Lokal mit korrekter DATABASE_URL
npm run db:push
npm run db:seed
```

Oder über Vercel CLI:
```bash
vercel env pull .env.local
npm run db:push
npm run db:seed
```

## Login Credentials

Nach dem Seeding:
- **Email:** admin@portal.local
- **Passwort:** admin123!

## Troubleshooting

### "Can't reach database server"
- Prüfe ob die Neon DB aktiv ist (nicht pausiert)
- Prüfe den Connection String
- Stelle sicher dass `?sslmode=require` im Connection String ist

### "PrismaClient needs valid options"
- Stelle sicher dass `DATABASE_URL` gesetzt ist
- Führe `npx prisma generate` aus

### Build Errors
```bash
npm run build
```
zeigt detaillierte Fehler an.
