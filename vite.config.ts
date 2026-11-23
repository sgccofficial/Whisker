import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
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

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildStoreZip(files: Array<{ name: string; data: Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const data = file.data;
    const sum = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(sum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(sum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + data.length;
  }

  const centralSize = centralParts.reduce((acc, b) => acc + b.length, 0);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, endRecord]);
}

function bakeDefaultsDevPlugin(): Plugin {
  return {
    name: 'bake-defaults-to-project',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__download-photos.zip', (req, res, next) => {
        if (req.method !== 'GET') {
          next();
          return;
        }
        try {
          const imagesDir = path.resolve(__dirname, 'public/images');
          const entries: Array<{ name: string; data: Buffer }> = [];
          for (let i = 1; i <= 6; i++) {
            const filename = `${i}.jpg`;
            const fullPath = path.join(imagesDir, filename);
            if (fs.existsSync(fullPath)) {
              entries.push({ name: filename, data: fs.readFileSync(fullPath) });
            }
          }
          const zipBuf = buildStoreZip(entries);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', 'attachment; filename="whisker-photos.zip"');
          res.setHeader('Content-Length', String(zipBuf.length));
          res.end(zipBuf);
        } catch {
          res.statusCode = 500;
          res.end('Could not package photos');
        }
      });

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
            const imagesDir = path.resolve(__dirname, 'public/images');
            fs.mkdirSync(imagesDir, { recursive: true });

            const existing = JSON.parse(
              fs.readFileSync(defaultJsonPath, 'utf8')
            ) as ExperiencePayload;

            const bakedPhotos: PhotoItem[] = existing.photos.map((base, idx) => {
              const item = Array.isArray(incoming.photos) ? incoming.photos[idx] : undefined;
              const slotFilename = `${idx + 1}.jpg`;
              let resolvedSrc = base.src;

              if (item && typeof item.src === 'string' && item.src.length > 0) {
                const dataUrlMatch = item.src.match(
                  /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/
                );
                if (dataUrlMatch) {
                  const imgBuffer = Buffer.from(dataUrlMatch[2], 'base64');
                  fs.writeFileSync(path.join(imagesDir, slotFilename), imgBuffer);
                  resolvedSrc = `/images/${slotFilename}`;
                } else if (
                  item.src.startsWith('/images/') &&
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
