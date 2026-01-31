import { MovieSearch } from '@/components/MovieSearch';
import { Navigation } from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen starfield pb-24 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-foreground mb-2">Find a Movie</h1>
          <p className="text-muted-foreground">Search for something you'd like to watch</p>
        </div>
        <MovieSearch />
      </div>
      <Navigation />
    </div>
  );
}
