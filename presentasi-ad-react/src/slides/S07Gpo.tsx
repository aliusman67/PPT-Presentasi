import { Fragment, useEffect, useState } from 'react';
import { useInterval } from '../hooks/useInterval';

const STAGES = [
  { letter: 'L', label: 'Local Policy' },
  { letter: 'S', label: 'Site' },
  { letter: 'D', label: 'Domain' },
  { letter: 'OU', label: 'Organizational Unit' },
] as const;

const VALUES = [7, 8, 10, 14] as const;
const STEP_MS = 850;
const LAST = STAGES.length;
const IDLE = -1;

const RESULT_IDLE = 'Tekan ▶ untuk melihat proses evaluasi…';
const RESULT_WIN =
  '🏆 Yang menang: OU → minimal 14 karakter. Urutannya L→S→D→O, dan yang terakhir nulis yang keliatan (“last write wins”). Pengecualian: GPO berstatus Enforced bisa nembus urutan ini.';

/** -1 = belum diputar; >= LAST = semua tahap sudah dievaluasi. */
export function gpoResult(pos: number): string {
  if (pos < 0) return RESULT_IDLE;
  if (pos >= LAST) return RESULT_WIN;
  return `GPO dievaluasi… nilai aktif sekarang: ${VALUES[pos]} — yang belakangan nulis, yang menang`;
}

export function S07Gpo() {
  const [pos, setPos] = useState(IDLE);
  const [playing, setPlaying] = useState(false);

  const done = pos >= LAST;

  useInterval(() => setPos((p) => Math.min(p + 1, LAST)), playing ? STEP_MS : null);

  useEffect(() => {
    if (playing && done) setPlaying(false);
  }, [playing, done]);

  const play = (): void => {
    setPos(IDLE);
    setPlaying(true);
  };

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">04 · Group Policy Object</span>
        <h2 data-reveal>
          Urutan Eksekusi GPO: <span className="lsdou">L S D O U</span>
          <button type="button" className="btn play" onClick={play} disabled={playing}>
            ▶ Putar urutan
          </button>
        </h2>
      </header>

      <div className="gpo-pipe" data-reveal>
        {STAGES.map((stage, i) => {
          // Tahap terakhir tetap menyala saat evaluasi selesai — sama seperti versi
          // vanilla, kelas "hit" tidak dilepas ketika "winner" dipasang.
          const isLastStage = i === LAST - 1;
          const classes = [
            'gpo-stage',
            pos === i || (done && isLastStage) ? 'hit' : undefined,
            done && isLastStage ? 'winner' : undefined,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Fragment key={stage.letter}>
              <div className={classes} data-i={i}>
                <b>{stage.letter}</b>
                <span>{stage.label}</span>
                <em className="gpo-val">{pos >= i ? `min length = ${VALUES[i]}` : ''}</em>
              </div>
              {isLastStage ? null : <div className="gpo-arrow">→</div>}
            </Fragment>
          );
        })}
      </div>

      <div className="gpo-case" data-reveal>
        <p className="mini">
          Skenario: kebijakan <code>Minimal password length</code> diset di 4 level — siapa yang menang?
        </p>
        <div className={done ? 'gpo-result win' : 'gpo-result'} aria-live="polite">
          {gpoResult(pos)}
        </div>
      </div>

      <p className="mini dim" data-reveal>
        Pengecualian: GPO berstatus <strong>Enforced</strong> / <strong>No Override</strong> dapat
        memenangkan perdebatan meski levelnya lebih awal.
      </p>
    </div>
  );
}
