import { useMemo } from 'react';
import { DeckFooter, Hud, Overview, ProgressBar } from './components/Chrome';
import { DeckProvider, type DeckNavigator } from './components/DeckContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SlideFrame } from './components/SlideFrame';
import { SLIDES } from './content/slides';
import { useDeck } from './hooks/useDeck';

export function App() {
  const deck = useDeck(SLIDES.length);

  const navigator = useMemo<DeckNavigator>(
    () => ({ go: deck.go, next: deck.next, prev: deck.prev }),
    [deck.go, deck.next, deck.prev],
  );

  return (
    <ErrorBoundary label="chrome">
      <ProgressBar ratio={(deck.index + 1) / SLIDES.length} />

      <Hud
        overviewOpen={deck.overviewOpen}
        onToggleOverview={deck.toggleOverview}
        onToggleFullscreen={deck.toggleFullscreen}
      />

      <main className="deck" id="deck">
        {/* Boundary kedua: kalau satu ilustrasi error, navigasi slide tetap hidup. */}
        <DeckProvider value={navigator}>
          <ErrorBoundary label="slide">
            {SLIDES.map((slide, i) => (
              <SlideFrame
                key={slide.id}
                slide={slide}
                active={i === deck.index}
                before={i < deck.index}
              />
            ))}
          </ErrorBoundary>
        </DeckProvider>
      </main>

      <DeckFooter index={deck.index} slides={SLIDES} onGo={deck.go} onPrev={deck.prev} onNext={deck.next} />

      <Overview
        open={deck.overviewOpen}
        index={deck.index}
        slides={SLIDES}
        onSelect={deck.go}
        onClose={deck.closeOverview}
      />
    </ErrorBoundary>
  );
}
