import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  original_language?: string;
  genre_ids?: number[];
}

export interface SearchResult {
  results: TMDBMovie[];
  total_results: number;
  genres?: string[];
  languages?: string[];
}

export interface MovieSearchFilters {
  query?: string;
  genre?: string;
  year?: string;
  language?: string;
  actor?: string;
}

export function useMovieSearch(filters: MovieSearchFilters) {
  const hasFilters = filters.query || filters.genre || filters.year || filters.language || filters.actor;
  
  return useQuery({
    queryKey: ['movie-search', filters],
    queryFn: async () => {
      if (!hasFilters) return { results: [], total_results: 0 };

      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: {
          query: filters.query || undefined,
          genre: filters.genre || undefined,
          year: filters.year ? parseInt(filters.year) : undefined,
          language: filters.language || undefined,
          actor: filters.actor || undefined,
        },
      });

      if (error) throw error;
      return data as SearchResult;
    },
    enabled: !!hasFilters && (
      (filters.query?.length ?? 0) >= 2 ||
      !!filters.genre ||
      !!filters.year ||
      !!filters.language ||
      (filters.actor?.length ?? 0) >= 2
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function getTMDBImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getReleaseYear(date: string | undefined): number | null {
  if (!date) return null;
  return new Date(date).getFullYear();
}
