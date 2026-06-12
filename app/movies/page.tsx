'use client';

import { useEffect, useState, useMemo } from 'react';
import { Category, VodStream } from '@/lib/iptv';
import MediaCard from '@/components/MediaCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import { MediaSkeleton } from '@/components/LoadingSkeleton';
import { Film } from 'lucide-react';

export default function Movies() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<VodStream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/iptv/vod/categories');
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
      setVisibleCount(24); // Reset pagination
      try {
        const url = selectedCategory
          ? `/api/iptv/vod/streams?category_id=${selectedCategory}`
          : '/api/iptv/vod/streams';
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

  // Filter streams by search
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
    setVisibleCount((prev) => prev + 24);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>On-Demand Movies</h1>
        <p>Explore movie titles, collections, and catalog releases</p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search movies..."
      />

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
        <MediaSkeleton count={12} />
      ) : visibleStreams.length > 0 ? (
        <>
          <div className="content-grid movies">
            {visibleStreams.map((stream) => (
              <MediaCard
                key={stream.stream_id}
                id={stream.stream_id}
                name={stream.name}
                image={stream.stream_icon}
                rating={stream.rating}
                type="vod"
                extension={stream.container_extension}
              />
            ))}
          </div>

          {filteredStreams.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <button className="btn btn-secondary" onClick={handleLoadMore}>
                Load More Movies ({filteredStreams.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Film />
          <h3>No Movies Found</h3>
          <p>We couldn't find any movie files matching your filter or search criteria.</p>
        </div>
      )}
    </div>
  );
}
