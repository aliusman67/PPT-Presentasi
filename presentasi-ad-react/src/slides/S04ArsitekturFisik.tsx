import { useEffect, useState } from 'react';

const NTDS_PATH = '%SystemRoot%\\NTDS\\ntds.dit';
const NOTE_DEFAULT = '💡 proteksi NTDS.dit = proteksi seluruh domain';
const NOTE_COPIED = '✅ Disalin! Lokasi default database AD.';
const COPIED_RESET_MS = 1500;

const SUBNETS = [
  { site: 'Site-JKT', cidr: '10.0.1.0/24' },
  { site: 'Site-SBY', cidr: '10.0.2.0/24' },
  { site: 'Site-SG', cidr: '172.16.0.0/22' },
] as const;

export function S04ArsitekturFisik() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyPath = async (): Promise<void> => {
    // Feedback visual langsung; panggilan clipboard jalan di belakangnya.
    // (Versi vanilla juga selalu menandai "Disalin!" meski clipboard ditolak browser.)
    setCopied(true);
    try {
      await navigator.clipboard.writeText(NTDS_PATH);
    } catch {
      /* Clipboard bisa diblokir browser. */
    }
  };

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">02 · Arsitektur — Komponen Fisik</span>
        <h2 data-reveal>Komponen Fisik AD</h2>
      </header>

      <div className="phys-grid">
        <article className="card" data-reveal>
          <div className="card-ic">🗄️</div>
          <h3>Domain Controller (DC)</h3>
          <p>
            Server yang menjalankan layanan <strong>AD DS</strong>, menyimpan salinan database AD, dan
            menangani proses otentikasi.
          </p>
          <div className="dc-anim">
            <div className="dc-rack">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="dc-pulse" />
          </div>
        </article>

        <article className="card" data-reveal>
          <div className="card-ic">📍</div>
          <h3>Sites</h3>
          <p>
            Pengelompokan <strong>fisik</strong> berdasarkan satu atau lebih subnet IP — mengoptimalkan
            lalu lintas replikasi AD.
          </p>
          <ul className="subnets">
            {SUBNETS.map((subnet) => (
              <li key={subnet.site}>
                <b>{subnet.site}</b> {subnet.cidr}
              </li>
            ))}
          </ul>
        </article>

        <article className="card" data-reveal>
          <div className="card-ic">🗃️</div>
          <h3>AD Database — NTDS.dit</h3>
          <p>Berkas database fisik berisi seluruh objek &amp; hash. Klik untuk menyalin lokasinya:</p>
          <button type="button" className={copied ? 'term copied' : 'term'} onClick={() => void copyPath()}>
            {NTDS_PATH}
          </button>
          <p className="mini">{copied ? NOTE_COPIED : NOTE_DEFAULT}</p>
        </article>
      </div>
    </div>
  );
}
