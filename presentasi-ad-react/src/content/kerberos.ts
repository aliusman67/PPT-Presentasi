export type ActorKey = 'client' | 'kdc' | 'tgs' | 'server';
export type TokenKey = 'ktp' | 'tgt' | 'st';
/** `idle` = token terlihat normal (tanpa kelas state). */
export type TokenState = 'idle' | 'faded' | 'hidden' | 'granted';

export type Actor = {
  x: number;
  y: number;
  icon: string;
  name: string;
  sub: string;
};

export type Token = {
  className: string;
  label: string;
};

export const ACTORS: Record<ActorKey, Actor> = {
  client: { x: 13, y: 74, icon: '🧑', name: 'Pengunjung', sub: 'User / workstation' },
  kdc: { x: 38, y: 20, icon: '🎟️', name: 'Loket Utama', sub: 'KDC · AS' },
  tgs: { x: 66, y: 20, icon: '🎡', name: 'Loket Wahana', sub: 'KDC · TGS' },
  server: { x: 87, y: 74, icon: '🎢', name: 'Penjaga Wahana', sub: 'File Server' },
};

export const TOKENS: Record<TokenKey, Token> = {
  ktp: { className: 't-ktp', label: '🪪 KTP (password)' },
  tgt: { className: 't-tgt', label: '⌚ Gelang (TGT)' },
  st: { className: 't-st', label: '🎫 Tiket (Service)' },
};

/** Posisi token = posisi aktor tujuan, dinaik sedikit biar nggak menutupi label. */
export const TOKEN_SLOT_DY = 11;

export type KerbStep = {
  tag: string;
  title: string;
  /** HTML authored (dipakai lewat <Prose />). */
  description: string;
  tokens: Record<TokenKey, { at: ActorKey; state: TokenState }>;
  glow: readonly ActorKey[];
  grant?: boolean;
};

export const KERB_STEPS: readonly KerbStep[] = [
  {
    tag: '',
    title: 'Analogi Taman Bermain',
    description:
      'Bayangin domain itu taman bermain 🎡 — Kerberos <strong>nggak pernah ngirim password lewat jaringan</strong>; yang berpindah cuma tiket. Tekan “Berikutnya →” buat ngikutin alurnya satu-satu.',
    tokens: { ktp: { at: 'client', state: 'idle' }, tgt: { at: 'kdc', state: 'hidden' }, st: { at: 'tgs', state: 'hidden' } },
    glow: [],
  },
  {
    tag: 'AS-REQ',
    title: '1 · Login Awal',
    description:
      'User nunjukin <strong>KTP (password)</strong> ke Loket Utama — KDC bagian <em>Authentication Service</em>. Ini satu-satunya momen password dipakai, dan tetap nggak dikirim mentah-mentah: cuma dipakai bikin <em>authenticator</em> yang diverifikasi balik oleh KDC.',
    tokens: { ktp: { at: 'kdc', state: 'idle' }, tgt: { at: 'kdc', state: 'hidden' }, st: { at: 'tgs', state: 'hidden' } },
    glow: ['kdc'],
  },
  {
    tag: 'AS-REP',
    title: '2 · Gelang Akses',
    description:
      'KDC ngecek identitas lalu ngasih <strong>Gelang Harian (TGT)</strong> — ditandatangani pakai kunci akun <code>krbtgt</code>, jadi semua loket percaya tanpa perlu nanya ulang. KTP-nya diam di loket; cuma dipakai buat verifikasi.',
    tokens: { ktp: { at: 'kdc', state: 'faded' }, tgt: { at: 'client', state: 'idle' }, st: { at: 'tgs', state: 'hidden' } },
    glow: ['kdc'],
  },
  {
    tag: 'TGS-REQ',
    title: '3 · Pesan Tiket Wahana',
    description:
      'Mau naik Rollercoaster (File Server)? Cukup tunjukin <strong>gelang (TGT)</strong> ke loket wahana — TGS. KTP nggak perlu; bahkan TGS pun nggak pernah lihat password user.',
    tokens: { ktp: { at: 'kdc', state: 'faded' }, tgt: { at: 'tgs', state: 'idle' }, st: { at: 'tgs', state: 'hidden' } },
    glow: ['tgs'],
  },
  {
    tag: 'TGS-REP',
    title: '4 · Tiket Rollercoaster',
    description:
      'TGS ngasih <strong>Service Ticket</strong>. Bedanya sama gelang: tiket ini khusus <em>satu wahana</em> saja — kalau sampai dicuri, kerusakannya terbatas ke layanan itu, bukan seluruh taman.',
    tokens: { ktp: { at: 'kdc', state: 'faded' }, tgt: { at: 'tgs', state: 'faded' }, st: { at: 'client', state: 'idle' } },
    glow: ['tgs'],
  },
  {
    tag: 'AP-REQ',
    title: '5 · Tunjuk ke Penjaga',
    description:
      'User nyerahin tiket ke <strong>Penjaga (server tujuan)</strong>. Penjaga cuma perlu percaya tanda tangan KDC — dia nggak pernah, dan nggak akan pernah, tahu password user.',
    tokens: { ktp: { at: 'kdc', state: 'faded' }, tgt: { at: 'tgs', state: 'faded' }, st: { at: 'server', state: 'idle' } },
    glow: ['server'],
  },
  {
    tag: 'AP-REP',
    title: '6 · Selamat Menikmati 🎢',
    description:
      'Tiket sah → pintu dibuka pakai <em>session key</em>. Kesimpulannya: password cuma <em>dipakai</em>, nggak pernah <em>dikirim</em>. Makanya Kerberos jauh lebih aman dari NTLM — dan makanya serangan Kerberos (Kerberoasting, Golden Ticket) nyasar ke <strong>tiket &amp; krbtgt</strong>, bukan ke password.',
    tokens: { ktp: { at: 'kdc', state: 'faded' }, tgt: { at: 'tgs', state: 'faded' }, st: { at: 'server', state: 'granted' } },
    glow: ['server'],
    grant: true,
  },
];

export const AUTOPLAY_MS = 2600;

export const protocolLine = (tag: string): string =>
  tag ? `◈ Protokol: ${tag}` : '◈ Belum ada traffic — siapkan tiketmu';
