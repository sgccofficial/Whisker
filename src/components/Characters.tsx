import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type MochiMood =
  | 'waving'
  | 'curious'
  | 'pleading'
  | 'shocked'
  | 'sitting-away'
  | 'peeking'
  | 'flopped'
  | 'holding-heart'
  | 'freeze-drop'
  | 'celebrating'
  | 'reading'
  | 'gentle-wave';

interface MochiProps {
  mood?: MochiMood;
  className?: string;
  size?: number;
  droppedItem?: boolean;
}

/**
 * Mochi — The recurring little storybook companion (soft round cream bunny-bear with charcoal ink lines).
 */
export const MochiCharacter: React.FC<MochiProps> = ({
  mood = 'waving',
  className = '',
  size = 112,
  droppedItem = false,
}) => {
  const isFlopped = mood === 'flopped';
  const isSittingAway = mood === 'sitting-away';
  const isPeeking = mood === 'peeking';
  const isCelebrating = mood === 'celebrating';
  const isFreezeDrop = mood === 'freeze-drop';

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      animate={
        isCelebrating
          ? { x: 0, y: [0, -14, 0, -9, 0], rotate: [0, -4, 4, -2, 0] }
          : isFlopped
            ? { x: 0, y: 12, rotate: -6 }
            : isPeeking
              ? { x: [0, 5, 0], y: 0, rotate: 0 }
              : { x: 0, y: 0, rotate: 0 }
      }
      transition={
        isCelebrating
          ? { type: 'tween', duration: 0.9, repeat: 1, ease: 'easeInOut' }
          : isPeeking
            ? { type: 'tween', duration: 0.7, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 220, damping: 18 }
      }
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Soft ground shadow */}
        <ellipse
          cx="60"
          cy={isFlopped ? '104' : '106'}
          rx={isFlopped ? '36' : '26'}
          ry="5.5"
          fill="#CBBFA9"
          fillOpacity="0.32"
        />

        <g className={isFreezeDrop ? '' : 'animate-gentle-breathe'}>
          {/* Flopped dramatic pose */}
          {isFlopped ? (
            <g>
              {/* Flopped ears */}
              <ellipse
                cx="28"
                cy="74"
                rx="13"
                ry="7"
                transform="rotate(-18 28 74)"
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.4"
              />
              <ellipse
                cx="36"
                cy="66"
                rx="12"
                ry="6.5"
                transform="rotate(-32 36 66)"
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.4"
              />
              {/* Flat loaf body */}
              <path
                d="M25 89C25 71 42 64 64 64C86 64 98 73 98 88C98 98 86 101 62 101C38 101 25 99 25 89Z"
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Blush */}
              <ellipse cx="48" cy="86" rx="5" ry="3" fill="#E8B4B4" opacity="0.65" />
              {/* Tired spiral / flat eyes */}
              <path d="M40 80H48" stroke="#3A322C" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M56 80H64" stroke="#3A322C" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M49 87C51 85.5 53 85.5 55 87" stroke="#3A322C" strokeWidth="2" strokeLinecap="round" />
              {/* Tiny sweat drop */}
              <path
                d="M78 58C78 58 83 64 83 67.5C83 70 80.8 72 78 72C75.2 72 73 70 73 67.5C73 64 78 58 78 58Z"
                fill="#B8CCE0"
                stroke="#3A322C"
                strokeWidth="1.6"
              />
            </g>
          ) : (
            <g>
              {/* Left Ear */}
              <ellipse
                cx="42"
                cy="30"
                rx="9.5"
                ry="18"
                transform={
                  mood === 'pleading' || mood === 'sitting-away'
                    ? 'rotate(-24 42 30)'
                    : mood === 'shocked' || isFreezeDrop
                      ? 'rotate(-4 42 30)'
                      : 'rotate(-12 42 30)'
                }
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.5"
              />
              <ellipse
                cx="42"
                cy="32"
                rx="4.5"
                ry="10"
                transform={
                  mood === 'pleading' || mood === 'sitting-away'
                    ? 'rotate(-24 42 32)'
                    : 'rotate(-12 42 32)'
                }
                fill="#F0D0D0"
                opacity="0.7"
              />

              {/* Right Ear */}
              <ellipse
                cx="78"
                cy="30"
                rx="9.5"
                ry="18"
                transform={
                  mood === 'pleading' || mood === 'sitting-away'
                    ? 'rotate(24 78 30)'
                    : mood === 'shocked' || isFreezeDrop
                      ? 'rotate(4 78 30)'
                      : 'rotate(12 78 30)'
                }
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.5"
              />
              <ellipse
                cx="78"
                cy="32"
                rx="4.5"
                ry="10"
                transform={
                  mood === 'pleading' || mood === 'sitting-away'
                    ? 'rotate(24 78 32)'
                    : 'rotate(12 78 32)'
                }
                fill="#F0D0D0"
                opacity="0.7"
              />

              {/* Main soft pear-shaped body */}
              <path
                d="M30 76C30 52 41 38 60 38C79 38 90 52 90 76C90 95 79 103 60 103C41 103 30 95 30 76Z"
                fill="#FFFDF8"
                stroke="#3A322C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Tiny pastel dusty-rose scarf/ribbon */}
              <path
                d="M42 78C48 82.5 72 82.5 78 78"
                stroke="#D99B9B"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M68 80L72 89"
                stroke="#D99B9B"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Sitting away (back turned slightly / covering eyes dramatically) */}
              {isSittingAway ? (
                <g>
                  {/* Little round cotton tail */}
                  <circle cx="60" cy="91" r="7" fill="#FFFDF8" stroke="#3A322C" strokeWidth="2.2" />
                  {/* Grumpy tiny puff cloud */}
                  <path
                    d="M89 44C91 41 96 42 96 46C99 47 98 52 94 52C92 54 88 53 88 50C85 49 86 44 89 44Z"
                    fill="#EFE9DE"
                    stroke="#3A322C"
                    strokeWidth="1.6"
                  />
                </g>
              ) : (
                <g>
                  {/* Cheeks */}
                  <ellipse cx="42" cy="67" rx="5.5" ry="3.2" fill="#E8B4B4" opacity="0.65" />
                  <ellipse cx="78" cy="67" rx="5.5" ry="3.2" fill="#E8B4B4" opacity="0.65" />

                  {/* Eyes by mood */}
                  {mood === 'pleading' ? (
                    <g>
                      <circle cx="48" cy="60" r="5.2" fill="#3A322C" />
                      <circle cx="46.5" cy="58.2" r="2" fill="#FFFFFF" />
                      <circle cx="49.8" cy="62" r="1" fill="#FFFFFF" />
                      <circle cx="72" cy="60" r="5.2" fill="#3A322C" />
                      <circle cx="70.5" cy="58.2" r="2" fill="#FFFFFF" />
                      <circle cx="73.8" cy="62" r="1" fill="#FFFFFF" />
                      {/* Worried little brows */}
                      <path d="M43 52L51 54" stroke="#3A322C" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M77 52L69 54" stroke="#3A322C" strokeWidth="1.8" strokeLinecap="round" />
                      {/* Tiny wobbly mouth */}
                      <path d="M56 69C58 67.5 62 67.5 64 69" stroke="#3A322C" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  ) : mood === 'shocked' || isFreezeDrop ? (
                    <g>
                      <circle cx="48" cy="60" r="5.2" fill="#FFFDF8" stroke="#3A322C" strokeWidth="2.2" />
                      <circle cx="48" cy="60" r="1.8" fill="#3A322C" />
                      <circle cx="72" cy="60" r="5.2" fill="#FFFDF8" stroke="#3A322C" strokeWidth="2.2" />
                      <circle cx="72" cy="60" r="1.8" fill="#3A322C" />
                      <ellipse cx="60" cy="70" rx="3" ry="3.8" fill="#D99B9B" stroke="#3A322C" strokeWidth="1.8" />
                      {mood === 'shocked' && (
                        <text
                          x="92"
                          y="45"
                          fill="#645B53"
                          fontSize="16"
                          fontFamily="Caveat, cursive"
                          fontWeight="600"
                        >
                          ?
                        </text>
                      )}
                    </g>
                  ) : isCelebrating ? (
                    <g>
                      <path d="M43 60C45.5 56 50.5 56 53 60" stroke="#3A322C" strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M67 60C69.5 56 74.5 56 77 60" stroke="#3A322C" strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M55 67C57 72 63 72 65 67" stroke="#3A322C" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                  ) : (
                    <g className="animate-soft-blink">
                      <circle cx="48" cy="60" r="3.2" fill="#3A322C" />
                      <circle cx="47" cy="58.8" r="1" fill="#FFFFFF" />
                      <circle cx="72" cy="60" r="3.2" fill="#3A322C" />
                      <circle cx="71" cy="58.8" r="1" fill="#FFFFFF" />
                      {/* Warm gentle smile */}
                      <path
                        d="M55.5 67.5C57.5 69.8 62.5 69.8 64.5 67.5"
                        stroke="#3A322C"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  )}

                  {/* Left paw */}
                  {isCelebrating ? (
                    <path
                      d="M32 72C22 62 18 54 22 49"
                      stroke="#3A322C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  ) : mood === 'holding-heart' ? (
                    <g>
                      <path
                        d="M52 86C52 82 58 80 60 84C62 80 68 82 68 86C68 91 60 95 60 95C60 95 52 91 52 86Z"
                        fill="#D99B9B"
                        stroke="#3A322C"
                        strokeWidth="1.8"
                      />
                    </g>
                  ) : (
                    <path
                      d="M36 80C32 84 32 88 36 89"
                      stroke="#3A322C"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Right paw — waving for welcome / gentle-wave / celebrating */}
                  {mood === 'waving' || mood === 'gentle-wave' || isCelebrating ? (
                    <motion.path
                      d="M87 72C96 63 102 55 98 49"
                      stroke="#3A322C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ transformOrigin: '87px 72px' }}
                      animate={{ rotate: [0, 14, -6, 12, 0] }}
                      transition={{
                        duration: mood === 'gentle-wave' ? 2.6 : 1.8,
                        repeat: Infinity,
                        repeatDelay: mood === 'gentle-wave' ? 2.2 : 1.4,
                        ease: 'easeInOut',
                      }}
                    />
                  ) : mood === 'curious' ? (
                    <path
                      d="M84 78C89 75 91 71 88 68"
                      stroke="#3A322C"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M84 80C88 84 88 88 84 89"
                      stroke="#3A322C"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              )}
            </g>
          )}
        </g>

        {/* Falling little flower/teacup during the Yes freeze-drop moment */}
        {isFreezeDrop && (
          <motion.g
            initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={
              droppedItem
                ? { y: 34, x: 10, rotate: 68, opacity: 1 }
                : { y: 0, x: 0, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Tiny warm ceramic teacup */}
            <path
              d="M91 71H103V78C103 81 100.5 83 97 83C93.5 83 91 81 91 78V71Z"
              fill="#EAC5AF"
              stroke="#3A322C"
              strokeWidth="2"
            />
            <path
              d="M103 73C106 73 106.5 78 103 78.5"
              stroke="#3A322C"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
};

interface PipProps {
  mode?: 'perched' | 'sleeping';
  className?: string;
  size?: number;
}

/**
 * Pip — Tiny sprout-bird companion. When in 'sleeping' mode, tapping Pip wakes it up,
 * blinks curiously with a little note, and then it drifts back to sleep.
 */
export const PipCharacter: React.FC<PipProps> = ({
  mode = 'perched',
  className = '',
  size = 64,
}) => {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    if (!awake) return;
    const timer = window.setTimeout(() => {
      setAwake(false);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, [awake]);

  const isInteractiveSleep = mode === 'sleeping';

  const svgContent = (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      {/* Tiny sage sprout on head */}
      <path d="M40 24C40 16 44 12 49 11" stroke="#5B7358" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M41 16C35 12 31 15 33 19C35 22 40 20 41 16Z"
        fill="#A8BCA5"
        stroke="#3A322C"
        strokeWidth="1.6"
      />
      <path
        d="M44 13C49 8 55 11 52 16C50 19 45 17 44 13Z"
        fill="#A8BCA5"
        stroke="#3A322C"
        strokeWidth="1.6"
      />

      {/* Round chick body */}
      <g className="animate-gentle-breathe">
        <path
          d="M18 52C18 34 27 24 40 24C53 24 62 34 62 52C62 63 53 68 40 68C27 68 18 63 18 52Z"
          fill="#F9EFE1"
          stroke="#3A322C"
          strokeWidth="2.3"
        />
        {/* Tiny wing */}
        <path
          d="M54 49C61 48 65 53 60 59"
          stroke="#3A322C"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        {/* Cheeks */}
        <ellipse cx="28" cy="48" rx="4" ry="2.4" fill="#E8B4B4" opacity="0.65" />
        <ellipse cx="52" cy="48" rx="4" ry="2.4" fill="#E8B4B4" opacity="0.65" />

        {/* Eyes */}
        {isInteractiveSleep && !awake ? (
          <g>
            <path d="M29 44C31 46.5 34 46.5 36 44" stroke="#3A322C" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M44 44C46 46.5 49 46.5 51 44" stroke="#3A322C" strokeWidth="2.1" strokeLinecap="round" />
          </g>
        ) : (
          <g className="animate-soft-blink">
            <circle cx="32.5" cy="43" r="2.7" fill="#3A322C" />
            <circle cx="47.5" cy="43" r="2.7" fill="#3A322C" />
          </g>
        )}

        {/* Little beak */}
        <path d="M38 47L40 50.5L42 47" fill="#E4A978" stroke="#3A322C" strokeWidth="1.7" strokeLinejoin="round" />
      </g>

      {/* Little feet */}
      <path d="M33 68V73M47 68V73" stroke="#3A322C" strokeWidth="2.1" strokeLinecap="round" />

      {/* Floating zzz when sleeping */}
      {isInteractiveSleep && !awake && (
        <text
          x="58"
          y="25"
          fill="#8C8278"
          fontSize="14"
          fontFamily="Caveat, cursive"
          className="animate-sleep-zzz"
        >
          z z
        </text>
      )}
    </svg>
  );

  if (!isInteractiveSleep) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }} aria-hidden="true">
        {svgContent}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence>
        {awake && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.25 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#FFFDF8] px-3 py-1.5 text-sm text-[#4C433C] border border-[#2E2925]/10 shadow-sm pointer-events-none"
            style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.05rem' }}
          >
            oh! ...five more minutes
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setAwake(true)}
        whileTap={{ scale: 0.93 }}
        animate={awake ? { y: [0, -5, 0], rotate: [0, -5, 5, 0] } : {}}
        transition={{ duration: 0.45 }}
        aria-label="Tap sleeping little bird companion"
        className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full focus-visible:outline-2"
        style={{ width: size, height: size }}
      >
        {svgContent}
      </motion.button>
    </div>
  );
};

/**
 * Bramble — The whimsical little cat-fox companion determinedly carrying a giant daisy flower.
 */
export const BrambleCharacter: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [tapCount, setTapCount] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  const lines = [
    'almost got it...',
    'this flower is heavier than it looks',
    'bringing it to the scrapbook!',
  ];

  useEffect(() => {
    if (!showBubble) return;
    const t = window.setTimeout(() => setShowBubble(false), 3000);
    return () => window.clearTimeout(t);
  }, [showBubble, tapCount]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key={tapCount}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.22 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#FFFDF8] px-3 py-1 text-[#4C433C] border border-[#2E2925]/10 shadow-sm pointer-events-none"
            style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.05rem' }}
          >
            {lines[(tapCount - 1) % lines.length]}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          setTapCount((c) => c + 1);
          setShowBubble(true);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        animate={tapCount > 0 ? { rotate: [0, -5, 4, -2, 0] } : {}}
        transition={{ duration: 0.5 }}
        aria-label="Little cat carrying an oversized daisy flower"
        className="min-w-[48px] min-h-[48px] inline-flex items-center justify-center rounded-2xl p-1"
      >
        <svg viewBox="0 0 132 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-20 overflow-visible">
          {/* Shadow */}
          <ellipse cx="58" cy="86" rx="28" ry="4.5" fill="#CBBFA9" fillOpacity="0.32" />

          {/* Oversized daisy carried on its back/paws */}
          <g transform="rotate(-14 74 42)">
            <path d="M22 60C48 54 74 46 98 34" stroke="#6C8369" strokeWidth="3.2" strokeLinecap="round" />
            <ellipse cx="64" cy="54" rx="9" ry="4" transform="rotate(24 64 54)" fill="#A8BCA5" stroke="#3A322C" strokeWidth="1.5" />
            {/* Daisy petals */}
            <g transform="translate(99, 32)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-13"
                  rx="4.6"
                  ry="9.5"
                  transform={`rotate(${deg})`}
                  fill="#FFFDF8"
                  stroke="#3A322C"
                  strokeWidth="1.6"
                />
              ))}
              <circle cx="0" cy="0" r="6.8" fill="#EAC58A" stroke="#3A322C" strokeWidth="1.6" />
            </g>
          </g>

          {/* Tiny determined cat-fox body */}
          <g className="animate-gentle-breathe">
            {/* Tail */}
            <path d="M36 74C26 74 22 65 26 58" stroke="#3A322C" strokeWidth="2.4" strokeLinecap="round" />
            {/* Pointed ears */}
            <path d="M44 50L47 40L54 47" fill="#F2E4D4" stroke="#3A322C" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M62 47L69 40L71 50" fill="#F2E4D4" stroke="#3A322C" strokeWidth="2.2" strokeLinejoin="round" />
            {/* Round body */}
            <ellipse cx="58" cy="65" rx="19" ry="17" fill="#F2E4D4" stroke="#3A322C" strokeWidth="2.3" />
            {/* Determined tiny eyes */}
            <circle cx="52" cy="61" r="2.2" fill="#3A322C" />
            <circle cx="65" cy="61" r="2.2" fill="#3A322C" />
            <ellipse cx="47" cy="65" rx="3.2" ry="2" fill="#E8B4B4" opacity="0.6" />
            <ellipse cx="70" cy="65" rx="3.2" ry="2" fill="#E8B4B4" opacity="0.6" />
            <path d="M56 66L58.5 68L61 66" stroke="#3A322C" strokeWidth="1.8" strokeLinecap="round" />
            {/* Little paws gripping stem */}
            <path d="M50 56L54 51M66 56L69 51" stroke="#3A322C" strokeWidth="2.2" strokeLinecap="round" />
            {/* Tiny legs */}
            <path d="M49 80V85M67 80V85" stroke="#3A322C" strokeWidth="2.3" strokeLinecap="round" />
          </g>
        </svg>
      </motion.button>
    </div>
  );
};
