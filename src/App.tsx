/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DEFAULT_EXPERIENCE,
  ExperienceConfig,
  ScrapbookPhoto,
  loadSavedExperience,
  saveExperience,
  resetSavedExperience,
} from './data/experienceContent';
import { hasShareHashInUrl, parseSharedGiftFromUrl } from './utils/shareLink';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { WelcomeScene } from './components/WelcomeScene';
import { TrustQuestionScene } from './components/TrustQuestionScene';
import { YesSurpriseScene } from './components/YesSurpriseScene';
import { EnvelopeScene } from './components/EnvelopeScene';
import { ScrapbookCard } from './components/ScrapbookCard';
import { EndingScene } from './components/EndingScene';
import { PhotoLightbox } from './components/PhotoLightbox';
import { PersonalizeDrawer } from './components/PersonalizeDrawer';
import { ShareLinkModal } from './components/ShareLinkModal';

type JourneyStage = 'welcome' | 'question' | 'surprise' | 'card';

export default function App() {
  const [stage, setStage] = useState<JourneyStage>('welcome');
  const [scrapbookRevealed, setScrapbookRevealed] = useState(false);
  const [nearEnding, setNearEnding] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ScrapbookPhoto | null>(null);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(() => hasShareHashInUrl());
  const [config, setConfig] = useState<ExperienceConfig>(() =>
    hasShareHashInUrl() ? DEFAULT_EXPERIENCE : loadSavedExperience()
  );

  // Load read-only shared gift if opened from a generated share link
  useEffect(() => {
    let active = true;

    const syncFromHash = async () => {
      if (!hasShareHashInUrl()) {
        if (!active) return;
        setIsReadOnly(false);
        setConfig(loadSavedExperience());
        return;
      }

      setIsReadOnly(true);
      setPersonalizeOpen(false);
      setShareOpen(false);
      const shared = await parseSharedGiftFromUrl();
      if (!active) return;
      if (shared) {
        setConfig(shared);
      }
    };

    syncFromHash();
    const onHashChange = () => {
      setStage('welcome');
      setScrapbookRevealed(false);
      setActivePhoto(null);
      window.scrollTo({ top: 0 });
      syncFromHash();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      active = false;
      window.removeEventListener('hashchange', onHashChange);
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
      if (isReadOnly) return;
      setConfig(next);
      saveExperience(next);
    },
    [isReadOnly]
  );

  const handleResetConfig = useCallback(() => {
    if (isReadOnly) return;
    resetSavedExperience();
    setConfig(DEFAULT_EXPERIENCE);
  }, [isReadOnly]);

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
      <AmbientBackdrop quiet={nearEnding} />

      {/* Background-blended brand mark continuing gently across all screens (no separate top bar) */}
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
                  isReadOnly={isReadOnly}
                  onReplay={handleReplay}
                  onOpenPersonalize={() => setPersonalizeOpen(true)}
                  onOpenShareLink={() => setShareOpen(true)}
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

      {/* Understated Personalization Drawer & Share Modal (never rendered in read-only shared links) */}
      {!isReadOnly && (
        <>
          <PersonalizeDrawer
            open={personalizeOpen}
            config={config}
            onChange={handleUpdateConfig}
            onReset={handleResetConfig}
            onClose={() => setPersonalizeOpen(false)}
          />

          <ShareLinkModal
            open={shareOpen}
            config={config}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}
    </main>
  );
}
