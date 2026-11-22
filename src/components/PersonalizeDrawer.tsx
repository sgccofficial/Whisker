import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload } from 'lucide-react';
import { ExperienceConfig } from '../data/experienceContent';
import { compressImageDataUrl } from '../utils/imageCompress';

interface PersonalizeDrawerProps {
  open: boolean;
  config: ExperienceConfig;
  savingDefaults?: boolean;
  onChange: (next: ExperienceConfig) => void;
  onClose: () => void;
}

export const PersonalizeDrawer: React.FC<PersonalizeDrawerProps> = ({
  open,
  config,
  savingDefaults = false,
  onChange,
  onClose,
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updatePhoto = (
    id: string,
    patch: Partial<ExperienceConfig['photos'][number]>
  ) => {
    onChange({
      ...config,
      photos: config.photos.map((photo) =>
        photo.id === id ? { ...photo, ...patch } : photo
      ),
    });
  };

  const handleFileUpload = (id: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImageDataUrl(reader.result, 1200, 0.84);
        updatePhoto(id, { src: compressed });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Personalize photos and notes"
          className="fixed inset-0 z-50 flex justify-end bg-[#241F1B]/45 backdrop-blur-xs"
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#FBF8F1] border-l border-[#3A322C]/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A322C]/10">
              <div>
                <h2
                  className="text-xl font-medium text-[#2E2925]"
                  style={{ fontFamily: 'var(--font-serif-story)' }}
                >
                  Personalize this gift
                </h2>
                <p className="text-xs text-[#7B7167] mt-0.5">
                  {savingDefaults
                    ? 'Saving directly into site defaults...'
                    : 'Saved directly as the site’s default photos & text.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close customization drawer"
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#5C534B] hover:bg-[#EFE9DD] transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* Opening & Envelope */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#2E2925]">
                  Opening &amp; letter
                </h3>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Welcome greeting</span>
                  <input
                    type="text"
                    value={config.friendLabel}
                    onChange={(e) =>
                      onChange({ ...config, friendLabel: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Envelope label</span>
                  <input
                    type="text"
                    value={config.envelopeLabel}
                    onChange={(e) =>
                      onChange({ ...config, envelopeLabel: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">First card message</span>
                  <textarea
                    rows={3}
                    value={config.openingLetter}
                    onChange={(e) =>
                      onChange({ ...config, openingLetter: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925] leading-relaxed"
                  />
                </label>
              </div>

              {/* Scrapbook texts & notes */}
              <div className="space-y-4 pt-4 border-t border-[#3A322C]/10">
                <h3 className="text-sm font-medium text-[#2E2925]">
                  Scrapbook notes &amp; hidden messages
                </h3>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Scrapbook small label</span>
                  <input
                    type="text"
                    value={config.scrapbookIntroKicker}
                    onChange={(e) =>
                      onChange({ ...config, scrapbookIntroKicker: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Scrapbook intro heading</span>
                  <input
                    type="text"
                    value={config.scrapbookIntroHeading}
                    onChange={(e) =>
                      onChange({ ...config, scrapbookIntroHeading: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Side note beside first photos</span>
                  <textarea
                    rows={3}
                    value={config.secondNote}
                    onChange={(e) =>
                      onChange({ ...config, secondNote: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925] leading-relaxed"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Main reflection card</span>
                  <textarea
                    rows={4}
                    value={config.mainReflection}
                    onChange={(e) =>
                      onChange({ ...config, mainReflection: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925] leading-relaxed"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Hidden flower note</span>
                  <input
                    type="text"
                    value={config.hiddenFlowerNote}
                    onChange={(e) =>
                      onChange({ ...config, hiddenFlowerNote: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Photo collage heading</span>
                  <input
                    type="text"
                    value={config.collageHeading}
                    onChange={(e) =>
                      onChange({ ...config, collageHeading: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Hidden secret envelope P.S.</span>
                  <textarea
                    rows={2}
                    value={config.hiddenEnvelopeNote}
                    onChange={(e) =>
                      onChange({ ...config, hiddenEnvelopeNote: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>
              </div>

              {/* Photographs */}
              <div className="space-y-4 pt-4 border-t border-[#3A322C]/10">
                <h3 className="text-sm font-medium text-[#2E2925]">
                  Scrapbook photographs
                </h3>

                <div className="space-y-4">
                  {config.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="rounded-xl bg-[#FFFDF8] border border-[#3A322C]/10 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-md object-cover bg-[#EFE9DD] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#7B7167]">
                            Photo {index + 1}
                          </p>
                          <input
                            ref={(el) => {
                              fileInputRefs.current[photo.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(photo.id, e.target.files?.[0])
                            }
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[photo.id]?.click()}
                            className="mt-1 inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-lg bg-[#F4EFE4] text-xs font-medium text-[#2E2925] hover:bg-[#EAE2D3] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Replace photo</span>
                          </button>
                        </div>
                      </div>

                      <label className="block">
                        <span className="text-[11px] text-[#7B7167]">Polaroid caption</span>
                        <input
                          type="text"
                          placeholder="Leave empty for no caption"
                          value={photo.caption ?? ''}
                          onChange={(e) =>
                            updatePhoto(photo.id, { caption: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg bg-[#FBF8F1] border border-[#3A322C]/12 px-3 py-2 text-xs text-[#2E2925]"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] text-[#7B7167]">
                          Small subtitle / date note (e.g. golden afternoon)
                        </span>
                        <input
                          type="text"
                          placeholder="Optional subtitle underneath caption"
                          value={photo.dateNote ?? ''}
                          onChange={(e) =>
                            updatePhoto(photo.id, { dateNote: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg bg-[#FBF8F1] border border-[#3A322C]/12 px-3 py-2 text-xs text-[#2E2925]"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] text-[#7B7167]">
                          Memory note (shown when photo is opened)
                        </span>
                        <textarea
                          rows={2}
                          placeholder="Optional memory note in full view"
                          value={photo.memoryNote ?? ''}
                          onChange={(e) =>
                            updatePhoto(photo.id, { memoryNote: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-lg bg-[#FBF8F1] border border-[#3A322C]/12 px-3 py-2 text-xs text-[#2E2925] leading-relaxed"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ending card texts */}
              <div className="space-y-4 pt-4 border-t border-[#3A322C]/10">
                <h3 className="text-sm font-medium text-[#2E2925]">
                  Closing card
                </h3>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">
                    Closing lines (one line per sentence)
                  </span>
                  <textarea
                    rows={4}
                    value={config.endingLines.join('\n')}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        endingLines: e.target.value.split('\n'),
                      })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925] leading-relaxed"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[#6B6158]">Handwritten sign-off</span>
                  <input
                    type="text"
                    value={config.endingSignOff}
                    onChange={(e) =>
                      onChange({ ...config, endingSignOff: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl bg-[#FFFDF8] border border-[#3A322C]/15 px-3.5 py-2.5 text-sm text-[#2E2925]"
                  />
                </label>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-[#3A322C]/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-6 py-2 rounded-full bg-[#2E2925] text-[#FFFDF8] text-sm font-medium hover:bg-[#413A34] transition-colors whitespace-nowrap shrink-0"
              >
                Done
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
