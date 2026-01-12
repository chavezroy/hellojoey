'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

interface NavigationProps {
  items: NavItem[];
  show: boolean;
  fadeOut: boolean;
}

export default function Navigation({ items, show, fadeOut }: NavigationProps) {
  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 py-[30px] px-[60px] z-[10000] flex justify-center items-center backdrop-blur-[7px] bg-header-purple transition-opacity duration-800 ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-70 pointer-events-auto'
      }`}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: show ? 1 : 0.8 }}
    >
      <nav className={`hidden md:flex flex-wrap gap-y-5 gap-x-[35px] justify-center max-w-[1200px] items-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="relative text-white/80 no-underline text-xl font-medium transition-all duration-400 whitespace-nowrap transform-origin-center hover:text-neon-green hover:scale-105 hover:drop-shadow-[0_0_5px_#00FF00,0_0_10px_#00FF00,0_0_20px_#00FF00,0_0_40px_#00FF00]"
            style={{ textTransform: 'none' }}
          >
            <span className="relative z-[2]">{item.label}</span>
            <motion.div
              className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-neon-green to-transparent"
              initial={{ width: 0 }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
            />
          </Link>
        ))}
      </nav>
    </motion.header>
  );
}

