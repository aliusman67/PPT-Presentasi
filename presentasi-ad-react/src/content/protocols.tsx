import type { ReactNode } from 'react';

/* ───────── NTLM challenge–response ───────── */

export type NtlmPhase = 0 | 1 | 2;

export type NtlmState = {
  phase: NtlmPhase;
  challenge: string;
  response: string;
};

export const NTLM_IDLE: NtlmState = { phase: 0, challenge: '—', response: '—' };

const HEX_BASE = 16;

export function randomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * HEX_BASE).toString(16))
    .join('')
    .toUpperCase();
}

export const NTLM_BUTTON_LABEL: Record<NtlmPhase, string> = {
  0: '🎲 Mulai challenge',
  1: '🔐 Kirim response (hash)',
  2: '↺ Ulangi',
};

/** Transisi murni phase 0 → 1 → 2 → 0. Nilai acak lewat parameter biar bisa dites. */
export function advanceNtlm(state: NtlmState, hex: (length: number) => string = randomHex): NtlmState {
  switch (state.phase) {
    case 0:
      return { phase: 1, challenge: hex(16), response: '…menunggu klien' };
    case 1:
      return { phase: 2, challenge: state.challenge, response: hex(32) };
    case 2:
      return { phase: 0, challenge: '—', response: '—' };
  }
}

/* ───────── LDAP vs LDAPS ───────── */

const B64_ALPHABET = 'ABCDabcdef0123456789+/';

export function randomGarble(length: number): string {
  return Array.from(
    { length },
    () => B64_ALPHABET[Math.floor(Math.random() * B64_ALPHABET.length)],
  ).join('');
}

export type PacketLine = { id: string; node: ReactNode };

/** Baris hasil tangkapan sniffer saat LDAP polos (port 389). */
export const LDAP_PLAIN: readonly PacketLine[] = [
  { id: 'conn', node: <span className="pl">TCP 10.0.1.55:49312 → DC01:389 (LDAP, plaintext)</span> },
  {
    id: 'bind',
    node: (
      <>
        bindDN: <span className="pl">CN=admin,OU=Users,DC=corp,DC=contoso,DC=com</span>
      </>
    ),
  },
  {
    id: 'pass',
    node: (
      <>
        password: <span className="pl">S3nyums@!</span> ← terbaca siapa pun di segmen
      </>
    ),
  },
  { id: 'filter', node: <>filter: (&(objectClass=user)(sAMAccountName=*))</> },
];

export function makeSecureLines(): readonly PacketLine[] {
  return [
    { id: 'conn', node: <span>TCP 10.0.1.55:49312 → DC01:636 (LDAPS, TLS 1.2)</span> },
    { id: 'p1', node: <>0x{randomGarble(58)}</> },
    { id: 'p2', node: <>0x{randomGarble(58)}</> },
    { id: 'p3', node: <>0x{randomGarble(44)}…</> },
  ];
}

export const LDAP_VERDICT = {
  plain: '⚠️ LDAP (389): kredensial terkirim PLAINTEXT — wajib diganti LDAPS.',
  secure: '🔒 LDAPS (636): kredensial terenkripsi SSL/TLS — sniffer hanya melihat sampah.',
} as const;

/* ───────── SMB versi ───────── */

export type SmbVersion = '1' | '2' | '3';
export type SmbTone = 'bad' | 'mid' | 'good';

export const SMB_VERDICTS: Record<SmbVersion, { tone: SmbTone; text: string }> = {
  '1': {
    tone: 'bad',
    text: '🔥 SMBv1 — celah fatal (EternalBlue / WannaCry, NTLMv1 signing opsional). WAJIB dinonaktifkan.',
  },
  '2': {
    tone: 'mid',
    text: '⚠️ SMBv2 — lebih baik, tapi signing masih bisa opsional: Relay masih mungkin. Naikkan ke v3 + Require Signing.',
  },
  '3': {
    tone: 'good',
    text: '✅ SMBv3 — enkripsi per-hop + SMB Signing diwajibkan → relay & sniffing diblokir.',
  },
};

export const SMB_PLACEHOLDER = 'Pilih versi SMB di kiri untuk menilai risikonya…';

export const smbVerdictClass = (version: SmbVersion | null): string =>
  version ? `smb-verdict ${SMB_VERDICTS[version].tone}` : 'smb-verdict';
