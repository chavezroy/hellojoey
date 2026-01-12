'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ParallaxListProps {
  items: string[];
}

export default function ParallaxList({ items }: ParallaxListProps) {
  return (
    <ul className="parallax-list list-none text-[clamp(28px,3vw,44px)] font-normal leading-[1.1] flex flex-col items-center gap-5">
      {items.map((item, index) => {
        const itemRef = useRef<HTMLLIElement>(null);
        const itemInView = useInView(itemRef, { amount: 0.2, once: false });

        return (
          <motion.li
            key={index}
            ref={itemRef}
            className="relative z-[2] inline-block transform-origin-center text-neon-green text-shadow-[0_0_3px_rgba(0,255,0,0.5),0_0_6px_rgba(0,255,0,0.3)]"
            initial={{ opacity: 0, y: 50 }}
            animate={itemInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
            whileHover={{
              scale: 1.05,
              textShadow: '0 0 3px #00FF00, 0 0 6px #00FF00',
            }}
          >
            <span className="relative z-[2]">{item}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}

