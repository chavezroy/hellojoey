'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [trailPositions, setTrailPositions] = useState<Array<{ x: number; y: number }>>(
    Array(8).fill({ x: 0, y: 0 })
  );
  const [rotation, setRotation] = useState(10);
  const [targetRotation, setTargetRotation] = useState(10);
  const [isMoving, setIsMoving] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [time, setTime] = useState(0);
  const lastX = useRef(0);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        setTargetRotation(10);
      }, 250);

      const deltaX = e.clientX - lastX.current;
      lastX.current = e.clientX;
      setTargetRotation(Math.max(Math.min(deltaX * 1.5, 35), -35));

      if (Math.random() > 0.6) {
        const newParticle: Particle = {
          id: particleIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          opacity: 0.9,
        };
        setParticles((prev) => [...prev, newParticle]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 1500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Idle particle leak
    const idleLeak = () => {
      if (!isMoving) {
        const burst = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < burst; i++) {
          setTimeout(() => {
            const newParticle: Particle = {
              id: particleIdRef.current++,
              x: currentPos.x,
              y: currentPos.y,
              opacity: 0.9,
            };
            setParticles((prev) => [...prev, newParticle]);
            setTimeout(() => {
              setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
            }, 1500);
          }, i * 100);
        }
      }
      setTimeout(idleLeak, 800 + Math.random() * 2500);
    };
    idleLeak();

    // Animation loop
    const animate = () => {
      setTime((t) => t + 0.05);
      setCurrentPos((prev) => {
        const newPos = {
          x: prev.x + (mousePos.x - prev.x) * 0.2,
          y: prev.y + (mousePos.y - prev.y) * 0.2,
        };
        
        // Update trail positions
        setTrailPositions((trail) => {
          const newTrail = [...trail];
          newTrail.pop();
          return [newPos, ...newTrail];
        });
        
        return newPos;
      });
      setRotation((prev) => prev + (targetRotation - prev) * 0.1);
      if (isMoving) {
        setTargetRotation((prev) => prev * 0.9);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos, isMoving, currentPos, targetRotation]);

  const pulseScale = 1 + Math.sin(time) * 0.08;

  return (
    <>
      <motion.div
        className="fixed text-[38px] pointer-events-none z-[10005] text-neon-green"
        style={{
          left: currentPos.x,
          top: currentPos.y,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${pulseScale})`,
          textShadow: '0 0 8px rgba(0, 255, 0, 0.6)',
        }}
      >
        🕹️
      </motion.div>
      
      {/* Trail */}
      {trailPositions.map((trailPos, i) => {
        const trailOpacity = 0.4 / (i + 1.5);
        const trailScale = pulseScale * (1 - (i + 1) * 0.08);
        
        return (
          <motion.div
            key={i}
            className="fixed text-[38px] pointer-events-none z-[10004] text-neon-green mix-blend-screen blur-[1px]"
            animate={{
              x: trailPos.x,
              y: trailPos.y,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              transform: `translate(-50%, -50%) scale(${trailScale}) rotate(${rotation}deg)`,
              opacity: trailOpacity,
            }}
          >
            🕹️
          </motion.div>
        );
      })}

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed text-sm pointer-events-none z-[10003] opacity-90 mix-blend-screen"
          initial={{ opacity: 0.9, scale: 1, rotate: 0 }}
          animate={{
            opacity: 0,
            y: particle.y + 150,
            scale: 0.5,
            rotate: 360,
          }}
          transition={{ duration: 1.5, ease: 'linear' }}
          style={{
            left: particle.x,
            top: particle.y,
            filter: 'brightness(0.8) sepia(1) hue-rotate(70deg) saturate(10)',
            textShadow: '0 0 5px #00FF00, 0 0 10px #00FF00',
          }}
        >
          ⭐️
        </motion.div>
      ))}
    </>
  );
}

