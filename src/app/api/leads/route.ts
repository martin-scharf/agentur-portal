import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/leads - Liste aller Leads
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        leadId: true,
        firma: true,
        name: true,
        adresse: true,
        email: true,
        telefon: true,
        status: true,
        demoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/leads - Neuen Lead erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firma, name, adresse, email, telefon, demoUrl, emailSubject, emailBody } = body;

    if (!firma) {
      return NextResponse.json({ error: 'Firma is required' }, { status: 400 });
    }

    // Generate leadId
    const count = await prisma.lead.count();
    const leadId = `L-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const lead = await prisma.lead.create({
      data: {
        leadId,
        firma,
        name,
        adresse,
        email,
        telefon,
        demoUrl,
        emailSubject,
        emailBody,
        status: 'NEW',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
