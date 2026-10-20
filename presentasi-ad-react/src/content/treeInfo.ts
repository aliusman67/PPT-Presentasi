export type TreeKey =
  | 'forest'
  | 'tree'
  | 'child'
  | 'domain2'
  | 'domain'
  | 'ou'
  | 'user'
  | 'group'
  | 'computer';

export type TreeInfo = {
  title: string;
  /** HTML authored (dipakai lewat <Prose />). */
  body: string;
  tags: readonly string[];
};

export const TREE_INFO: Record<TreeKey, TreeInfo> = {
  forest: {
    title: '🌳 Forest',
    body: 'Level paling atas — satu “kerajaan” AD. Semua domain di dalamnya sepakat pakai satu <em>Schema</em> (definisi tipe objek &amp; atribut), <em>Configuration Partition</em>, dan <em>Global Catalog</em> (indeks pencarian lintas domain).',
    tags: ['Schema', 'Global Catalog', 'Config Partition'],
  },
  tree: {
    title: '🌲 Domain Tree',
    body: 'Kumpulan domain yang nyambung lewat <em>trust relationship</em> berantai: kalau A percaya B dan B percaya C, A–C ikut percaya (<em>transitive</em>). Masih satu “keluarga” nama: contoso.com → corp.contoso.com.',
    tags: ['Trust transitive'],
  },
  child: {
    title: '↳ Child Domain',
    body: 'Domain di bawah nama induknya — misal <code>finance.corp.contoso.com</code>. Boleh punya DC sendiri, tapi tetap satu trust sama keluarga besarnya.',
    tags: ['Namespace berlanjut'],
  },
  domain2: {
    title: '🌲 Domain Lain',
    body: 'Namanya beda total (<code>otherdomain.com</code>) tapi masih satu forest — tetap berbagi schema &amp; global catalog yang sama, dan trust-nya otomatis.',
    tags: ['Cross-tree trust'],
  },
  domain: {
    title: '🏷️ Domain',
    body: 'Batas <strong>administrasi &amp; keamanan</strong>: user, grup, dan policy di domain A nggak otomatis ngerti domain B. Ini juga unit replikasi — DC cuma nyalin data domain-nya sendiri.',
    tags: ['Security boundary', 'Unit replikasi'],
  },
  ou: {
    title: '📁 Organizational Unit (OU)',
    body: 'Folder di dalam domain buat ngelompokin objek — dan level <strong>paling bawah</strong> yang bisa dikasih GPO langsung. Catatan penting: OU itu kontainer administrasi, <em>bukan</em> security boundary.',
    tags: ['Target GPO', 'Kontainer'],
  },
  user: {
    title: '👤 User Object',
    body: 'Unit paling dasar AD. Atributnya lengkap: nama, email, SID, UPN, sampai <strong>hash password</strong> di atribut <code>unicodePwd</code> — inilah harta karun yang diincer DCSync.',
    tags: ['Objek'],
  },
  group: {
    title: '👥 Group Object',
    body: 'Cara praktis ngasih izin ke banyak orang sekaligus. Ingat scope-nya: Global, Domain Local, Universal.',
    tags: ['Objek', 'Scope'],
  },
  computer: {
    title: '🖥️ Computer Object',
    body: 'Setiap mesin yang join domain punya akun komputer — passwordnya auto-rotate ±30 hari dan dipakai mesin buat autentikasi ke DC.',
    tags: ['Objek'],
  },
};

export type TreeLevel = 'forest' | 'domain' | 'ou' | 'obj';

export type TreeNode = {
  /** Stabil & unik — dipakai sebagai key React dan ID state lipat. */
  id: string;
  info: TreeKey;
  label: string;
  note?: string;
  level: TreeLevel;
  /** Menandai node yang dapat highlight `open-target` (domain utama). */
  openTarget?: boolean;
  children?: readonly TreeNode[];
};

export const TREE: readonly TreeNode[] = [
  {
    id: 'forest',
    info: 'forest',
    level: 'forest',
    label: '🌳 Forest',
    note: 'tingkat tertinggi',
    children: [
      {
        id: 'tree-corp',
        info: 'tree',
        level: 'domain',
        label: '🌲 Domain Tree',
        note: 'corp.contoso.com',
        children: [
          {
            id: 'child-finance',
            info: 'child',
            level: 'domain',
            label: '↳ Child Domain',
            note: 'finance.corp.contoso.com',
          },
        ],
      },
      {
        id: 'domain-other',
        info: 'domain2',
        level: 'domain',
        label: '🌲 Domain',
        note: 'otherdomain.com',
      },
    ],
  },
  {
    id: 'domain-corp',
    info: 'domain',
    level: 'domain',
    label: '🏷️ Domain',
    note: 'corp.contoso.com — batas administrasi & keamanan',
    openTarget: true,
    children: [
      {
        id: 'ou-users',
        info: 'ou',
        level: 'ou',
        label: '📁 OU “Users”',
        note: 'kontainer hierarkis',
        children: [
          { id: 'obj-user', info: 'user', level: 'obj', label: '👤 User — john.doe' },
          { id: 'obj-group', info: 'group', level: 'obj', label: '👥 Group — HelpDesk' },
        ],
      },
      {
        id: 'ou-servers',
        info: 'ou',
        level: 'ou',
        label: '📁 OU “Servers”',
        children: [{ id: 'obj-computer', info: 'computer', level: 'obj', label: '🖥️ Computer — DC01' }],
      },
    ],
  },
];

export const TREE_DEFAULT_INFO = {
  title: 'Pilih sebuah node',
  body:
    'Setiap komponen logis punya peran spesifik — dari <em>Objects</em> sebagai unit dasar hingga <em>Forest</em> sebagai puncak hierarki yang berbagi Schema, Configuration Partition, dan Global Catalog.',
} as const;
