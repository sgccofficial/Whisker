import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Link2, Globe } from 'lucide-react';
import { ExperienceConfig } from '../data/experienceContent';
import { buildShareableLink, isAiStudioPreviewHost } from '../utils/shareLink';

interface ShareLinkModalProps {
  open: boolean;
  config: ExperienceConfig;
  onClose: () => void;
}

const CUSTOM_DOMAIN_KEY = 'friendship_experience_public_url_v1';

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  open,
  config,
  onClose,
}) => {
  const isPreview = isAiStudioPreviewHost();
  const [publicBaseUrl, setPublicBaseUrl] = useState<string>(() => {
    try {
      return window.localStorage.getItem(CUSTOM_DOMAIN_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [hasUploadedPhotos, setHasUploadedPhotos] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePublicUrlChange = (value: string) => {
    setPublicBaseUrl(value);
    try {
      if (value.trim()) {
        window.localStorage.setItem(CUSTOM_DOMAIN_KEY, value.trim());
      } else {
        window.localStorage.removeItem(CUSTOM_DOMAIN_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGenerating(true);
    setCopied(false);

    buildShareableLink(config, isPreview ? publicBaseUrl : undefined).then((result) => {
      if (cancelled) return;
      setGeneratedUrl(result.url);
      setHasUploadedPhotos(result.hasCustomUploadedPhotos);
      setGenerating(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, config, isPreview, publicBaseUrl]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const el = document.createElement('textarea');
      el.value = generatedUrl;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Generate shareable link"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#241F1B]/50 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#FFFDF8] border border-[#3A322C]/12 shadow-2xl p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F4EFE4] flex items-center justify-center text-[#A86A6A] shrink-0">
                  <Link2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    className="text-xl font-medium text-[#2E2925]"
                    style={{ fontFamily: 'var(--font-serif-story)' }}
                  >
                    Your shareable link
                  </h2>
                  <p className="text-xs text-[#7B7167]">
                    Opens as a view-only gift — no edit options shown.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close share link dialog"
                className="min-w-[40px] min-h-[40px] -mt-1 -mr-1 rounded-full flex items-center justify-center text-[#6B6158] hover:bg-[#EFE9DD] transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {isPreview && (
              <div className="mt-4 rounded-xl bg-[#F7F1E6] border border-[#3A322C]/10 p-3.5 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-[#544A42] leading-relaxed">
                  <Globe className="w-4 h-4 text-[#A86A6A] shrink-0 mt-0.5" aria-hidden="true" />
                  <p>
                    You&apos;re viewing inside AI Studio&apos;s private preview, which redirects other browsers to sign in. Deploy this app (via Cloud Run, Vercel, or Netlify) and either generate the link there or paste your deployed web address below:
                  </p>
                </div>
                <input
                  type="url"
                  placeholder="https://your-deployed-site.com"
                  value={publicBaseUrl}
                  onChange={(e) => handlePublicUrlChange(e.target.value)}
                  className="w-full rounded-lg bg-[#FFFDF8] border border-[#3A322C]/15 px-3 py-2 text-xs text-[#2E2925]"
                />
              </div>
            )}

            <div className="mt-5">
              <label className="block text-xs text-[#6B6158] mb-1.5">
                Link ready to send
              </label>
              <input
                type="text"
                readOnly
                value={generating ? 'Preparing your link...' : generatedUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl bg-[#FBF8F1] border border-[#3A322C]/15 px-3.5 py-2.5 text-xs text-[#3A322C] font-mono truncate"
              />
            </div>

            {hasUploadedPhotos && (
              <p className="mt-3 text-xs text-[#7B7167] leading-relaxed">
                Your uploaded photos are bundled inside this link so it works directly when opened in a browser.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-full text-sm text-[#6B6158] hover:text-[#2E2925] hover:bg-[#EFE9DD] transition-colors whitespace-nowrap shrink-0"
              >
                Close
              </button>

              <button
                type="button"
                disabled={generating || !generatedUrl}
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-full bg-[#2E2925] text-[#FFFDF8] text-sm font-medium hover:bg-[#413A34] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
