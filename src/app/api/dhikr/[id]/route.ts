import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { getSurahNumberFromTitle } from '@/lib/quran-audio';

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

  const updateData: Record<string, unknown> = {
    title: body.title,
    arabic: body.arabic,
    sortOrder: body.sortOrder,
    startAyah: body.startAyah,
  };
  if (body.title || body.surahNumber !== undefined) {
    updateData.surahNumber = getSurahNumberFromTitle(body.title, body.surahNumber);
  }

  const dhikr = await prisma.dhikr.update({
    where: { id: parseInt(id) },
    data: updateData,
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
