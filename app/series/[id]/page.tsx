'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Star, Calendar, Heart } from 'lucide-react';
import { SeriesInfo, Episode } from '@/lib/iptv';
import { useFavorites } from '@/hooks/useFavorites';
import { FALLBACK_IMAGE } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SeriesDetail({ params }: PageProps) {
  const { id: seriesId } = use(params);
  
  const [data, setData] = useState<SeriesInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<string>('1');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function fetchSeriesInfo() {
      try {
        const res = await fetch(`/api/iptv/series/info?series_id=${seriesId}`);
        if (!res.ok) throw new Error('Failed to load series details');
        const resData = await res.json();
        if (resData.error) throw new Error(resData.error);
        setData(resData);
        
        // Set first season as active
        if (resData.episodes) {
          const seasons = Object.keys(resData.episodes).sort((a, b) => parseInt(a) - parseInt(b));
          if (seasons.length > 0) {
            setActiveSeason(seasons[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching series info');
      } finally {
        setLoading(false);
      }
    }
    fetchSeriesInfo();
  }, [seriesId]);

  const handleToggleFavorite = () => {
    if (!data) return;
    toggleFavorite({
      id: parseInt(seriesId),
      type: 'series',
      name: data.info.name,
      icon: data.info.cover,
    });
  };

  const getEpisodesForActiveSeason = (): Episode[] => {
    if (!data || !data.episodes) return [];
    return data.episodes[activeSeason] || [];
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ padding: '24px 0' }}>
        <div className="skeleton" style={{ height: '30px', width: '100px', marginBottom: '24px' }} />
        <div className="series-detail-header">
          <div className="skeleton series-detail-poster" />
          <div className="series-detail-info">
            <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '24px', width: '180px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '24px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-enter" style={{ padding: '24px 0' }}>
        <Link href="/series" className="back-link">
          <ArrowLeft size={16} /> Back to Series
        </Link>
        <div className="player-info" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)' }}>
          <h3>Failed to load series details</h3>
          <p>{error || 'Series not found.'}</p>
        </div>
      </div>
    );
  }

  const seasonsList = Object.keys(data.episodes || {}).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="page-enter">
      <Link href="/series" className="back-link">
        <ArrowLeft size={16} /> Back to Series
      </Link>

      <div className="series-detail-header">
        <div className="series-detail-poster">
          <img
            src={data.info.cover || FALLBACK_IMAGE}
            alt={data.info.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <div className="series-detail-info">
          <h1>{data.info.name}</h1>
          <div className="series-detail-meta">
            {data.info.rating && parseFloat(data.info.rating) > 0 && (
              <span className="meta-badge" style={{ color: 'var(--accent-amber)' }}>
                <Star size={14} fill="currentColor" /> {parseFloat(data.info.rating).toFixed(1)}
              </span>
            )}
            {data.info.releaseDate && (
              <span className="meta-badge">
                <Calendar size={14} /> {data.info.releaseDate}
              </span>
            )}
            {data.info.genre && (
              <span className="meta-badge">{data.info.genre}</span>
            )}
          </div>
          <p className="series-detail-plot">{data.info.plot || 'No overview available.'}</p>
          {data.info.cast && (
            <div className="series-detail-cast">
              <strong>Cast:</strong> {data.info.cast}
            </div>
          )}
          {data.info.director && (
            <div className="series-detail-cast" style={{ marginTop: '4px' }}>
              <strong>Director:</strong> {data.info.director}
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <button
              className={`btn ${isFavorite(parseInt(seriesId), 'series') ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={16} fill={isFavorite(parseInt(seriesId), 'series') ? 'var(--accent-rose)' : 'none'} style={{ color: isFavorite(parseInt(seriesId), 'series') ? 'var(--accent-rose)' : 'currentColor' }} />
              {isFavorite(parseInt(seriesId), 'series') ? 'Remove from Library' : 'Add to Library'}
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Seasons & Episodes</h2>
        </div>

        {seasonsList.length > 0 ? (
          <>
            <div className="season-tabs">
              {seasonsList.map((season) => (
                <button
                  key={season}
                  className={`season-tab ${activeSeason === season ? 'active' : ''}`}
                  onClick={() => setActiveSeason(season)}
                >
                  Season {season}
                </button>
              ))}
            </div>

            <div className="episode-list">
              {getEpisodesForActiveSeason().map((episode) => (
                <Link
                  key={episode.id}
                  href={`/player?type=series&id=${episode.stream_id}&ext=${episode.container_extension || 'mp4'}`}
                  className="episode-item"
                >
                  <div className="episode-number">
                    E{episode.episode_num.toString().padStart(2, '0')}
                  </div>
                  <div className="episode-info">
                    <div className="episode-title">{episode.title || `Episode ${episode.episode_num}`}</div>
                    {episode.info?.plot && (
                      <div className="channel-category" style={{ fontSize: '13px', margin: '4px 0' }}>
                        {episode.info.plot}
                      </div>
                    )}
                    {episode.info?.duration && (
                      <div className="episode-duration">Duration: {episode.info.duration}</div>
                    )}
                  </div>
                  <button className="btn-icon" aria-label="Play Episode">
                    <Play size={14} fill="currentColor" />
                  </button>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No Episodes Available</h3>
            <p>We couldn't find any seasons or episodes for this series.</p>
          </div>
        )}
      </div>
    </div>
  );
}
