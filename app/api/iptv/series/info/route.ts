import type { NextRequest } from 'next/server';
import { fetchApi, type SeriesInfo } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  try {
    const seriesId = request.nextUrl.searchParams.get('series_id');
    if (!seriesId) return Response.json({ error: 'series_id is required' }, { status: 400 });
    const data = await fetchApi<SeriesInfo>('get_series_info', { series_id: seriesId });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch series info' }, { status: 500 });
  }
}
