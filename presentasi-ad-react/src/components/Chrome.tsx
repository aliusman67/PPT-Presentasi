import type { SlideMeta } from '../content/slides';

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export function ProgressBar({ ratio }: { ratio: number }) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        role="progressbar"
        aria-label="Progres presentasi"
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

type HudProps = {
  overviewOpen: boolean;
  onToggleOverview: () => void;
  onToggleFullscreen: () => void | Promise<void>;
};

export function Hud({ overviewOpen, onToggleOverview, onToggleFullscreen }: HudProps) {
  return (
    <div className="hud">
      <button
        type="button"
        className="hud-btn"
        onClick={onToggleOverview}
        aria-expanded={overviewOpen}
        title="Daftar slide (Esc)"
      >
        ☰<span> Slide</span>
      </button>
      <button type="button" className="hud-btn" onClick={() => void onToggleFullscreen()} title="Layar penuh (F)">
        ⛶
      </button>
    </div>
  );
}

type DeckFooterProps = {
  index: number;
  slides: readonly SlideMeta[];
  onGo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function DeckFooter({ index, slides, onGo, onPrev, onNext }: DeckFooterProps) {
  const total = slides.length;

  return (
    <footer className="foot">
      <div className="foot-left">
        <b>{pad2(index + 1)}</b> / <span>{pad2(total)}</span>
        <span className="foot-title">{slides[index]?.title ?? ''}</span>
      </div>

      <div className="foot-right">
        <button type="button" className="nav-btn" onClick={onPrev} aria-label="Sebelumnya" disabled={index === 0}>
          ←
        </button>

        <div className="dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={i === index ? 'dot on' : 'dot'}
              title={`${i + 1}. ${slide.title}`}
              aria-label={`Slide ${i + 1}: ${slide.title}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => onGo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="nav-btn"
          onClick={onNext}
          aria-label="Berikutnya"
          disabled={index === total - 1}
        >
          →
        </button>
      </div>
    </footer>
  );
}

type OverviewProps = {
  open: boolean;
  index: number;
  slides: readonly SlideMeta[];
  onSelect: (index: number) => void;
  onClose: () => void;
};

export function Overview({ open, index, slides, onSelect, onClose }: OverviewProps) {
  if (!open) return null;

  return (
    <div className="overview" role="dialog" aria-modal="true" aria-label="Daftar slide">
      <div className="ov-head">
        <h2>Daftar Slide</h2>
        <button type="button" className="hud-btn" onClick={onClose} aria-label="Tutup daftar slide">
          ✕
        </button>
      </div>

      <div className="ov-grid">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={i === index ? 'ov-item cur' : 'ov-item'}
            onClick={() => onSelect(i)}
            aria-current={i === index ? 'true' : undefined}
          >
            <span className="ov-num">SLIDE {pad2(i + 1)}</span>
            <span className="ov-t">{slide.title}</span>
            <span className="ov-d">{slide.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
