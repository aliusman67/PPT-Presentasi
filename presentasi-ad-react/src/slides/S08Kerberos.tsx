import { useEffect, useState } from 'react';
import { Prose } from '../components/Prose';
import { useInterval } from '../hooks/useInterval';
import {
  ACTORS,
  KERB_STEPS,
  TOKENS,
  AUTOPLAY_MS,
  TOKEN_SLOT_DY,
  protocolLine,
  type ActorKey,
  type TokenKey,
} from '../content/kerberos';

const ACTOR_KEYS = Object.keys(ACTORS) as ActorKey[];
const TOKEN_KEYS = Object.keys(TOKENS) as TokenKey[];
const LAST_STEP = KERB_STEPS.length - 1;

export function S08Kerberos() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  const current = KERB_STEPS[step];
  const stopAuto = (): void => setAuto(false);
  const goTo = (index: number): void => {
    setAuto(false);
    setStep(Math.max(0, Math.min(LAST_STEP, index)));
  };

  useInterval(() => setStep((s) => Math.min(s + 1, LAST_STEP)), auto ? AUTOPLAY_MS : null);

  // Auto-play berhenti sendiri begitu langkah terakhir tercapai.
  useEffect(() => {
    if (auto && step >= LAST_STEP) setAuto(false);
  }, [auto, step]);

  const startAuto = (): void => {
    if (auto) {
      stopAuto();
      return;
    }
    if (step === LAST_STEP) setStep(0);
    setAuto(true);
  };

  return (
    <div className="slide-inner kerb-slide">
      <header className="slide-head">
        <span className="kicker">05 · Protokol Autentikasi Utama</span>
        <h2 data-reveal>
          Kerberos — Analogi Taman Bermain <span className="tag-live">● simulasi interaktif</span>
        </h2>
      </header>

      <div className="kerb-layout">
        <div className="kerb-scene" data-reveal aria-label="Simulasi Kerberos">
          {ACTOR_KEYS.map((key) => {
            const actor = ACTORS[key];
            const classes = [
              'actor',
              current.glow.includes(key) ? 'glow' : undefined,
              current.grant && key === 'server' ? 'granted' : undefined,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={key}
                className={classes}
                style={{ left: `${actor.x}%`, top: `${actor.y}%` }}
              >
                <span className="a-ic">{actor.icon}</span>
                <span className="a-name">
                  {actor.name}
                  <br />
                  <span className="a-sub">{actor.sub}</span>
                </span>
              </div>
            );
          })}

          {TOKEN_KEYS.map((key) => {
            const token = TOKENS[key];
            const placement = current.tokens[key];
            const actor = ACTORS[placement.at];
            const classes = [
              'token',
              token.className,
              placement.state === 'idle' ? undefined : placement.state,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={key}
                className={classes}
                style={{ left: `${actor.x}%`, top: `${actor.y - TOKEN_SLOT_DY}%` }}
              >
                {token.label}
              </div>
            );
          })}
        </div>

        <div className="kerb-side" data-reveal>
          <div className="kerb-tagline">{protocolLine(current.tag)}</div>
          <h3>{current.title}</h3>
          <Prose as="p" html={current.description} />

          <div className="kerb-dots">
            {KERB_STEPS.map((entry, i) => (
              <button
                key={entry.tag || `step-${i}`}
                type="button"
                className={i === step ? 'kdot on' : 'kdot'}
                title={`Langkah ${i}`}
                aria-label={`Langkah ${i}: ${entry.title}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <div className="kerb-ctrl">
            <button type="button" className="btn" onClick={() => goTo(step - 1)} disabled={step === 0}>
              ← Sebelumnya
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => goTo(step + 1)}
              disabled={step === LAST_STEP}
            >
              Berikutnya →
            </button>
            <button type="button" className="btn ghost" onClick={() => goTo(0)}>
              ↺
            </button>
            <button type="button" className="btn ghost" onClick={startAuto} aria-pressed={auto}>
              {auto ? '⏸ Stop' : '▶▶ Auto'}
            </button>
          </div>

          <p className="mini">
            🔑 Inti: <strong>password tidak pernah melintasi jaringan</strong> — yang berpindah hanya
            tiket yang ditandatangani KDC.
          </p>
        </div>
      </div>
    </div>
  );
}
