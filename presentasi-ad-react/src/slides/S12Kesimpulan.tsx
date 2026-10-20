import { useDeckNavigator } from '../components/DeckContext';

export function S12Kesimpulan() {
  const deck = useDeckNavigator();

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">08 · Kesimpulan</span>
        <h2 data-reveal>
          AD adalah <span className="grad">pilar identitas</span> — dan medan perang utama.
        </h2>
      </header>

      <ol className="takeaways" data-reveal>
        <li>
          Pahami <strong>mekanisme Kerberos</strong>: tiket, bukan password, yang berpindah.
        </li>
        <li>
          Kenali <strong>titik lemah tiap protokol</strong>: NTLM, LDAP plaintext, SMBv1.
        </li>
        <li>
          Serangan AD mengeksploitasi <strong>fitur bawaan</strong> — bukan malware eksotis:
          Kerberoasting, DCSync, Golden Ticket.
        </li>
        <li>
          Bertahan dengan <strong>tiering + LAPS + gMSA + mati protokol legacy</strong>.
        </li>
      </ol>

      <p className="lead" data-reveal>
        Krusial untuk pertahanan era hibrida — <em>On-Premises</em> &amp; <em>Entra ID</em>. 🎓
      </p>

      <div className="end-ctrl" data-reveal>
        <button type="button" className="btn primary" onClick={() => deck.go(0)}>
          ↺ Mulai dari awal
        </button>
        <span className="dim">Sumber: active_directory_research.md</span>
      </div>
    </div>
  );
}
