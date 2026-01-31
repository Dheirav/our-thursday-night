import { PicksList } from '@/components/PicksList';
import { Navigation } from '@/components/Navigation';

export default function PicksPage() {
  return (
    <div className="min-h-screen starfield pb-24 md:pt-24">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PicksList />
      </div>
      <Navigation />
    </div>
  );
}
