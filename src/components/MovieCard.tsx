import { motion } from 'framer-motion';
import { Plus, Check, Film } from 'lucide-react';
import { getTMDBImageUrl, type TMDBMovie } from '@/hooks/useMovieSearch';

interface MovieCardProps {
  movie: {
    tmdb_id?: number;
    id?: number | string;
    title: string;
    poster_path: string | null;
    overview?: string | null;
    release_date?: string;
    release_year?: number | null;
  };
  variant?: 'search' | 'pick' | 'shared' | 'memory';
  addedBy?: 'dherru' | 'nivi';
  onAdd?: () => void;
  onRemove?: () => void;
  onVote?: () => void;
  isAdded?: boolean;
  isVoted?: boolean;
  showVoteButton?: boolean;
  delay?: number;
}

export function MovieCard({
  movie,
  variant = 'search',
  addedBy,
  onAdd,
  onRemove,
  onVote,
  isAdded,
  isVoted,
  showVoteButton,
  delay = 0,
}: MovieCardProps) {
  const posterUrl = getTMDBImageUrl(movie.poster_path, 'w500');
  const year = movie.release_year || (movie.release_date ? new Date(movie.release_date).getFullYear() : null);

  const cardClass = variant === 'shared' 
    ? 'shared-pick' 
    : variant === 'memory' 
    ? 'glass-card' 
    : addedBy === 'dherru' 
    ? 'role-dherru border' 
    : addedBy === 'nivi' 
    ? 'role-nivi border' 
    : 'glass-card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.3 }}
      className={`
        ${cardClass}
        rounded-xl overflow-hidden
        hover-lift group
        relative
      `}
    >
      <div className="flex gap-4 p-3">
        {/* Poster */}
        <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-display text-lg text-foreground truncate mb-1">
            {movie.title}
          </h3>
          {year && (
            <p className="text-sm text-muted-foreground mb-2">{year}</p>
          )}
          {movie.overview && (
            <p className="text-xs text-muted-foreground/70 line-clamp-2">
              {movie.overview}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-2">
          {onAdd && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAdd}
              disabled={isAdded}
              className={`
                p-2 rounded-full transition-all
                ${isAdded 
                  ? 'bg-primary/20 text-primary cursor-default' 
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                }
              `}
            >
              {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </motion.button>
          )}

          {showVoteButton && onVote && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onVote}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isVoted 
                  ? 'bg-primary text-primary-foreground glow' 
                  : 'bg-primary/20 text-primary hover:bg-primary/30'
                }
              `}
            >
              {isVoted ? 'Voted ✓' : 'Vote'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Remove button (visible on hover for picks) */}
      {onRemove && variant === 'pick' && (
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/20 text-destructive 
                     hover:bg-destructive hover:text-destructive-foreground transition-all
                     opacity-0 group-hover:opacity-100"
        >
          <span className="text-xs">✕</span>
        </motion.button>
      )}
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden p-3">
      <div className="flex gap-4">
        <div className="w-20 h-28 rounded-lg bg-muted shimmer" />
        <div className="flex-1 py-1 space-y-3">
          <div className="h-5 w-3/4 bg-muted shimmer rounded" />
          <div className="h-4 w-1/4 bg-muted shimmer rounded" />
          <div className="h-3 w-full bg-muted shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
