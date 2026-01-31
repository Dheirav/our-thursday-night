-- Movie picks table - stores individual picks from each person
CREATE TABLE public.movie_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  overview TEXT,
  release_year INTEGER,
  added_by TEXT NOT NULL CHECK (added_by IN ('dherru', 'nivi')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thursday votes table - stores votes for each Thursday
CREATE TABLE public.thursday_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_pick_id UUID NOT NULL REFERENCES public.movie_picks(id) ON DELETE CASCADE,
  voted_by TEXT NOT NULL CHECK (voted_by IN ('dherru', 'nivi')),
  thursday_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(voted_by, thursday_date)
);

-- Watched movies table - memory timeline of past movie nights
CREATE TABLE public.watched_movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  watched_on DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.movie_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thursday_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watched_movies ENABLE ROW LEVEL SECURITY;

-- Simple policies - this is a private two-person app, allow all operations
-- No authentication needed, just role selection stored in localStorage

CREATE POLICY "Allow all operations on movie_picks"
  ON public.movie_picks
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on thursday_votes"
  ON public.thursday_votes
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on watched_movies"
  ON public.watched_movies
  FOR ALL
  USING (true)
  WITH CHECK (true);