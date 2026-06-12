import { fetchAndParseM3U } from '@/lib/iptv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Search for channels containing "كأس العالم" (World Cup)
    const data = await fetchAndParseM3U('كأس العالم');
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch World Cup channels' }, { status: 500 });
  }
}
