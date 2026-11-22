import defaultExperienceData from './defaultExperience.json';

export type TapeTone = 'rose' | 'sage' | 'lavender' | 'peach' | 'blue';

export interface ScrapbookPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  dateNote?: string;
  memoryNote?: string;
  aspect: '4/3' | '3/4' | '1/1';
  tilt: number;
  tape: TapeTone;
}

export interface ExperienceConfig {
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
  endingLines: string[];
  endingSignOff: string;
  photos: ScrapbookPhoto[];
}

export interface NoReaction {
  message: string;
  mood:
    | 'pleading'
    | 'shocked'
    | 'sitting-away'
    | 'peeking'
    | 'flopped'
    | 'holding-heart'
    | 'curious';
  characterOffset?: 'center' | 'peek-left' | 'peek-right' | 'low';
}

export const INITIAL_NO_REACTIONS: NoReaction[] = [
  {
    message: 'Please? 🥺',
    mood: 'pleading',
    characterOffset: 'center',
  },
  {
    message: "Wait. You're actually saying no?",
    mood: 'shocked',
    characterOffset: 'center',
  },
  {
    message: "I'm going to pretend I didn't see that.",
    mood: 'sitting-away',
    characterOffset: 'low',
  },
  {
    message: "One tiny yes. That's all I'm asking.",
    mood: 'peeking',
    characterOffset: 'peek-left',
  },
  {
    message: 'Okay, this is becoming unnecessarily difficult for me.',
    mood: 'flopped',
    characterOffset: 'low',
  },
];

export const FURTHER_NO_REACTIONS: NoReaction[] = [
  { message: 'Pleeeeease?', mood: 'pleading', characterOffset: 'center' },
  { message: 'I even prepared something for you.', mood: 'holding-heart', characterOffset: 'center' },
  { message: "You didn't have to think THAT long.", mood: 'shocked', characterOffset: 'center' },
  { message: "I'll ask again. Very politely this time.", mood: 'curious', characterOffset: 'center' },
  { message: '🥺', mood: 'pleading', characterOffset: 'peek-right' },
  { message: 'At least reconsider?', mood: 'peeking', characterOffset: 'peek-left' },
  { message: 'My little heart is waiting here.', mood: 'holding-heart', characterOffset: 'center' },
  { message: "Fine... I'll wait. But not really.", mood: 'sitting-away', characterOffset: 'low' },
];

export const DEFAULT_EXPERIENCE: ExperienceConfig = defaultExperienceData as ExperienceConfig;

const STORAGE_KEY = 'friendship_experience_custom_v1';

export function loadSavedExperience(): ExperienceConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EXPERIENCE;
    const parsed = JSON.parse(raw) as Partial<ExperienceConfig>;
    return {
      ...DEFAULT_EXPERIENCE,
      ...parsed,
      photos:
        Array.isArray(parsed.photos) && parsed.photos.length === DEFAULT_EXPERIENCE.photos.length
          ? parsed.photos.map((p, idx) => ({
              ...DEFAULT_EXPERIENCE.photos[idx],
              ...p,
            }))
          : DEFAULT_EXPERIENCE.photos,
    };
  } catch {
    return DEFAULT_EXPERIENCE;
  }
}

export function saveExperience(config: ExperienceConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage quota exceeded — keep in runtime state silently
  }
}

export function hasSavedLocalExperience(): boolean {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function clearSavedLocalExperience(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * In AI Studio preview (Vite dev server), writes the customized photos and text
 * directly into `src/assets/images/` and `src/data/defaultExperience.json` so they
 * become the permanent original defaults when deployed to Cloudflare Pages.
 */
export async function bakeDefaultsToProject(
  config: ExperienceConfig
): Promise<ExperienceConfig | null> {
  if (!import.meta.env.DEV) return null;
  try {
    const res = await fetch('/__bake-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; config?: ExperienceConfig };
    return data.ok && data.config ? data.config : null;
  } catch {
    return null;
  }
}
