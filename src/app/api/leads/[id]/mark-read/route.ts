import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/leads/[id]/mark-read - Markiere alle inbound Messages als gelesen
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Alle inbound Messages mit status 'received' auf 'read' setzen
    const result = await prisma.leadMessage.updateMany({
      where: {
        leadId: id,
        direction: 'inbound',
        status: 'received',
      },
      data: {
        status: 'read',
      },
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
