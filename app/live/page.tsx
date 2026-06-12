'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchApi, Category, LiveStream } from '@/lib/iptv';
import ChannelCard from '@/components/ChannelCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import { ChannelSkeleton } from '@/components/LoadingSkeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { Tv } from 'lucide-react';

export default function LiveTV() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [visibleCount, setVisibleCount] = useState(48);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/iptv/live/categories');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Load streams when selected category changes
  useEffect(() => {
    async function loadStreams() {
      setLoadingStreams(true);
      setVisibleCount(48); // Reset pagination
      try {
        const url = selectedCategory
          ? `/api/iptv/live/streams?category_id=${selectedCategory}`
          : '/api/iptv/live/streams';
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStreams(data || []);
      } catch (err) {
        console.error('Failed to load streams');
      } finally {
        setLoadingStreams(false);
      }
    }
    loadStreams();
  }, [selectedCategory]);

  // Filter streams by search query
  const filteredStreams = useMemo(() => {
    if (!searchQuery) return streams;
    const query = searchQuery.toLowerCase();
    return streams.filter((stream) =>
      stream.name.toLowerCase().includes(query)
    );
  }, [streams, searchQuery]);

  const visibleStreams = useMemo(() => {
    return filteredStreams.slice(0, visibleCount);
  }, [filteredStreams, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 48);
  };

  const handleToggleFav = (streamId: number) => {
    const stream = streams.find((s) => s.stream_id === streamId);
    if (!stream) return;
    toggleFavorite({
      id: stream.stream_id,
      type: 'live',
      name: stream.name,
      icon: stream.stream_icon,
    });
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Live Television</h1>
        <p>Browse and play live TV channels from your provider</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search channels..."
        />
      </div>

      {loadingCategories ? (
        <div className="skeleton" style={{ height: '38px', width: '100%', borderRadius: 'var(--radius-full)', marginBottom: '24px' }} />
      ) : (
        <CategoryFilter
          categories={categories}
          activeId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {loadingStreams ? (
        <ChannelSkeleton count={12} />
      ) : visibleStreams.length > 0 ? (
        <>
          <div className="content-grid channels">
            {visibleStreams.map((stream) => (
              <ChannelCard
                key={stream.stream_id}
                streamId={stream.stream_id}
                name={stream.name}
                icon={stream.stream_icon}
                isFavorite={isFavorite(stream.stream_id, 'live')}
                onToggleFavorite={handleToggleFav}
              />
            ))}
          </div>

          {filteredStreams.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <button className="btn btn-secondary" onClick={handleLoadMore}>
                Load More Channels ({filteredStreams.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Tv />
          <h3>No Channels Found</h3>
          <p>We couldn't find any channels matching your filters or search.</p>
        </div>
      )}
    </div>
  );
}
