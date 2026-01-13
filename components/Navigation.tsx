'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface NavItem {
  label: string;
  href: string;
}

interface NavigationProps {
  items: NavItem[];
  show: boolean;
  fadeOut: boolean;
  logoImage: string;
  logoAlt: string;
}

export default function Navigation({ items, show, fadeOut, logoImage, logoAlt }: NavigationProps) {
  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 py-[30px] px-[60px] z-[10000] flex justify-center items-center backdrop-blur-[7px] bg-header-purple transition-opacity duration-800 ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-70 pointer-events-auto'
      }`}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: show ? 1 : 0.8 }}
    >
      {/* Left Logo */}
      <div className="nav-logo-wrap left">
        <Image
          src={logoImage}
          alt={logoAlt}
          width={62}
          height={62}
          className="nav-logo-img logo-trigger"
          style={{ height: '62px', width: 'auto' }}
        />
      </div>

      {/* Navigation Links */}
      <nav className={`hidden md:flex flex-wrap gap-y-5 gap-x-[35px] justify-center max-w-[1200px] items-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="relative text-neon-green no-underline text-xl font-medium transition-all duration-400 whitespace-nowrap transform-origin-center hover:scale-105 hover:drop-shadow-[0_0_3px_#00FF00,0_0_6px_#00FF00]"
            style={{ textTransform: 'none' }}
          >
            <span className="relative z-[2]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right Logo */}
      <div className="nav-logo-wrap right">
        <Image
          src={logoImage}
          alt={logoAlt}
          width={62}
          height={62}
          className="nav-logo-img logo-trigger"
          style={{ height: '62px', width: 'auto' }}
        />
      </div>
    </motion.header>
  );
}

