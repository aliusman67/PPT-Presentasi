import { createContext, useContext } from 'react';

/** Navigasi deck yang dibutuhkan slide tertentu (mis. tombol "Mulai dari awal"). */
export type DeckNavigator = {
  go: (index: number) => void;
  next: () => void;
  prev: () => void;
};

const DeckContext = createContext<DeckNavigator | null>(null);

export const DeckProvider = DeckContext.Provider;

export function useDeckNavigator(): DeckNavigator {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('Slide dipakai tanpa DeckProvider.');
  return ctx;
}
