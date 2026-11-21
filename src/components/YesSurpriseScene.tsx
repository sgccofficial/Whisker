import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MochiCharacter } from './Characters';

interface YesSurpriseSceneProps {
  onOpenGift: () => void;
}

const BURST_PETALS = [
  { x: -92, y: -64, rotate: -25, color: '#D99B9B', kind: 'star' },
  { x: 96, y: -58, rotate: 22, color: '#C9BFDC', kind: 'star' },
  { x: -110, y: 12, rotate: -40, color: '#A8BCA5', kind: 'petal' },
  { x: 112, y: 16, rotate: 35, color: '#EAC5AF', kind: 'petal' },
  { x: -58, y: -96, rotate: -10, color: '#B8CCE0', kind: 'star' },
  { x: 60, y: -94, rotate: 14, color: '#D99B9B', kind: 'petal' },
  { x: -72, y: 68, rotate: 18, color: '#EAC5AF', kind: 'star' },
  { x: 76, y: 62, rotate: -18, color: '#C9BFDC', kind: 'petal' },
];

export const YesSurpriseScene: React.FC<YesSurpriseSceneProps> = ({ onOpenGift }) => {
  // Beat 0: freeze -> Beat 1: item drops -> Beat 2: Really!! burst -> Beat 3: Okay. I have something for you.
  const [beat, setBeat] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setBeat(1), 280);
    const t2 = window.setTimeout(() => setBeat(2), 1150);
    const t3 = window.setTimeout(() => setBeat(3), 2350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const isCelebration = beat >= 2;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Character + gentle outward star & petal bloom */}
        <div className="relative flex items-center justify-center h-40 w-full mb-4">
          {isCelebration &&
            BURST_PETALS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 0.95, 0.75],
                  x: item.x,
                  y: item.y,
                  scale: [0.3, 1.12, 1],
                  rotate: item.rotate,
                }}
                transition={{
                  duration: 0.85,
                  delay: idx * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none absolute"
                aria-hidden="true"
              >
                {item.kind === 'star' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L14 9.5L21.5 12L14 14.5L12 22L10 14.5L2.5 12L10 9.5L12 2Z"
                      fill={item.color}
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 2C14.5 5.5 15.5 12 10 18C4.5 12 5.5 5.5 10 2Z"
                      fill={item.color}
                    />
                  </svg>
                )}
              </motion.div>
            ))}

          <MochiCharacter
            mood={isCelebration ? 'celebrating' : 'freeze-drop'}
            droppedItem={beat >= 1}
            size={134}
          />
        </div>

        {/* Surprise reaction text */}
        <div className="min-h-[104px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isCelebration ? (
              <motion.p
                key="pause-dots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-2xl text-[#8C8278] tracking-widest"
                style={{ fontFamily: 'var(--font-serif-story)' }}
              >
                . . .
              </motion.p>
            ) : (
              <motion.div
                key="really-reveal"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5"
              >
                <h2
                  className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2E2925]"
                  style={{ fontFamily: 'var(--font-serif-story)' }}
                >
                  Really!!
                </h2>
                <p className="text-lg sm:text-xl text-[#5D534B]">
                  I didn&apos;t expect that from you!!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calm follow-up + Open it button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: beat >= 3 ? 1 : 0, y: beat >= 3 ? 0 : 12 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-8 flex flex-col items-center gap-6 ${
            beat >= 3 ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <p className="text-base sm:text-lg text-[#6B6158]">
            Okay. I have something for you.
          </p>

          <motion.button
            type="button"
            onClick={onOpenGift}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2.5 min-h-[50px] px-8 py-3 rounded-full bg-[#2E2925] text-[#FBF8F1] text-base font-medium shadow-sm hover:bg-[#413A34] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open it</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};
