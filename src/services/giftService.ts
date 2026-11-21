import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEFAULT_EXPERIENCE,
  ExperienceConfig,
  resetSavedExperience,
} from '../data/experienceContent';
import { compressImageDataUrl } from '../utils/shareLink';

// Synchronized verbatim with firebase-blueprint.json and firestore.rules
export const GIFT_LIMITS = {
  friendLabel: 120,
  envelopeLabel: 120,
  openingLetter: 2000,
  scrapbookIntroKicker: 120,
  scrapbookIntroHeading: 240,
  mainReflection: 3000,
  secondNote: 1000,
  collageHeading: 240,
  hiddenFlowerNote: 300,
  hiddenEnvelopeNote: 600,
  endingText: 1500,
  endingSignOff: 200,
  photoSrc: 130000,
  photoCaption: 200,
  photoDateNote: 120,
  photoMemoryNote: 600,
} as const;

const ACTIVE_GIFT_ID_KEY = 'whisker_active_gift_id_v1';
const PUBLISHED_GIFT_ID_KEY = 'whisker_published_gift_id_v1';
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

interface StoredPhotoDoc {
  id: string;
  src: string;
  caption: string;
  dateNote: string;
  memoryNote: string;
}

interface StoredGiftFields {
  friendLabel: string;
  envelopeLabel: string;
  openingLetter: string;
  scrapbookIntroKicker: string;
  scrapbookIntroHeading: string;
  mainReflection: string;
  secondNote: string;
  collageHeading: string;
  hiddenFlowerNote: string;
  hiddenEnvelopeNote: string;
  endingText: string;
  endingSignOff: string;
  photos: StoredPhotoDoc[];
}

function clampString(val: string | undefined, max: number): string {
  return (val ?? '').slice(0, max);
}

/**
 * Generates a high-entropy URL-safe unique gift ID (matching ^[a-zA-Z0-9_\-]+$).
 */
export function generateUniqueGiftId(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let suffix = '';
  for (let i = 0; i < bytes.length; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `wsk-${suffix}`;
}

/**
 * Returns the persistent giftId for the current creation attempt.
 * Stays identical across edits and reloads until a future "Create New" action mints a fresh one.
 */
export function getOrCreateActiveGiftId(): string {
  try {
    const existing = window.localStorage.getItem(ACTIVE_GIFT_ID_KEY);
    if (existing && ID_PATTERN.test(existing)) {
      return existing;
    }
    const fresh = generateUniqueGiftId();
    window.localStorage.setItem(ACTIVE_GIFT_ID_KEY, fresh);
    return fresh;
  } catch {
    return generateUniqueGiftId();
  }
}

export function setActiveGiftId(giftId: string): void {
  try {
    window.localStorage.setItem(ACTIVE_GIFT_ID_KEY, giftId);
  } catch {
    // Ignore storage errors
  }
}

export function isGiftAlreadyPublished(giftId: string): boolean {
  try {
    return window.localStorage.getItem(PUBLISHED_GIFT_ID_KEY) === giftId;
  } catch {
    return false;
  }
}

export function markGiftPublished(giftId: string): void {
  try {
    window.localStorage.setItem(PUBLISHED_GIFT_ID_KEY, giftId);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Mints a brand-new unique giftId and resets the draft for the future "Create New" homepage button.
 */
export function startFreshGiftAttempt(): string {
  const freshId = generateUniqueGiftId();
  setActiveGiftId(freshId);
  try {
    window.localStorage.removeItem(PUBLISHED_GIFT_ID_KEY);
  } catch {
    // Ignore storage errors
  }
  resetSavedExperience();
  return freshId;
}

/**
 * Extracts a shared gift ID from `?g=<giftId>` or `#g=<giftId>`.
 */
export function getSharedGiftIdFromUrl(): string | null {
  try {
    const queryId = new URLSearchParams(window.location.search).get('g');
    if (queryId && ID_PATTERN.test(queryId)) {
      return queryId;
    }
    if (window.location.hash.startsWith('#g=')) {
      const hashId = window.location.hash.slice(3).trim();
      if (ID_PATTERN.test(hashId)) {
        return hashId;
      }
    }
  } catch {
    // Ignore URL parse errors
  }
  return null;
}

function normalizeBaseUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
}

/**
 * Builds the short, permanent, read-only shareable URL for a given unique giftId.
 */
export function buildUniqueGiftUrl(giftId: string, customBaseUrl?: string): string {
  const fallbackBase = `${window.location.origin}${window.location.pathname}`;
  const baseUrl = (customBaseUrl ? normalizeBaseUrl(customBaseUrl) : null) ?? fallbackBase;
  return `${baseUrl}?g=${encodeURIComponent(giftId)}`;
}

/**
 * Ensures uploaded image data URLs fit cleanly within Firestore's per-photo cap (<= 120,000 chars).
 */
async function ensurePhotoFitsLimit(src: string): Promise<string> {
  if (!src.startsWith('data:image/')) {
    return clampString(src, GIFT_LIMITS.photoSrc);
  }
  if (src.length <= 115000) return src;

  const passes: Array<[number, number]> = [
    [760, 0.72],
    [600, 0.64],
    [480, 0.56],
    [360, 0.48],
  ];
  let current = src;
  for (const [maxDim, quality] of passes) {
    current = await compressImageDataUrl(current, maxDim, quality);
    if (current.length <= 115000) return current;
  }
  return current.slice(0, GIFT_LIMITS.photoSrc);
}

async function serializeConfigToFields(config: ExperienceConfig): Promise<StoredGiftFields> {
  const photos: StoredPhotoDoc[] = [];
  for (let i = 0; i < DEFAULT_EXPERIENCE.photos.length; i++) {
    const base = DEFAULT_EXPERIENCE.photos[i];
    const current = config.photos[i] ?? base;
    const safeSrc = await ensurePhotoFitsLimit(current.src || base.src);
    photos.push({
      id: clampString(base.id, 64),
      src: safeSrc || base.src,
      caption: clampString(current.caption, GIFT_LIMITS.photoCaption),
      dateNote: clampString(current.dateNote, GIFT_LIMITS.photoDateNote),
      memoryNote: clampString(current.memoryNote, GIFT_LIMITS.photoMemoryNote),
    });
  }

  return {
    friendLabel: clampString(config.friendLabel, GIFT_LIMITS.friendLabel),
    envelopeLabel: clampString(config.envelopeLabel, GIFT_LIMITS.envelopeLabel),
    openingLetter: clampString(config.openingLetter, GIFT_LIMITS.openingLetter),
    scrapbookIntroKicker: clampString(
      config.scrapbookIntroKicker,
      GIFT_LIMITS.scrapbookIntroKicker
    ),
    scrapbookIntroHeading: clampString(
      config.scrapbookIntroHeading,
      GIFT_LIMITS.scrapbookIntroHeading
    ),
    mainReflection: clampString(config.mainReflection, GIFT_LIMITS.mainReflection),
    secondNote: clampString(config.secondNote, GIFT_LIMITS.secondNote),
    collageHeading: clampString(config.collageHeading, GIFT_LIMITS.collageHeading),
    hiddenFlowerNote: clampString(config.hiddenFlowerNote, GIFT_LIMITS.hiddenFlowerNote),
    hiddenEnvelopeNote: clampString(config.hiddenEnvelopeNote, GIFT_LIMITS.hiddenEnvelopeNote),
    endingText: clampString(config.endingLines.join('\n'), GIFT_LIMITS.endingText),
    endingSignOff: clampString(config.endingSignOff, GIFT_LIMITS.endingSignOff),
    photos,
  };
}

function hydrateConfigFromDoc(data: Record<string, unknown>): ExperienceConfig {
  const rawPhotos = Array.isArray(data.photos) ? data.photos : [];
  const photos = DEFAULT_EXPERIENCE.photos.map((base, idx) => {
    const item = rawPhotos[idx] as Partial<StoredPhotoDoc> | undefined;
    if (!item || typeof item !== 'object') return base;
    return {
      ...base,
      src: typeof item.src === 'string' && item.src.length > 0 ? item.src : base.src,
      caption: typeof item.caption === 'string' ? item.caption : base.caption,
      dateNote: typeof item.dateNote === 'string' ? item.dateNote : base.dateNote,
      memoryNote: typeof item.memoryNote === 'string' ? item.memoryNote : base.memoryNote,
    };
  });

  const endingLines =
    typeof data.endingText === 'string'
      ? data.endingText.split('\n')
      : DEFAULT_EXPERIENCE.endingLines;

  return {
    friendLabel:
      typeof data.friendLabel === 'string' ? data.friendLabel : DEFAULT_EXPERIENCE.friendLabel,
    envelopeLabel:
      typeof data.envelopeLabel === 'string'
        ? data.envelopeLabel
        : DEFAULT_EXPERIENCE.envelopeLabel,
    openingLetter:
      typeof data.openingLetter === 'string'
        ? data.openingLetter
        : DEFAULT_EXPERIENCE.openingLetter,
    scrapbookIntroKicker:
      typeof data.scrapbookIntroKicker === 'string'
        ? data.scrapbookIntroKicker
        : DEFAULT_EXPERIENCE.scrapbookIntroKicker,
    scrapbookIntroHeading:
      typeof data.scrapbookIntroHeading === 'string'
        ? data.scrapbookIntroHeading
        : DEFAULT_EXPERIENCE.scrapbookIntroHeading,
    mainReflection:
      typeof data.mainReflection === 'string'
        ? data.mainReflection
        : DEFAULT_EXPERIENCE.mainReflection,
    secondNote:
      typeof data.secondNote === 'string' ? data.secondNote : DEFAULT_EXPERIENCE.secondNote,
    collageHeading:
      typeof data.collageHeading === 'string'
        ? data.collageHeading
        : DEFAULT_EXPERIENCE.collageHeading,
    hiddenFlowerNote:
      typeof data.hiddenFlowerNote === 'string'
        ? data.hiddenFlowerNote
        : DEFAULT_EXPERIENCE.hiddenFlowerNote,
    hiddenEnvelopeNote:
      typeof data.hiddenEnvelopeNote === 'string'
        ? data.hiddenEnvelopeNote
        : DEFAULT_EXPERIENCE.hiddenEnvelopeNote,
    endingLines,
    endingSignOff:
      typeof data.endingSignOff === 'string'
        ? data.endingSignOff
        : DEFAULT_EXPERIENCE.endingSignOff,
    photos,
  };
}

/**
 * Creates or updates `/gifts/{giftId}` in Firestore for the verified owner.
 * Always keeps the same unique giftId so subsequent changes reflect on the exact same link.
 */
export async function saveGiftToFirestore(
  currentGiftId: string,
  config: ExperienceConfig,
  ownerUid: string
): Promise<string> {
  let targetId = ID_PATTERN.test(currentGiftId) ? currentGiftId : generateUniqueGiftId();
  const path = `gifts/${targetId}`;
  const fields = await serializeConfigToFields(config);

  let existingSnap;
  try {
    existingSnap = await getDoc(doc(db, 'gifts', targetId));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  // If an existing gift belongs to another account (e.g. switched Google accounts on same browser),
  // mint a fresh unique ID for this user instead of colliding.
  if (existingSnap.exists() && existingSnap.data()?.ownerId !== ownerUid) {
    targetId = generateUniqueGiftId();
    setActiveGiftId(targetId);
    const freshPath = `gifts/${targetId}`;
    try {
      await setDoc(doc(db, 'gifts', targetId), {
        ownerId: ownerUid,
        ...fields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, freshPath);
    }
    markGiftPublished(targetId);
    return targetId;
  }

  if (existingSnap.exists()) {
    try {
      await updateDoc(doc(db, 'gifts', targetId), {
        ...fields,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    try {
      await setDoc(doc(db, 'gifts', targetId), {
        ownerId: ownerUid,
        ...fields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  markGiftPublished(targetId);
  return targetId;
}

/**
 * Subscribes live to a shared read-only gift document by its unique giftId.
 * Any updates made by the creator immediately reflect on this exact same link.
 */
export function subscribeToSharedGift(
  giftId: string,
  onData: (config: ExperienceConfig | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `gifts/${giftId}`;
  return onSnapshot(
    doc(db, 'gifts', giftId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(hydrateConfigFromDoc(snapshot.data() as Record<string, unknown>));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        onError?.(wrapped);
      }
    }
  );
}
