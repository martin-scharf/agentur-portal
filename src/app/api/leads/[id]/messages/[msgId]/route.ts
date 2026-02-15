import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string; msgId: string }>;
};

// PUT /api/leads/[id]/messages/[msgId] - Message bearbeiten
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, msgId } = await params;
    const body = await request.json();

    // Message existiert und gehört zum Lead?
    const existingMessage = await prisma.leadMessage.findFirst({
      where: {
        id: msgId,
        leadId: id,
      },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Nur Entwürfe dürfen bearbeitet werden
    if (existingMessage.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft messages can be edited' },
        { status: 400 }
      );
    }

    // Message aktualisieren
    const updatedMessage = await prisma.leadMessage.update({
      where: { id: msgId },
      data: {
        subject: body.subject !== undefined ? body.subject : existingMessage.subject,
        body: body.body !== undefined ? body.body : existingMessage.body,
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Message update error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
