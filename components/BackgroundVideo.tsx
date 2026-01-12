'use client';

import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  videoUrl: string;
}

export default function BackgroundVideo({ videoUrl }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      id="bg-video"
      autoPlay
      muted
      loop
      playsInline
      className="fixed top-0 left-0 w-full h-full object-cover -z-[2] opacity-35 mix-blend-screen"
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}

