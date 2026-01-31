import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Role } from '@/lib/roleContext';

export interface MoviePick {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  overview: string | null;
  release_year: number | null;
  added_by: 'dherru' | 'nivi';
  created_at: string;
}

export function useMoviePicks() {
  return useQuery({
    queryKey: ['movie-picks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movie_picks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MoviePick[];
    },
  });
}

export function useAddMoviePick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pick: Omit<MoviePick, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('movie_picks')
        .insert(pick)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie-picks'] });
    },
  });
}

export function useRemoveMoviePick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('movie_picks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie-picks'] });
    },
  });
}

export function getPicksByRole(picks: MoviePick[], role: Role) {
  if (!role) return [];
  return picks.filter(p => p.added_by === role);
}

export function getSharedPicks(picks: MoviePick[]) {
  const tmdbIds = picks.map(p => p.tmdb_id);
  const dherruPicks = picks.filter(p => p.added_by === 'dherru').map(p => p.tmdb_id);
  const niviPicks = picks.filter(p => p.added_by === 'nivi').map(p => p.tmdb_id);
  
  const sharedTmdbIds = dherruPicks.filter(id => niviPicks.includes(id));
  
  // Return one pick per shared movie (prefer the first added)
  const seen = new Set<number>();
  return picks
    .filter(p => {
      if (sharedTmdbIds.includes(p.tmdb_id) && !seen.has(p.tmdb_id)) {
        seen.add(p.tmdb_id);
        return true;
      }
      return false;
    });
}
