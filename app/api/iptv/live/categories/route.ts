import { fetchApi, type Category } from '@/lib/iptv';

export async function GET() {
  try {
    const data = await fetchApi<Category[]>('get_live_categories');
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch live categories' }, { status: 500 });
  }
}
