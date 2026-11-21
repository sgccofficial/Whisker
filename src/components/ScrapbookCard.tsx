import React from 'react';
import { motion } from 'motion/react';
import { ExperienceConfig, ScrapbookPhoto } from '../data/experienceContent';
import { PolaroidCard } from './PolaroidCard';
import { BrambleCharacter, PipCharacter } from './Characters';
import {
  HiddenFlowerNote,
  HiddenMiniEnvelope,
  InteractiveTeacupDoodle,
} from './InteractiveObjects';

interface ScrapbookCardProps {
  config: ExperienceConfig;
  onSelectPhoto: (photo: ScrapbookPhoto) => void;
}

export const ScrapbookCard: React.FC<ScrapbookCardProps> = ({
  config,
  onSelectPhoto,
}) => {
  const [
    coffeePhoto,
    picnicPhoto,
    sunsetPhoto,
    rainyPhoto,
    eveningPhoto,
    shorePhoto,
  ] = config.photos;

  const reflectionParagraphs = config.mainReflection
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div id="scrapbook-start" className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-16 space-y-24 sm:space-y-32">
      {/* Spread 1: Scattered Polaroid Memories */}
      <section aria-label="First memories" className="relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="max-w-md mb-10 sm:mb-12"
        >
          {config.scrapbookIntroKicker && (
            <p
              className="text-xl text-[#A86A6A] mb-1.5"
              style={{ fontFamily: 'var(--font-handwritten)' }}
            >
              {config.scrapbookIntroKicker}
            </p>
          )}
          {config.scrapbookIntroHeading && (
            <h2
              className="text-2xl sm:text-3xl font-medium text-[#2E2925] leading-snug"
              style={{ fontFamily: 'var(--font-serif-story)' }}
            >
              {config.scrapbookIntroHeading}
            </h2>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          {/* Tilted Polaroid 1 */}
          {coffeePhoto && (
            <div className="md:col-span-6 lg:col-span-5 md:mt-2">
              <PolaroidCard
                photo={coffeePhoto}
                onSelect={onSelectPhoto}
                tapePosition="center"
                className="w-full max-w-md mx-auto"
              />
            </div>
          )}

          {/* Small conversational margin note + Polaroid 2 offset */}
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7 flex flex-col items-center md:items-start gap-8 md:mt-14">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-base sm:text-lg text-[#5C534B] leading-relaxed max-w-sm md:pl-2"
            >
              {config.secondNote}
            </motion.p>

            {picnicPhoto && (
              <PolaroidCard
                photo={picnicPhoto}
                onSelect={onSelectPhoto}
                tapePosition="corners"
                className="w-full max-w-sm mx-auto md:mx-0"
              />
            )}
          </div>
        </div>
      </section>

      {/* Spread 2: Heartfelt Natural Note + Bramble carrying an oversized daisy + Tappable Flower */}
      <section aria-label="A quiet note" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 paper-card rounded-2xl px-7 py-9 sm:px-11 sm:py-11 relative"
          >
            <span
              className="washi-tape absolute -top-3 left-10 w-20 h-5 rounded-[2px] rotate-2"
              style={{ backgroundColor: 'rgba(168, 188, 165, 0.5)' }}
              aria-hidden="true"
            />
            <div className="space-y-4">
              {reflectionParagraphs.map((para, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? 'text-xl sm:text-2xl text-[#2E2925] leading-snug'
                      : 'text-base sm:text-lg text-[#564D45] leading-relaxed'
                  }
                  style={
                    index === 0
                      ? { fontFamily: 'var(--font-serif-story)' }
                      : undefined
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Quiet playful margin: Bramble carrying a giant daisy + tappable flower */}
          <div className="lg:col-span-5 flex flex-row lg:flex-col items-center justify-around lg:justify-center gap-8 py-2">
            <div className="flex flex-col items-center">
              <BrambleCharacter />
              <span
                className="mt-1 text-base text-[#8C8278]"
                style={{ fontFamily: 'var(--font-handwritten)' }}
              >
                (very important delivery)
              </span>
            </div>

            <HiddenFlowerNote message={config.hiddenFlowerNote} />
          </div>
        </div>
      </section>

      {/* Spread 3: Dedicated Memory Pages — One with a handwritten note, one intentionally silent */}
      <section aria-label="Dedicated memory pages" className="relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10 items-center">
          {/* Featured vertical photo with handwritten reflection */}
          {sunsetPhoto && (
            <div className="md:col-span-6 flex flex-col items-center">
              <PolaroidCard
                photo={sunsetPhoto}
                onSelect={onSelectPhoto}
                tapePosition="center"
                size="featured"
                className="w-full max-w-sm"
              />
            </div>
          )}

          {/* Quiet photo with no caption + cozy teacup doodle */}
          {rainyPhoto && (
            <div className="md:col-span-6 flex flex-col items-center md:mt-16">
              <div className="mb-4 self-end mr-6 sm:mr-14">
                <InteractiveTeacupDoodle />
              </div>
              <PolaroidCard
                photo={rainyPhoto}
                onSelect={onSelectPhoto}
                tapePosition="corners"
                className="w-full max-w-[300px]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Spread 4: Overlapping Scrapbook Photo Constellation + Sleeping Pip + Hidden Envelope */}
      <section aria-label="Photo collage and hidden notes" className="relative pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto mb-12"
        >
          {config.collageHeading && (
            <p
              className="text-2xl sm:text-3xl text-[#2E2925] leading-snug"
              style={{ fontFamily: 'var(--font-serif-story)' }}
            >
              {config.collageHeading}
            </p>
          )}
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 items-center">
          {/* Photo 5 with Sleeping Pip perched quietly on top */}
          {eveningPhoto && (
            <div className="relative md:col-span-7 md:z-10">
              {/* Sleeping Pip perched on top-left corner of the Polaroid */}
              <div className="flex justify-start pl-6 -mb-3 relative z-20">
                <PipCharacter mode="sleeping" size={62} />
              </div>
              <PolaroidCard
                photo={eveningPhoto}
                onSelect={onSelectPhoto}
                tapePosition="center"
                className="w-full max-w-lg mx-auto"
              />
            </div>
          )}

          {/* Photo 6 overlapping gently on desktop + Hidden Mini Envelope */}
          {shorePhoto && (
            <div className="md:col-span-6 md:-ml-12 md:mt-24 relative z-20 flex flex-col items-center gap-10">
              <PolaroidCard
                photo={shorePhoto}
                onSelect={onSelectPhoto}
                tapePosition="corners"
                className="w-full max-w-md mx-auto"
              />

              <HiddenMiniEnvelope note={config.hiddenEnvelopeNote} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
