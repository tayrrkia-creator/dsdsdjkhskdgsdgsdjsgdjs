import type { NextRequest } from 'next/server';
import { fetchApi, type VodInfo } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  try {
    const vodId = request.nextUrl.searchParams.get('vod_id');
    if (!vodId) return Response.json({ error: 'vod_id is required' }, { status: 400 });
    const data = await fetchApi<VodInfo>('get_vod_info', { vod_id: vodId });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch VOD info' }, { status: 500 });
  }
}
