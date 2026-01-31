import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface SearchResult {
  results: TMDBMovie[];
  total_results: number;
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ['movie-search', query],
    queryFn: async () => {
      if (!query.trim()) return { results: [], total_results: 0 };

      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: { query },
      });

      if (error) throw error;
      return data as SearchResult;
    },
    enabled: query.length >= 2,
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
