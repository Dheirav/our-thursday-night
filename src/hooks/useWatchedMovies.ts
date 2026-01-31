import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WatchedMovie {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  watched_on: string;
  notes: string | null;
  created_at: string;
}

export function useWatchedMovies() {
  return useQuery({
    queryKey: ['watched-movies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watched_movies')
        .select('*')
        .order('watched_on', { ascending: false });

      if (error) throw error;
      return data as WatchedMovie[];
    },
  });
}

export function useAddWatchedMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movie: Omit<WatchedMovie, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('watched_movies')
        .insert(movie)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watched-movies'] });
    },
  });
}
