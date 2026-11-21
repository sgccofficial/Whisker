import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { MochiCharacter, PipCharacter } from './Characters';

interface EnvelopeSceneProps {
  envelopeLabel: string;
  openingLetter: string;
  isScrapbookRevealed: boolean;
  onRevealScrapbook: () => void;
}

export const EnvelopeScene: React.FC<EnvelopeSceneProps> = ({
  envelopeLabel,
  openingLetter,
  isScrapbookRevealed,
  onRevealScrapbook,
}) => {
  const [opened, setOpened] = useState(false);

  const paragraphs = openingLetter
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="relative z-10 min-h-[92dvh] w-full flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="closed-envelope"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Tactile handmade envelope */}
              <div className="relative pt-10">
                {/* Pip perched curiously on top-right corner of the envelope */}
                <div className="absolute -top-1 right-6 z-20 pointer-events-none">
                  <PipCharacter mode="perched" size={56} />
                </div>

                <motion.button
                  type="button"
                  onClick={() => setOpened(true)}
                  whileHover={{ y: -4, rotate: -0.6 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Tap to open the envelope"
                  className="group relative w-[300px] sm:w-[370px] h-[206px] sm:h-[240px] rounded-2xl bg-[#F6EDE0] border border-[#3A322C]/15 shadow-[0_18px_40px_-16px_rgba(62,50,38,0.18)] flex flex-col items-center justify-center overflow-hidden text-center transition-shadow hover:shadow-[0_22px_48px_-14px_rgba(62,50,38,0.22)]"
                >
                  {/* Envelope flap lines */}
                  <svg
                    viewBox="0 0 370 240"
                    fill="none"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    aria-hidden="true"
                  >
                    {/* Bottom fold triangles */}
                    <path
                      d="M0 240L185 118L370 240"
                      fill="#EFE3D2"
                      fillOpacity="0.65"
                      stroke="#3A322C"
                      strokeOpacity="0.11"
                      strokeWidth="1.2"
                    />
                    {/* Top flap */}
                    <path
                      d="M0 0L185 126L370 0"
                      fill="#FBF5EB"
                      stroke="#3A322C"
                      strokeOpacity="0.14"
                      strokeWidth="1.3"
                    />
                  </svg>

                  {/* Dusty-rose wax seal */}
                  <div className="relative z-10 mt-2 mb-3 w-12 h-12 rounded-full bg-[#D18B8B] border-2 border-[#B56E6E]/60 shadow-sm flex items-center justify-center text-[#FFFDF8] text-lg transition-transform duration-200 group-hover:scale-105">
                    ♡
                  </div>

                  {/* Handwritten envelope label */}
                  <span
                    className="relative z-10 text-[#3A322C] text-3xl sm:text-4xl"
                    style={{ fontFamily: 'var(--font-handwritten)' }}
                  >
                    {envelopeLabel}
                  </span>
                </motion.button>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-7 text-sm text-[#7B7167]"
              >
                Tap the envelope to open it
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="unfolded-letter"
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl"
            >
              {/* Unfolded cream letter card with subtle paper crease */}
              <div className="relative paper-card rounded-2xl px-7 py-10 sm:px-12 sm:py-12">
                {/* Tiny decorative pastel tape at top center */}
                <div
                  className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-sm -rotate-1"
                  style={{ backgroundColor: 'rgba(217, 155, 155, 0.45)' }}
                  aria-hidden="true"
                />

                {/* Handwritten small greeting */}
                <p
                  className="text-2xl text-[#A86A6A] mb-5"
                  style={{ fontFamily: 'var(--font-handwritten)' }}
                >
                  {envelopeLabel}
                </p>

                {/* Opening letter prose */}
                <div className="space-y-4">
                  {paragraphs.map((text, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + idx * 0.25 }}
                      className={
                        idx === 0
                          ? 'text-2xl sm:text-[1.7rem] leading-snug text-[#2E2925] font-normal'
                          : 'text-base sm:text-lg leading-relaxed text-[#584F47]'
                      }
                      style={
                        idx === 0
                          ? { fontFamily: 'var(--font-serif-story)' }
                          : undefined
                      }
                    >
                      {text}
                    </motion.p>
                  ))}
                </div>

                {/* Mochi sitting quietly beside the letter */}
                <div className="mt-8 flex items-end justify-between gap-4 pt-4 border-t border-[#2E2925]/8">
                  <div className="flex items-center gap-3">
                    <MochiCharacter mood="reading" size={76} />
                    <span
                      className="text-lg text-[#8C8278] hidden sm:inline"
                      style={{ fontFamily: 'var(--font-handwritten)' }}
                    >
                      take your time reading...
                    </span>
                  </div>

                  {!isScrapbookRevealed && (
                    <motion.button
                      type="button"
                      onClick={onRevealScrapbook}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 rounded-full bg-[#2E2925] text-[#FBF8F1] text-sm sm:text-base font-medium hover:bg-[#413A34] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Keep going</span>
                      <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
