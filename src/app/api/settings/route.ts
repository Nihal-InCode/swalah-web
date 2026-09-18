import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

const DEFAULT_SETTINGS: Record<string, string> = {
  readingMode: 'paper',
  fontFamily: 'KFGQPCUthmanicScript',
  fontSize: '28',
  lineHeight: '1.8',
  textAlign: 'center',
  keepScreenAwake: 'false',
  autoScrollEnabled: 'false',
  autoScrollSpeed: '3',
  colorAllah: 'true',
  colorAyahMarkers: 'true',
};

export async function GET() {
  const settings = await prisma.settings.findMany();
  const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }
  return Response.json(settingsMap);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await prisma.settings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return Response.json({ success: true });
}
