import type { NextRequest } from 'next/server';
import { fetchApi, type EpgListing } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  try {
    const streamId = request.nextUrl.searchParams.get('stream_id');
    if (!streamId) return Response.json({ error: 'stream_id is required' }, { status: 400 });
    const data = await fetchApi<{epg_listings: EpgListing[]}>('get_short_epg', { stream_id: streamId });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch EPG' }, { status: 500 });
  }
}
