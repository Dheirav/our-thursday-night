import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useMovieSearch, MovieSearchFilters } from '@/hooks/useMovieSearch';
import { useAddMoviePick, useMoviePicks } from '@/hooks/useMoviePicks';
import { useRole } from '@/lib/roleContext';
import { MovieCard, MovieCardSkeleton } from './MovieCard';
import { MovieFilters, MovieFiltersState } from './MovieFilters';
import { toast } from 'sonner';

export function MovieSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<MovieFiltersState>({
    genre: '',
    year: '',
    language: '',
    actor: '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState<MovieSearchFilters>({});
  
  const { role } = useRole();
  const { data: searchResults, isLoading: isSearching } = useMovieSearch(debouncedFilters);
  const { data: picks } = useMoviePicks();
  const addPick = useAddMoviePick();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Debounce actor filter separately (longer delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        query: debouncedQuery || undefined,
        genre: filters.genre || undefined,
        year: filters.year || undefined,
        language: filters.language || undefined,
        actor: filters.actor || undefined,
      });
    }, filters.actor !== debouncedFilters.actor ? 500 : 100);
    return () => clearTimeout(timer);
  }, [debouncedQuery, filters]);

  const handleAddMovie = async (movie: any) => {
    if (!role) {
      toast.error('Please select your role first');
      return;
    }

    try {
      await addPick.mutateAsync({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        added_by: role,
      });
      toast.success(`Added "${movie.title}" to your picks`);
    } catch (error) {
      toast.error('Failed to add movie');
    }
  };

  const isMovieAdded = (tmdbId: number) => {
    return picks?.some(p => p.tmdb_id === tmdbId && p.added_by === role);
  };

  const hasActiveSearch = debouncedQuery.length >= 2 || filters.genre || filters.year || filters.language || (filters.actor?.length ?? 0) >= 2;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-4"
      >
        <div className="glass-card rounded-2xl p-1 flex items-center">
          <Search className="w-5 h-5 text-muted-foreground ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-foreground placeholder:text-muted-foreground/50 text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 mr-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <MovieFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* Results */}
      <div className="space-y-3">
        {isSearching && (
          <>
            <MovieCardSkeleton />
            <MovieCardSkeleton />
            <MovieCardSkeleton />
          </>
        )}

        {!isSearching && searchResults?.results.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant="search"
            onAdd={() => handleAddMovie(movie)}
            isAdded={isMovieAdded(movie.id)}
            delay={index * 0.05}
          />
        ))}

        {!isSearching && hasActiveSearch && searchResults?.results.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            No movies found with the selected filters
          </motion.p>
        )}

        {!hasActiveSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground/60">
              Search for movies or use filters to discover together
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
