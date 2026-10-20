import { useState, type ReactNode } from 'react';

type HardItem = {
  id: string;
  icon: string;
  title: string;
  body: ReactNode;
};

const ITEMS: readonly HardItem[] = [
  {
    id: 'tiering',
    icon: '🏰',
    title: 'Tiered Administration Model',
    body: (
      <>
        Pisahkan “kunci” berdasarkan kelas: <b>Tier 0</b> = DC · <b>Tier 1</b> = server ·{' '}
        <b>Tier 2</b> = workstation. Admin Tier-0 nggak pernah login ke Tier-2 — sekali ada workstation
        yang kena, hash admin DC nggak ikut ke-dump karena memang nggak pernah ada di sana.
      </>
    ),
  },
  {
    id: 'laps',
    icon: '🔁',
    title: 'LAPS',
    body: (
      <>
        Masalah admin lokal: passwordnya biasanya sama di semua mesin dan jarang diganti.{' '}
        <em>Local Administrator Password Solution</em> bikin tiap mesin punya password <b>unik</b> +
        dirotasi otomatis — admin tinggal ambil nilainya lewat AD saat butuh.
      </>
    ),
  },
  {
    id: 'legacy',
    icon: '🚫',
    title: 'Nonaktifkan Protokol Legacy',
    body: (
      <>
        Matikan <b>NTLMv1</b>, <b>SMBv1</b>, dan <b>WDigest</b> (yang diam-diam nyimpen password
        plaintext di LSASS), lalu wajibkan <b>SMB Signing = Require</b>. Pintu-pintu lama ini justru
        yang paling sering dilewatin penyerang.
      </>
    ),
  },
  {
    id: 'gmsa',
    icon: '⚙️',
    title: 'gMSA untuk Service Accounts',
    body: (
      <>
        Service Account itu target empuk karena passwordnya “di-set-lalu-dilupakan”. <b>gMSA</b> bikin
        Windows yang ngelola: 240+ karakter acak, rotasi otomatis, dan nggak ada manusia yang tahu —
        Kerberoasting pun jadi nggak ada gunanya.
      </>
    ),
  },
];

const MESSAGES = [
  'Baru mulai… domain masih terbuka lebar 😬',
  'Setengah jalan — lanjutkan!',
  'Hampir solid, satu langkah lagi.',
  'Siap bertahan dari serangan umum.',
  '🛡️ 100% — Domain terkunci! Tiering, LAPS, legacy off, gMSA. 🎉',
];

export function hardeningLabel(done: number, total: number): string {
  return `Skor hardening: ${done} / ${total} — ${MESSAGES[done] ?? ''}`;
}

export function S11Hardening() {
  const [checked, setChecked] = useState<readonly boolean[]>(() => ITEMS.map(() => false));

  const done = checked.filter(Boolean).length;
  const complete = done === ITEMS.length;

  const toggle = (index: number): void => {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">07 · Strategi Pengamanan</span>
        <h2 data-reveal>
          Hardening Checklist <span className="tag-live">● nyalakan semua</span>
        </h2>
      </header>

      <div className="hard-grid">
        {ITEMS.map((item, i) => (
          <label key={item.id} className={checked[i] ? 'hard-card on' : 'hard-card'} data-reveal>
            <input type="checkbox" className="hard-sw" checked={checked[i]} onChange={() => toggle(i)} />
            <div className="hard-body">
              <span className="card-ic">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <span className="switch" />
          </label>
        ))}
      </div>

      <div className="score-row" data-reveal>
        <div className="score-meter" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={ITEMS.length}>
          <div className="score-fill" style={{ width: `${(done / ITEMS.length) * 100}%` }} />
        </div>
        <div className={complete ? 'score-txt full' : 'score-txt'} aria-live="polite">
          {hardeningLabel(done, ITEMS.length)}
        </div>
      </div>
    </div>
  );
}
