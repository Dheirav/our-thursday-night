import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, addDays, format, isThursday, isBefore, isAfter, startOfDay } from 'date-fns';
import type { Role } from '@/lib/roleContext';

export interface ThursdayVote {
  id: string;
  movie_pick_id: string;
  voted_by: 'dherru' | 'nivi';
  thursday_date: string;
  created_at: string;
}

export function getNextThursday(from: Date = new Date()): Date {
  const day = from.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7; // Thursday is day 4
  
  if (isThursday(from)) {
    return startOfDay(from);
  }
  
  return startOfDay(addDays(from, daysUntilThursday));
}

export function getCurrentThursday(): Date {
  const now = new Date();
  if (isThursday(now)) {
    return startOfDay(now);
  }
  return getNextThursday(now);
}

export function isVotingEnabled(): boolean {
  return isThursday(new Date());
}

export function getThursdayDateString(date: Date = getCurrentThursday()): string {
  return format(date, 'yyyy-MM-dd');
}

export function useThursdayVotes(thursdayDate?: string) {
  const dateStr = thursdayDate || getThursdayDateString();

  return useQuery({
    queryKey: ['thursday-votes', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('thursday_votes')
        .select('*')
        .eq('thursday_date', dateStr);

      if (error) throw error;
      return data as ThursdayVote[];
    },
  });
}

export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moviePickId, role }: { moviePickId: string; role: Role }) => {
      if (!role) throw new Error('No role selected');
      if (!isVotingEnabled()) throw new Error('Voting is only available on Thursday');

      const thursdayDate = getThursdayDateString();

      // First check if user already voted
      const { data: existing } = await supabase
        .from('thursday_votes')
        .select('*')
        .eq('voted_by', role)
        .eq('thursday_date', thursdayDate)
        .maybeSingle();

      if (existing) {
        // Update existing vote
        const { data, error } = await supabase
          .from('thursday_votes')
          .update({ movie_pick_id: moviePickId })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('thursday_votes')
          .insert({
            movie_pick_id: moviePickId,
            voted_by: role,
            thursday_date: thursdayDate,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thursday-votes'] });
    },
  });
}

export function useCurrentVote(role: Role) {
  const thursdayDate = getThursdayDateString();

  return useQuery({
    queryKey: ['my-vote', role, thursdayDate],
    queryFn: async () => {
      if (!role) return null;

      const { data, error } = await supabase
        .from('thursday_votes')
        .select('*')
        .eq('voted_by', role)
        .eq('thursday_date', thursdayDate)
        .maybeSingle();

      if (error) throw error;
      return data as ThursdayVote | null;
    },
    enabled: !!role,
  });
}
