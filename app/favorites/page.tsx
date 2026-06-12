'use client';

import { useFavorites } from '@/hooks/useFavorites';
import ChannelCard from '@/components/ChannelCard';
import { Tv } from 'lucide-react';

export default function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();

  const liveFavorites = favorites.filter((f) => f.type === 'live');

  const handleToggleFavorite = (id: number) => {
    const item = favorites.find((f) => f.id === id && f.type === 'live');
    if (item) toggleFavorite(item);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>القنوات المفضلة</h1>
        <p>قائمة قنوات كأس العالم التي قمت بحفظها للوصول السريع</p>
      </div>

      {liveFavorites.length > 0 ? (
        <div className="content-grid channels">
          {liveFavorites.map((item) => (
            <ChannelCard
              key={item.id}
              streamId={item.id}
              name={item.name}
              icon={item.icon || ''}
              isFavorite={true}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Tv size={48} />
          <h3>لا توجد قنوات مفضلة</h3>
          <p>أضف بعض قنوات كأس العالم المباشرة إلى المفضلة لتظهر هنا.</p>
        </div>
      )}
    </div>
  );
}
