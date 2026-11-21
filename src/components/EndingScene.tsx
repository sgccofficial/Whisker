import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, SlidersHorizontal, Link2 } from 'lucide-react';
import { MochiCharacter } from './Characters';

interface EndingSceneProps {
  endingLines: string[];
  endingSignOff: string;
  isReadOnly?: boolean;
  onReplay: () => void;
  onOpenPersonalize: () => void;
  onOpenShareLink: () => void;
}

export const EndingScene: React.FC<EndingSceneProps> = ({
  endingLines,
  endingSignOff,
  isReadOnly = false,
  onReplay,
  onOpenPersonalize,
  onOpenShareLink,
}) => {
  return (
    <section
      aria-label="Closing message"
      className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-12 pb-24 sm:pt-20 sm:pb-28"
    >
      {/* Subtle hairline divider marking the calmer, quieter chapter */}
      <div className="w-16 h-px bg-[#2E2925]/15 mx-auto mb-16 sm:mb-20" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="paper-card rounded-2xl px-7 py-10 sm:px-12 sm:py-14 text-center"
      >
        <div className="space-y-4 max-w-md mx-auto">
          {endingLines.map((line, idx) => (
            <p
              key={idx}
              className={
                idx === 0
                  ? 'text-xl text-[#8C8278] italic'
                  : idx === 1
                    ? 'text-2xl sm:text-[1.75rem] text-[#2E2925] leading-snug pt-1'
                    : 'text-base sm:text-lg text-[#5B524A] leading-relaxed'
              }
              style={
                idx === 0 || idx === 1
                  ? { fontFamily: 'var(--font-serif-story)' }
                  : undefined
              }
            >
              {line}
            </p>
          ))}
        </div>

        {/* Handwritten sign-off + gently waving Mochi */}
        <div className="mt-10 pt-8 border-t border-[#2E2925]/8 flex flex-col items-center gap-4">
          <p
            className="text-2xl sm:text-3xl text-[#A86A6A]"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            {endingSignOff}
          </p>

          <MochiCharacter mood="gentle-wave" size={96} />
        </div>
      </motion.div>

      {/* Quiet, understated footer links — edit & share actions are hidden in read-only shared links */}
      <div className="mt-12 flex flex-col items-center gap-2 text-sm text-[#7B7167]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 hover:text-[#2E2925] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Start from the beginning</span>
          </button>

          {!isReadOnly && (
            <>
              <span aria-hidden="true" className="text-[#C7BEB3]">
                ·
              </span>

              <button
                type="button"
                onClick={onOpenPersonalize}
                className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 hover:text-[#2E2925] transition-colors whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Personalize photos &amp; notes</span>
              </button>
            </>
          )}
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={onOpenShareLink}
            className="mt-2 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-full bg-[#2E2925] text-[#FBF8F1] text-sm font-medium hover:bg-[#413A34] transition-colors whitespace-nowrap shrink-0"
          >
            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Generate shareable link</span>
          </button>
        )}
      </div>

      {/* Chunky, background-blended Swiggy-style ending signature */}
      <div className="mt-20 pt-12 border-t border-[#2E2925]/8 max-w-md mx-auto select-none">
        <div
          className="text-4xl sm:text-[2.85rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#8E8479]/38"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <span className="inline-flex items-center gap-2.5 flex-wrap">
            <span>Made with</span>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 sm:w-10 sm:h-10 text-[#C98686]/80 translate-y-[2px]"
              aria-label="love"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          <span className="block">by whisker.</span>
        </div>
      </div>
    </section>
  );
};
