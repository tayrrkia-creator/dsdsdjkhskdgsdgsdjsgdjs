import type { NextRequest } from 'next/server';
import { fetchApi, type LiveStream } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('category_id');
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    const data = await fetchApi<LiveStream[]>('get_live_streams', params);
    return Response.json(data || []);
  } catch (error) {
    console.error("Failed to fetch live streams:", error);
    return Response.json([]);
  }
}
