import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  dateNote?: string;
  memoryNote?: string;
  aspect: '4/3' | '3/4' | '1/1';
  tilt: number;
  tape: 'rose' | 'sage' | 'lavender' | 'peach' | 'blue';
}

interface ExperiencePayload {
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
  photos: PhotoItem[];
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function bakeDefaultsDevPlugin(): Plugin {
  return {
    name: 'bake-defaults-to-project',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__bake-defaults', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        const MAX_BYTES = 35 * 1024 * 1024;
        let aborted = false;

        req.on('data', (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > MAX_BYTES) {
            aborted = true;
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Payload too large' }));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (aborted) return;
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const incoming = JSON.parse(rawBody) as Partial<ExperiencePayload>;

            const defaultJsonPath = path.resolve(__dirname, 'src/data/defaultExperience.json');
            const imagesDir = path.resolve(__dirname, 'src/assets/images');
            fs.mkdirSync(imagesDir, { recursive: true });

            const existing = JSON.parse(
              fs.readFileSync(defaultJsonPath, 'utf8')
            ) as ExperiencePayload;

            const existingImages = fs.readdirSync(imagesDir);

            const bakedPhotos: PhotoItem[] = existing.photos.map((base, idx) => {
              const item = Array.isArray(incoming.photos) ? incoming.photos[idx] : undefined;
              const safeId = /^[a-zA-Z0-9_-]+$/.test(base.id) ? base.id : `photo-${idx + 1}`;
              let resolvedSrc = base.src;

              if (item && typeof item.src === 'string' && item.src.length > 0) {
                const dataUrlMatch = item.src.match(
                  /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/
                );
                if (dataUrlMatch) {
                  const ext = MIME_TO_EXT[dataUrlMatch[1].toLowerCase()] ?? 'jpg';
                  const imgBuffer = Buffer.from(dataUrlMatch[2], 'base64');
                  const hash = crypto
                    .createHash('sha256')
                    .update(imgBuffer)
                    .digest('hex')
                    .slice(0, 8);
                  const filename = `custom_${safeId}_${hash}.${ext}`;
                  const targetFile = path.join(imagesDir, filename);

                  // Clean up superseded custom image files for this slot
                  const prefix = `custom_${safeId}_`;
                  for (const oldFile of existingImages) {
                    if (oldFile.startsWith(prefix) && oldFile !== filename) {
                      try {
                        fs.unlinkSync(path.join(imagesDir, oldFile));
                      } catch {
                        // Ignore cleanup error
                      }
                    }
                  }

                  if (!fs.existsSync(targetFile)) {
                    fs.writeFileSync(targetFile, imgBuffer);
                  }
                  resolvedSrc = `/src/assets/images/${filename}`;
                } else if (
                  item.src.startsWith('/src/assets/images/') &&
                  !item.src.includes('..') &&
                  fs.existsSync(path.join(imagesDir, path.basename(item.src)))
                ) {
                  resolvedSrc = item.src;
                }
              }

              const nextPhoto: PhotoItem = {
                ...base,
                src: resolvedSrc,
                caption: typeof item?.caption === 'string' ? item.caption : (base.caption ?? ''),
                memoryNote:
                  typeof item?.memoryNote === 'string' ? item.memoryNote : (base.memoryNote ?? ''),
              };

              if (typeof item?.dateNote === 'string') {
                nextPhoto.dateNote = item.dateNote;
              } else if (base.dateNote !== undefined) {
                nextPhoto.dateNote = base.dateNote;
              }

              return nextPhoto;
            });

            const bakedConfig: ExperiencePayload = {
              friendLabel:
                typeof incoming.friendLabel === 'string'
                  ? incoming.friendLabel
                  : existing.friendLabel,
              envelopeLabel:
                typeof incoming.envelopeLabel === 'string'
                  ? incoming.envelopeLabel
                  : existing.envelopeLabel,
              openingLetter:
                typeof incoming.openingLetter === 'string'
                  ? incoming.openingLetter
                  : existing.openingLetter,
              scrapbookIntroKicker:
                typeof incoming.scrapbookIntroKicker === 'string'
                  ? incoming.scrapbookIntroKicker
                  : existing.scrapbookIntroKicker,
              scrapbookIntroHeading:
                typeof incoming.scrapbookIntroHeading === 'string'
                  ? incoming.scrapbookIntroHeading
                  : existing.scrapbookIntroHeading,
              mainReflection:
                typeof incoming.mainReflection === 'string'
                  ? incoming.mainReflection
                  : existing.mainReflection,
              secondNote:
                typeof incoming.secondNote === 'string'
                  ? incoming.secondNote
                  : existing.secondNote,
              collageHeading:
                typeof incoming.collageHeading === 'string'
                  ? incoming.collageHeading
                  : existing.collageHeading,
              hiddenFlowerNote:
                typeof incoming.hiddenFlowerNote === 'string'
                  ? incoming.hiddenFlowerNote
                  : existing.hiddenFlowerNote,
              hiddenEnvelopeNote:
                typeof incoming.hiddenEnvelopeNote === 'string'
                  ? incoming.hiddenEnvelopeNote
                  : existing.hiddenEnvelopeNote,
              endingLines:
                Array.isArray(incoming.endingLines) &&
                incoming.endingLines.every((l) => typeof l === 'string')
                  ? incoming.endingLines
                  : existing.endingLines,
              endingSignOff:
                typeof incoming.endingSignOff === 'string'
                  ? incoming.endingSignOff
                  : existing.endingSignOff,
              photos: bakedPhotos,
            };

            const serialized = JSON.stringify(bakedConfig, null, 2) + '\n';
            const prevSerialized = fs.readFileSync(defaultJsonPath, 'utf8');
            if (serialized !== prevSerialized) {
              fs.writeFileSync(defaultJsonPath, serialized, 'utf8');
              const mods = server.moduleGraph.getModulesByFile(defaultJsonPath);
              if (mods) {
                for (const mod of mods) {
                  server.moduleGraph.invalidateModule(mod);
                }
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, config: bakedConfig }));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error: err instanceof Error ? err.message : 'Failed to save defaults',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      bakeDefaultsDevPlugin(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." still resolve in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
