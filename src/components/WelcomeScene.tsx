import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MochiCharacter } from './Characters';

interface WelcomeSceneProps {
  friendLabel: string;
  onEnter: () => void;
}

export const WelcomeScene: React.FC<WelcomeSceneProps> = ({ friendLabel, onEnter }) => {
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(() => {
      onEnter();
    }, 340);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Mochi gently greets */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <MochiCharacter
            mood={entering ? 'celebrating' : 'waving'}
            size={124}
          />
        </motion.div>

        {/* Gradual, warm short intro lines */}
        <div className="space-y-4 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl font-medium tracking-tight text-[#2E2925]"
            style={{ fontFamily: 'var(--font-serif-story)' }}
          >
            {friendLabel}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-[#4C443D] leading-relaxed"
          >
            I&apos;ve made something for you.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#6B6158] leading-relaxed"
          >
            It&apos;s a little different from the usual stuff.
            <br />
            Come on, take a look.
          </motion.p>
        </div>

        {/* Single primary CTA — immediately reachable in DOM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <motion.button
            type="button"
            onClick={handleEnter}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-7 py-3 rounded-full bg-[#2E2925] text-[#FBF8F1] text-base font-medium shadow-sm hover:bg-[#413A34] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Come in</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Subtle quiet hint about interactive stars */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 1.9 }}
          className="mt-14 text-sm text-[#8C8278]"
          style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem' }}
        >
          (psst — you can tap the little stars floating around)
        </motion.p>
      </div>
    </motion.section>
  );
};
