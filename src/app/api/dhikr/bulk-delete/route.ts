import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids)) {
    return Response.json({ error: 'ids array required' }, { status: 400 });
  }

  await prisma.dhikr.deleteMany({
    where: { id: { in: ids } },
  });

  return Response.json({ success: true });
}
