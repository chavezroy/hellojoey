'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FooterProps {
  email: string;
  copyright: string;
  kangarooImage: string;
  show: boolean;
}

export default function Footer({ email, copyright, kangarooImage, show }: FooterProps) {
  const [shouldPause, setShouldPause] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playRooSound = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    const now = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(now + 0.1);
  };

  useEffect(() => {
    // Get audio context from window if available
    const getAudioContext = () => {
      if (typeof window !== 'undefined') {
        // Try to get from AudioToggle component's context
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
          // Audio context should be initialized by AudioToggle
          // We'll create our own if needed
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
        }
      }
    };

    const schedulePause = () => {
      const pauseInterval = Math.random() * 5000 + 3000;
      pauseTimeoutRef.current = setTimeout(() => {
        setShouldPause(true);
        setTimeout(() => {
          setShouldPause(false);
          schedulePause();
        }, 3000);
      }, pauseInterval);
    };

    getAudioContext();
    schedulePause();

    // Play sound on animation iteration
    const rooImg = document.getElementById('roo-img');
    if (rooImg) {
      const handleIteration = () => {
        if (!shouldPause && audioCtxRef.current && audioCtxRef.current.state === 'running') {
          playRooSound();
        }
      };
      rooImg.addEventListener('animationiteration', handleIteration);
      return () => {
        rooImg.removeEventListener('animationiteration', handleIteration);
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      };
    }

    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [shouldPause]);

  return (
    <motion.footer
      className={`fixed bottom-0 left-0 right-0 py-[10px] px-[10%] text-center text-xs backdrop-blur-[7px] bg-header-purple z-[1000] flex flex-col gap-[2px] transition-opacity duration-800 ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
    >
      <div
        className="absolute bottom-full left-[-100px] z-[1001] pointer-events-none"
        style={{
          animation: shouldPause ? 'none' : 'roo-travel 18s infinite linear',
        }}
      >
        <motion.div
          style={{
            animation: shouldPause ? 'paused' : 'roo-hop',
            animationPlayState: shouldPause ? 'paused' : 'running',
          }}
        >
          <img
            id="roo-img"
            src={kangarooImage}
            alt="Kangaroo"
            className="max-w-[35px] inline-block transform-origin-bottom-center"
          />
        </motion.div>
      </div>
      <p>
        <a href={`mailto:${email}`} className="text-neon-green no-underline relative inline-block">
          {email}
        </a>
      </p>
      <p>{copyright}</p>
    </motion.footer>
  );
}

