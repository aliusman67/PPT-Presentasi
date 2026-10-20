import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

const SWIPE_MIN_DX = 64;
const SWIPE_RATIO = 1.4;

export type DeckState = {
  readonly index: number;
  readonly total: number;
  readonly overviewOpen: boolean;
};

export type DeckAction =
  | { readonly type: 'go'; readonly index: number }
  | { readonly type: 'next' }
  | { readonly type: 'prev' }
  | { readonly type: 'first' }
  | { readonly type: 'last' }
  | { readonly type: 'toggleOverview' }
  | { readonly type: 'closeOverview' };

export function clampIndex(index: number, total: number): number {
  return Math.max(0, Math.min(total - 1, index));
}

/**
 * Reducer murni untuk navigasi deck.
 * Semua aksi pindah slide menutup overlay daftar slide — persis seperti
 * perilaku versi vanilla (tombol next/prev & klik item selalu `toggleOv(false)`).
 */
export function deckReducer(state: DeckState, action: DeckAction): DeckState {
  const move = (index: number): DeckState => ({
    ...state,
    index: clampIndex(index, state.total),
    overviewOpen: false,
  });

  switch (action.type) {
    case 'go':
      return move(action.index);
    case 'next':
      return move(state.index + 1);
    case 'prev':
      return move(state.index - 1);
    case 'first':
      return move(0);
    case 'last':
      return move(state.total - 1);
    case 'toggleOverview':
      return { ...state, overviewOpen: !state.overviewOpen };
    case 'closeOverview':
      return { ...state, overviewOpen: false };
  }
}

/** Deep-link `#n` (1-based). Nomor di luar jangkauan di-clamp, bukan dilempar. */
export function readInitialIndex(total: number, hash: string = window.location.hash): number {
  const parsed = Number.parseInt(hash.replace(/^#/, ''), 10);
  return Number.isNaN(parsed) ? 0 : clampIndex(parsed - 1, total);
}

export function useDeck(total: number) {
  const [state, dispatch] = useReducer(deckReducer, total, (size: number) => ({
    index: readInitialIndex(size),
    total: size,
    overviewOpen: false,
  }));

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    const root = document.documentElement;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await root.requestFullscreen();
      }
    } catch {
      /* Fullscreen bisa ditolak browser (misal tanpa gesture pengguna). Abaikan. */
    }
  }, []);

  // Sinkronkan URL (#n) supaya presentasi bisa di-resume / di-share per slide.
  useEffect(() => {
    window.history.replaceState(null, '', `#${state.index + 1}`);
  }, [state.index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, textarea')) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'n':
          event.preventDefault();
          dispatch({ type: 'next' });
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'p':
          event.preventDefault();
          dispatch({ type: 'prev' });
          break;
        case 'Home':
          dispatch({ type: 'first' });
          break;
        case 'End':
          dispatch({ type: 'last' });
          break;
        case 'Escape':
        case 'o':
        case 'O':
          dispatch({ type: 'toggleOverview' });
          break;
        case 'f':
        case 'F':
          void toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggleFullscreen]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent): void => {
      const touch = event.touches[0];
      touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };

    const onTouchEnd = (event: TouchEvent): void => {
      const start = touchStart.current;
      touchStart.current = null;
      const touch = event.changedTouches[0];
      if (!start || !touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) > SWIPE_MIN_DX && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
        dispatch({ type: dx < 0 ? 'next' : 'prev' });
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const go = useCallback((index: number) => dispatch({ type: 'go', index }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const toggleOverview = useCallback(() => dispatch({ type: 'toggleOverview' }), []);
  const closeOverview = useCallback(() => dispatch({ type: 'closeOverview' }), []);

  return useMemo(
    () => ({
      index: state.index,
      total: state.total,
      overviewOpen: state.overviewOpen,
      go,
      next,
      prev,
      toggleOverview,
      closeOverview,
      toggleFullscreen,
    }),
    [state, go, next, prev, toggleOverview, closeOverview, toggleFullscreen],
  );
}
