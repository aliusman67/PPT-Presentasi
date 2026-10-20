export type FsmoKey = 'schema' | 'dnaming' | 'pdc' | 'rid' | 'infra';
export type FsmoScope = 'forest' | 'domain';

export type FsmoRole = {
  name: string;
  scope: FsmoScope;
  /** HTML authored (dipakai lewat <Prose />). */
  text: string;
};

export const FSMO: Record<FsmoKey, FsmoRole> = {
  schema: {
    name: 'Schema Master',
    scope: 'forest',
    text: 'Satu-satunya DC yang boleh <strong>nulis schema</strong> — dipakai pas nambah atribut/objek baru (misal instal Exchange). Jarang disentuh, tapi kalau mati: semua perubahan schema batal.',
  },
  dnaming: {
    name: 'Domain Naming Master',
    scope: 'forest',
    text: 'Penjaga nama domain se-forest: cuma dia yang boleh nge-<em>approve</em> penambahan atau penghapusan domain dalam forest.',
  },
  pdc: {
    name: 'PDC Emulator',
    scope: 'domain',
    text: 'DC “paling sibuk” sehari-hari: sumber waktu semua mesin, tujuan pertama perubahan password &amp; lockout, editor default GPO. Kalau mati: password baru lama nyebar, jam mulai drift, editing GPO berantakan.',
  },
  rid: {
    name: 'RID Master',
    scope: 'domain',
    text: 'Ngebagiin <em>pool RID</em> (nomor seri) ke DC lain supaya SID user/group/computer baru nggak pernah dobel se-domain.',
  },
  infra: {
    name: 'Infrastructure Master',
    scope: 'domain',
    text: 'Nerjemahin SID ↔ nama untuk objek lintas domain. Klasik: jangan taruh dia di Global Catalog (kecuali forest-nya cuma satu domain) — kalau nggak, dia diem-diem nggak kerja.',
  },
};

export const FOREST_ROLES: readonly FsmoKey[] = ['schema', 'dnaming'];
export const DOMAIN_ROLES: readonly FsmoKey[] = ['pdc', 'rid', 'infra'];

export const scopeLabel = (scope: FsmoScope): string =>
  scope === 'forest' ? '🌳 Forest-wide' : '🏷️ Domain-wide';
