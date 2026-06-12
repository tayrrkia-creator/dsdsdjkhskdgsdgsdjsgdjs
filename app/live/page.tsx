'use client';

import { useEffect, useState, useMemo } from 'react';
import { M3UChannel } from '@/lib/iptv';
import SearchBar from '@/components/SearchBar';
import { ChannelSkeleton } from '@/components/LoadingSkeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { Tv, Heart } from 'lucide-react';
import Link from 'next/link';

export default function LiveTV() {
  const [channels, setChannels] = useState<M3UChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function loadWorldCupChannels() {
      try {
        setLoading(true);
        const res = await fetch('/api/iptv/worldcup');
        if (!res.ok) throw new Error('Failed to load World Cup channels');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setChannels(data || []);
      } catch (err: any) {
        setError(err.message || 'Could not fetch channels');
      } finally {
        setLoading(false);
      }
    }
    loadWorldCupChannels();
  }, []);

  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;
    const query = searchQuery.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(query));
  }, [channels, searchQuery]);

  const handleToggleFav = (channel: M3UChannel) => {
    toggleFavorite({
      id: channel.stream_id,
      type: 'live',
      name: channel.name,
      icon: channel.logo,
    });
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1>قنوات كأس العالم المباشرة</h1>
        <p>شاهد بث جميع المباريات الحية والبرامج الرياضية لكأس العالم</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث عن قنوات كأس العالم..."
        />
      </div>

      {loading ? (
        <ChannelSkeleton count={12} />
      ) : filteredChannels.length > 0 ? (
        <div className="content-grid channels">
          {filteredChannels.map((channel) => (
            <div className="channel-card" key={channel.stream_id}>
              <Link
                href={`/player?type=live&id=${channel.stream_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  className="channel-logo"
                  src={channel.logo || '/fallback.png'}
                  alt={channel.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxMzEzMWEiLz48cGF0aCBkPSJNMTc1IDE1MEwxNjAgMTcwSDE5MEwxNzUgMTUwWiIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjE4NSIgY3k9IjEzNSIgcj0iOCIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjE0MCIgeT0iMTIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI4IiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';
                  }}
                  loading="lazy"
                />
                <div className="channel-info">
                  <div className="channel-name" style={{ textAlign: 'right', direction: 'rtl' }}>{channel.name}</div>
                  <div className="channel-category">كأس العالم Live</div>
                </div>
                <span className="channel-live-badge">مباشر</span>
              </Link>
              <button
                className={`favorite-btn ${isFavorite(channel.stream_id, 'live') ? 'active' : ''}`}
                onClick={() => handleToggleFav(channel)}
                aria-label="Add to library"
              >
                <Heart size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Tv size={48} />
          <h3>لا توجد قنوات</h3>
          <p>لم نتمكن من العثور على أي قنوات مطابقة لبحثك.</p>
        </div>
      )}
    </div>
  );
}
