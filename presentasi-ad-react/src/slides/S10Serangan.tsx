import { Fragment, useState } from 'react';
import { Prose } from '../components/Prose';
import { ATTACKS, SEVERITY_LEVELS, isSeverityOn } from '../content/attacks';

const FLOW_PREVIEW_STYLE = { marginTop: 2 } as const;

export function S10Serangan() {
  // Versi vanilla langsung meng-klik kartu pertama saat load — state awal ikut 0.
  const [selected, setSelected] = useState(0);
  const attack = ATTACKS[selected]!;

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">06 · Common Attacks</span>
        <h2 data-reveal>
          Serangan Umum pada AD <span className="tag-live">● klik kartu</span>
        </h2>
      </header>

      <div className="atk-layout" data-reveal>
        <div className="atk-grid">
          {ATTACKS.map((entry, i) => (
            <button
              key={entry.key}
              type="button"
              className={i === selected ? 'atk-card active' : 'atk-card'}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
            >
              <span className="atk-cat">{entry.category}</span>
              <h4>{entry.name}</h4>
              <span className="sev" aria-label={`Severity ${entry.severity} dari 5`}>
                {SEVERITY_LEVELS.map((level) => (
                  <i key={level} className={isSeverityOn(entry.severity, level) ? 'on' : undefined} />
                ))}
              </span>
              <p className="mini" style={FLOW_PREVIEW_STYLE}>
                {entry.flow[2]}
              </p>
            </button>
          ))}
        </div>

        <aside className="atk-panel" aria-live="polite">
          <h3>⚔️ {attack.name}</h3>

          <div className="atk-flow">
            {attack.flow.map((step, i) => (
              <Fragment key={`${attack.key}-${step}`}>
                {i > 0 && <em>→</em>}
                <span>{step}</span>
              </Fragment>
            ))}
          </div>

          <div className="atk-sec">
            <h5>Deskripsi</h5>
            <Prose as="p" html={attack.how} />
          </div>
          <div className="atk-sec">
            <h5>Kenapa ini bisa terjadi? 🧨 (root cause)</h5>
            <Prose as="p" html={attack.why} />
          </div>
          <div className="atk-fix">🛡️ Penangkal: {attack.fix}</div>
        </aside>
      </div>
    </div>
  );
}
