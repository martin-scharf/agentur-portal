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

    // Email-Template: Kurz, freundlich, unaufdringlich. Absender: Jeanette
    console.log('📧 Generiere Email-Entwurf für:', lead.firma);

    // Anrede bestimmen
    const nachname = lead.name ? lead.name.split(' ').pop() : '';
    const anrede = nachname ? `Hallo Herr ${nachname}` : 'Guten Tag';

    const emailSubject = `Eine Demo-Website für ${lead.firma}`;

    const emailBody = `${anrede},

wir haben uns Ihr Unternehmen angeschaut und eine kostenlose Demo-Website speziell für ${lead.firma} erstellt.

<strong>Schauen Sie sich Ihre Demo an:</strong>
<a href="${lead.demoUrl}">${lead.demoUrl}</a>

Die Seite zeigt, wie Ihr Betrieb online aussehen könnte – modern, mobilfreundlich und einladend für neue Kunden.

Wenn Ihnen gefällt was Sie sehen, melden Sie sich einfach bei uns. Wir freuen uns auf Ihre Rückmeldung!

Viele Grüße
Jeanette

partpeople – Websites für Handwerker`;

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
