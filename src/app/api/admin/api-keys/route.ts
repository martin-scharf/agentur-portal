import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKeys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      service: true,
      isActive: true,
      lastUsed: true,
      createdAt: true,
      keyEncrypted: true,
    }
  })

  // Add key preview (first 8 chars + ...)
  const keysWithPreview = apiKeys.map(key => {
    let keyPreview = ''
    try {
      const decrypted = decrypt(key.keyEncrypted)
      keyPreview = decrypted.substring(0, 8) + '...'
    } catch {
      keyPreview = '***'
    }
    return {
      ...key,
      keyPreview,
      keyEncrypted: undefined
    }
  })

  return NextResponse.json(keysWithPreview)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, service, key } = await req.json()

  if (!name || !service || !key) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
  }

  const keyEncrypted = encrypt(key)

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      service,
      keyEncrypted,
    }
  })

  return NextResponse.json({ id: apiKey.id })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, name, service, key } = await req.json()

  if (!id || !name || !service) {
    return NextResponse.json({ error: 'ID, Name und Service sind erforderlich' }, { status: 400 })
  }

  const updateData: any = { name, service }
  
  if (key) {
    updateData.keyEncrypted = encrypt(key)
  }

  await prisma.apiKey.update({
    where: { id },
    data: updateData
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, isActive } = await req.json()

  if (!id || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'ID und isActive sind erforderlich' }, { status: 400 })
  }

  await prisma.apiKey.update({
    where: { id },
    data: { isActive }
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
  }

  await prisma.apiKey.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
