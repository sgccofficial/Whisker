import { DEFAULT_EXPERIENCE, ExperienceConfig } from '../data/experienceContent';

interface CompactPhotoDiff {
  s?: string;
  c?: string;
  d?: string;
  m?: string;
}

interface CompactGiftPayload {
  ro: 1;
  fl?: string;
  el?: string;
  ol?: string;
  sk?: string;
  sh?: string;
  mr?: string;
  sn?: string;
  ch?: string;
  hf?: string;
  he?: string;
  en?: string[];
  es?: string;
  p?: Record<string, CompactPhotoDiff>;
}

const HASH_PREFIX = '#gift=';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressString(input: string): Promise<string> {
  const rawBytes = new TextEncoder().encode(input);
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new CompressionStream('deflate-raw');
      const writer = stream.writable.getWriter();
      writer.write(rawBytes);
      writer.close();
      const buffer = await new Response(stream.readable).arrayBuffer();
      return `z.${bytesToBase64Url(new Uint8Array(buffer))}`;
    } catch {
      // Fallback to uncompressed base64url
    }
  }
  return `u.${bytesToBase64Url(rawBytes)}`;
}

async function decompressString(encoded: string): Promise<string | null> {
  try {
    if (encoded.startsWith('z.')) {
      const bytes = base64UrlToBytes(encoded.slice(2));
      if (typeof DecompressionStream === 'undefined') return null;
      const stream = new DecompressionStream('deflate-raw');
      const writer = stream.writable.getWriter();
      writer.write(bytes as unknown as BufferSource);
      writer.close();
      const buffer = await new Response(stream.readable).arrayBuffer();
      return new TextDecoder().decode(buffer);
    }
    if (encoded.startsWith('u.')) {
      const bytes = base64UrlToBytes(encoded.slice(2));
      return new TextDecoder().decode(bytes);
    }
    // Legacy raw base64url fallback
    const bytes = base64UrlToBytes(encoded);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Downscales a data URL image so uploaded photos fit comfortably in localStorage & shareable links.
 */
export function compressImageDataUrl(
  dataUrl: string,
  maxDimension: number,
  quality: number
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function isAiStudioPreviewHost(): boolean {
  const host = window.location.hostname;
  return /^ais-(dev|pre)-/.test(host) || host.endsWith('.aistudio.google.com');
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
 * Generates a read-only shareable link encoding all customized text & photos.
 */
export async function buildShareableLink(
  config: ExperienceConfig,
  customBaseUrl?: string
): Promise<{
  url: string;
  hasCustomUploadedPhotos: boolean;
}> {
  const payload: CompactGiftPayload = { ro: 1 };
  let hasCustomUploadedPhotos = false;

  if (config.friendLabel !== DEFAULT_EXPERIENCE.friendLabel) payload.fl = config.friendLabel;
  if (config.envelopeLabel !== DEFAULT_EXPERIENCE.envelopeLabel) payload.el = config.envelopeLabel;
  if (config.openingLetter !== DEFAULT_EXPERIENCE.openingLetter) payload.ol = config.openingLetter;
  if (config.scrapbookIntroKicker !== DEFAULT_EXPERIENCE.scrapbookIntroKicker)
    payload.sk = config.scrapbookIntroKicker;
  if (config.scrapbookIntroHeading !== DEFAULT_EXPERIENCE.scrapbookIntroHeading)
    payload.sh = config.scrapbookIntroHeading;
  if (config.mainReflection !== DEFAULT_EXPERIENCE.mainReflection) payload.mr = config.mainReflection;
  if (config.secondNote !== DEFAULT_EXPERIENCE.secondNote) payload.sn = config.secondNote;
  if (config.collageHeading !== DEFAULT_EXPERIENCE.collageHeading) payload.ch = config.collageHeading;
  if (config.hiddenFlowerNote !== DEFAULT_EXPERIENCE.hiddenFlowerNote)
    payload.hf = config.hiddenFlowerNote;
  if (config.hiddenEnvelopeNote !== DEFAULT_EXPERIENCE.hiddenEnvelopeNote)
    payload.he = config.hiddenEnvelopeNote;
  if (JSON.stringify(config.endingLines) !== JSON.stringify(DEFAULT_EXPERIENCE.endingLines)) {
    payload.en = config.endingLines;
  }
  if (config.endingSignOff !== DEFAULT_EXPERIENCE.endingSignOff) payload.es = config.endingSignOff;

  const photoDiffs: Record<string, CompactPhotoDiff> = {};

  for (let i = 0; i < config.photos.length; i++) {
    const current = config.photos[i];
    const base = DEFAULT_EXPERIENCE.photos[i];
    if (!base) continue;

    const diff: CompactPhotoDiff = {};
    if (current.src !== base.src) {
      if (current.src.startsWith('data:image/')) {
        hasCustomUploadedPhotos = true;
        diff.s = await compressImageDataUrl(current.src, 480, 0.65);
      } else {
        diff.s = current.src;
      }
    }
    if ((current.caption ?? '') !== (base.caption ?? '')) diff.c = current.caption ?? '';
    if ((current.dateNote ?? '') !== (base.dateNote ?? '')) diff.d = current.dateNote ?? '';
    if ((current.memoryNote ?? '') !== (base.memoryNote ?? '')) diff.m = current.memoryNote ?? '';

    if (Object.keys(diff).length > 0) {
      photoDiffs[String(i)] = diff;
    }
  }

  if (Object.keys(photoDiffs).length > 0) {
    payload.p = photoDiffs;
  }

  const encoded = await compressString(JSON.stringify(payload));
  const fallbackBase = `${window.location.origin}${window.location.pathname}`;
  const baseUrl = (customBaseUrl ? normalizeBaseUrl(customBaseUrl) : null) ?? fallbackBase;
  return {
    url: `${baseUrl}${HASH_PREFIX}${encoded}`,
    hasCustomUploadedPhotos,
  };
}

export function hasShareHashInUrl(): boolean {
  return window.location.hash.startsWith(HASH_PREFIX);
}

/**
 * Parses a read-only shared gift from window.location.hash if present.
 */
export async function parseSharedGiftFromUrl(): Promise<ExperienceConfig | null> {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;

  const encoded = hash.slice(HASH_PREFIX.length);
  if (!encoded) return null;

  const json = await decompressString(encoded);
  if (!json) return null;

  try {
    const payload = JSON.parse(json) as Partial<CompactGiftPayload>;
    const photos = DEFAULT_EXPERIENCE.photos.map((base, index) => {
      const diff = payload.p?.[String(index)];
      if (!diff) return base;
      return {
        ...base,
        src: typeof diff.s === 'string' ? diff.s : base.src,
        caption: typeof diff.c === 'string' ? diff.c : base.caption,
        dateNote: typeof diff.d === 'string' ? diff.d : base.dateNote,
        memoryNote: typeof diff.m === 'string' ? diff.m : base.memoryNote,
      };
    });

    return {
      friendLabel: typeof payload.fl === 'string' ? payload.fl : DEFAULT_EXPERIENCE.friendLabel,
      envelopeLabel: typeof payload.el === 'string' ? payload.el : DEFAULT_EXPERIENCE.envelopeLabel,
      openingLetter: typeof payload.ol === 'string' ? payload.ol : DEFAULT_EXPERIENCE.openingLetter,
      scrapbookIntroKicker:
        typeof payload.sk === 'string' ? payload.sk : DEFAULT_EXPERIENCE.scrapbookIntroKicker,
      scrapbookIntroHeading:
        typeof payload.sh === 'string' ? payload.sh : DEFAULT_EXPERIENCE.scrapbookIntroHeading,
      mainReflection:
        typeof payload.mr === 'string' ? payload.mr : DEFAULT_EXPERIENCE.mainReflection,
      secondNote: typeof payload.sn === 'string' ? payload.sn : DEFAULT_EXPERIENCE.secondNote,
      collageHeading:
        typeof payload.ch === 'string' ? payload.ch : DEFAULT_EXPERIENCE.collageHeading,
      hiddenFlowerNote:
        typeof payload.hf === 'string' ? payload.hf : DEFAULT_EXPERIENCE.hiddenFlowerNote,
      hiddenEnvelopeNote:
        typeof payload.he === 'string' ? payload.he : DEFAULT_EXPERIENCE.hiddenEnvelopeNote,
      endingLines:
        Array.isArray(payload.en) && payload.en.every((l) => typeof l === 'string')
          ? payload.en
          : DEFAULT_EXPERIENCE.endingLines,
      endingSignOff:
        typeof payload.es === 'string' ? payload.es : DEFAULT_EXPERIENCE.endingSignOff,
      photos,
    };
  } catch {
    return null;
  }
}
