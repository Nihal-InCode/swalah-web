import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const audio = await prisma.audio.upsert({
    where: { dhikrId: body.dhikrId },
    update: {
      driveFileId: body.driveFileId,
      fileName: body.fileName,
      duration: body.duration,
    },
    create: {
      dhikrId: body.dhikrId,
      driveFileId: body.driveFileId,
      fileName: body.fileName,
      duration: body.duration,
    },
  });

  return Response.json(audio, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dhikrId = searchParams.get('dhikrId');

  if (!dhikrId) {
    return Response.json({ error: 'dhikrId required' }, { status: 400 });
  }

  const audio = await prisma.audio.findUnique({
    where: { dhikrId: parseInt(dhikrId) },
  });

  return Response.json(audio);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dhikrId = searchParams.get('dhikrId');

  if (!dhikrId) {
    return Response.json({ error: 'dhikrId required' }, { status: 400 });
  }

  await prisma.audio.delete({ where: { dhikrId: parseInt(dhikrId) } });
  return Response.json({ success: true });
}
