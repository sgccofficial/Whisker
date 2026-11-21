/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import {
  DEFAULT_EXPERIENCE,
  ExperienceConfig,
  ScrapbookPhoto,
  loadSavedExperience,
  saveExperience,
  resetSavedExperience,
} from './data/experienceContent';
import { hasShareHashInUrl, parseSharedGiftFromUrl } from './utils/shareLink';
import {
  getOrCreateActiveGiftId,
  getSharedGiftIdFromUrl,
  isGiftAlreadyPublished,
  saveGiftToFirestore,
  subscribeToSharedGift,
} from './services/giftService';
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
type SyncStatus = 'local' | 'saving' | 'synced' | 'error';

export default function App() {
  const [stage, setStage] = useState<JourneyStage>('welcome');
  const [scrapbookRevealed, setScrapbookRevealed] = useState(false);
  const [nearEnding, setNearEnding] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ScrapbookPhoto | null>(null);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [activeGiftId, setActiveGiftId] = useState<string>(() => getOrCreateActiveGiftId());
  const [published, setPublished] = useState<boolean>(() =>
    isGiftAlreadyPublished(getOrCreateActiveGiftId())
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    isGiftAlreadyPublished(getOrCreateActiveGiftId()) ? 'synced' : 'local'
  );

  const [sharedGiftId, setSharedGiftId] = useState<string | null>(() => getSharedGiftIdFromUrl());
  const [isLegacyShareHash, setIsLegacyShareHash] = useState<boolean>(() => hasShareHashInUrl());
  const isReadOnly = Boolean(sharedGiftId) || isLegacyShareHash;

  const [loadingShared, setLoadingShared] = useState<boolean>(() => Boolean(getSharedGiftIdFromUrl()));
  const [sharedNotFound, setSharedNotFound] = useState(false);

  const [config, setConfig] = useState<ExperienceConfig>(() =>
    getSharedGiftIdFromUrl() || hasShareHashInUrl() ? DEFAULT_EXPERIENCE : loadSavedExperience()
  );

  const syncTimerRef = useRef<number | null>(null);

  // Track Firebase Auth state for creators
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
  }, []);

  // Watch URL changes (`?g=<giftId>`, `#g=<giftId>`, or legacy `#gift=...`)
  useEffect(() => {
    const handleLocationChange = () => {
      const nextGiftId = getSharedGiftIdFromUrl();
      const nextLegacy = hasShareHashInUrl();
      setSharedGiftId(nextGiftId);
      setIsLegacyShareHash(nextLegacy);
      setStage('welcome');
      setScrapbookRevealed(false);
      setActivePhoto(null);
      setPersonalizeOpen(false);
      setShareOpen(false);
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Subscribe live to a shared Firestore gift document when `?g=<giftId>` is present
  useEffect(() => {
    if (!sharedGiftId) {
      setLoadingShared(false);
      setSharedNotFound(false);
      return;
    }

    setLoadingShared(true);
    setSharedNotFound(false);

    const unsubscribe = subscribeToSharedGift(
      sharedGiftId,
      (remoteConfig) => {
        setLoadingShared(false);
        if (!remoteConfig) {
          setSharedNotFound(true);
          return;
        }
        setSharedNotFound(false);
        setConfig(remoteConfig);
      },
      () => {
        setLoadingShared(false);
        setSharedNotFound(true);
      }
    );

    return () => unsubscribe();
  }, [sharedGiftId]);

  // Backwards-compatibility support for legacy `#gift=...` links
  useEffect(() => {
    if (sharedGiftId) return;
    if (!isLegacyShareHash) {
      setConfig(loadSavedExperience());
      return;
    }

    let active = true;
    parseSharedGiftFromUrl().then((parsed) => {
      if (!active) return;
      if (parsed) {
        setConfig(parsed);
      }
    });
    return () => {
      active = false;
    };
  }, [sharedGiftId, isLegacyShareHash]);

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

  // Live-sync creator edits to the exact same unique Firestore link once published
  const scheduleFirestoreSync = useCallback(
    (nextConfig: ExperienceConfig) => {
      if (!authUser || !published) return;
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
      setSyncStatus('saving');
      syncTimerRef.current = window.setTimeout(async () => {
        try {
          const resolvedId = await saveGiftToFirestore(activeGiftId, nextConfig, authUser.uid);
          if (resolvedId !== activeGiftId) {
            setActiveGiftId(resolvedId);
          }
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, 650);
    },
    [authUser, published, activeGiftId]
  );

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const handleUpdateConfig = useCallback(
    (next: ExperienceConfig) => {
      if (isReadOnly) return;
      setConfig(next);
      saveExperience(next);
      scheduleFirestoreSync(next);
    },
    [isReadOnly, scheduleFirestoreSync]
  );

  const handleResetConfig = useCallback(() => {
    if (isReadOnly) return;
    resetSavedExperience();
    setConfig(DEFAULT_EXPERIENCE);
    scheduleFirestoreSync(DEFAULT_EXPERIENCE);
  }, [isReadOnly, scheduleFirestoreSync]);

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
        hideStars={personalizeOpen || shareOpen || Boolean(activePhoto)}
      />

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

      {loadingShared ? (
        <section className="relative z-10 min-h-[100dvh] w-full flex items-center justify-center px-6">
          <p
            className="text-lg text-[#7B7167]"
            style={{ fontFamily: 'var(--font-serif-story)' }}
          >
            Opening something made for you...
          </p>
        </section>
      ) : sharedNotFound ? (
        <section className="relative z-10 min-h-[100dvh] w-full flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl paper-card p-8 text-center space-y-4">
            <h1
              className="text-2xl font-medium text-[#2E2925]"
              style={{ fontFamily: 'var(--font-serif-story)' }}
            >
              We couldn&apos;t find this gift
            </h1>
            <p className="text-sm text-[#6B6158] leading-relaxed">
              This link may be incomplete or no longer available. Double-check the link with the friend who sent it.
            </p>
          </div>
        </section>
      ) : (
        /* Continuous storybook journey */
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
      )}

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
            syncStatus={syncStatus}
            onChange={handleUpdateConfig}
            onReset={handleResetConfig}
            onClose={() => setPersonalizeOpen(false)}
          />

          <ShareLinkModal
            open={shareOpen}
            config={config}
            giftId={activeGiftId}
            authUser={authUser}
            onGiftIdResolved={(resolvedId) => setActiveGiftId(resolvedId)}
            onSyncComplete={() => {
              setPublished(true);
              setSyncStatus('synced');
            }}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}
    </main>
  );
}
