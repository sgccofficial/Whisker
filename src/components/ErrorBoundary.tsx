import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Something went wrong while loading this gift.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FBF8F1] text-[#2E2925] px-6 py-12">
          <div className="max-w-md w-full rounded-2xl paper-card p-8 text-center space-y-4">
            <h1
              className="text-2xl font-medium text-[#2E2925]"
              style={{ fontFamily: 'var(--font-serif-story)' }}
            >
              Something paused unexpectedly
            </h1>
            <p className="text-sm text-[#6B6158] leading-relaxed">
              We couldn&apos;t load or save part of this page right now. Try refreshing to pick right back up.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 rounded-full bg-[#2E2925] text-[#FBF8F1] text-sm font-medium hover:bg-[#413A34] transition-colors"
            >
              Refresh page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
