const HERO_DOT_COUNT = 30;
const HERO_TWINKLE_MAX_S = 3.2;

/** Di-generate sekali di module scope supaya posisinya stabil antar render. */
const HERO_DOTS = Array.from({ length: HERO_DOT_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * HERO_TWINKLE_MAX_S}s`,
}));

export function S01Judul() {
  return (
    <>
      <div className="hero-bg" aria-hidden="true">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="orb o3" />
        <div className="net">
          {HERO_DOTS.map((dot) => (
            <span key={dot.id} style={{ left: dot.left, top: dot.top, animationDelay: dot.delay }} />
          ))}
        </div>
      </div>

      <div className="slide-inner hero-inner">
        <p className="eyebrow" data-reveal>
          🛡️ Riset Infrastruktur &amp; Keamanan TI
        </p>
        <h1 data-reveal>
          Active
          <br />
          <span className="grad">Directory</span>
        </h1>
        <p className="hero-sub" data-reveal>
          Riset komprehensif: arsitektur, protokol autentikasi, vektor serangan, dan strategi{' '}
          <em>hardening</em>.
        </p>
        <div className="chips" data-reveal>
          <span className="chip">Otentikasi</span>
          <span className="chip">Otorisasi</span>
          <span className="chip">Manajemen Kebijakan</span>
        </div>
        <p className="hint" data-reveal>
          <kbd>→</kbd> / <kbd>Space</kbd> lanjut &nbsp;·&nbsp; <kbd>Esc</kbd> daftar slide &nbsp;·&nbsp;{' '}
          <kbd>F</kbd> layar penuh
        </p>
      </div>
    </>
  );
}
