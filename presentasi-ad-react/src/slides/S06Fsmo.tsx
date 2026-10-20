import { useState } from 'react';
import { Prose } from '../components/Prose';
import { DOMAIN_ROLES, FOREST_ROLES, FSMO, scopeLabel, type FsmoKey, type FsmoScope } from '../content/fsmo';

const MUTED_TEXT = { color: 'var(--muted)', fontSize: '.92rem' } as const;
const SCOPE_CHIP = { fontSize: '.68rem', padding: '2px 10px', marginLeft: 8 } as const;

type ScopeColumnProps = {
  scope: FsmoScope;
  heading: string;
  count: string;
  roles: readonly FsmoKey[];
  activeScope: FsmoScope | null;
  activeRole: FsmoKey | null;
  onPick: (role: FsmoKey) => void;
};

function ScopeColumn({ scope, heading, count, roles, activeScope, activeRole, onPick }: ScopeColumnProps) {
  return (
    <div className={activeScope === scope ? `fmso-scope ${scope} hl` : `fmso-scope ${scope}`} data-reveal>
      <h3>
        {heading} <small>{count}</small>
      </h3>
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          className={role === activeRole ? 'fmso-role active' : 'fmso-role'}
          aria-pressed={role === activeRole}
          onClick={() => onPick(role)}
        >
          {FSMO[role].name}
        </button>
      ))}
    </div>
  );
}

export function S06Fsmo() {
  const [activeRole, setActiveRole] = useState<FsmoKey | null>(null);
  const role = activeRole ? FSMO[activeRole] : null;

  return (
    <div className="slide-inner">
      <header className="slide-head">
        <span className="kicker">04 · Konsep Kunci Operasional</span>
        <h2 data-reveal>
          FSMO Roles — 5 Kursi Singleton <span className="tag-live">● klik peran</span>
        </h2>
      </header>

      <p className="mini center" data-reveal>
        Hanya boleh dijalankan <strong>satu DC</strong> pada satu waktu per cakupan.
      </p>

      <div className="fmso-cols">
        <ScopeColumn
          scope="forest"
          heading="🌳 Forest-wide"
          count="1 per forest"
          roles={FOREST_ROLES}
          activeScope={role?.scope ?? null}
          activeRole={activeRole}
          onPick={setActiveRole}
        />
        <ScopeColumn
          scope="domain"
          heading="🏷️ Domain-wide"
          count="1 per domain"
          roles={DOMAIN_ROLES}
          activeScope={role?.scope ?? null}
          activeRole={activeRole}
          onPick={setActiveRole}
        />
      </div>

      <div className={role ? 'fmso-detail show' : 'fmso-detail'} data-reveal aria-live="polite">
        {role ? (
          <>
            <strong style={{ color: 'var(--accent2)' }}>{role.name}</strong>
            <span className="chip" style={SCOPE_CHIP}>
              {scopeLabel(role.scope)}
            </span>
            <br />
            <Prose as="span" style={MUTED_TEXT} html={role.text} />
          </>
        ) : (
          <span className="dim">Klik salah satu peran untuk melihat fungsinya…</span>
        )}
      </div>
    </div>
  );
}
