'use client';

import { useEffect, useState, useMemo } from 'react';
import { Category, Series } from '@/lib/iptv';
import MediaCard from '@/components/MediaCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import { MediaSkeleton } from '@/components/LoadingSkeleton';
import { Clapperboard } from 'lucide-react';

export default function SeriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/iptv/series/categories');
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

  // Load series when selected category changes
  useEffect(() => {
    async function loadSeries() {
      setLoadingSeries(true);
      setVisibleCount(24); // Reset pagination
      try {
        const url = selectedCategory
          ? `/api/iptv/series/list?category_id=${selectedCategory}`
          : '/api/iptv/series/list';
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSeriesList(data || []);
      } catch (err) {
        console.error('Failed to load series');
      } finally {
        setLoadingSeries(false);
      }
    }
    loadSeries();
  }, [selectedCategory]);

  // Filter series by search
  const filteredSeries = useMemo(() => {
    if (!searchQuery) return seriesList;
    const query = searchQuery.toLowerCase();
    return seriesList.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [seriesList, searchQuery]);

  const visibleSeries = useMemo(() => {
    return filteredSeries.slice(0, visibleCount);
  }, [filteredSeries, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>TV Series</h1>
        <p>Explore television programs, seasons, and serial shows</p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search series..."
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

      {loadingSeries ? (
        <MediaSkeleton count={12} />
      ) : visibleSeries.length > 0 ? (
        <>
          <div className="content-grid movies">
            {visibleSeries.map((item) => (
              <MediaCard
                key={item.series_id}
                id={item.series_id}
                name={item.name}
                image={item.cover}
                rating={item.rating}
                type="series"
              />
            ))}
          </div>

          {filteredSeries.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
              <button className="btn btn-secondary" onClick={handleLoadMore}>
                Load More Series ({filteredSeries.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Clapperboard />
          <h3>No Series Found</h3>
          <p>We couldn't find any TV series matching your filter or search criteria.</p>
        </div>
      )}
    </div>
  );
}
