import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { useMoviePicks, getPicksByRole, getSharedPicks, useRemoveMoviePick } from '@/hooks/useMoviePicks';
import { useRole } from '@/lib/roleContext';
import { MovieCard, MovieCardSkeleton } from './MovieCard';
import { toast } from 'sonner';

export function PicksList() {
  const { role } = useRole();
  const { data: picks, isLoading } = useMoviePicks();
  const removePick = useRemoveMoviePick();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Section title="Your Picks">
          <MovieCardSkeleton />
          <MovieCardSkeleton />
        </Section>
      </div>
    );
  }

  const allPicks = picks || [];
  const myPicks = getPicksByRole(allPicks, role);
  const otherPicks = getPicksByRole(allPicks, role === 'dherru' ? 'nivi' : 'dherru');
  const sharedPicks = getSharedPicks(allPicks);

  const handleRemove = async (id: string, title: string) => {
    try {
      await removePick.mutateAsync(id);
      toast.success(`Removed "${title}"`);
    } catch (error) {
      toast.error('Failed to remove movie');
    }
  };

  return (
    <div className="space-y-10">
      {/* Shared Suggestions - Special Section */}
      {sharedPicks.length > 0 && (
        <Section
          title="Our Picks"
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          special
        >
          <AnimatePresence mode="popLayout">
            {sharedPicks.map((pick, index) => (
              <MovieCard
                key={pick.id}
                movie={pick}
                variant="shared"
                delay={index * 0.05}
              />
            ))}
          </AnimatePresence>
          <p className="text-sm text-muted-foreground/60 text-center pt-2">
            Movies you both want to watch ✨
          </p>
        </Section>
      )}

      {/* My Picks */}
      <Section
        title={role === 'dherru' ? "Dherru's Picks" : "Nivi's Picks"}
        icon={<Heart className="w-5 h-5 text-primary" />}
      >
        <AnimatePresence mode="popLayout">
          {myPicks.length > 0 ? (
            myPicks.map((pick, index) => (
              <MovieCard
                key={pick.id}
                movie={pick}
                variant="pick"
                addedBy={pick.added_by}
                onRemove={() => handleRemove(pick.id, pick.title)}
                delay={index * 0.05}
              />
            ))
          ) : (
            <EmptyState message="You haven't added any movies yet" />
          )}
        </AnimatePresence>
      </Section>

      {/* Other's Picks */}
      <Section
        title={role === 'dherru' ? "Nivi's Picks" : "Dherru's Picks"}
        icon={<Heart className="w-5 h-5 text-muted-foreground" />}
      >
        <AnimatePresence mode="popLayout">
          {otherPicks.length > 0 ? (
            otherPicks.map((pick, index) => (
              <MovieCard
                key={pick.id}
                movie={pick}
                variant="pick"
                addedBy={pick.added_by}
                onRemove={() => handleRemove(pick.id, pick.title)}
                delay={index * 0.05}
              />
            ))
          ) : (
            <EmptyState message={`${role === 'dherru' ? 'Nivi' : 'Dherru'} hasn't added any movies yet`} />
          )}
        </AnimatePresence>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  special,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  special?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={special ? 'p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 to-rose-500/5 border border-amber-400/20' : ''}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </motion.section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-muted-foreground/50 text-center py-8"
    >
      {message}
    </motion.p>
  );
}
