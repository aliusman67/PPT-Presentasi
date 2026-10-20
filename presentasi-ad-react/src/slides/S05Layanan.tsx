import { useState, type ReactNode } from 'react';

type Service = {
  key: string;
  short: string;
  label: string;
  title: ReactNode;
  body: ReactNode;
  bar: readonly string[];
};

const SERVICES: readonly Service[] = [
  {
    key: 'ds',
    short: 'AD DS',
    label: 'Domain Services',
    title: '🧱 Active Directory Domain Services',
    body: (
      <>
        Inti dari semuanya: <strong>menyimpan data jaringan</strong> dan mengelola interaksi pengguna
        dengan domain. Otentikasi, otorisasi, replikasi, GPO — semua lewat AD DS.
      </>
    ),
    bar: ['Penyimpanan', 'Otentikasi', 'Replikasi', 'GPO'],
  },
  {
    key: 'lds',
    short: 'AD LDS',
    label: 'Lightweight DS',
    title: '🪶 Active Directory Lightweight Directory Services',
    body: (
      <>
        Layanan direktori <strong>independen berbasis LDAP</strong> — ringan, bisa beberapa instance
        dalam satu server, tanpa perlu jadi Domain Controller.
      </>
    ),
    bar: ['LDAP murni', 'Multi-instance', 'Untuk aplikasi'],
  },
  {
    key: 'cs',
    short: 'AD CS',
    label: 'Certificate Services',
    title: '🔐 Active Directory Certificate Services',
    body: (
      <>
        Infrastruktur kunci publik (<strong>PKI</strong>) untuk menerbitkan sertifikat digital: HTTPS
        internal, smart card, signing, enkripsi email.
      </>
    ),
    bar: ['CA', 'Sertifikat', 'PKI', 'Smartcard'],
  },
  {
    key: 'rms',
    short: 'AD RMS',
    label: 'Rights Management',
    title: '📜 Active Directory Rights Management Services',
    body: (
      <>
        Manajemen hak akses <strong>dokumen</strong> (DRM): larang cetak, forward, atau buka file di
        luar organisasi — bahkan setelah file dikirimin.
      </>
    ),
    bar: ['Doc lockdown', 'No forward', 'Ekspor dibatasi'],
  },
  {
    key: 'fs',
    short: 'AD FS',
    label: 'Federation Services',
    title: '🌐 Active Directory Federation Services',
    body: (
      <>
        Layanan identitas <strong>federasi</strong> dan <em>Single Sign-On</em> (SSO) — jembatan
        ON-PREM ↔ cloud (contoh: SSO ke M365/Entra ID).
      </>
    ),
    bar: ['SSO', 'Trust antar-org', 'Token claims'],
  },
];

export function S05Layanan() {
  const [active, setActive] = useState(SERVICES[0]!.key);
  const pane = SERVICES.find((service) => service.key === active) ?? SERVICES[0]!;

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">03 · Komponen Layanan Utama</span>
        <h2 data-reveal>
          Satu “AD”, Lima Layanan <span className="tag-live">● pilih tab</span>
        </h2>
      </header>

      <div className="svc-wrap" data-reveal>
        <nav className="svc-tabs" aria-label="Layanan Active Directory">
          {SERVICES.map((service) => (
            <button
              key={service.key}
              type="button"
              className={service.key === active ? 'svc-tab active' : 'svc-tab'}
              aria-label={`${service.short} ${service.label}`}
              aria-pressed={service.key === active}
              onClick={() => setActive(service.key)}
            >
              <b>{service.short}</b>
              <span>{service.label}</span>
            </button>
          ))}
        </nav>

        <div className="svc-panes">
          <div className="svc-pane active" data-svc={pane.key}>
            <h3>{pane.title}</h3>
            <p>{pane.body}</p>
            <div className="svc-bar">
              {pane.bar.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
