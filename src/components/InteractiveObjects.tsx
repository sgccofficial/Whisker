import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Hidden Interaction: A pressed storybook flower.
 * Tap it → petals sway/bloom softly and reveal a tiny handwritten message.
 */
export const HiddenFlowerNote: React.FC<{ message: string; className?: string }> = ({
  message,
  className = '',
}) => {
  const [bloomed, setBloomed] = useState(false);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.button
        type="button"
        onClick={() => setBloomed((prev) => !prev)}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={bloomed}
        aria-label="Tap flower doodle to reveal a small note"
        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full p-1 group"
      >
        <motion.svg
          viewBox="0 0 64 64"
          fill="none"
          className="w-14 h-14 overflow-visible"
          animate={bloomed ? { rotate: [0, -8, 6, 0], scale: 1.08 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Stem */}
          <path d="M32 34C32 44 30 52 29 59" stroke="#6E856B" strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M31 48C25 46 21 48 22 52C25 53 29 51 31 48Z"
            fill="#A8BCA5"
            stroke="#3A322C"
            strokeWidth="1.4"
          />
          {/* Petals */}
          <g transform="translate(32, 26)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <motion.ellipse
                key={deg}
                cx="0"
                cy={bloomed ? '-12' : '-10.5'}
                rx="5.2"
                ry="8.5"
                transform={`rotate(${deg})`}
                fill={bloomed ? '#F4D4D4' : '#F8E6E1'}
                stroke="#3A322C"
                strokeWidth="1.5"
                animate={{ scale: bloomed ? 1.08 : 1 }}
                transition={{ duration: 0.35 }}
              />
            ))}
            <circle cx="0" cy="0" r="5.6" fill="#EAC58A" stroke="#3A322C" strokeWidth="1.5" />
          </g>
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {bloomed && (
          <motion.p
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="mt-1 max-w-[210px] text-center text-[#5B524A] leading-snug"
            style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.25rem' }}
          >
            “{message}”
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Hidden Interaction: A tiny folded personal envelope tucked in the scrapbook corner.
 * Tap it → opens a short personal note card.
 */
export const HiddenMiniEnvelope: React.FC<{ note: string; className?: string }> = ({
  note,
  className = '',
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.button
        type="button"
        onClick={() => setOpened((prev) => !prev)}
        whileHover={{ y: -2, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={opened}
        aria-label="Open hidden small envelope note"
        className="min-w-[52px] min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1"
      >
        <svg viewBox="0 0 68 48" fill="none" className="w-16 h-11 overflow-visible">
          <rect
            x="4"
            y="8"
            width="60"
            height="36"
            rx="4"
            fill="#F7EFE2"
            stroke="#3A322C"
            strokeWidth="2"
          />
          <motion.path
            d={opened ? 'M5 10L34 2L63 10' : 'M5 10L34 28L63 10'}
            fill="#EFE4D2"
            stroke="#3A322C"
            strokeWidth="2"
            strokeLinejoin="round"
            transition={{ duration: 0.3 }}
          />
          {!opened && (
            <circle cx="34" cy="27" r="4.5" fill="#D99B9B" stroke="#3A322C" strokeWidth="1.4" />
          )}
        </svg>
        <span
          className="text-[#8C8278] text-sm"
          style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.05rem' }}
        >
          {opened ? 'close note' : 'psst...'}
        </span>
      </motion.button>

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 w-64 sm:w-72 rounded-xl paper-card p-4 text-left"
          >
            <p
              className="text-[#3E3731] leading-snug"
              style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.28rem' }}
            >
              {note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Hidden Interaction: A tiny hand-drawn teacup doodle that puffs a gentle floating heart when tapped.
 */
export const InteractiveTeacupDoodle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [puffs, setPuffs] = useState<number[]>([]);

  const handleTap = () => {
    const id = Date.now();
    setPuffs((prev) => [...prev.slice(-3), id]);
    window.setTimeout(() => {
      setPuffs((prev) => prev.filter((item) => item !== id));
    }, 1500);
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2">
        <AnimatePresence>
          {puffs.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 0, y: 8, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: -22, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.35, ease: 'easeOut' }}
              className="block text-[#C47D7D] text-base"
            >
              ♡
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={handleTap}
        whileHover={{ rotate: -4 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Tap cozy teacup doodle"
        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full"
      >
        <svg viewBox="0 0 56 48" fill="none" className="w-12 h-11 overflow-visible">
          {/* Gentle steam wisps */}
          <path d="M20 14C19 10 22 8 21 4" stroke="#9B9085" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M29 13C28 9 31 7 30 3" stroke="#9B9085" strokeWidth="1.6" strokeLinecap="round" />
          {/* Cup body */}
          <path
            d="M12 19H38V30C38 36 33 40 25 40C17 40 12 36 12 30V19Z"
            fill="#F4E5D8"
            stroke="#3A322C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Handle */}
          <path
            d="M38 22C44 22 45 31 38 32"
            stroke="#3A322C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Saucer */}
          <path d="M8 42H42" stroke="#3A322C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  );
};
