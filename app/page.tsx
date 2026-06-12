'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Tv, Trophy, ShieldAlert, Heart, Search, Play } from 'lucide-react';
import { M3UChannel } from '@/lib/iptv';
import { ChannelSkeleton } from '@/components/LoadingSkeleton';
import { useFavorites } from '@/hooks/useFavorites';
import SearchBar from '@/components/SearchBar';

export default function Home() {
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
      {/* World Cup Themed Hero */}
      <div className="hero" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }}>
        <div className="hero-bg" style={{ opacity: 0.1, backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 'var(--radius-full)', color: '#fbbf24', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <Trophy size={14} /> بث مباشر كأس العالم
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 900 }}>
            بوابة <span>كأس العالم</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#e2e8f0', maxWidth: '520px' }}>
            شاهد جميع قنوات ومباريات كأس العالم بث مباشر بجودة عالية وبدون تقطيع. تابع منتخباتك المفضلة لحظة بلحظة.
          </p>
        </div>
      </div>

      {/* Connection warning or error */}
      {error && (
        <div className="player-info" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-rose)' }}>
            <ShieldAlert size={24} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>IPTV Server Offline</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Server returned 502 Bad Gateway. Displaying local cached World Cup channels fallback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Channel List */}
      <div className="section">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 700 }}>قنوات كأس العالم المتاحة</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>انقر على أي قناة لبدء البث المباشر فوراً</p>
          </div>
          <span className="channel-live-badge" style={{ padding: '6px 12px' }}>{filteredChannels.length} قنوات</span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث عن قنوات كأس العالم..."
          />
        </div>

        {loading ? (
          <ChannelSkeleton count={6} />
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
                    <div className="channel-category">كأس العالم live</div>
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
    </div>
  );
}
