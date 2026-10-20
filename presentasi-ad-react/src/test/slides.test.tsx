import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SLIDES } from '../content/slides';
import { NTLM_IDLE, advanceNtlm } from '../content/protocols';

const TOTAL = SLIDES.length;

function activeNumber(container: HTMLElement): string {
  return container.querySelector('.foot-left b')?.textContent ?? '';
}

function renderDeck() {
  window.location.hash = '';
  return render(<App />);
}

describe('Slide 3 · pohon arsitektur logis', () => {
  it('mengganti panel info ketika node diklik', async () => {
    const user = userEvent.setup();
    renderDeck();

    expect(screen.getByRole('heading', { name: 'Pilih sebuah node' })).toBeInTheDocument();
    // Kelas level pohon digabung dinamis (lv-forest / lv-domain / lv-ou / lv-obj).
    expect(screen.getByRole('button', { name: /🌳 Forest/ })).toHaveClass('lv-forest');
    expect(screen.getByRole('button', { name: /📁 OU “Users”/ })).toHaveClass('lv-ou');
    expect(screen.getByRole('button', { name: /🖥️ Computer — DC01/ })).toHaveClass('lv-obj');
    expect(screen.getByRole('button', { name: /🏷️ Domain/ })).toHaveClass('lv-domain', 'open-target');

    await user.click(screen.getByRole('button', { name: /🏷️ Domain/ }));

    expect(screen.getByRole('heading', { name: '🏷️ Domain' })).toBeInTheDocument();
    expect(screen.getByText(/nggak otomatis ngerti domain B/)).toBeInTheDocument();
    expect(screen.getByText('Security boundary')).toBeInTheDocument();
    expect(screen.getByText('Unit replikasi')).toBeInTheDocument();
  });

  it('hanya satu node yang terpilih pada satu waktu', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: /👤 User — john.doe/ }));
    await user.click(screen.getByRole('button', { name: /👥 Group — HelpDesk/ }));

    expect(container.querySelectorAll('.node.selected')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /👥 Group — HelpDesk/ })).toHaveClass('selected');
  });

  it('melipat dan membuka cabang', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const fold = screen.getAllByRole('button', { name: 'Lipat cabang' })[0]!;
    expect(fold).toHaveAttribute('aria-expanded', 'true');

    await user.click(fold);
    expect(container.querySelector('li.folded')).not.toBeNull();
    expect(fold).toHaveAttribute('aria-expanded', 'false');
    expect(fold).toHaveTextContent('+');

    await user.click(screen.getByRole('button', { name: 'Buka cabang' }));
    expect(container.querySelector('li.folded')).toBeNull();
  });
});

describe('Slide 4 · salin path NTDS.dit', () => {
  it('menulis ke clipboard lalu melepas kelas copied', () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderDeck();
    const button = screen.getByRole('button', { name: '%SystemRoot%\\NTDS\\ntds.dit' });

    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledWith('%SystemRoot%\\NTDS\\ntds.dit');
    expect(button).toHaveClass('copied');
    expect(screen.getByText('✅ Disalin! Lokasi default database AD.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(button).not.toHaveClass('copied');

    Object.defineProperty(window.navigator, 'clipboard', { value: undefined, configurable: true });
    vi.useRealTimers();
  });
});

describe('Slide 5 · tab layanan AD', () => {
  it('menukar pane saat tab lain dipilih', async () => {
    const user = userEvent.setup();
    renderDeck();

    expect(screen.getByRole('heading', { name: /Active Directory Domain Services/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'AD FS Federation Services' }));

    expect(screen.getByRole('heading', { name: /Active Directory Federation Services/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Active Directory Domain Services/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AD FS Federation Services' })).toHaveClass('active');
  });
});

describe('Slide 6 · FSMO roles', () => {
  it('menampilkan detail peran + highlight cakupannya', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    expect(container.querySelector('.fmso-detail')).not.toHaveClass('show');

    await user.click(screen.getByRole('button', { name: 'PDC Emulator' }));

    const detail = container.querySelector('.fmso-detail')!;
    expect(detail).toHaveClass('show');
    expect(detail).toHaveTextContent('PDC Emulator');
    expect(detail).toHaveTextContent('🏷️ Domain-wide');
    expect(detail).toHaveTextContent('paling sibuk');
    expect(container.querySelector('.fmso-scope.domain')).toHaveClass('hl');
    expect(container.querySelector('.fmso-scope.forest')).not.toHaveClass('hl');
  });

  it('peran forest menandai kolom forest', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: 'Schema Master' }));
    expect(container.querySelector('.fmso-scope.forest')).toHaveClass('hl');
    expect(container.querySelector('.fmso-detail')).toHaveTextContent('🌳 Forest-wide');
    expect(container.querySelector('.fmso-detail')).toHaveTextContent('Schema Master');
  });
});

describe('Slide 7 · animasi GPO LSDOU', () => {
  it('menjalankan evaluasi L→S→D→O sampai OU menang', () => {
    vi.useFakeTimers();
    const { container } = renderDeck();

    const play = screen.getByRole('button', { name: '▶ Putar urutan' });
    fireEvent.click(play);
    expect(play).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(850);
    });

    // Panah menyisip di antara tahap (L→S→D→O), bukan sesudah semua kotak.
    expect(container.querySelectorAll('.gpo-arrow')).toHaveLength(3);

    const stages = container.querySelectorAll('.gpo-stage');
    expect(stages[0]).toHaveClass('hit');
    expect(stages[0]).toHaveTextContent('min length = 7');
    expect(screen.getByText(/nilai aktif sekarang: 7/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(850 * 4);
    });

    expect(stages[3]).toHaveClass('hit');
    expect(stages[3]).toHaveClass('winner');
    expect(screen.getByText(/🏆 Yang menang: OU → minimal 14 karakter/)).toBeInTheDocument();
    expect(container.querySelector('.gpo-result')).toHaveClass('win');
    expect(play).toBeEnabled();

    vi.useRealTimers();
  });
});

describe('Slide 8 · simulasi Kerberos', () => {
  it('memulai di langkah 0 dengan tombol sebelumnya nonaktif', () => {
    renderDeck();

    expect(screen.getByText('◈ Belum ada traffic — siapkan tiketmu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Sebelumnya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Berikutnya →' })).toBeEnabled();
  });

  it('melangkah lewat tombol dan memposisikan token di slot aktor', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    for (let i = 0; i < 6; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Berikutnya →' }));
    }

    expect(screen.getByRole('heading', { name: '6 · Selamat Menikmati 🎢' })).toBeInTheDocument();
    expect(screen.getByText('◈ Protokol: AP-REP')).toBeInTheDocument();

    const ticket = container.querySelector('.token.t-st') as HTMLElement;
    expect(ticket).toHaveStyle({ left: '87%', top: '63%' });
    expect(ticket).toHaveClass('granted');
    expect(container.querySelector('.actor.granted')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Berikutnya →' })).toBeDisabled();
  });

  it('dot langkah melompat langsung ke langkah yang dipilih', async () => {
    const user = userEvent.setup();
    renderDeck();

    await user.click(screen.getByRole('button', { name: 'Langkah 2: 2 · Gelang Akses' }));
    expect(screen.getByText('◈ Protokol: AS-REP')).toBeInTheDocument();
  });

  it('auto-play berhenti sendiri di langkah terakhir', () => {
    vi.useFakeTimers();
    renderDeck();

    const auto = screen.getByRole('button', { name: '▶▶ Auto' });
    fireEvent.click(auto);
    expect(auto).toHaveTextContent('⏸ Stop');

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByText('◈ Protokol: AS-REQ')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2600 * 6);
    });
    expect(screen.getByText('◈ Protokol: AP-REP')).toBeInTheDocument();
    expect(auto).toHaveTextContent('▶▶ Auto');

    vi.useRealTimers();
  });
});

describe('Slide 9 · NTLM / LDAP / SMB', () => {
  it('transisi NTLM challenge–response berjalan berurutan', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: '🎲 Mulai challenge' }));
    const codes = container.querySelectorAll('.ntlm-out code');
    expect(codes[0]).toHaveTextContent(/^[0-9A-F]{16}$/);
    expect(codes[1]).toHaveTextContent('…menunggu klien');

    await user.click(screen.getByRole('button', { name: '🔐 Kirim response (hash)' }));
    expect(container.querySelectorAll('.ntlm-out code')[1]).toHaveTextContent(/^[0-9A-F]{32}$/);

    await user.click(screen.getByRole('button', { name: '↺ Ulangi' }));
    const reset = container.querySelectorAll('.ntlm-out code');
    expect(reset[0]).toHaveTextContent('—');
    expect(reset[1]).toHaveTextContent('—');
  });

  it('advanceNtlm adalah transisi murni (deterministik lewat hex injeksi)', () => {
    const hex = (len: number) => 'F'.repeat(len);
    expect(advanceNtlm(NTLM_IDLE, hex)).toEqual({ phase: 1, challenge: 'F'.repeat(16), response: '…menunggu klien' });
    expect(advanceNtlm({ phase: 1, challenge: 'A'.repeat(16), response: '…menunggu klien' }, hex)).toEqual({
      phase: 2,
      challenge: 'A'.repeat(16),
      response: 'F'.repeat(32),
    });
    expect(advanceNtlm({ phase: 2, challenge: 'x', response: 'y' }, hex)).toEqual(NTLM_IDLE);
  });

  it('switch LDAPS mengganti isi packet capture', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const packet = container.querySelector('.pkt')!;
    expect(packet).not.toHaveClass('secure');
    expect(packet).toHaveTextContent('S3nyums@!');
    expect(screen.getByText(/kredensial terkirim PLAINTEXT/)).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Aktifkan LDAPS' }));

    expect(packet).toHaveClass('secure');
    expect(packet).toHaveTextContent('DC01:636 (LDAPS, TLS 1.2)');
    expect(packet.textContent).not.toContain('S3nyums@!');
    expect(screen.getByText(/kredensial terenkripsi SSL\/TLS/)).toBeInTheDocument();
  });

  it('pilihan versi SMB memberi verdict dengan nada yang benar', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const verdict = container.querySelector('.smb-verdict')!;
    expect(verdict).toHaveTextContent('Pilih versi SMB di kiri');

    await user.click(screen.getByRole('button', { name: 'SMBv1' }));
    expect(verdict).toHaveClass('bad');
    expect(verdict).toHaveTextContent('EternalBlue');
    expect(screen.getByRole('button', { name: 'SMBv1' })).toHaveClass('sel');

    await user.click(screen.getByRole('button', { name: 'SMBv3' }));
    expect(verdict).toHaveClass('good');
    expect(verdict).toHaveTextContent('enkripsi per-hop');
  });

  it('status demo tetap tersimpan saat berpindah tab', async () => {
    const user = userEvent.setup();
    renderDeck();

    await user.click(screen.getByRole('button', { name: 'SMBv2' }));
    await user.click(screen.getByRole('tab', { name: 'NTLM' }));
    await user.click(screen.getByRole('tab', { name: 'SMB' }));

    expect(screen.getByRole('button', { name: 'SMBv2' })).toHaveClass('sel');
  });
});

describe('Slide 10 · kartu serangan', () => {
  it('memilih kartu pertama secara default lalu berganti panel', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const panel = container.querySelector('.atk-panel')!;
    expect(container.querySelectorAll('.atk-card')).toHaveLength(6);
    expect(container.querySelector('.atk-card.active')).toHaveTextContent('Kerberoasting');

    await user.click(screen.getByRole('button', { name: /DCSync/ }));

    expect(panel).toHaveTextContent('DCSync');
    expect(panel).toHaveTextContent('Replicating Directory Changes');
    expect(panel).toHaveTextContent('Penangkal:');
    expect(container.querySelectorAll('.atk-card.active .sev i.on')).toHaveLength(5);
  });

  it('menampilkan alur serangan tiga langkah', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: /Golden Ticket/ }));
    expect(container.querySelectorAll('.atk-flow span')).toHaveLength(3);
    expect(container.querySelectorAll('.atk-flow em')).toHaveLength(2);
  });
});

describe('Slide 11 · skor hardening', () => {
  it('menaikkan skor tiap toggle sampai 100%', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const txt = container.querySelector('.score-txt')!;
    expect(txt).toHaveTextContent('Skor hardening: 0 / 4 — Baru mulai');

    await user.click(screen.getByRole('checkbox', { name: /Tiered Administration Model/ }));
    expect(txt).toHaveTextContent('Skor hardening: 1 / 4');
    expect(container.querySelector('.hard-card.on')).not.toBeNull();

    await user.click(screen.getByRole('checkbox', { name: /LAPS/ }));
    await user.click(screen.getByRole('checkbox', { name: /Nonaktifkan Protokol Legacy/ }));
    await user.click(screen.getByRole('checkbox', { name: /gMSA untuk Service Accounts/ }));

    expect(txt).toHaveTextContent('🛡️ 100% — Domain terkunci!');
    expect(txt).toHaveClass('full');
    expect(container.querySelectorAll('.hard-card.on')).toHaveLength(4);
    expect(container.querySelector('.score-fill')).toHaveStyle({ width: '100%' });
  });

  it('toggle bisa dimatikan lagi', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    const box = screen.getByRole('checkbox', { name: /LAPS/ });
    await user.click(box);
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
    expect(container.querySelector('.score-txt')).toHaveTextContent('Skor hardening: 0 / 4');
  });
});

describe('Slide 12 · penutup', () => {
  it('tombol mulai dari awal mengembalikan deck ke slide 1', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();

    await user.click(screen.getByRole('button', { name: `Slide ${TOTAL}: Kesimpulan` }));
    expect(activeNumber(container)).toBe(String(TOTAL).padStart(2, '0'));

    await user.click(screen.getByRole('button', { name: /Mulai dari awal/ }));
    expect(activeNumber(container)).toBe('01');
  });
});

describe('ErrorBoundary', () => {
  it('menangkap error dari subtree tanpa mematikan seluruh app', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Boom(): never {
      throw new Error('sengaja gagal');
    }

    render(
      <ErrorBoundary label="test">
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Bagian ini gagal ditampilkan.')).toBeInTheDocument();
    expect(screen.getByText('sengaja gagal')).toBeInTheDocument();

    spy.mockRestore();
  });
});
