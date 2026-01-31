import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sparkles, Lock, PartyPopper } from 'lucide-react';
import { 
  getNextThursday, 
  isVotingEnabled, 
  useThursdayVotes, 
  useCastVote,
  useCurrentVote,
  getThursdayDateString
} from '@/hooks/useThursdayVoting';
import { useMoviePicks, getSharedPicks } from '@/hooks/useMoviePicks';
import { useRole } from '@/lib/roleContext';
import { MovieCard } from './MovieCard';
import { toast } from 'sonner';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export function ThursdayRitual() {
  const { role } = useRole();
  const isThursday = isVotingEnabled();
  const { data: picks } = useMoviePicks();
  const { data: votes } = useThursdayVotes();
  const { data: myVote } = useCurrentVote(role);
  const castVote = useCastVote();

  const sharedPicks = picks ? getSharedPicks(picks) : [];
  const allPicks = picks || [];

  // Check if both have voted
  const dherruVote = votes?.find(v => v.voted_by === 'dherru');
  const niviVote = votes?.find(v => v.voted_by === 'nivi');
  const bothVoted = dherruVote && niviVote;

  // Check if they voted for the same movie
  const consensusReached = bothVoted && dherruVote.movie_pick_id === niviVote.movie_pick_id;
  const chosenMovie = consensusReached 
    ? allPicks.find(p => p.id === dherruVote.movie_pick_id) 
    : null;

  const handleVote = async (movieId: string) => {
    if (!role) return;
    try {
      await castVote.mutateAsync({ moviePickId: movieId, role });
      toast.success('Vote cast!');
    } catch (error) {
      toast.error('Failed to cast vote');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Countdown / Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center mb-10 p-8 rounded-3xl ${isThursday ? 'thursday-active' : 'glass-card'}`}
      >
        {isThursday ? (
          <div>
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="font-display text-4xl text-foreground mb-2">It's Thursday!</h2>
            <p className="text-muted-foreground">Time to decide what to watch tonight</p>
          </div>
        ) : (
          <ThursdayCountdown />
        )}
      </motion.div>

      {/* Voting Section */}
      {isThursday && !consensusReached && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-foreground">Cast Your Vote</h3>
            <div className="flex gap-2">
              <VoteStatus label="Dherru" voted={!!dherruVote} />
              <VoteStatus label="Nivi" voted={!!niviVote} />
            </div>
          </div>

          {/* Prioritize shared picks */}
          {sharedPicks.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-amber-400/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Movies you both want to watch
              </p>
              {sharedPicks.map((pick, index) => (
                <MovieCard
                  key={pick.id}
                  movie={pick}
                  variant="shared"
                  showVoteButton
                  isVoted={myVote?.movie_pick_id === pick.id}
                  onVote={() => handleVote(pick.id)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}

          {/* All other picks */}
          <div className="space-y-3 mt-6">
            <p className="text-sm text-muted-foreground">All picks</p>
            {allPicks
              .filter(p => !sharedPicks.some(sp => sp.id === p.id))
              .map((pick, index) => (
                <MovieCard
                  key={pick.id}
                  movie={pick}
                  variant="pick"
                  addedBy={pick.added_by}
                  showVoteButton
                  isVoted={myVote?.movie_pick_id === pick.id}
                  onVote={() => handleVote(pick.id)}
                  delay={index * 0.05}
                />
              ))}
          </div>

          {allPicks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No movies to vote on. Add some picks first!
            </p>
          )}
        </motion.div>
      )}

      {/* Consensus Reveal */}
      {consensusReached && chosenMovie && (
        <MovieReveal movie={chosenMovie} />
      )}

      {/* Waiting for other person */}
      {isThursday && bothVoted && !consensusReached && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 glass-card rounded-2xl"
        >
          <p className="text-xl text-foreground mb-2">You both voted!</p>
          <p className="text-muted-foreground">But for different movies... Maybe discuss? 💕</p>
        </motion.div>
      )}

      {/* Not Thursday - Locked */}
      {!isThursday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12 glass-card rounded-2xl"
        >
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Voting opens on Thursday. Until then, keep adding movies!
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ThursdayCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const nextThursday = getNextThursday();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      setTimeLeft({
        days: differenceInDays(nextThursday, now),
        hours: differenceInHours(nextThursday, now) % 24,
        minutes: differenceInMinutes(nextThursday, now) % 60,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextThursday]);

  return (
    <div>
      <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-display text-3xl text-foreground mb-4">
        Next Thursday
      </h2>
      <p className="text-muted-foreground mb-6">{format(nextThursday, 'MMMM d, yyyy')}</p>
      
      <div className="flex justify-center gap-4">
        <CountdownUnit value={timeLeft.days} label="days" />
        <CountdownUnit value={timeLeft.hours} label="hours" />
        <CountdownUnit value={timeLeft.minutes} label="min" />
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-card px-4 py-3 rounded-xl">
      <div className="font-display text-2xl text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function VoteStatus({ label, voted }: { label: string; voted: boolean }) {
  return (
    <div className={`px-3 py-1 rounded-full text-sm ${voted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
      {label} {voted ? '✓' : '...'}
    </div>
  );
}

function MovieReveal({ movie }: { movie: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <PartyPopper className="w-12 h-12 text-amber-400 mx-auto mb-6" />
      </motion.div>
      
      <h2 className="font-display text-4xl text-foreground mb-2">Tonight's Movie</h2>
      <p className="text-muted-foreground mb-8">You both picked the same one! 🎉</p>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="celebration-gradient p-1 rounded-2xl inline-block glow"
      >
        <div className="glass-card rounded-xl p-6">
          <MovieCard movie={movie} variant="memory" />
        </div>
      </motion.div>
    </motion.div>
  );
}
