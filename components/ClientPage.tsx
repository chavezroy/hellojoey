'use client';

import { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import Navigation from './Navigation';
import ParallaxList from './ParallaxList';
import Footer from './Footer';
import type { ContentData } from '@/lib/content';

interface ClientPageProps {
  content: ContentData;
}

export default function ClientPage({ content }: ClientPageProps) {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true); // Start visible
  const [fadeOutNav, setFadeOutNav] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        setIsSticky(true);
        setFadeOutNav(true);
      } else {
        setIsSticky(false);
        setFadeOutNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navigation
        items={content.navigation}
        show={showHeaderFooter}
        fadeOut={fadeOutNav}
        logoImage={content.logo.image}
        logoAlt={content.logo.alt}
      />
      <HeroSection
        imageUrl={content.hero.image}
        alt={content.hero.alt}
        onMouseEnter={() => setShowHeaderFooter(true)}
        onMouseLeave={() => setShowHeaderFooter(false)}
      />
      <section id="about" className="mt-[100px] md:mt-0">
        <ParallaxList items={content.sections.about} />
      </section>
      <div className="h-[400px]" />
      <Footer
        email={content.footer.email}
        copyright={content.footer.copyright}
        kangarooImage={content.kangaroo.image}
        show={showHeaderFooter}
      />
    </>
  );
}

