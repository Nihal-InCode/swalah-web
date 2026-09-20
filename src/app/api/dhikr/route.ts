import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (query) {
    const dhikrList = await prisma.dhikr.findMany({
      where: { title: { contains: query } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { audio: true },
    });
    return Response.json(dhikrList);
  }

  const dhikrList = await prisma.dhikr.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { audio: true },
  });
  return Response.json(dhikrList);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const maxOrder = await prisma.dhikr.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const dhikr = await prisma.dhikr.create({
    data: {
      title: body.title,
      arabic: body.arabic,
      sortOrder: body.sortOrder ?? sortOrder,
      startAyah: body.startAyah ?? 1,
      surahNumber: body.surahNumber ?? 1,
    },
  });

  return Response.json(dhikr, { status: 201 });
}
