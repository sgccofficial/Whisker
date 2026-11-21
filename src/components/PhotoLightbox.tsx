import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ScrapbookPhoto } from '../data/experienceContent';

interface PhotoLightboxProps {
  photo: ScrapbookPhoto | null;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photo, onClose }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo?.id, photo?.src]);

  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onClose]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption || 'Photograph view'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#241F1B]/72 backdrop-blur-sm p-4 sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14, rotate: photo.tilt * 0.6 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10, rotate: photo.tilt * 0.5 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FFFDF8] p-3.5 sm:p-5 rounded-lg shadow-2xl border border-[#3A322C]/12 max-h-[90dvh] overflow-y-auto"
          >
            {/* High-contrast close button with >= 44px hitbox */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close photograph"
              className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] rounded-full bg-[#2E2925]/85 text-[#FFFDF8] flex items-center justify-center hover:bg-[#2E2925] transition-colors shadow-sm"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Full photograph */}
            <div className="relative w-full overflow-hidden rounded-[4px] bg-[#EFE9DD]">
              {!imgError ? (
                <img
                  src={photo.src}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full max-h-[65dvh] object-contain mx-auto bg-[#F4EFE4]"
                />
              ) : (
                <div className="w-full h-72 flex flex-col items-center justify-center text-[#7A6F65]">
                  <ImageIcon className="w-9 h-9 mb-2 opacity-60" />
                  <span className="text-sm">Photograph preview unavailable</span>
                </div>
              )}
            </div>

            {/* Handwritten caption & memory note */}
            {(photo.caption || photo.memoryNote) && (
              <div className="mt-4 px-1.5 pb-1">
                {photo.caption && (
                  <p
                    className="text-2xl sm:text-3xl text-[#2E2925] leading-snug"
                    style={{ fontFamily: 'var(--font-handwritten)' }}
                  >
                    {photo.caption}
                  </p>
                )}
                {photo.memoryNote && (
                  <p className="mt-2 text-sm sm:text-base text-[#5C534B] leading-relaxed">
                    {photo.memoryNote}
                  </p>
                )}
                {photo.dateNote && (
                  <p className="mt-2 text-xs text-[#8C8278]">
                    {photo.dateNote}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
