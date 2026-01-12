'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  imageUrl: string;
  alt: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function HeroSection({ imageUrl, alt, onMouseEnter, onMouseLeave }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const rgbRRef = useRef<HTMLImageElement>(null);
  const rgbGRef = useRef<HTMLImageElement>(null);
  const rgbBRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rgbR = rgbRRef.current;
    const rgbG = rgbGRef.current;
    const rgbB = rgbBRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !img || !rgbR || !rgbG || !rgbB || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (img.complete) {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
      }
    };

    const glitchLoop = () => {
      if (!img.complete) {
        requestAnimationFrame(glitchLoop);
        return;
      }
      if (canvas.width === 0) resizeCanvas();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const jX = (Math.random() - 0.5) * 1.5;
      const jY = (Math.random() - 0.5) * 1.5;
      wrapper.style.transform = `translate(${jX}px, ${jY}px)`;

      if (Math.random() < 0.3) {
        const h = Math.random() * 40;
        const sy = Math.random() * canvas.height;
        const dx = (Math.random() - 0.5) * 55;
        ctx.drawImage(img, 0, sy, canvas.width, h, dx, sy, canvas.width, h);
      }

      if (Math.random() < 0.22) {
        const rx = (Math.random() - 0.5) * 25;
        const gx = (Math.random() - 0.5) * 25;
        if (rgbR) rgbR.style.transform = `translate(${rx}px, 0)`;
        if (rgbG) rgbG.style.transform = `translate(${gx}px, 0)`;
        if (rgbR) rgbR.style.opacity = '0.7';
        if (rgbG) rgbG.style.opacity = '0.75';
        if (rgbB) rgbB.style.opacity = '0.75';
      } else {
        if (rgbR) rgbR.style.transform = 'none';
        if (rgbG) rgbG.style.transform = 'none';
        if (rgbR) rgbR.style.opacity = '0';
        if (rgbG) rgbG.style.opacity = '0';
        if (rgbB) rgbB.style.opacity = '0';
      }
      requestAnimationFrame(glitchLoop);
    };

    window.addEventListener('resize', resizeCanvas);
    img.onload = () => {
      resizeCanvas();
      glitchLoop();
    };
    if (img.complete) {
      resizeCanvas();
      glitchLoop();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-[90vh] flex flex-col justify-center items-center text-center perspective-1000">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          ref={wrapperRef}
          id="hero-image-trigger"
          className={`glitch-container inline-block transition-all duration-600 hidden md:block ${
            isSticky ? 'fixed top-20 left-1/2 -translate-x-1/2 z-[1002]' : 'relative'
          }`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="hero-image-wrap relative inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt={alt}
              className="hero-image base relative z-[2] block max-w-[30vw] h-auto mix-blend-screen opacity-95 drop-shadow-[0_0_4px_rgba(0,255,0,0.5),0_0_8px_rgba(0,255,0,0.3)] transition-all duration-400"
            />
            <img
              ref={rgbRRef}
              src={imageUrl}
              alt=""
              className="hero-image rgb r absolute top-0 left-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-0 z-[1]"
              aria-hidden="true"
              style={{
                filter: 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)',
              }}
            />
            <img
              ref={rgbGRef}
              src={imageUrl}
              alt=""
              className="hero-image rgb g absolute top-0 left-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-0 z-[1]"
              aria-hidden="true"
              style={{
                filter: 'brightness(1.5) sepia(1) hue-rotate(70deg) saturate(5)',
              }}
            />
            <img
              ref={rgbBRef}
              src={imageUrl}
              alt=""
              className="hero-image rgb b absolute top-0 left-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-0 z-[1]"
              aria-hidden="true"
              style={{
                filter: 'brightness(1.5) sepia(1) hue-rotate(190deg) saturate(5)',
              }}
            />
            <canvas
              ref={canvasRef}
              id="glitch-canvas"
              className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-hard-light opacity-35 z-[4]"
            />
            <div
              className="absolute inset-0 z-[5] pointer-events-none opacity-15"
              style={{
                background: 'repeating-linear-gradient(rgba(0,0,0,0.8) 0px, rgba(0,0,0,0.8) 1px, transparent 1px, transparent 2px)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

