import { ThursdayRitual } from '@/components/ThursdayRitual';
import { Navigation } from '@/components/Navigation';

export default function ThursdayPage() {
  return (
    <div className="min-h-screen starfield pb-24 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <ThursdayRitual />
      </div>
      <Navigation />
    </div>
  );
}
