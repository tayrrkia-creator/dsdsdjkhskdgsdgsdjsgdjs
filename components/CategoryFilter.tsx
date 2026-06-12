'use client';

interface Category {
  category_id: string;
  category_name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryFilter({ categories, activeId, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`category-pill ${activeId === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          className={`category-pill ${activeId === cat.category_id ? 'active' : ''}`}
          onClick={() => onSelect(cat.category_id)}
        >
          {cat.category_name}
        </button>
      ))}
    </div>
  );
}
