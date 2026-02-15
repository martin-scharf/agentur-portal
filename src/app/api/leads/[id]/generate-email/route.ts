import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/leads/[id]/generate-email - Akquise-Email-Entwurf generieren
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Lead holen
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status !== 'DEMO_READY') {
      return NextResponse.json(
        { error: 'Lead muss Status DEMO_READY haben' },
        { status: 400 }
      );
    }

    if (!lead.demoUrl) {
      return NextResponse.json(
        { error: 'Demo-URL fehlt' },
        { status: 400 }
      );
    }

    // TODO: Hier könnte OpenAI für personalisierte Emails genutzt werden
    // Für jetzt: Template-basierte Email
    console.log('📧 Generiere Email-Entwurf für:', lead.firma);

    const kontaktAnrede = lead.name 
      ? `Guten Tag ${lead.name.split(' ')[0]}` 
      : 'Guten Tag';

    const branchenText = lead.branche 
      ? `Als ${lead.branche} wissen Sie` 
      : 'Sie wissen sicherlich';

    const websiteHinweis = lead.websiteUrl
      ? `Ich habe mir Ihre aktuelle Website (${lead.websiteUrl}) angesehen und sehe großes Potenzial für eine moderne, mobiloptimierte Präsenz.`
      : 'Eine professionelle Website ist heute unverzichtbar, um neue Kunden zu gewinnen und Ihr Unternehmen optimal zu präsentieren.';

    const emailSubject = `${lead.firma} – Ihre neue Demo-Website ist fertig 🚀`;

    const emailBody = `${kontaktAnrede},

ich bin Martin von der Web-Agentur Lokal und habe mir erlaubt, eine Demo-Website speziell für ${lead.firma} zu erstellen.

${branchenText}, wie wichtig eine professionelle Online-Präsenz für den Geschäftserfolg ist. ${websiteHinweis}

<strong>Ihre persönliche Demo-Website:</strong>
<a href="${lead.demoUrl}">${lead.demoUrl}</a>

Diese Demo zeigt, wie Ihr Unternehmen online erstrahlen könnte:
• Modernes, mobilfreundliches Design
• Schnelle Ladezeiten
• Suchmaschinenoptimiert (SEO)
• Einfach zu pflegen

<strong>Und das Beste:</strong> Wenn Ihnen gefällt, was Sie sehen, können wir diese Demo direkt als Grundlage für Ihre neue Website nutzen!

Haben Sie 15 Minuten Zeit für ein kurzes Telefonat? Ich würde Ihnen gerne zeigen, wie wir ${lead.firma} online optimal positionieren können.

Antworten Sie einfach auf diese Email oder rufen Sie mich an unter 0176 / XXX XXX.

Mit freundlichen Grüßen
Martin
Web-Agentur Lokal

P.S. Die Demo bleibt noch 14 Tage online – schauen Sie sie sich in Ruhe an!`;

    // Lead aktualisieren
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        emailSubject,
        emailBody,
        status: 'EMAIL_DRAFT',
      },
    });

    // Activity loggen
    try {
      await prisma.activity.create({
        data: {
          agentId: 'boss',
          action: 'email_drafted',
          description: `Email-Entwurf erstellt für ${lead.firma}`,
          metadata: JSON.stringify({ leadId: lead.leadId }),
        },
      });
    } catch (activityError) {
      console.log('Activity logging skipped:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email-Entwurf generiert',
      emailSubject,
      emailBody,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Generate email error:', error);
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}
