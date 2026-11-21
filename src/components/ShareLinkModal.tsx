import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Link2, Globe, LogIn, Loader2 } from 'lucide-react';
import { User, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ExperienceConfig } from '../data/experienceContent';
import { isAiStudioPreviewHost } from '../utils/shareLink';
import {
  buildUniqueGiftUrl,
  saveGiftToFirestore,
} from '../services/giftService';

interface ShareLinkModalProps {
  open: boolean;
  config: ExperienceConfig;
  giftId: string;
  authUser: User | null;
  onGiftIdResolved: (resolvedId: string) => void;
  onSyncComplete: () => void;
  onClose: () => void;
}

const CUSTOM_DOMAIN_KEY = 'friendship_experience_public_url_v1';

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  open,
  config,
  giftId,
  authUser,
  onGiftIdResolved,
  onSyncComplete,
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
  const [resolvedGiftId, setResolvedGiftId] = useState(giftId);
  const [saving, setSaving] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setResolvedGiftId(giftId);
  }, [giftId]);

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

  // Whenever the modal opens and the creator is signed in, persist/update this exact unique gift link
  useEffect(() => {
    if (!open || !authUser) return;
    let cancelled = false;
    setSaving(true);
    setErrorMsg(null);
    setCopied(false);

    saveGiftToFirestore(giftId, config, authUser.uid)
      .then((finalId) => {
        if (cancelled) return;
        setResolvedGiftId(finalId);
        if (finalId !== giftId) {
          onGiftIdResolved(finalId);
        }
        onSyncComplete();
        setSaving(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setSaving(false);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Quota exceeded')) {
          setErrorMsg('Daily database quota was reached. Quota resets tomorrow.');
        } else {
          setErrorMsg('Could not save your link right now. Please try again.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, authUser, giftId, config, onGiftIdResolved, onSyncComplete]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg('Sign-in did not complete. Please allow popups and try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const generatedUrl = authUser
    ? buildUniqueGiftUrl(resolvedGiftId, isPreview ? publicBaseUrl : undefined)
    : '';

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
                    Your unique link
                  </h2>
                  <p className="text-xs text-[#7B7167]">
                    View-only for her — stays linked to your edits.
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

            {!authUser ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-[#544A42] leading-relaxed">
                  Sign in once with Google to create your unique link. Any future edits you make to photos or notes will automatically update that exact same link.
                </p>

                {errorMsg && (
                  <p className="text-xs text-[#A84A4A]">{errorMsg}</p>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-full text-sm text-[#6B6158] hover:text-[#2E2925] hover:bg-[#EFE9DD] transition-colors whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={signingIn}
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-full bg-[#2E2925] text-[#FFFDF8] text-sm font-medium hover:bg-[#413A34] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    {signingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <LogIn className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isPreview && (
                  <div className="mt-4 rounded-xl bg-[#F7F1E6] border border-[#3A322C]/10 p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2 text-xs text-[#544A42] leading-relaxed">
                      <Globe className="w-4 h-4 text-[#A86A6A] shrink-0 mt-0.5" aria-hidden="true" />
                      <p>
                        You&apos;re in AI Studio&apos;s private preview. Paste your deployed site URL (e.g. Cloudflare Pages) below so this link opens in any browser:
                      </p>
                    </div>
                    <input
                      type="url"
                      placeholder="https://your-site.pages.dev"
                      value={publicBaseUrl}
                      onChange={(e) => handlePublicUrlChange(e.target.value)}
                      className="w-full rounded-lg bg-[#FFFDF8] border border-[#3A322C]/15 px-3 py-2 text-xs text-[#2E2925]"
                    />
                  </div>
                )}

                <div className="mt-5">
                  <label className="block text-xs text-[#6B6158] mb-1.5">
                    Permanent link for this gift
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={saving ? 'Saving your unique link...' : generatedUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-xl bg-[#FBF8F1] border border-[#3A322C]/15 px-3.5 py-2.5 text-xs text-[#3A322C] font-mono truncate"
                  />
                </div>

                {errorMsg ? (
                  <p className="mt-3 text-xs text-[#A84A4A]">{errorMsg}</p>
                ) : (
                  <p className="mt-3 text-xs text-[#7B7167] leading-relaxed">
                    Every edit you make to photos or notes stays linked to this exact URL — no need to generate a new link when you tweak something.
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
                    disabled={saving || !generatedUrl || Boolean(errorMsg)}
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
