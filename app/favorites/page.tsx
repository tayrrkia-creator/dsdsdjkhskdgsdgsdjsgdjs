'use client';

import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import ChannelCard from '@/components/ChannelCard';
import MediaCard from '@/components/MediaCard';
import { Heart, Tv, Film, Clapperboard } from 'lucide-react';

type Tab = 'live' | 'vod' | 'series';

export default function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<Tab>('live');

  const liveFavorites = favorites.filter((f) => f.type === 'live');
  const movieFavorites = favorites.filter((f) => f.type === 'vod');
  const seriesFavorites = favorites.filter((f) => f.type === 'series');

  const handleToggleFavorite = (id: number, type: 'live' | 'vod' | 'series') => {
    const item = favorites.find((f) => f.id === id && f.type === type);
    if (item) toggleFavorite(item);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>My Library</h1>
        <p>Your saved live TV channels, movies, and series</p>
      </div>

      <div className="season-tabs" style={{ marginBottom: '32px' }}>
        <button
          className={`season-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <Tv size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Live TV ({liveFavorites.length})
        </button>
        <button
          className={`season-tab ${activeTab === 'vod' ? 'active' : ''}`}
          onClick={() => setActiveTab('vod')}
        >
          <Film size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Movies ({movieFavorites.length})
        </button>
        <button
          className={`season-tab ${activeTab === 'series' ? 'active' : ''}`}
          onClick={() => setActiveTab('series')}
        >
          <Clapperboard size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Series ({seriesFavorites.length})
        </button>
      </div>

      {activeTab === 'live' && (
        liveFavorites.length > 0 ? (
          <div className="content-grid channels">
            {liveFavorites.map((item) => (
              <ChannelCard
                key={item.id}
                streamId={item.id}
                name={item.name}
                icon={item.icon || ''}
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(item.id, 'live')}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Tv />
            <h3>No Favorite Channels</h3>
            <p>Save channels while watching Live TV to see them here.</p>
          </div>
        )
      )}

      {activeTab === 'vod' && (
        movieFavorites.length > 0 ? (
          <div className="content-grid movies">
            {movieFavorites.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.icon || ''}
                type="vod"
                extension={item.extension}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Film />
            <h3>No Favorite Movies</h3>
            <p>Save movies while exploring the VOD catalog to access them quickly.</p>
          </div>
        )
      )}

      {activeTab === 'series' && (
        seriesFavorites.length > 0 ? (
          <div className="content-grid movies">
            {seriesFavorites.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.icon || ''}
                type="series"
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Clapperboard />
            <h3>No Favorite Series</h3>
            <p>Add TV shows to your library to keep track of your progress.</p>
          </div>
        )
      )}
    </div>
  );
}
