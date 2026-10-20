import { memo, useLayoutEffect, useRef } from 'react';
import type { SlideMeta, SlideVariant } from '../content/slides';

const REVEAL_STAGGER_MS = 110;

const VARIANT_CLASS: Record<SlideVariant, string> = {
  hero: 'slide-hero',
  end: 'slide-end',
};

type SlideFrameProps = {
  slide: SlideMeta;
  active: boolean;
  before: boolean;
};

/**
 * Membungkus isi slide dengan `<section class="slide">` + state kelas yang di versi
 * vanilla di-toggle manual oleh mesin slide (`active` / `before`).
 *
 * Delay animasi masuk tetap dihitung dari urutan DOM elemen `[data-reveal]`, karena
 * stylesheet mengatur stagger lewat `transition-delay` per elemen — satu-satunya
 * bagian yang lebih praktis kalau tetap imperatif.
 */
export const SlideFrame = memo(function SlideFrame({ slide, active, before }: SlideFrameProps) {
  const ref = useRef<HTMLElement>(null);
  const Content = slide.Component;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node, n) => {
      node.style.transitionDelay = `${n * REVEAL_STAGGER_MS}ms`;
    });
  }, [active]);

  const classes = [
    'slide',
    slide.variant ? VARIANT_CLASS[slide.variant] : undefined,
    active ? 'active' : undefined,
    before ? 'before' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  // Slide non-aktif sudah disembunyikan stylesheet lewat `visibility: hidden`,
  // yang otomatis mengeluarkannya dari accessibility tree dan dari urutan Tab.
  return (
    <section ref={ref} className={classes}>
      <Content />
    </section>
  );
});
