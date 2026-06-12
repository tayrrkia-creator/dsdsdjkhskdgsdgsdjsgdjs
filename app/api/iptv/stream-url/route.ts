import type { NextRequest } from 'next/server';
import { getLiveStreamUrl, getVodStreamUrl, getSeriesStreamUrl } from '@/lib/iptv';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const streamId = request.nextUrl.searchParams.get('stream_id');
  // Default to .ts for live streams (most Xtream Codes servers use TS format)
  const defaultExt = type === 'live' ? 'ts' : 'mp4';
  const extension = request.nextUrl.searchParams.get('extension') || defaultExt;

  if (!type || !streamId) {
    return Response.json({ error: 'type and stream_id are required' }, { status: 400 });
  }

  let url: string;
  switch (type) {
    case 'live':
      url = getLiveStreamUrl(parseInt(streamId), extension);
      break;
    case 'vod':
      url = getVodStreamUrl(parseInt(streamId), extension);
      break;
    case 'series':
      url = getSeriesStreamUrl(parseInt(streamId), extension);
      break;
    default:
      return Response.json({ error: 'Invalid type' }, { status: 400 });
  }

  return Response.json({ url });
}

