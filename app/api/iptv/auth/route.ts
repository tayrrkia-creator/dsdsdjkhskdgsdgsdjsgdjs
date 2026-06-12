import { fetchApi, type AuthResponse } from '@/lib/iptv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchApi<AuthResponse>();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
