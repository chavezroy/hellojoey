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
    const initAudio = () => {
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        return;
      }
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      
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

    // Initialize on user interaction
    const handleInteraction = () => {
      initAudio();
    };

    const handleMouseDown = (e: MouseEvent) => {
      initAudio();
      if ((e.target as HTMLElement).closest('#hero-image-trigger')) {
        play8BitBlip();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('scroll', handleInteraction, { once: true });

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

  const handleToggle = () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
        setIsOn(false);
      } else {
        audioCtxRef.current.resume();
        setIsOn(true);
      }
    }
  };

  return (
    <button
      id="audio-toggle"
      onClick={handleToggle}
      className="fixed bottom-[10px] right-5 z-[10002] bg-[rgba(0,255,0,0.1)] border border-neon-green text-neon-green py-2 px-3 font-upheaval transition-all duration-300 hover:bg-neon-green hover:text-black hover:shadow-[0_0_15px_#00FF00]"
      style={{ cursor: 'none' }}
    >
      AUDIO: {isOn ? 'ON' : 'OFF'}
    </button>
  );
}

