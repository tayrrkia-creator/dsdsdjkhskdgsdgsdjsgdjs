'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { FALLBACK_IMAGE } from '@/lib/constants';

interface ChannelCardProps {
  streamId: number;
  name: string;
  icon: string;
  category?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export default function ChannelCard({ streamId, name, icon, category, isFavorite, onToggleFavorite }: ChannelCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="channel-card">
      <Link href={`/player?type=live&id=${streamId}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, textDecoration: 'none', color: 'inherit' }}>
        <img
          className="channel-logo"
          src={imgError || !icon ? FALLBACK_IMAGE : icon}
          alt={name}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="channel-info">
          <div className="channel-name">{name}</div>
          {category && <div className="channel-category">{category}</div>}
        </div>
        <span className="channel-live-badge">LIVE</span>
      </Link>
      {onToggleFavorite && (
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(streamId); }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} />
        </button>
      )}
    </div>
  );
}
