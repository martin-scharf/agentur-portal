import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string; msgId: string }>;
};

// POST /api/leads/[id]/messages/[msgId]/approve - Message freigeben
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, msgId } = await params;

    // Message existiert und gehört zum Lead?
    const message = await prisma.leadMessage.findFirst({
      where: {
        id: msgId,
        leadId: id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Nur Entwürfe können freigegeben werden
    if (message.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft messages can be approved' },
        { status: 400 }
      );
    }

    // Status auf "approved" setzen
    const approvedMessage = await prisma.leadMessage.update({
      where: { id: msgId },
      data: {
        status: 'approved',
      },
    });

    return NextResponse.json({
      success: true,
      message: approvedMessage,
    });
  } catch (error) {
    console.error('Message approval error:', error);
    return NextResponse.json({ error: 'Failed to approve message' }, { status: 500 });
  }
}
