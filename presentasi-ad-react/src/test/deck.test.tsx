import { fireEvent, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { pad2 } from '../components/Chrome';
import { SLIDES } from '../content/slides';
import { clampIndex, deckReducer, readInitialIndex, type DeckState } from '../hooks/useDeck';

const TOTAL = SLIDES.length;

function initialState(index = 0, overviewOpen = false): DeckState {
  return { index, total: TOTAL, overviewOpen };
}

/** Nomor slide aktif dibaca dari counter di footer. */
function activeNumber(container: HTMLElement): string {
  const counter = container.querySelector('.foot-left b');
  if (!counter) throw new Error('Counter slide tidak ditemukan');
  return counter.textContent ?? '';
}

/** Setiap test mulai dari slide 1 — hash yang ditulis test sebelumnya tidak menular. */
function renderDeck() {
  window.location.hash = '';
  return render(<App />);
}

describe('deckReducer', () => {
  it('meng-clamp indeks ke batas deck', () => {
    expect(deckReducer(initialState(), { type: 'go', index: 999 }).index).toBe(TOTAL - 1);
    expect(deckReducer(initialState(), { type: 'go', index: -5 }).index).toBe(0);
    expect(clampIndex(4, 3)).toBe(2);
  });

  it('next/prev bergerak satu langkah dan menutup overlay', () => {
    const state = initialState(2, true);
    expect(deckReducer(state, { type: 'next' })).toMatchObject({ index: 3, overviewOpen: false });
    expect(deckReducer(state, { type: 'prev' })).toMatchObject({ index: 1, overviewOpen: false });
  });

  it('first/last melompat ke ujung deck', () => {
    expect(deckReducer(initialState(5), { type: 'first' }).index).toBe(0);
    expect(deckReducer(initialState(5), { type: 'last' }).index).toBe(TOTAL - 1);
  });

  it('toggleOverview membuka lalu menutup tanpa pindah slide', () => {
    const opened = deckReducer(initialState(4), { type: 'toggleOverview' });
    expect(opened).toMatchObject({ index: 4, overviewOpen: true });
    expect(deckReducer(opened, { type: 'toggleOverview' }).overviewOpen).toBe(false);
  });
});

describe('readInitialIndex', () => {
  it('membaca deep-link 1-based', () => {
    expect(readInitialIndex(TOTAL, '#8')).toBe(7);
  });

  it('fallback ke slide pertama untuk hash kosong / tidak valid', () => {
    expect(readInitialIndex(TOTAL, '')).toBe(0);
    expect(readInitialIndex(TOTAL, '#abc')).toBe(0);
  });

  it('meng-clamp nomor di luar jangkauan', () => {
    expect(readInitialIndex(TOTAL, '#900')).toBe(TOTAL - 1);
    expect(readInitialIndex(TOTAL, '#0')).toBe(0);
  });
});

describe('navigasi deck', () => {
  it('merender seluruh slide + counter footer', () => {
    const { container } = renderDeck();
    expect(container.querySelectorAll('.slide')).toHaveLength(TOTAL);
    expect(container.querySelector('.slide.active')).toHaveClass('slide-hero');
    expect(activeNumber(container)).toBe('01');
    expect(screen.getByText(pad2(TOTAL))).toBeInTheDocument();
  });

  it('tombol next/prev di footer memindahkan slide', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(activeNumber(container)).toBe('02');
    expect(screen.getByRole('heading', { name: 'Apa itu Active Directory?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sebelumnya' }));
    expect(activeNumber(container)).toBe('01');
  });

  it('keyboard: panah, spasi, Home, dan End', () => {
    const { container } = renderDeck();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(activeNumber(container)).toBe('02');

    fireEvent.keyDown(document, { key: ' ' });
    expect(activeNumber(container)).toBe('03');

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(activeNumber(container)).toBe('02');

    fireEvent.keyDown(document, { key: 'End' });
    expect(activeNumber(container)).toBe(pad2(TOTAL));

    fireEvent.keyDown(document, { key: 'End' });
    expect(activeNumber(container)).toBe(pad2(TOTAL));

    fireEvent.keyDown(document, { key: 'Home' });
    expect(activeNumber(container)).toBe('01');
  });

  it('keyboard diabaikan saat fokus di input (checkbox LDAPS)', () => {
    const { container } = renderDeck();
    const toggle = screen.getByRole('checkbox', { name: 'Aktifkan LDAPS' });

    fireEvent.keyDown(toggle, { key: 'ArrowRight' });
    expect(activeNumber(container)).toBe('01');
  });

  it('titik navigasi memilih slide dan menandai aria-current', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: 'Slide 6: FSMO Roles' }));
    expect(activeNumber(container)).toBe('06');
    expect(screen.getByRole('button', { name: 'Slide 6: FSMO Roles' })).toHaveAttribute('aria-current', 'true');
  });

  it('deep-link #n membuka slide terkait saat mount', () => {
    window.location.hash = '#9';
    const { container } = render(<App />);
    expect(activeNumber(container)).toBe('09');
  });

  it('menuliskan nomor slide ke URL saat berpindah', () => {
    renderDeck();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(window.location.hash).toBe('#2');
  });

  it('tombol next/prev nonaktif di ujung deck', () => {
    renderDeck();
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeEnabled();
  });

  it('memberi transition-delay bertingkat pada elemen [data-reveal]', () => {
    const { container } = renderDeck();
    const reveals = container.querySelectorAll('.slide.active [data-reveal]');
    expect(reveals.length).toBeGreaterThan(2);
    expect((reveals[0] as HTMLElement).style.transitionDelay).toBe('0ms');
    expect((reveals[1] as HTMLElement).style.transitionDelay).toBe('110ms');
    expect((reveals[2] as HTMLElement).style.transitionDelay).toBe('220ms');
  });

  it('swipe horizontal di touch device memindahkan slide', () => {
    const { container } = renderDeck();

    fireEvent.touchStart(document, { touches: [{ clientX: 400, clientY: 300 }] });
    fireEvent.touchEnd(document, { changedTouches: [{ clientX: 200, clientY: 305 }] });
    expect(activeNumber(container)).toBe('02');

    fireEvent.touchStart(document, { touches: [{ clientX: 100, clientY: 300 }] });
    fireEvent.touchEnd(document, { changedTouches: [{ clientX: 120, clientY: 100 }] });
    expect(activeNumber(container)).toBe('02'); // geser vertikal bukan navigasi
  });

  it('tetap bersih di bawah StrictMode (double-invoke effects)', () => {
    window.location.hash = ''; // jangan warisi hash dari test sebelumnya
    const { container } = render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(container.querySelectorAll('.slide')).toHaveLength(TOTAL);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(activeNumber(container)).toBe('02');
    expect(container.querySelectorAll('.slide.active')).toHaveLength(1);
  });
});

describe('overlay daftar slide', () => {
  it('Esc membuka overlay, klik item pindah slide lalu menutupnya', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    expect(screen.queryByRole('dialog', { name: 'Daftar slide' })).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    const dialog = screen.getByRole('dialog', { name: 'Daftar slide' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getAllByRole('button')).toHaveLength(TOTAL + 1); // + tombol tutup

    await user.click(within(dialog).getByRole('button', { name: /Kerberos/ }));
    expect(activeNumber(container)).toBe('08');
    expect(screen.queryByRole('dialog', { name: 'Daftar slide' })).not.toBeInTheDocument();
  });

  it('tombol tutup di overlay menyembunyikan dialog', async () => {
    const user = userEvent.setup();
    renderDeck();

    fireEvent.keyDown(document, { key: 'o' });
    expect(screen.getByRole('dialog', { name: 'Daftar slide' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tutup daftar slide' }));
    expect(screen.queryByRole('dialog', { name: 'Daftar slide' })).not.toBeInTheDocument();
  });

  it('overlay memuat judul dan deskripsi tiap slide', () => {
    renderDeck();
    fireEvent.keyDown(document, { key: 'Escape' });

    const dialog = screen.getByRole('dialog', { name: 'Daftar slide' });
    expect(within(dialog).getByText('SLIDE 03')).toBeInTheDocument();
    expect(within(dialog).getByText('Bagian Arsitektur — Komponen Logis')).toBeInTheDocument();
    expect(within(dialog).getByText('Ringkasan & penutup')).toBeInTheDocument();
  });
});
