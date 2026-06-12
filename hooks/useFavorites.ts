'use client';

import { useState, useEffect, useCallback } from 'react';

interface FavoriteItem {
  id: number;
  type: 'live' | 'vod' | 'series';
  name: string;
  icon?: string;
  extension?: string;
}

const STORAGE_KEY = 'streamvault_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch {}
    }
  }, [favorites, loaded]);

  const isFavorite = useCallback(
    (id: number, type: 'live' | 'vod' | 'series') =>
      favorites.some((f) => f.id === id && f.type === type),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === item.id && f.type === item.type);
        if (exists) return prev.filter((f) => !(f.id === item.id && f.type === item.type));
        return [...prev, item];
      });
    },
    []
  );

  const removeFavorite = useCallback(
    (id: number, type: 'live' | 'vod' | 'series') => {
      setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));
    },
    []
  );

  return { favorites, isFavorite, toggleFavorite, removeFavorite, loaded };
}
