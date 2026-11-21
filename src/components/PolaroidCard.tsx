import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon } from 'lucide-react';
import { ScrapbookPhoto, TapeTone } from '../data/experienceContent';

const TAPE_COLORS: Record<TapeTone, string> = {
  rose: 'rgba(217, 155, 155, 0.5)',
  sage: 'rgba(168, 188, 165, 0.52)',
  lavender: 'rgba(201, 191, 220, 0.52)',
  peach: 'rgba(234, 197, 175, 0.56)',
  blue: 'rgba(184, 204, 224, 0.52)',
};

interface PolaroidCardProps {
  photo: ScrapbookPhoto;
  onSelect: (photo: ScrapbookPhoto) => void;
  className?: string;
  tapePosition?: 'center' | 'corners' | 'none';
  size?: 'default' | 'featured';
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  photo,
  onSelect,
  className = '',
  tapePosition = 'center',
  size = 'default',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo.src]);

  const aspectClass =
    photo.aspect === '3/4'
      ? 'aspect-[3/4]'
      : photo.aspect === '1/1'
        ? 'aspect-square'
        : 'aspect-[4/3]';

  const hasCaption = Boolean(photo.caption && photo.caption.trim().length > 0);
  const hasDateNote = Boolean(photo.dateNote && photo.dateNote.trim().length > 0);
  const hasFooterText = hasCaption || hasDateNote;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(photo)}
      initial={{ opacity: 0, y: 20, rotate: photo.tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: photo.tilt }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        y: -7,
        rotate: 0,
        scale: 1.02,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-label={
        hasCaption
          ? `View photograph: ${photo.caption}`
          : `View photograph: ${photo.alt}`
      }
      className={`group relative block text-left bg-[#FFFDF8] p-3 sm:p-3.5 ${
        hasFooterText ? 'pb-5 sm:pb-6' : 'pb-4 sm:pb-5'
      } rounded-[4px] border border-[#3A322C]/10 polaroid-shadow focus-visible:outline-2 ${className}`}
    >
      {/* Washi tape accents */}
      {tapePosition === 'center' && (
        <span
          className="washi-tape pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-[2px] -rotate-2"
          style={{ backgroundColor: TAPE_COLORS[photo.tape] }}
          aria-hidden="true"
        />
      )}
      {tapePosition === 'corners' && (
        <>
          <span
            className="washi-tape pointer-events-none absolute -top-2.5 -left-3 w-12 h-4 rounded-[2px] -rotate-[32deg]"
            style={{ backgroundColor: TAPE_COLORS[photo.tape] }}
            aria-hidden="true"
          />
          <span
            className="washi-tape pointer-events-none absolute -bottom-2 -right-3 w-12 h-4 rounded-[2px] -rotate-[28deg]"
            style={{ backgroundColor: TAPE_COLORS[photo.tape] }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Photo frame */}
      <div className={`relative w-full ${aspectClass} overflow-hidden rounded-[2px] bg-[#EFE9DD]`}>
        {!imgError ? (
          <img
            src={photo.src}
            alt={photo.alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#F4EDE2] to-[#E8DDD0] text-[#7A6F65]">
            <ImageIcon className="w-7 h-7 mb-2 opacity-60" aria-hidden="true" />
            <span className="text-xs leading-snug">{photo.caption || 'Memory snapshot'}</span>
          </div>
        )}
      </div>

      {/* Optional handwritten caption & date note underneath */}
      {hasFooterText && (
        <div className="mt-3 px-1">
          {hasCaption && (
            <p
              className={`${
                size === 'featured' ? 'text-2xl sm:text-[1.65rem]' : 'text-xl sm:text-2xl'
              } text-[#3D352E] leading-tight`}
              style={{ fontFamily: 'var(--font-handwritten)' }}
            >
              {photo.caption}
            </p>
          )}
          {hasDateNote && (
            <p className={`${hasCaption ? 'mt-1' : ''} text-xs text-[#8C8278] tracking-normal`}>
              {photo.dateNote}
            </p>
          )}
        </div>
      )}
    </motion.button>
  );
};
