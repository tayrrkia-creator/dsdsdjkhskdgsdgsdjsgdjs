'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Film, Tv, Star, Users, Info, ShieldAlert } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { VodInfo, EpgListing } from '@/lib/iptv';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') || 'live';
  const id = searchParams.get('id');
  const ext = searchParams.get('ext') || (type === 'live' ? 'ts' : 'mp4');

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [vodInfo, setVodInfo] = useState<VodInfo | null>(null);
  const [epgData, setEpgData] = useState<EpgListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Stream ID is required');
      setLoading(false);
      return;
    }

    async function loadPlayerInfo() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch final streaming URL from proxy
        const urlRes = await fetch(`/api/iptv/stream-url?type=${type}&stream_id=${id}&extension=${ext}`);
        if (!urlRes.ok) throw new Error('Failed to resolve stream URL');
        const urlData = await urlRes.json();
        if (urlData.error) throw new Error(urlData.error);
        setStreamUrl(urlData.url);

        // 2. Fetch metadata depending on type
        if (type === 'vod') {
          const infoRes = await fetch(`/api/iptv/vod/info?vod_id=${id}`);
          if (infoRes.ok) {
            const infoData = await infoRes.json();
            if (!infoData.error) setVodInfo(infoData);
          }
        } else if (type === 'live') {
          const epgRes = await fetch(`/api/iptv/epg?stream_id=${id}`);
          if (epgRes.ok) {
            const epgDataRes = await epgRes.json();
            if (epgDataRes.epg_listings) {
              setEpgData(epgDataRes.epg_listings);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error initializing stream player');
      } finally {
        setLoading(false);
      }
    }

    loadPlayerInfo();
  }, [type, id, ext]);

  const handlePlayerError = () => {
    setError('The media playback was aborted. The video is either unsupported, offline, or your connection was interrupted.');
  };

  const getBackUrl = () => {
    if (type === 'live') return '/live';
    if (type === 'vod') return '/movies';
    return '/series';
  };

  if (!id) {
    return (
      <div className="page-enter">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="player-info" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)' }}>
          <h3>Invalid Request</h3>
          <p>No stream ID was specified for the video player.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Link href={getBackUrl()} className="back-link">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {error ? (
        <div className="player-info" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--accent-rose)', marginBottom: '16px' }}>
            <ShieldAlert size={32} />
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Playback Failed</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry Playback
            </button>
            <Link href={getBackUrl()} className="btn btn-secondary">
              Go Back
            </Link>
          </div>
        </div>
      ) : streamUrl ? (
        <>
          <VideoPlayer
            src={streamUrl}
            title={type === 'live' ? 'Live Stream' : vodInfo?.info?.name || 'VOD Media'}
            isLive={type === 'live'}
            onError={handlePlayerError}
          />

          {type === 'vod' && vodInfo && (
            <div className="player-info" style={{ marginTop: '24px' }}>
              <h2>{vodInfo.info.name}</h2>
              
              <div className="series-detail-meta" style={{ margin: '12px 0 20px' }}>
                {vodInfo.info.rating && parseFloat(vodInfo.info.rating) > 0 && (
                  <span className="meta-badge" style={{ color: 'var(--accent-amber)' }}>
                    <Star size={14} fill="currentColor" /> {parseFloat(vodInfo.info.rating).toFixed(1)}
                  </span>
                )}
                {vodInfo.info.releasedate && (
                  <span className="meta-badge">Release: {vodInfo.info.releasedate}</span>
                )}
                {vodInfo.info.duration && (
                  <span className="meta-badge">Duration: {vodInfo.info.duration}</span>
                )}
                {vodInfo.info.genre && (
                  <span className="meta-badge">{vodInfo.info.genre}</span>
                )}
              </div>

              <p className="player-info-description" style={{ fontSize: '15px' }}>
                {vodInfo.info.plot || 'No details available for this title.'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                {vodInfo.info.cast && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: '1 1 250px' }}>
                    <Users size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Cast</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{vodInfo.info.cast}</span>
                    </div>
                  </div>
                )}
                {vodInfo.info.director && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: '1 1 200px' }}>
                    <Info size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Director</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{vodInfo.info.director}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'live' && (
            <div className="player-info" style={{ marginTop: '24px' }}>
              <h2>Live Channels Player</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                Playing live broadcast. Use the quality or fullscreen controls in the player panel.
              </p>

              {epgData.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Program Schedule (EPG)</h3>
                  <div className="episode-list">
                    {epgData.map((epg, i) => {
                      const startTime = epg.start ? new Date(epg.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                      const endTime = epg.end ? new Date(epg.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                      return (
                        <div key={i} className="episode-item" style={{ cursor: 'default' }}>
                          <div className="episode-number" style={{ minWidth: '100px', fontSize: '13px' }}>
                            {startTime} - {endTime}
                          </div>
                          <div className="episode-info">
                            <div className="episode-title" style={{ fontSize: '14px', fontWeight: 600 }}>{epg.title}</div>
                            {epg.description && (
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{epg.description}</div>
                            )}
                          </div>
                          {epg.now_playing === 1 && (
                            <span className="channel-live-badge" style={{ fontSize: '9px' }}>Active Now</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="player-spinner" />
          <h3 style={{ marginTop: '16px' }}>Loading Stream...</h3>
          <p>Connecting to media provider server</p>
        </div>
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="empty-state">
        <div className="player-spinner" />
        <h3 style={{ marginTop: '16px' }}>Loading Player Container...</h3>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
