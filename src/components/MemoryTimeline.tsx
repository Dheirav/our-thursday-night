import { motion } from 'framer-motion';
import { BookHeart, Film } from 'lucide-react';
import { useWatchedMovies } from '@/hooks/useWatchedMovies';
import { getTMDBImageUrl } from '@/hooks/useMovieSearch';
import { format, parseISO } from 'date-fns';

export function MemoryTimeline() {
  const { data: movies, isLoading } = useWatchedMovies();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-xl h-32" />
          ))}
        </div>
      </div>
    );
  }

  const watchedMovies = movies || [];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <BookHeart className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="font-display text-4xl text-foreground mb-2">Our Movie Nights</h2>
        <p className="text-muted-foreground">Memories of Thursdays past</p>
      </motion.div>

      {watchedMovies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16 glass-card rounded-2xl"
        >
          <Film className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No movie nights yet</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Your shared memories will appear here
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          <div className="space-y-8">
            {watchedMovies.map((movie, index) => (
              <MemoryCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryCard({ movie, index }: { movie: any; index: number }) {
  const posterUrl = getTMDBImageUrl(movie.poster_path, 'w200');
  const watchedDate = parseISO(movie.watched_on);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-16"
    >
      {/* Timeline dot */}
      <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-primary glow" />

      <div className="glass-card rounded-xl p-4 hover-lift">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm text-primary mb-1">
              {format(watchedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <h3 className="font-display text-xl text-foreground mb-1">
              {movie.title}
            </h3>
            {movie.notes && (
              <p className="text-sm text-muted-foreground/70 italic">
                "{movie.notes}"
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
