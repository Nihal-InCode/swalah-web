import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orderedIds } = body;

  if (!Array.isArray(orderedIds)) {
    return Response.json({ error: 'orderedIds array required' }, { status: 400 });
  }

  const updates = orderedIds.map((id: number, index: number) =>
    prisma.dhikr.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);
  return Response.json({ success: true });
}
