import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const streamId = request.nextUrl.searchParams.get('stream_id');
  // Default to .ts for live streams (most Xtream Codes servers use TS format)
  const defaultExt = type === 'live' ? 'ts' : 'mp4';
  const extension = request.nextUrl.searchParams.get('extension') || defaultExt;

  if (!type || !streamId) {
    return Response.json({ error: 'type and stream_id are required' }, { status: 400 });
  }

  // Return a proxy URL instead of the direct IPTV server URL
  // This solves HTTPS mixed content issues on Vercel deployments
  const proxyUrl = `/api/iptv/proxy?type=${type}&stream_id=${streamId}&extension=${extension}`;

  return Response.json({ url: proxyUrl });
}
