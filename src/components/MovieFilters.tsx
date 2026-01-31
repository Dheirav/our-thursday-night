import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MovieFiltersState {
  genre: string;
  year: string;
  language: string;
  actor: string;
}

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese',
  'Korean', 'Chinese', 'Italian', 'Portuguese', 'Russian',
  'Tamil', 'Telugu', 'Malayalam', 'Bengali'
];

// Generate years from current year back to 1950
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1949 }, (_, i) => (currentYear - i).toString());

interface MovieFiltersProps {
  filters: MovieFiltersState;
  onChange: (filters: MovieFiltersState) => void;
}

export function MovieFilters({ filters, onChange }: MovieFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const updateFilter = (key: keyof MovieFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    onChange({ genre: '', year: '', language: '', actor: '' });
  };

  const clearFilter = (key: keyof MovieFiltersState) => {
    onChange({ ...filters, [key]: '' });
  };

  return (
    <div className="w-full">
      {/* Filter Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
          "glass-card hover:bg-muted/30",
          activeFilterCount > 0 && "ring-1 ring-primary/50"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-4 mt-3 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Genre Dropdown */}
                <FilterDropdown
                  label="Genre"
                  value={filters.genre}
                  options={GENRES}
                  isOpen={openDropdown === 'genre'}
                  onToggle={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
                  onSelect={(v) => updateFilter('genre', v)}
                  onClear={() => clearFilter('genre')}
                />

                {/* Year Dropdown */}
                <FilterDropdown
                  label="Year"
                  value={filters.year}
                  options={YEARS}
                  isOpen={openDropdown === 'year'}
                  onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  onSelect={(v) => updateFilter('year', v)}
                  onClear={() => clearFilter('year')}
                />

                {/* Language Dropdown */}
                <FilterDropdown
                  label="Language"
                  value={filters.language}
                  options={LANGUAGES}
                  isOpen={openDropdown === 'language'}
                  onToggle={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
                  onSelect={(v) => updateFilter('language', v)}
                  onClear={() => clearFilter('language')}
                />

                {/* Actor Input */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Actor</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.actor}
                      onChange={(e) => updateFilter('actor', e.target.value)}
                      placeholder="Search actor..."
                      className="w-full px-3 py-2 text-sm bg-muted/30 border border-muted/50 rounded-xl 
                               text-foreground placeholder:text-muted-foreground/50
                               focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {filters.actor && (
                      <button
                        onClick={() => clearFilter('actor')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded-full"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters & Clear */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => value && (
                      <motion.span
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs 
                                 bg-primary/20 text-primary rounded-lg"
                      >
                        <span className="capitalize">{key}:</span> {value}
                        <button
                          onClick={() => clearFilter(key as keyof MovieFiltersState)}
                          className="p-0.5 hover:bg-primary/30 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClear: () => void;
}

function FilterDropdown({ label, value, options, isOpen, onToggle, onSelect, onClear }: FilterDropdownProps) {
  return (
    <div className="space-y-1 relative">
      <label className="text-xs text-muted-foreground">{label}</label>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm",
          "bg-muted/30 border border-muted/50 rounded-xl",
          "hover:bg-muted/50 transition-colors",
          value && "ring-1 ring-primary/30"
        )}
      >
        <span className={cn(
          value ? "text-foreground" : "text-muted-foreground/50"
        )}>
          {value || `Select ${label.toLowerCase()}`}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-0.5 hover:bg-muted/50 rounded-full"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 
                     bg-card/95 backdrop-blur-xl border border-muted/50 
                     rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto p-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => onSelect(option)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg",
                    "hover:bg-muted/50 transition-colors",
                    value === option && "bg-primary/20 text-primary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
