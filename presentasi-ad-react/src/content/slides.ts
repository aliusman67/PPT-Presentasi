import type { ComponentType } from 'react';
import { S01Judul } from '../slides/S01Judul';
import { S02Pendahuluan } from '../slides/S02Pendahuluan';
import { S03ArsitekturLogis } from '../slides/S03ArsitekturLogis';
import { S04ArsitekturFisik } from '../slides/S04ArsitekturFisik';
import { S05Layanan } from '../slides/S05Layanan';
import { S06Fsmo } from '../slides/S06Fsmo';
import { S07Gpo } from '../slides/S07Gpo';
import { S08Kerberos } from '../slides/S08Kerberos';
import { S09Protokol } from '../slides/S09Protokol';
import { S10Serangan } from '../slides/S10Serangan';
import { S11Hardening } from '../slides/S11Hardening';
import { S12Kesimpulan } from '../slides/S12Kesimpulan';

export type SlideVariant = 'hero' | 'end';

export type SlideMeta = {
  readonly id: string;
  /** Judul pendek: dipakai footer, tooltip titik navigasi, dan overlay daftar slide. */
  readonly title: string;
  /** Baris deskripsi di overlay. Di versi vanilla nilai ini dibaca dari DOM — sekarang deklaratif. */
  readonly blurb: string;
  readonly variant?: SlideVariant;
  readonly Component: ComponentType;
};

export const SLIDES: readonly SlideMeta[] = [
  { id: 'judul', title: 'Judul', blurb: 'Riset komprehensif AD', variant: 'hero', Component: S01Judul },
  { id: 'pendahuluan', title: 'Pendahuluan', blurb: 'Bagian Pendahuluan', Component: S02Pendahuluan },
  {
    id: 'arsitektur-logis',
    title: 'Arsitektur Logis',
    blurb: 'Bagian Arsitektur — Komponen Logis',
    Component: S03ArsitekturLogis,
  },
  {
    id: 'arsitektur-fisik',
    title: 'Arsitektur Fisik',
    blurb: 'Bagian Arsitektur — Komponen Fisik',
    Component: S04ArsitekturFisik,
  },
  { id: 'layanan', title: 'Layanan AD', blurb: 'Bagian Komponen Layanan Utama', Component: S05Layanan },
  { id: 'fsmo', title: 'FSMO Roles', blurb: 'Bagian Konsep Kunci Operasional', Component: S06Fsmo },
  { id: 'gpo', title: 'GPO · LSDOU', blurb: 'Bagian Group Policy Object', Component: S07Gpo },
  { id: 'kerberos', title: 'Kerberos', blurb: 'Bagian Protokol Autentikasi Utama', Component: S08Kerberos },
  {
    id: 'protokol-lain',
    title: 'Protokol Lain',
    blurb: 'Bagian Protokol Pendukung & Kelemahannya',
    Component: S09Protokol,
  },
  { id: 'serangan', title: 'Serangan Umum', blurb: 'Bagian Common Attacks', Component: S10Serangan },
  { id: 'hardening', title: 'Hardening', blurb: 'Bagian Strategi Pengamanan', Component: S11Hardening },
  { id: 'kesimpulan', title: 'Kesimpulan', blurb: 'Ringkasan & penutup', variant: 'end', Component: S12Kesimpulan },
];
