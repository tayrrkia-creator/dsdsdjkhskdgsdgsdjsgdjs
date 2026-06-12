import type { NextRequest } from 'next/server';
import { fetchApi, type Series } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('category_id');
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    const data = await fetchApi<Series[]>('get_series', params);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}
