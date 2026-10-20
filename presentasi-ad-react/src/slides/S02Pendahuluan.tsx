import { useState } from 'react';
import { useInterval } from '../hooks/useInterval';

const PHONEBOOK_CYCLE_MS = 1800;

const PHONEBOOK_ROWS = [
  { type: '👤 User', name: 'john.doe', meta: 'Domain: corp.contoso.com' },
  { type: '🖥️ Computer', name: 'WS-FINANCE-01', meta: 'OU: Workstations' },
  { type: '🖨️ Printer', name: 'HP-MPA01', meta: 'Site: Jakarta' },
  { type: '👥 Group', name: 'Tier0-Admins', meta: 'Scope: Global' },
] as const;

export function S02Pendahuluan() {
  const [litRow, setLitRow] = useState(0);

  useInterval(() => setLitRow((k) => (k + 1) % PHONEBOOK_ROWS.length), PHONEBOOK_CYCLE_MS);

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">01 · Pendahuluan</span>
        <h2 data-reveal>Apa itu Active Directory?</h2>
      </header>

      <div className="cols">
        <div className="col" data-reveal>
          <p className="lead">
            <strong>Active Directory (AD)</strong> adalah layanan direktori{' '}
            <em>proprietary</em> Microsoft untuk Windows Server — pusat penyimpanan data terstruktur
            mengenai seluruh entitas jaringan: pengguna, komputer, grup, aplikasi, dan perangkat keras.
          </p>
          <ul className="ticks">
            <li>
              <strong>Otentikasi</strong> — memverifikasi identitas.
            </li>
            <li>
              <strong>Otorisasi</strong> — menentukan hak akses.
            </li>
            <li>
              <strong>Kebijakan</strong> — manajemen terpusat dari satu titik.
            </li>
          </ul>
        </div>

        <div className="col analogy" data-reveal>
          <h3>📒 Analogi</h3>
          <p>
            AD adalah <strong>“buku telepon digital terenkripsi”</strong> — administrator mengelola
            identitas &amp; hak akses secara konsisten dari satu titik pusat.
          </p>
          <div className="phonebook">
            {PHONEBOOK_ROWS.map((row, i) => (
              <div key={row.name} className={i === litRow ? 'pb-row lit' : 'pb-row'}>
                <span className="pb-type">{row.type}</span> {row.name} <em>{row.meta}</em>
              </div>
            ))}
          </div>
          <p className="mini">
            ✦ Setiap objek memiliki <em>attributes</em> yang dapat dicari (LDAP query).
          </p>
        </div>
      </div>
    </div>
  );
}
