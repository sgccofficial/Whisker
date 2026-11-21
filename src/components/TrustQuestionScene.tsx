import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MochiCharacter, MochiMood } from './Characters';
import {
  INITIAL_NO_REACTIONS,
  FURTHER_NO_REACTIONS,
  NoReaction,
} from '../data/experienceContent';

interface TrustQuestionSceneProps {
  onYes: () => void;
}

export const TrustQuestionScene: React.FC<TrustQuestionSceneProps> = ({ onYes }) => {
  const [noCount, setNoCount] = useState(0);
  const [currentReaction, setCurrentReaction] = useState<NoReaction | null>(null);
  const lastRandomIndex = useRef<number>(-1);

  const handleNo = () => {
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    if (nextCount <= INITIAL_NO_REACTIONS.length) {
      setCurrentReaction(INITIAL_NO_REACTIONS[nextCount - 1]);
      return;
    }

    // Pick a different playful response each time from FURTHER_NO_REACTIONS
    let nextIdx = Math.floor(Math.random() * FURTHER_NO_REACTIONS.length);
    if (nextIdx === lastRandomIndex.current) {
      nextIdx = (nextIdx + 1) % FURTHER_NO_REACTIONS.length;
    }
    lastRandomIndex.current = nextIdx;
    setCurrentReaction(FURTHER_NO_REACTIONS[nextIdx]);
  };

  const characterMood: MochiMood = currentReaction ? currentReaction.mood : 'curious';
  const characterOffset = currentReaction?.characterOffset ?? 'center';

  const offsetAnimate =
    characterOffset === 'peek-left'
      ? { x: -46, y: 4, rotate: 9 }
      : characterOffset === 'peek-right'
        ? { x: 46, y: 4, rotate: -9 }
        : characterOffset === 'low'
          ? { x: 0, y: 10, rotate: 0 }
          : { x: 0, y: 0, rotate: 0 };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Mochi's stage — shifts playfully with each No */}
        <div className="relative h-36 w-full flex items-center justify-center mb-4">
          <motion.div
            animate={offsetAnimate}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <MochiCharacter mood={characterMood} size={126} />
          </motion.div>
        </div>

        {/* Dynamic reaction bubble for the Please Loop */}
        <div className="min-h-[56px] flex items-center justify-center mb-4 px-2">
          <AnimatePresence mode="wait">
            {currentReaction ? (
              <motion.div
                key={`no-${noCount}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block rounded-2xl paper-card px-5 py-2.5 text-[#3B342E]"
              >
                <p className="text-base sm:text-lg font-medium leading-snug">
                  {currentReaction.message}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="intro-line"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-lg text-[#6B6158] max-w-md leading-relaxed"
              >
                Okay... before I show it to you, I need to ask you something.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* The focal question */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-[2.65rem] font-medium tracking-tight text-[#2E2925] leading-[1.2] max-w-lg"
          style={{ fontFamily: 'var(--font-serif-story)' }}
        >
          Do you trust me as your best friend?
        </motion.h2>

        {/* Two comfortable, always-usable buttons (No never disappears or traps her) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="mt-10 flex items-center justify-center gap-4 w-full max-w-xs"
        >
          <motion.button
            type="button"
            onClick={onYes}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1 min-h-[52px] px-7 py-3 rounded-full bg-[#B56E6E] text-[#FFFDF8] text-base font-medium shadow-sm hover:bg-[#9E5B5B] transition-colors whitespace-nowrap shrink-0"
          >
            YES
          </motion.button>

          <motion.button
            type="button"
            onClick={handleNo}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1 min-h-[52px] px-7 py-3 rounded-full bg-[#FFFDF8] text-[#4C443D] text-base font-medium border border-[#2E2925]/15 hover:border-[#2E2925]/30 hover:bg-[#F7F2E8] transition-colors whitespace-nowrap shrink-0"
          >
            NO
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};
