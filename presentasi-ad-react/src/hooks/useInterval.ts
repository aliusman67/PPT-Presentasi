import { useEffect, useRef } from 'react';

/**
 * Interval deklaratif: `delay === null` berarti berhenti.
 * Callback disimpan di ref supaya closure-nya selalu fresh tanpa
 * me-reset interval setiap render.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => savedCallback.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}
