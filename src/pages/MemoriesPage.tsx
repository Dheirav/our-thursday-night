import { MemoryTimeline } from '@/components/MemoryTimeline';
import { Navigation } from '@/components/Navigation';

export default function MemoriesPage() {
  return (
    <div className="min-h-screen starfield pb-24 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <MemoryTimeline />
      </div>
      <Navigation />
    </div>
  );
}
