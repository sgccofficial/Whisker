/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DEFAULT_EXPERIENCE,
  ExperienceConfig,
  ScrapbookPhoto,
  bakeDefaultsToProject,
  hasSavedLocalExperience,
  loadSavedExperience,
  saveExperience,
} from './data/experienceContent';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { WelcomeScene } from './components/WelcomeScene';
import { TrustQuestionScene } from './components/TrustQuestionScene';
import { YesSurpriseScene } from './components/YesSurpriseScene';
import { EnvelopeScene } from './components/EnvelopeScene';
import { ScrapbookCard } from './components/ScrapbookCard';
import { EndingScene } from './components/EndingScene';
import { PhotoLightbox } from './components/PhotoLightbox';
import { PersonalizeDrawer } from './components/PersonalizeDrawer';

type JourneyStage = 'welcome' | 'question' | 'surprise' | 'card';

const IS_DEV_EDITOR = import.meta.env.DEV;

export default function App() {
  const [stage, setStage] = useState<JourneyStage>('welcome');
  const [scrapbookRevealed, setScrapbookRevealed] = useState(false);
  const [nearEnding, setNearEnding] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ScrapbookPhoto | null>(null);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [savingDefaults, setSavingDefaults] = useState(false);

  const [config, setConfig] = useState<ExperienceConfig>(() =>
    IS_DEV_EDITOR ? loadSavedExperience() : DEFAULT_EXPERIENCE
  );

  const bakeTimerRef = useRef<number | null>(null);
  const bakeSeqRef = useRef(0);
  const bakeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingConfigRef = useRef<ExperienceConfig | null>(null);

  const commitDefaultsToProject = useCallback((nextConfig: ExperienceConfig) => {
    if (!IS_DEV_EDITOR) return;
    const seq = ++bakeSeqRef.current;
    setSavingDefaults(true);

    bakeQueueRef.current = bakeQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const baked = await bakeDefaultsToProject(nextConfig);
        if (seq !== bakeSeqRef.current) return;
        if (baked) {
          setConfig(baked);
          saveExperience(baked);
        }
        setSavingDefaults(false);
      });
  }, []);

  // Automatically bake any customizations already saved in AI Studio preview localStorage
  // into `src/data/defaultExperience.json` and `src/assets/images/` on load.
  useEffect(() => {
    if (!IS_DEV_EDITOR) return;
    if (!hasSavedLocalExperience()) return;
    const existingLocal = loadSavedExperience();
    commitDefaultsToProject(existingLocal);
  }, [commitDefaultsToProject]);

  useEffect(() => {
    return () => {
      if (bakeTimerRef.current) {
        window.clearTimeout(bakeTimerRef.current);
      }
    };
  }, []);

  // Gently quiet the ambient decorations when the visitor scrolls down to the final ending
  useEffect(() => {
    if (!scrapbookRevealed) {
      setNearEnding(false);
      return;
    }
    const handleScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setNearEnding(docHeight - scrollBottom < 420);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrapbookRevealed]);

  const handleUpdateConfig = useCallback(
    (next: ExperienceConfig) => {
      if (!IS_DEV_EDITOR) return;
      setConfig(next);
      saveExperience(next);
      pendingConfigRef.current = next;

      if (bakeTimerRef.current) {
        window.clearTimeout(bakeTimerRef.current);
      }
      setSavingDefaults(true);
      bakeTimerRef.current = window.setTimeout(() => {
        const toBake = pendingConfigRef.current;
        pendingConfigRef.current = null;
        if (toBake) {
          commitDefaultsToProject(toBake);
        }
      }, 450);
    },
    [commitDefaultsToProject]
  );

  const handleClosePersonalize = useCallback(() => {
    setPersonalizeOpen(false);
    if (bakeTimerRef.current) {
      window.clearTimeout(bakeTimerRef.current);
      bakeTimerRef.current = null;
    }
    if (pendingConfigRef.current) {
      const toBake = pendingConfigRef.current;
      pendingConfigRef.current = null;
      commitDefaultsToProject(toBake);
    }
  }, [commitDefaultsToProject]);

  const handleRevealScrapbook = useCallback(() => {
    setScrapbookRevealed(true);
    window.setTimeout(() => {
      const el = document.getElementById('scrapbook-start');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }, []);

  const handleReplay = useCallback(() => {
    setActivePhoto(null);
    setScrapbookRevealed(false);
    setNearEnding(false);
    setStage('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-clip bg-[#FBF8F1] text-[#2E2925]">
      {/* Soft warm paper backdrop with gentle drifting elements & tappable stars */}
      <AmbientBackdrop
        quiet={nearEnding}
        hideStars={personalizeOpen || Boolean(activePhoto)}
      />

      {/* Background-blended brand mark continuing gently across all screens */}
      <div
        aria-label="whisker."
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[1] pointer-events-none select-none"
      >
        <span
          className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-[#7D7267]/50"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          whisker.
        </span>
      </div>

      {/* Continuous storybook journey */}
      <AnimatePresence mode="wait">
        {stage === 'welcome' && (
          <WelcomeScene
            key="stage-welcome"
            friendLabel={config.friendLabel}
            onEnter={() => setStage('question')}
          />
        )}

        {stage === 'question' && (
          <TrustQuestionScene
            key="stage-question"
            onYes={() => setStage('surprise')}
          />
        )}

        {stage === 'surprise' && (
          <YesSurpriseScene
            key="stage-surprise"
            onOpenGift={() => {
              setStage('card');
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {stage === 'card' && (
          <motion.div
            key="stage-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 w-full"
          >
            {/* Scene 05: Envelope opening into the first letter card */}
            <EnvelopeScene
              envelopeLabel={config.envelopeLabel}
              openingLetter={config.openingLetter}
              isScrapbookRevealed={scrapbookRevealed}
              onRevealScrapbook={handleRevealScrapbook}
            />

            {/* Scene 06 & 07: The Scrapbook Memories + The Quiet Ending */}
            {scrapbookRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <ScrapbookCard
                  config={config}
                  onSelectPhoto={(photo) => setActivePhoto(photo)}
                />

                <EndingScene
                  endingLines={config.endingLines}
                  endingSignOff={config.endingSignOff}
                  canEdit={IS_DEV_EDITOR}
                  onReplay={handleReplay}
                  onOpenPersonalize={() => setPersonalizeOpen(true)}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enlarged Polaroid Lightbox */}
      <PhotoLightbox
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
      />

      {/* Personalization drawer available only in AI Studio preview so edits save directly into project defaults */}
      {IS_DEV_EDITOR && (
        <PersonalizeDrawer
          open={personalizeOpen}
          config={config}
          savingDefaults={savingDefaults}
          onChange={handleUpdateConfig}
          onClose={handleClosePersonalize}
        />
      )}
    </main>
  );
}
