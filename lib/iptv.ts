// Server-side helper for Xtream Codes API

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface ServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

export interface AuthResponse {
  user_info: UserInfo;
  server_info: ServerInfo;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  category_id: string;
  category_ids: number[];
  thumbnail: string;
}

export interface VodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  category_ids: number[];
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface VodInfo {
  info: {
    name: string;
    o_name: string;
    cover_big: string;
    movie_image: string;
    releasedate: string;
    plot: string;
    duration: string;
    duration_secs: number;
    rating: string;
    director: string;
    genre: string;
    cast: string;
    youtube_trailer: string;
    tmdb_id: string;
  };
  movie_data: {
    stream_id: number;
    extension: string;
    container_extension: string;
  };
}

export interface Series {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  category_id: string;
  category_ids: number[];
}

export interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    plot: string;
    duration: string;
    rating: string;
    movie_image: string;
  };
  custom_sid: string;
  added: string;
  season: number;
  direct_source: string;
  stream_id: number | string;
}

export interface SeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    rating_5based: number;
    backdrop_path: string[];
    youtube_trailer: string;
    tmdb_id: string;
  };
  episodes: Record<string, Episode[]>;
  seasons: Array<{
    season_number: number;
    name: string;
    air_date: string;
    episode_count: number;
    overview: string;
    cover: string;
    cover_big: string;
  }>;
}

export interface EpgListing {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
  now_playing: number;
  has_archive: number;
}

const IPTV_SERVER = process.env.IPTV_SERVER || '';
const IPTV_USERNAME = process.env.IPTV_USERNAME || '';
const IPTV_PASSWORD = process.env.IPTV_PASSWORD || '';

function getApiUrl(action?: string, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams({
    username: IPTV_USERNAME,
    password: IPTV_PASSWORD,
  });
  if (action) params.set('action', action);
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => params.set(key, value));
  }
  return `${IPTV_SERVER}/player_api.php?${params.toString()}`;
}

export async function fetchApi<T>(action?: string, extraParams?: Record<string, string>): Promise<T> {
  const url = getApiUrl(action, extraParams);
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`IPTV API error: ${res.status}`);
  return res.json();
}

export function getLiveStreamUrl(streamId: number, format: string = 'm3u8'): string {
  return `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${format}`;
}

export function getVodStreamUrl(streamId: number, extension: string): string {
  return `${IPTV_SERVER}/movie/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${extension}`;
}

export function getSeriesStreamUrl(streamId: number, extension: string): string {
  return `${IPTV_SERVER}/series/${IPTV_USERNAME}/${IPTV_PASSWORD}/${streamId}.${extension}`;
}

export interface M3UChannel {
  name: string;
  logo: string;
  group: string;
  url: string;
  stream_id: number;
}

export const MOCK_WORLD_CUP_CHANNELS: M3UChannel[] = [
  {
    name: "beIN SPORTS MAX 1 HD (كأس العالم)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sF5zI5s0P-3l3r7tZ8LwZ8F1P5k4D6D2A&s",
    group: "كأس العالم",
    url: `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/2001.ts`,
    stream_id: 2001
  },
  {
    name: "beIN SPORTS MAX 2 HD (كأس العالم)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sF5zI5s0P-3l3r7tZ8LwZ8F1P5k4D6D2A&s",
    group: "كأس العالم",
    url: `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/2002.ts`,
    stream_id: 2002
  },
  {
    name: "beIN SPORTS MAX 3 HD (كأس العالم)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sF5zI5s0P-3l3r7tZ8LwZ8F1P5k4D6D2A&s",
    group: "كأس العالم",
    url: `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/2003.ts`,
    stream_id: 2003
  },
  {
    name: "Alkass EXTRA One HD (كأس العالم)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sF5zI5s0P-3l3r7tZ8LwZ8F1P5k4D6D2A&s",
    group: "كأس العالم",
    url: `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/2004.ts`,
    stream_id: 2004
  },
  {
    name: "Alkass EXTRA Two HD (كأس العالم)",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sF5zI5s0P-3l3r7tZ8LwZ8F1P5k4D6D2A&s",
    group: "كأس العالم",
    url: `${IPTV_SERVER}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/2005.ts`,
    stream_id: 2005
  }
];

export async function fetchAndParseM3U(filterKeyword: string): Promise<M3UChannel[]> {
  const m3uUrl = `${IPTV_SERVER}/get.php?username=${IPTV_USERNAME}&password=${IPTV_PASSWORD}&type=m3u_plus&output=ts`;
  
  try {
    const res = await fetch(m3uUrl, { 
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000) // 6 second timeout
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const text = await res.text();
    const lines = text.split('\n');
    const channels: M3UChannel[] = [];
    
    let currentInfo: {
      name: string;
      logo: string;
      group: string;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse metadata
        const nameMatch = line.match(/,(.+)$/);
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);

        currentInfo = {
          name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
          logo: logoMatch ? logoMatch[1] : '',
          group: groupMatch ? groupMatch[1] : 'Channels',
        };
      } else if (line.startsWith('http') && currentInfo) {
        const url = line;
        
        // Extract stream ID from URL (e.g. /live/user/pass/12345.ts -> 12345)
        const idMatch = url.match(/\/(\d+)\.(ts|m3u8)/);
        const stream_id = idMatch ? parseInt(idMatch[1]) : Math.floor(Math.random() * 10000);

        if (currentInfo.name.toLowerCase().includes(filterKeyword.toLowerCase())) {
          channels.push({
            name: currentInfo.name,
            logo: currentInfo.logo,
            group: currentInfo.group,
            url,
            stream_id,
          });
        }
        currentInfo = null;
      }
    }

    return channels;
  } catch (error) {
    console.warn("M3U fetch failed or timed out. Falling back to mock data.", error);
    // Return filtered mock data
    return MOCK_WORLD_CUP_CHANNELS.filter(c => 
      c.name.toLowerCase().includes(filterKeyword.toLowerCase())
    );
  }
}
