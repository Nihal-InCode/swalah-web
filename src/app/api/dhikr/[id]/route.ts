import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const dhikr = await prisma.dhikr.findUnique({
    where: { id: parseInt(id) },
    include: { audio: true },
  });

  if (!dhikr) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(dhikr);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const dhikr = await prisma.dhikr.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      arabic: body.arabic,
      sortOrder: body.sortOrder,
      startAyah: body.startAyah,
    },
  });

  return Response.json(dhikr);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.dhikr.delete({ where: { id: parseInt(id) } });
  return Response.json({ success: true });
}
