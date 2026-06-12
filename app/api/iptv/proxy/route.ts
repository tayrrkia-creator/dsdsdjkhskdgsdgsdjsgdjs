import type { NextRequest } from 'next/server';

const IPTV_SERVER = process.env.IPTV_SERVER || '';
const IPTV_USERNAME = process.env.IPTV_USERNAME || '';
const IPTV_PASSWORD = process.env.IPTV_PASSWORD || '';

// Increase the max duration for streaming (Vercel Pro: up to 300s, Hobby: 60s)
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type'); // live, vod, series
  const streamId = request.nextUrl.searchParams.get('stream_id');
  const extension = request.nextUrl.searchParams.get('extension') || 'ts';

  if (!type || !streamId) {
    return new Response(JSON.stringify({ error: 'type and stream_id are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build the upstream URL
  let upstreamPath: string;
  switch (type) {
    case 'live':
      upstreamPath = `/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${extension}`;
      break;
    case 'vod':
      upstreamPath = `/movie/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${extension}`;
      break;
    case 'series':
      upstreamPath = `/series/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${extension}`;
      break;
    default:
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  const upstreamUrl = `${IPTV_SERVER}${upstreamPath}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // @ts-ignore - Next.js specific
      cache: 'no-store',
    });

    if (!upstreamRes.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${upstreamRes.status}` }), {
        status: upstreamRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!upstreamRes.body) {
      return new Response(JSON.stringify({ error: 'No stream body received' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine content type
    const contentType = extension === 'ts'
      ? 'video/mp2t'
      : extension === 'm3u8'
        ? 'application/vnd.apple.mpegurl'
        : extension === 'mp4'
          ? 'video/mp4'
          : 'application/octet-stream';

    // Stream the response back to the client
    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to connect to stream server' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
