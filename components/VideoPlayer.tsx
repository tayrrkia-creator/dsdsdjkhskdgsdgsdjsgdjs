'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  isLive?: boolean;
  onError?: (error: string) => void;
}

export default function VideoPlayer({ src, title, autoPlay = true, isLive = false, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 0 : 90,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setIsLoading(false);
          onError?.('Stream playback error');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
    } else {
      video.src = src;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, isLive, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (video.duration && isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(formatTime(video.currentTime));
        setDuration(formatTime(video.duration));
      }
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

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
      />

      {isLoading && (
        <div className="player-loading">
          <div className="player-spinner" />
        </div>
      )}

      <div className="player-controls" style={{ opacity: showControls ? 1 : 0 }}>
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
              <span className="channel-live-badge">LIVE</span>
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
