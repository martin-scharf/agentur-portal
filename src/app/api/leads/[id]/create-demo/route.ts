import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/leads/[id]/create-demo - Demo-Website erstellen lassen
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

    if (lead.status !== 'NEW') {
      return NextResponse.json(
        { error: 'Lead muss Status NEW haben' },
        { status: 400 }
      );
    }

    // TODO: Hier würde der echte BUILDER-Agent aufgerufen werden
    // Für jetzt: GitHub Pages Template-URL generieren
    console.log('🏗️ BUILDER-Auftrag für:', lead.firma);
    console.log('Branche:', lead.branche);
    console.log('Bestehende Website:', lead.websiteUrl);

    // Demo-URL auf echtes GitHub Pages Template zeigen
    const firmaSlug = lead.firma
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const demoUrl = `https://martin-scharf.github.io/branchen-templates/demos/${firmaSlug}.html`;

    // Lead aktualisieren
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        demoUrl,
        status: 'DEMO_READY',
      },
    });

    // Activity loggen
    try {
      await prisma.activity.create({
        data: {
          agentId: 'builder',
          action: 'demo_created',
          description: `Demo-Website erstellt für ${lead.firma}`,
          metadata: JSON.stringify({ leadId: lead.leadId, demoUrl }),
        },
      });
    } catch (activityError) {
      // Activity logging ist optional
      console.log('Activity logging skipped:', activityError);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo-Website erstellt',
      demoUrl,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Create demo error:', error);
    return NextResponse.json({ error: 'Failed to create demo' }, { status: 500 });
  }
}
