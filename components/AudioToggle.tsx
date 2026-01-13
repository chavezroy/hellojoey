'use client';

import { useEffect, useRef, useState } from 'react';

const JOEY_AUDIO_MIX = { master: 1.0, ghost: 0.10, arcade: 0.2, hum: 0.003, ping: 0.15, blip: 0.2 };

export default function AudioToggle() {
  const [isOn, setIsOn] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humOscRef = useRef<OscillatorNode | null>(null);

  const playGlassPing = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    const now = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    const filter = audioCtxRef.current.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(6500 + Math.random() * 500, now);
    filter.type = 'highpass';
    filter.frequency.value = 2500;
    gain.gain.setValueAtTime(JOEY_AUDIO_MIX.ping * JOEY_AUDIO_MIX.master, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(now + 0.11);
  };

  const play8BitBlip = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    const now = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(5500, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(JOEY_AUDIO_MIX.blip * JOEY_AUDIO_MIX.master, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(now + 0.09);
  };

  useEffect(() => {
    // Initialize audio context
    const initAudio = async () => {
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          try {
            await audioCtxRef.current.resume();
            console.log('Audio context resumed');
          } catch (error) {
            console.warn('Failed to resume audio context:', error);
          }
        }
        return;
      }
      
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        
        // AudioContext starts in 'suspended' state - resume it
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        console.log('Audio context initialized, state:', ctx.state);
        
        // Start hum
        const humOsc = ctx.createOscillator();
        const humGain = ctx.createGain();
        humOsc.type = 'sawtooth';
        humOsc.frequency.value = 60;
        humGain.gain.value = JOEY_AUDIO_MIX.hum * JOEY_AUDIO_MIX.master;
        humOsc.connect(humGain);
        humGain.connect(ctx.destination);
        humOsc.start();
        humOscRef.current = humOsc;
        
        // Start background audio engine
        startBackgroundEngine();
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    const startBackgroundEngine = () => {
      if (!audioCtxRef.current) return;
      
      const ghostFreqs = [110, 220, 330, 440];
      const arcadeFreqs = [440, 660, 880, 1200, 1600];

      const triggerNext = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const now = audioCtxRef.current.currentTime;
        const roll = Math.random();
        
        if (roll < 0.8) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(ghostFreqs[Math.floor(Math.random() * ghostFreqs.length)], now);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(JOEY_AUDIO_MIX.ghost * JOEY_AUDIO_MIX.master, now + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(now + 3.1);
        } else {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = Math.random() > 0.5 ? 'square' : 'triangle';
          const f = arcadeFreqs[Math.floor(Math.random() * arcadeFreqs.length)];
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.1);
          gain.gain.setValueAtTime(JOEY_AUDIO_MIX.arcade * JOEY_AUDIO_MIX.master, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(now + 0.21);
        }
        setTimeout(triggerNext, 1000 + Math.random() * 500);
      };
      triggerNext();
    };

    // Initialize on user interaction - add multiple triggers for better compatibility
    const handleInteraction = async () => {
      await initAudio();
    };

    const handleMouseDown = async (e: MouseEvent) => {
      await initAudio();
      if ((e.target as HTMLElement).closest('#hero-image-trigger')) {
        play8BitBlip();
      }
    };

    // Add multiple interaction listeners to ensure audio starts
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true });
    
    // Also try to initialize on page load (may fail due to autoplay policy, but worth trying)
    if (typeof window !== 'undefined') {
      // Try to initialize after a short delay
      setTimeout(() => {
        try {
          initAudio();
        } catch (error) {
          console.log('Audio autoplay blocked - waiting for user interaction');
        }
      }, 1000);
    }

    // Add audio to nav links and parallax items
    const navLinks = document.querySelectorAll('nav a, .parallax-list li');
    navLinks.forEach((el) => {
      el.addEventListener('mouseenter', playGlassPing);
    });

    const hero = document.getElementById('hero-image-trigger');
    if (hero) {
      hero.addEventListener('mouseenter', play8BitBlip);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      navLinks.forEach((el) => {
        el.removeEventListener('mouseenter', playGlassPing);
      });
      if (hero) {
        hero.removeEventListener('mouseenter', play8BitBlip);
      }
      if (audioCtxRef.current) {
        if (humOscRef.current) {
          humOscRef.current.stop();
        }
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleToggle = async () => {
    // Initialize audio if it doesn't exist (user clicked the button)
    if (!audioCtxRef.current) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        
        // Resume if suspended (required for autoplay policy)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        // Start hum
        const humOsc = ctx.createOscillator();
        const humGain = ctx.createGain();
        humOsc.type = 'sawtooth';
        humOsc.frequency.value = 60;
        humGain.gain.value = JOEY_AUDIO_MIX.hum * JOEY_AUDIO_MIX.master;
        humOsc.connect(humGain);
        humGain.connect(ctx.destination);
        humOsc.start();
        humOscRef.current = humOsc;
        
        // Start background audio engine (reuse the function from useEffect)
        const startBackgroundEngine = () => {
          if (!audioCtxRef.current) return;
          
          const ghostFreqs = [110, 220, 330, 440];
          const arcadeFreqs = [440, 660, 880, 1200, 1600];

          const triggerNext = () => {
            if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
            const now = audioCtxRef.current.currentTime;
            const roll = Math.random();
            
            if (roll < 0.8) {
              const osc = audioCtxRef.current.createOscillator();
              const gain = audioCtxRef.current.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(ghostFreqs[Math.floor(Math.random() * ghostFreqs.length)], now);
              gain.gain.setValueAtTime(0, now);
              gain.gain.linearRampToValueAtTime(JOEY_AUDIO_MIX.ghost * JOEY_AUDIO_MIX.master, now + 0.5);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);
              osc.connect(gain);
              gain.connect(audioCtxRef.current.destination);
              osc.start();
              osc.stop(now + 3.1);
            } else {
              const osc = audioCtxRef.current.createOscillator();
              const gain = audioCtxRef.current.createGain();
              osc.type = Math.random() > 0.5 ? 'square' : 'triangle';
              const f = arcadeFreqs[Math.floor(Math.random() * arcadeFreqs.length)];
              osc.frequency.setValueAtTime(f, now);
              osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.1);
              gain.gain.setValueAtTime(JOEY_AUDIO_MIX.arcade * JOEY_AUDIO_MIX.master, now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
              osc.connect(gain);
              gain.connect(audioCtxRef.current.destination);
              osc.start();
              osc.stop(now + 0.21);
            }
            setTimeout(triggerNext, 1000 + Math.random() * 500);
          };
          triggerNext();
        };
        
        startBackgroundEngine();
        setIsOn(true);
        console.log('Audio initialized via toggle button');
        return;
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setIsOn(false);
        return;
      }
    }
    
    // Toggle existing audio context
    try {
      if (audioCtxRef.current.state === 'running') {
        await audioCtxRef.current.suspend();
        setIsOn(false);
        console.log('Audio suspended');
      } else {
        await audioCtxRef.current.resume();
        setIsOn(true);
        console.log('Audio resumed, state:', audioCtxRef.current.state);
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  return (
    <button
      id="audio-toggle"
      onClick={handleToggle}
      className="fixed bottom-[10px] right-5 z-[10002] bg-[rgba(0,255,0,0.1)] border border-neon-green text-neon-green py-2 px-3 font-upheaval transition-all duration-300 hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00]"
    >
      AUDIO: {isOn ? 'ON' : 'OFF'}
    </button>
  );
}

