'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { FALLBACK_IMAGE } from '@/lib/constants';

interface MediaCardProps {
  id: number;
  name: string;
  image: string;
  rating?: string;
  year?: string;
  type: 'vod' | 'series';
  extension?: string;
}

export default function MediaCard({ id, name, image, rating, year, type, extension }: MediaCardProps) {
  const [imgError, setImgError] = useState(false);

  const href = type === 'series'
    ? `/series/${id}`
    : `/player?type=vod&id=${id}&ext=${extension || 'mp4'}`;

  return (
    <Link href={href} className="media-card">
      <img
        className="media-card-image"
        src={imgError || !image ? FALLBACK_IMAGE : image}
        alt={name}
        onError={() => setImgError(true)}
        loading="lazy"
      />
      <div className="play-button-overlay">
        <Play />
      </div>
      <div className="media-card-overlay">
        <div className="media-card-title">{name}</div>
        <div className="media-card-meta">
          {rating && parseFloat(rating) > 0 && (
            <span className="media-card-rating">
              <Star size={12} fill="currentColor" />
              {parseFloat(rating).toFixed(1)}
            </span>
          )}
          {year && <span>{year}</span>}
        </div>
      </div>
      <div className="media-card-bottom">
        <div className="media-card-bottom-title">{name}</div>
      </div>
    </Link>
  );
}
