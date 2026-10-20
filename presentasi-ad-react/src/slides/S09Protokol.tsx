import { useState, type ChangeEvent, type ReactNode } from 'react';
import {
  LDAP_PLAIN,
  LDAP_VERDICT,
  NTLM_BUTTON_LABEL,
  NTLM_IDLE,
  SMB_PLACEHOLDER,
  SMB_VERDICTS,
  advanceNtlm,
  makeSecureLines,
  smbVerdictClass,
  type NtlmState,
  type PacketLine,
  type SmbVersion,
} from '../content/protocols';

type ProtoKey = 'ntlm' | 'ldap' | 'smb';

const TABS: readonly { key: ProtoKey; label: string }[] = [
  { key: 'ntlm', label: 'NTLM' },
  { key: 'ldap', label: 'LDAP / LDAPS' },
  { key: 'smb', label: 'SMB' },
];

function Pane({
  proto,
  active,
  children,
}: {
  proto: ProtoKey;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={active ? 'proto-pane active' : 'proto-pane'}
      data-proto={proto}
      data-reveal
      role="tabpanel"
      id={`proto-pane-${proto}`}
      aria-labelledby={`proto-tab-${proto}`}
    >
      {children}
    </div>
  );
}

function NtlmPane() {
  const [ntlm, setNtlm] = useState<NtlmState>(NTLM_IDLE);

  return (
    <div className="cols">
      <div className="col">
        <h3>
          🪙 Challenge–Response <em>(legacy)</em>
        </h3>
        <p>
          Protokol warisan. Alurnya: server ngirim <strong>challenge</strong> acak, klien menjawab
          dengan enkripsi berbasis <em>hash password</em>. Password utuh memang nggak pernah dikirim —
          tapi jawabannya tetap bisa disalahgunakan lewat dua jalur: hash-nya bisa dipakai langsung
          sebagai kunci (<strong>Pass-the-Hash</strong>), dan jawabannya nggak terikat ke sesi tertentu
          sehingga bisa diteruskan ke server lain (<strong>Relay</strong>). NTLMv1 wajib dimatikan; NTLM
          sepenuhnya cukup jadi <em>fallback</em> saja.
        </p>
        <div className="ntlm-demo">
          <button type="button" className="btn small" onClick={() => setNtlm((s) => advanceNtlm(s))}>
            {NTLM_BUTTON_LABEL[ntlm.phase]}
          </button>
          <div className="ntlm-out">
            <div>
              <span className="lbl">Server →</span> <code>{ntlm.challenge}</code>
            </div>
            <div>
              <span className="lbl">Client →</span> <code>{ntlm.response}</code>
            </div>
          </div>
        </div>
      </div>
      <div className="col warn-col">
        <div className="warn-card">⚠️ NTLM = fallback. Matikan bila Kerberos tersedia penuh.</div>
      </div>
    </div>
  );
}

function LdapPane() {
  const [tls, setTls] = useState(false);
  const [lines, setLines] = useState<readonly PacketLine[]>(LDAP_PLAIN);

  const onToggle = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.checked;
    setTls(next);
    // Nilai acak dihitung sekali per toggle — bukan per render.
    setLines(next ? makeSecureLines() : LDAP_PLAIN);
  };

  return (
    <div className="cols">
      <div className="col">
        <h3>📖 LDAP (389) vs 🔒 LDAPS (636)</h3>
        <p>
          Protokol buat baca/tulis database AD. LDAP biasa (port 389) ngirim segalanya dalam{' '}
          <strong>plaintext</strong> — termasuk kredensial. Nyalakan switch di bawah dan lihat sendiri
          apa yang “tertangkap” sniffer di jaringan.
        </p>
        <label className="switch-row">
          <span>LDAP&nbsp;389</span>
          <input type="checkbox" checked={tls} onChange={onToggle} aria-label="Aktifkan LDAPS" />
          <span className="slider" />
          <span>LDAPS&nbsp;636</span>
        </label>
      </div>
      <div className="col">
        <h4>👁️ Tangkapan di jaringan (sniffer):</h4>
        <div className={tls ? 'pkt secure' : 'pkt'}>
          {lines.map((line) => (
            <div key={line.id}>{line.node}</div>
          ))}
        </div>
        <p className="mini">{tls ? LDAP_VERDICT.secure : LDAP_VERDICT.plain}</p>
      </div>
    </div>
  );
}

function SmbPane() {
  const [version, setVersion] = useState<SmbVersion | null>(null);

  return (
    <div className="cols">
      <div className="col">
        <h3>📂 Server Message Block</h3>
        <p>
          Protokol berbagi file &amp; printer — dan jalur distribusi Group Policy (folder SYSVOL). Pilih
          versinya untuk melihat risikonya:
        </p>
        <div className="smb-versions">
          {(['1', '2', '3'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={
                [
                  'smb-v',
                  v === '1' ? 'danger' : undefined,
                  v === '3' ? 'ok' : undefined,
                  v === version ? 'sel' : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')
              }
              aria-pressed={v === version}
              onClick={() => setVersion(v)}
            >
              SMBv{v}
            </button>
          ))}
        </div>
        <div className={smbVerdictClass(version)}>{version ? SMB_VERDICTS[version].text : SMB_PLACEHOLDER}</div>
      </div>
      <div className="col warn-col">
        <div className="warn-card danger">
          🔥 SMBv1 = lubang EternalBlue / WannaCry. Nonaktifkan total, wajibkan{' '}
          <strong>SMB Signing = Require</strong>.
        </div>
      </div>
    </div>
  );
}

export function S09Protokol() {
  const [tab, setTab] = useState<ProtoKey>('ntlm');

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">05 · Protokol Pendukung &amp; Kelemahannya</span>
        <h2 data-reveal>
          NTLM · LDAP · SMB <span className="tag-live">● coba tab</span>
        </h2>
      </header>

      <div className="proto-tabs" data-reveal role="tablist" aria-label="Protokol pendukung">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={entry.key === tab ? 'proto-tab active' : 'proto-tab'}
            role="tab"
            id={`proto-tab-${entry.key}`}
            aria-selected={entry.key === tab}
            aria-controls={`proto-pane-${entry.key}`}
            onClick={() => setTab(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/*
        Pane tetap ter-mount (seperti versi vanilla) supaya status demo — challenge NTLM,
        pilihan versi SMB — tidak hilang saat berpindah tab. Pane non-aktif disembunyikan
        oleh aturan CSS `.proto-pane{display:none}`.
      */}
      <Pane proto="ntlm" active={tab === 'ntlm'}>
        <NtlmPane />
      </Pane>
      <Pane proto="ldap" active={tab === 'ldap'}>
        <LdapPane />
      </Pane>
      <Pane proto="smb" active={tab === 'smb'}>
        <SmbPane />
      </Pane>
    </div>
  );
}
