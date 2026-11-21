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

export const DEFAULT_EXPERIENCE: ExperienceConfig = {
  friendLabel: 'Hey, you.',
  envelopeLabel: 'For you ♡',
  openingLetter:
    "Some things don't need a special occasion.\n\nSometimes, you just want to make something for someone and let them know they're appreciated.",
  scrapbookIntroKicker: 'a few little frames',
  scrapbookIntroHeading: 'Tap any photograph to hold it a little closer.',
  mainReflection:
    "It's funny how certain people slowly become a part of your everyday life.\n\nYou don't necessarily notice it happening. You just get used to talking to them, sharing things, laughing at random nonsense, and having them around.\n\nAnd eventually, you realize that their presence has become something you genuinely appreciate.",
  secondNote:
    "Half of our best memories are just ordinary afternoons that turned into three-hour conversations about nothing at all. Somehow those are always the ones that stick.",
  collageHeading: 'Some moments are better kept than explained.',
  hiddenFlowerNote: 'glad our paths crossed when they did.',
  hiddenEnvelopeNote:
    'P.S. Thank you for always listening to my completely unnecessary 20-minute stories like they actually matter.',
  endingLines: [
    'Anyway...',
    "I'm genuinely glad you're my friend.",
    'I just wanted to make something a little different for you.',
    'I hope it made you smile.',
  ],
  endingSignOff: 'A little friendship. A little happiness. ♡',
  photos: [
    {
      id: 'coffee-afternoon',
      src: '/src/assets/images/memory_coffee_afternoon_1795270308300.jpg',
      alt: 'Two friends laughing over iced coffee and a shared pastry at a sunlit wooden cafe table',
      caption: 'iced coffee & zero sense of time',
      dateNote: 'one slow afternoon',
      memoryNote: 'We only planned to stop by for twenty minutes. Two hours later we were still laughing at the exact same joke.',
      aspect: '4/3',
      tilt: -2.4,
      tape: 'peach',
    },
    {
      id: 'picnic-blanket',
      src: '/src/assets/images/memory_picnic_blanket_1795270307597.jpg',
      alt: 'Two friends sitting on a sunlit picnic blanket in the park with wildflowers and fruit',
      caption: 'sunlight, snacks, and nowhere else to be',
      dateNote: 'golden afternoon',
      memoryNote: 'One of those effortlessly good days where nothing fancy happened, yet everything felt right.',
      aspect: '1/1',
      tilt: 2.1,
      tape: 'sage',
    },
    {
      id: 'sunset-walk',
      src: '/src/assets/images/memory_sunset_walk_1795270307270.jpg',
      alt: 'Quiet leafy tree-lined street glowing in warm pastel sunset light',
      caption: "I don't know why, but this one belongs here.",
      dateNote: 'walking home late',
      memoryNote: 'Some streets just feel different when you have good company and nowhere urgent to rush to.',
      aspect: '3/4',
      tilt: -1.4,
      tape: 'lavender',
    },
    {
      id: 'rainy-window',
      src: '/src/assets/images/memory_rainy_window_1795270308972.jpg',
      alt: 'Raindrops on a cozy window looking out toward warm blurred street lights at dusk',
      caption: '',
      memoryNote: 'Quiet rain outside, warm tea inside. No caption needed for this feeling.',
      aspect: '3/4',
      tilt: 1.8,
      tape: 'blue',
    },
    {
      id: 'evening-lights',
      src: '/src/assets/images/memory_evening_lights_1795270304882.jpg',
      alt: 'Warm string lights glowing over a quiet evening outdoor courtyard table at twilight',
      caption: 'Some moments are better kept than explained.',
      dateNote: 'under the string lights',
      memoryNote: 'The kind of evening conversation you wish could stretch on just a little longer.',
      aspect: '4/3',
      tilt: -2.0,
      tape: 'rose',
    },
    {
      id: 'golden-shore',
      src: '/src/assets/images/memory_golden_shore_1795270327720.jpg',
      alt: 'Two sets of footprints walking side by side along a pastel sunset shoreline',
      caption: 'still my favorite view',
      dateNote: 'by the water',
      memoryNote: 'Soft pastel sky, cool sand, and quiet laughter over the sound of the waves.',
      aspect: '4/3',
      tilt: 1.5,
      tape: 'blue',
    },
  ],
};

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
    // Storage quota exceeded (e.g. very large local image) — keep in runtime state silently
  }
}

export function resetSavedExperience(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
