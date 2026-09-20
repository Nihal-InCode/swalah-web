import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { dhikrList, replace } = body;

  if (!Array.isArray(dhikrList)) {
    return Response.json({ error: 'dhikrList array required' }, { status: 400 });
  }

  if (replace) {
    await prisma.$transaction([
      prisma.dhikr.deleteMany(),
      ...dhikrList.map((d: { title: string; arabic: string; sortOrder?: number; startAyah?: number; surahNumber?: number }, i: number) =>
        prisma.dhikr.create({
          data: {
            title: d.title,
            arabic: d.arabic,
            sortOrder: d.sortOrder ?? i,
            startAyah: d.startAyah ?? 1,
            surahNumber: d.surahNumber ?? 1,
          },
        })
      ),
    ]);
  } else {
    const maxOrder = await prisma.dhikr.aggregate({ _max: { sortOrder: true } });
    let order = (maxOrder._max.sortOrder ?? -1) + 1;

    for (const d of dhikrList) {
      await prisma.dhikr.create({
        data: {
          title: d.title,
          arabic: d.arabic,
          sortOrder: order++,
          startAyah: d.startAyah ?? 1,
          surahNumber: d.surahNumber ?? 1,
        },
      });
    }
  }

  return Response.json({ success: true });
}
