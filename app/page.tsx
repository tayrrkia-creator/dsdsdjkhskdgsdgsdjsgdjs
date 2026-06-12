'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tv, Film, Clapperboard, Heart, Calendar, Activity, ShieldAlert, Award } from 'lucide-react';
import { AuthResponse } from '@/lib/iptv';
import { StatSkeleton } from '@/components/LoadingSkeleton';

export default function Home() {
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch('/api/iptv/auth');
        if (!res.ok) throw new Error('Failed to fetch auth data');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAuthData(data);
      } catch (err: any) {
        setError(err.message || 'Could not connect to IPTV server');
      } finally {
        setLoading(false);
      }
    }
    fetchAuth();
  }, []);

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'Unlimited';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="page-enter">
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-particles">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="hero-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-content">
          <h1>Welcome to <span>StreamVault</span></h1>
          <p>
            Experience premium streaming at your fingertips. Browse through thousands of live channels, on-demand movies, and complete TV series in high definition.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/live" className="btn btn-primary">
              <Tv size={18} /> Watch Live TV
            </Link>
            <Link href="/favorites" className="btn btn-secondary">
              <Heart size={18} /> My Library
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <StatSkeleton />
      ) : error ? (
        <div className="player-info" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-rose)' }}>
            <ShieldAlert size={24} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Connection Error</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {error}. Please check your server credentials in `.env.local`.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
              <Activity size={20} />
            </div>
            <h3>{authData?.user_info?.status || 'Active'}</h3>
            <p>Account Status</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
              <Calendar size={20} />
            </div>
            <h3>{formatDate(authData?.user_info?.exp_date || '')}</h3>
            <p>Expiration Date</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-secondary)' }}>
              <Award size={20} />
            </div>
            <h3>{authData?.user_info?.max_connections || '1'}</h3>
            <p>Max Connections</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <Tv size={20} />
            </div>
            <h3>{authData?.server_info?.timezone || 'UTC'}</h3>
            <p>Server Timezone</p>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Explore Categories</h2>
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <Link href="/live" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="stat-card-icon live">
              <Tv size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '8px 0 4px' }}>Live Television</h3>
            <p>Watch live streams from around the globe, organized by category.</p>
          </Link>
          <Link href="/movies" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="stat-card-icon movies">
              <Film size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '8px 0 4px' }}>On-Demand Movies</h3>
            <p>Access film releases, blockbusters, and classics anytime.</p>
          </Link>
          <Link href="/series" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="stat-card-icon series">
              <Clapperboard size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '8px 0 4px' }}>TV Series</h3>
            <p>Follow your favorite shows episode by episode, season by season.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
