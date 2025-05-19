"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface FiltersTabProps {
  imageUrl: string;
  onChange: (filter: string | null) => void;
  initialFilter?: string | null; // Optional initial filter value
}

// Filter presets with their Cloudinary transformation equivalents
const FILTERS = [
  { name: 'Original', value: null },
  { name: 'Duotone', value: 'Duotone' },
  { name: '1977', value: '1977' },
  { name: 'Aden', value: 'Aden' },
  { name: 'Brannan', value: 'Brannan' },
  { name: 'Brooklyn', value: 'Brooklyn' },
  { name: 'Clarendon', value: 'Clarendon' },
  { name: 'Gingham', value: 'Gingham' },
  { name: 'Hudson', value: 'Hudson' },
  { name: 'Inkwell', value: 'Inkwell' },
  { name: 'Valencia', value: 'Valencia' }
];

export default function FiltersTab({ imageUrl, onChange, initialFilter }: FiltersTabProps) {
  // Get filter preview function from store
  const { getFilterThumbnailUrl } = useFormBuilderStore();
  
  // Initialize with the provided filter or null
  const [selectedFilter, setSelectedFilter] = useState<string | null>(initialFilter || null);
  
  // Update state when initialFilter changes
  useEffect(() => {
    if (initialFilter !== undefined) {
      setSelectedFilter(initialFilter);
    }
  }, [initialFilter]);
  
  const handleFilterSelect = (filterValue: string | null) => {
    setSelectedFilter(filterValue);
    onChange(filterValue);
  };

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {FILTERS.map(filter => (
        <div key={filter.name} className="flex flex-col items-center">
          <button 
            className={cn(
              "w-full aspect-square rounded-md overflow-hidden border-2 transition-all",
              selectedFilter === filter.value ? "border-primary" : "border-transparent hover:border-primary/50"
            )}
            onClick={() => handleFilterSelect(filter.value)}
          >
            <img 
              src={getFilterThumbnailUrl(filter.value) || imageUrl} 
              alt={filter.name}
              className="w-full h-full object-cover"
            />
          </button>
          <span className="mt-2 text-center text-sm">{filter.name}</span>
        </div>
      ))}
    </div>
  );
}
