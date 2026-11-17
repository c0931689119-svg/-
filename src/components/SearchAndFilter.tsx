import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  brands: string[];
  sortBy: 'priceDesc' | 'diffDesc' | 'modelAsc';
  onSortChange: (sort: 'priceDesc' | 'diffDesc' | 'modelAsc') => void;
  vendorFilter: 'ALL' | 'dianzi' | 'fdi';
  onVendorFilterChange: (v: 'ALL' | 'dianzi' | 'fdi') => void;
  totalCount: number;
  filteredCount: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandSelect,
  brands,
  sortBy,
  onSortChange,
  vendorFilter,
  onVendorFilterChange,
  totalCount,
  filteredCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-3.5 space-y-3">
        {/* Main Search Bar & Quick Controls */}
        <div className="flex items-center gap-3 justify-between">
          {/* Prominent Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜尋型號、容量，如：16 Pro、S25、256G... (按 / 快速搜尋)"
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Sort Options */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">排序:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => onSortChange('priceDesc')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  sortBy === 'priceDesc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                最高回收價
              </button>
              <button
                onClick={() => onSortChange('diffDesc')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  sortBy === 'diffDesc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                價差最大
              </button>
              <button
                onClick={() => onSortChange('modelAsc')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  sortBy === 'modelAsc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                型號筆畫
              </button>
            </div>
            <span className="text-slate-400 ml-2">
              共 <strong className="text-slate-700">{filteredCount}</strong> 筆
            </span>
          </div>
        </div>

        {/* Clean Brand Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          <button
            onClick={() => onBrandSelect('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedBrand === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            全部 ({totalCount})
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandSelect(brand)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedBrand === brand
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
