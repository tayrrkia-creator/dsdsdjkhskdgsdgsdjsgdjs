import { fetchApi, type AuthResponse } from '@/lib/iptv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchApi<AuthResponse>();
    return Response.json({ ...data, deploy_ver: "v3_clean" });
  } catch (error) {
    return Response.json({ error: 'Failed to authenticate', deploy_ver: "v3_clean_err" }, { status: 500 });
  }
}
