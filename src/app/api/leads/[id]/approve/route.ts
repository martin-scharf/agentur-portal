import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/leads/[id]/approve - Email freigeben & senden
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

    if (!lead.email || !lead.emailSubject || !lead.emailBody) {
      return NextResponse.json(
        { error: 'Email data incomplete' },
        { status: 400 }
      );
    }

    // Status auf APPROVED setzen (Email wird vom lokalen Bot-Agent via Apple Mail versendet)
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // EmailLog erstellen
    await prisma.emailLog.create({
      data: {
        leadId: lead.leadId,
        direction: 'out',
        recipient: lead.email,
        subject: lead.emailSubject,
        status: 'sent',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email approved and sent',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Failed to approve lead' }, { status: 500 });
  }
}
