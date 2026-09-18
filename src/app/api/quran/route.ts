import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surah = searchParams.get('surah');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!surah) {
    return Response.json({ error: 'surah parameter required' }, { status: 400 });
  }

  try {
    let url = `https://api.alquran.cloud/v1/surah/${surah}/ar.alafasy`;
    if (from && to) {
      const fromNum = parseInt(from);
      const toNum = parseInt(to);
      url += `?offset=${fromNum - 1}&limit=${toNum - fromNum + 1}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 200) {
      return Response.json({ error: data.data || 'Failed to fetch' }, { status: 502 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: 'Failed to fetch from Quran API' }, { status: 500 });
  }
}
