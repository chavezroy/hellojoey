import { getContent } from '@/lib/content';
import CustomCursor from '@/components/CustomCursor';
import BackgroundVideo from '@/components/BackgroundVideo';
import NoiseOverlay from '@/components/NoiseOverlay';
import HeroSection from '@/components/HeroSection';
import Navigation from '@/components/Navigation';
import ParallaxList from '@/components/ParallaxList';
import Footer from '@/components/Footer';
import AudioToggle from '@/components/AudioToggle';
import ClientPage from '@/components/ClientPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const content = getContent();

    return (
      <main className="min-h-screen">
        <CustomCursor />
        <BackgroundVideo videoUrl={content.video.url} />
        <NoiseOverlay />
        <ClientPage content={content} />
        <AudioToggle />
      </main>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-neon-green">
        <div className="text-center p-8">
          <h1 className="text-2xl mb-4">Error Loading Page</h1>
          <p className="text-sm">Please check the console for details.</p>
        </div>
      </main>
    );
  }
}

