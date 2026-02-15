import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/leads/[id]/messages - Alle Messages eines Leads
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Lead existiert?
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Messages abrufen (chronologisch sortiert)
    const messages = await prisma.leadMessage.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/leads/[id]/messages - Neue Message anlegen
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validierung
    if (!body.direction || !body.from || !body.to || !body.body) {
      return NextResponse.json(
        { error: 'Missing required fields: direction, from, to, body' },
        { status: 400 }
      );
    }

    // Lead existiert?
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Message erstellen
    const message = await prisma.leadMessage.create({
      data: {
        leadId: id,
        direction: body.direction,
        from: body.from,
        to: body.to,
        subject: body.subject || null,
        body: body.body,
        status: body.status || 'draft',
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
