import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StarSpec {
  id: string;
  top: string;
  left: string;
  size: number;
  color: string;
  delay: number;
}

const AMBIENT_STARS: StarSpec[] = [
  { id: 's1', top: '12%', left: '14%', size: 22, color: '#D99B9B', delay: 0 },
  { id: 's2', top: '19%', left: '84%', size: 20, color: '#C9BFDC', delay: 1.4 },
  { id: 's3', top: '44%', left: '8%', size: 18, color: '#A8BCA5', delay: 2.2 },
  { id: 's4', top: '66%', left: '89%', size: 21, color: '#EAC5AF', delay: 0.7 },
  { id: 's5', top: '82%', left: '16%', size: 19, color: '#B8CCE0', delay: 1.9 },
];

const SPARK_OFFSETS = [
  { x: -24, y: -20, size: 7 },
  { x: 24, y: -18, size: 6 },
  { x: -26, y: 14, size: 6 },
  { x: 22, y: 20, size: 7 },
  { x: 0, y: -28, size: 8 },
  { x: 2, y: 24, size: 5 },
];

/**
 * Interactive little hand-drawn star: tap it and it bursts into tiny sparkles and disappears.
 */
export const TappableStar: React.FC<{
  top: string;
  left: string;
  size?: number;
  color?: string;
  delay?: number;
}> = ({ top, left, size = 20, color = '#D99B9B', delay = 0 }) => {
  const [popped, setPopped] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) return null;

  const handlePop = () => {
    if (popped) return;
    setPopped(true);
    window.setTimeout(() => setGone(true), 850);
  };

  return (
    <div
      className="fixed z-30 pointer-events-auto"
      style={{ top, left }}
    >
      <AnimatePresence>
        {!popped ? (
          <motion.button
            key="star-idle"
            type="button"
            onClick={handlePop}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: [0.55, 0.92, 0.55],
              scale: [0.95, 1.07, 0.95],
              rotate: [0, 8, -4, 0],
            }}
            exit={{ scale: 1.35, opacity: 0, transition: { duration: 0.14 } }}
            transition={{
              duration: 5.5,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.3, opacity: 1 }}
            whileTap={{ scale: 0.85 }}
            aria-label="Tap little star"
            className="min-w-[44px] min-h-[44px] -m-3 flex items-center justify-center rounded-full cursor-pointer"
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.5C12.7 8 16 11.3 21.5 12C16 12.7 12.7 16 12 21.5C11.3 16 8 12.7 2.5 12C8 11.3 11.3 8 12 2.5Z"
                fill={color}
                fillOpacity="0.78"
                stroke="#5A5047"
                strokeWidth="1.15"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        ) : (
          <div
            key="star-burst"
            className="relative w-8 h-8 -m-2 flex items-center justify-center pointer-events-none"
          >
            {/* Subtle expanding pop ring */}
            <motion.span
              initial={{ scale: 0.3, opacity: 0.75 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute block w-6 h-6 rounded-full border"
              style={{ borderColor: color }}
            />
            {/* Tiny bursting mini-stars */}
            {SPARK_OFFSETS.map((pt, idx) => (
              <motion.svg
                key={idx}
                width={pt.size * 1.6}
                height={pt.size * 1.6}
                viewBox="0 0 24 24"
                fill="none"
                initial={{ x: 0, y: 0, scale: 1.1, opacity: 1, rotate: 0 }}
                animate={{ x: pt.x, y: pt.y, scale: 0.1, opacity: 0, rotate: 65 }}
                transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                className="absolute"
              >
                <path
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
                  fill={color}
                />
              </motion.svg>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AmbientBackdropProps {
  quiet?: boolean;
}

/**
 * Calm warm paper backdrop with subtle drifting clouds, occasional botanical petals,
 * and optional tappable stars. Quiets down gracefully for the ending.
 */
export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ quiet = false }) => {
  return (
    <>
      {/* Non-interactive paper grain & soft drifting clouds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden paper-grain" aria-hidden="true">
        {/* Soft watercolor cloud top-left */}
        <div
          className={`absolute -top-12 -left-16 w-72 h-44 rounded-full opacity-40 blur-3xl transition-opacity duration-1000 ${
            quiet ? 'opacity-15' : 'animate-slow-drift'
          }`}
          style={{ background: '#EFE6D5' }}
        />

        {/* Soft dusty-lavender cloud mid-right */}
        <div
          className={`absolute top-1/3 -right-20 w-80 h-56 rounded-full blur-3xl transition-opacity duration-1000 ${
            quiet ? 'opacity-10' : 'opacity-25 animate-slow-drift'
          }`}
          style={{ background: '#DFD7EC', animationDelay: '-6s' }}
        />

        {/* Soft warm sage wash bottom-left */}
        <div
          className={`absolute bottom-10 -left-16 w-72 h-52 rounded-full blur-3xl transition-opacity duration-1000 ${
            quiet ? 'opacity-15' : 'opacity-25'
          }`}
          style={{ background: '#DDE6DC' }}
        />

        {/* Subtle hand-drawn cloud outlines */}
        {!quiet && (
          <>
            <svg
              className="absolute top-[9%] right-[12%] w-24 h-12 text-[#8C8278]/20 animate-slow-drift hidden sm:block"
              viewBox="0 0 120 60"
              fill="none"
            >
              <path
                d="M22 44H95C103 44 108 38 107 31C106 25 100 21 94 22C91 12 80 7 70 10C62 12 58 17 56 21C51 17 42 18 38 24C30 24 22 30 22 38C22 41 22 44 22 44Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>

            {/* Occasional floating pastel petals */}
            <svg
              className="absolute top-[16%] left-[26%] w-4 h-4 animate-petal-drift"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M10 2C14 5 16 11 10 18C4 11 6 5 10 2Z" fill="#E6B8B8" fillOpacity="0.6" />
            </svg>
            <svg
              className="absolute top-[30%] right-[22%] w-3.5 h-3.5 animate-petal-drift"
              style={{ animationDelay: '-5s' }}
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M10 2C14 5 16 11 10 18C4 11 6 5 10 2Z" fill="#C9BFDC" fillOpacity="0.55" />
            </svg>
          </>
        )}
      </div>

      {/* Tappable floating little stars (subtle, sparse, rewarding curiosity) */}
      {!quiet &&
        AMBIENT_STARS.map((star) => (
          <TappableStar
            key={star.id}
            top={star.top}
            left={star.left}
            size={star.size}
            color={star.color}
            delay={star.delay}
          />
        ))}
    </>
  );
};
