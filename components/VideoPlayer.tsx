'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, RefreshCw, Clock, Loader } from 'lucide-react';

const LIVE_DELAY_SECONDS = 60; // 1 minute buffer delay for live streams

interface VideoPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  isLive?: boolean;
  onError?: (error: string) => void;
}

export default function VideoPlayer({ src, title, autoPlay = true, isLive = false, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Live delay buffering state
  const [isBufferingDelay, setIsBufferingDelay] = useState(false);
  const [bufferCountdown, setBufferCountdown] = useState(LIVE_DELAY_SECONDS);
  const [bufferProgress, setBufferProgress] = useState(0);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const destroyPlayer = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (e) {
        // ignore
      }
      playerRef.current = null;
    }
  }, []);

  const startBufferCountdown = useCallback((video: HTMLVideoElement) => {
    setIsBufferingDelay(true);
    setBufferCountdown(LIVE_DELAY_SECONDS);
    setBufferProgress(0);
    setIsLoading(false);

    let elapsed = 0;
    countdownRef.current = setInterval(() => {
      elapsed++;
      const remaining = LIVE_DELAY_SECONDS - elapsed;
      const pct = (elapsed / LIVE_DELAY_SECONDS) * 100;
      setBufferCountdown(remaining);
      setBufferProgress(pct);

      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setIsBufferingDelay(false);
        // Now start playback — the stream has been loading in the background for 1 min
        video.play().catch(() => setIsPlaying(false));
      }
    }, 1000);
  }, []);

  const initPlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);
    setPlayerError(null);
    setIsBufferingDelay(false);
    setBufferCountdown(LIVE_DELAY_SECONDS);
    setBufferProgress(0);
    destroyPlayer();

    // Detect format from file extension OR query param (for proxy URLs like /api/iptv/proxy?extension=ts)
    const urlObj = (() => { try { return new URL(src, window.location.origin); } catch { return null; } })();
    const extParam = urlObj?.searchParams.get('extension') || '';
    const isM3u8 = src.includes('.m3u8') || extParam === 'm3u8';
    const isTs = (src.includes('.ts') || extParam === 'ts' || src.includes('extension=ts')) && !isM3u8;

    try {
      if (isTs) {
        const mpegts = (await import('mpegts.js')).default;
        if (mpegts.isSupported()) {
          const player = mpegts.createPlayer({
            type: 'mpegts',
            isLive: isLive,
            url: src,
          }, {
            enableWorker: true,
            lazyLoadMaxDuration: 5 * 60,
            seekType: 'range',
            // Disable live latency chasing so the buffer accumulates the 1-min delay
            liveBufferLatencyChasing: false,
            liveBufferLatencyMaxLatency: 120,
            liveBufferLatencyMinRemain: 60,
          });
          playerRef.current = player;
          player.attachMediaElement(video);
          player.load();

          player.on(mpegts.Events.ERROR, (errorType: string, errorDetail: string) => {
            console.error('mpegts.js error:', errorType, errorDetail);
            setIsLoading(false);
            setIsBufferingDelay(false);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setPlayerError(`Stream error: ${errorDetail || errorType}`);
            onError?.(`Stream error: ${errorDetail || errorType}`);
          });

          // For live streams: start the 1 min countdown once data starts arriving
          if (isLive) {
            const onDataArrived = () => {
              video.removeEventListener('loadeddata', onDataArrived);
              startBufferCountdown(video);
            };
            video.addEventListener('loadeddata', onDataArrived);
          } else {
            if (autoPlay) {
              video.play().catch(() => setIsPlaying(false));
            }
          }
        } else {
          setPlayerError('Your browser does not support MPEG-TS playback');
          onError?.('Browser does not support MPEG-TS playback');
        }
      } else if (isM3u8) {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: isLive ? 120 : 90,
            liveDurationInfinity: isLive,
            // Allow large buffer for 1-min delay
            maxBufferLength: isLive ? 120 : 30,
            maxMaxBufferLength: isLive ? 180 : 60,
          });
          playerRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (isLive) {
              startBufferCountdown(video);
            } else {
              if (autoPlay) video.play().catch(() => {});
            }
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              console.error('HLS fatal error:', data);
              setIsLoading(false);
              setIsBufferingDelay(false);
              if (countdownRef.current) clearInterval(countdownRef.current);
              setPlayerError('HLS stream error. The stream may be offline.');
              onError?.('HLS stream error');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          if (isLive) {
            video.addEventListener('loadeddata', () => startBufferCountdown(video), { once: true });
          } else {
            if (autoPlay) video.play().catch(() => {});
          }
        }
      } else {
        // Direct playback (mp4, etc.) — no delay for VOD
        video.src = src;
        video.addEventListener('loadeddata', () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        }, { once: true });
      }
    } catch (err: any) {
      console.error('Player init error:', err);
      setPlayerError('Failed to initialize video player');
      onError?.('Failed to initialize video player');
      setIsLoading(false);
    }
  }, [src, autoPlay, isLive, onError, destroyPlayer, startBufferCountdown]);

  useEffect(() => {
    initPlayer();
    return () => destroyPlayer();
  }, [initPlayer, destroyPlayer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (video.duration && isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(formatTime(video.currentTime));
        setDuration(formatTime(video.duration));
      }
    };
    const onWaiting = () => {
      if (!isBufferingDelay) setIsLoading(true);
    };
    const onCanPlay = () => {
      if (!isBufferingDelay) setIsLoading(false);
    };
    const onVideoError = () => {
      setIsLoading(false);
      if (!playerError && !isBufferingDelay) {
        setPlayerError('The media playback was aborted. The video is either unsupported, offline, or your connection was interrupted.');
        onError?.('Media playback error');
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onVideoError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onVideoError);
    };
  }, [onError, playerError, isBufferingDelay]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || isBufferingDelay) return; // can't play during buffer countdown
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [isBufferingDelay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!video.muted ? false : true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || isLive) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, [isLive]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || isLive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  }, [isLive]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const handleRetry = useCallback(() => {
    setPlayerError(null);
    initPlayer();
  }, [initPlayer]);

  // Skip the buffer delay and start playing immediately
  const skipDelay = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setIsBufferingDelay(false);
    const video = videoRef.current;
    if (video) video.play().catch(() => setIsPlaying(false));
  }, []);

  return (
    <div
      ref={containerRef}
      className="player-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
        style={{ opacity: isBufferingDelay ? 0 : 1 }}
      />

      {/* Spinner while connecting (before buffer countdown starts) */}
      {isLoading && !playerError && !isBufferingDelay && (
        <div className="player-loading">
          <div className="player-spinner" />
        </div>
      )}

      {/* Live delay buffering countdown overlay */}
      {isBufferingDelay && (
        <div className="player-loading" style={{
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          padding: '32px',
          background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
        }}>
          {/* Countdown circle */}
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="70" cy="70" r="62"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
              />
              <circle
                cx="70" cy="70" r="62"
                fill="none"
                stroke="url(#bufferGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - bufferProgress / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="bufferGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '36px',
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                background: 'linear-gradient(135deg, #c7d2fe, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}>
                {bufferCountdown}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                sec
              </span>
            </div>
          </div>

          {/* Text info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8' }}>
            <Clock size={18} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Buffering Live Stream</span>
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            maxWidth: '340px',
            lineHeight: 1.6,
          }}>
            Loading 1 minute of stream data for a smooth, delayed playback experience. The stream will start automatically.
          </p>

          {/* Progress bar */}
          <div style={{
            width: '280px',
            height: '4px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${bufferProgress}%`,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              borderRadius: '4px',
              transition: 'width 1s linear',
            }} />
          </div>

          {/* Skip button */}
          <button
            onClick={skipDelay}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            Skip delay — play now
          </button>
        </div>
      )}

      {/* Error overlay */}
      {playerError && (
        <div className="player-loading" style={{ flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
          <div style={{ color: 'var(--accent-rose)', fontSize: '18px', fontWeight: 600 }}>
            Stream Unavailable
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
            {playerError}
          </p>
          <button className="btn btn-primary" onClick={handleRetry} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      <div className="player-controls" style={{ opacity: showControls && !isBufferingDelay ? 1 : 0 }}>
        {!isLive && (
          <div className="player-progress" onClick={handleProgressClick}>
            <div className="player-progress-filled" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="player-buttons">
          <div className="player-buttons-left">
            <button className="player-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
            {!isLive && (
              <>
                <button className="player-btn" onClick={() => seek(-10)} aria-label="Rewind 10s">
                  <SkipBack />
                </button>
                <button className="player-btn" onClick={() => seek(10)} aria-label="Forward 10s">
                  <SkipForward />
                </button>
              </>            
            )}
            <button className="player-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX /> : <Volume2 />}
            </button>
            {!isLive && (
              <span className="player-time">{currentTime} / {duration}</span>
            )}
            {isLive && (
              <span className="channel-live-badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                DELAYED −1 MIN
              </span>
            )}
          </div>
          <div className="player-buttons-right">
            {title && <span className="player-time" style={{ marginRight: 8 }}>{title}</span>}
            <button className="player-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
              {isFullscreen ? <Minimize /> : <Maximize />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
