# Presentasi Active Directory — versi React 19

Migrasi dari `../index.html` + `../script.js` (vanilla JS, ±30 KB DOM-manipulation) ke
**React 19 + TypeScript strict + Vite**. Konten, kelas CSS, dan `styles.css` identik dengan
aslinya — yang berubah hanya cara state-nya dikelola.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # sajikan hasil build
npm run typecheck  # hanya cek tipe
npm test           # vitest (44 test)
```

## Arsitektur

```
src/
├── main.tsx                 # createRoot + StrictMode + import stylesheet
├── App.tsx                  # perakit: deck state + chrome + 12 slide
├── styles/presentation.css  # salinan mentah styles.css asli (tidak diedit)
├── hooks/
│   ├── useDeck.ts           # mesin slide: reducer indeks, keyboard, swipe, hash #n, fullscreen
│   └── useInterval.ts       # interval deklaratif (delay = null berarti berhenti)
├── components/
│   ├── SlideFrame.tsx       # <section class="slide"> + state active/before + stagger reveal
│   ├── Chrome.tsx           # ProgressBar, Hud, DeckFooter (titik navigasi), Overview
│   ├── Prose.tsx            # render string HTML authored (isi data teks panjang)
│   ├── DeckContext.tsx      # navigasi deck untuk slide (tombol "Mulai dari awal")
│   └── ErrorBoundary.tsx    # dua lapis: chrome & isi slide
├── content/                 # data teks, dipisah dari tampilan
│   ├── slides.ts            # registry 12 slide: id, judul, blurb overlay, komponen
│   ├── treeInfo.ts          # definisi node hierarki logis + struktur pohon rekursif
│   ├── fsmo.ts              # 5 peran FSMO
│   ├── kerberos.ts          # aktor, token, 7 langkah simulasi
│   ├── attacks.ts           # 6 serangan (deskripsi + root cause + penangkal)
│   └── protocols.tsx        # transisi NTLM, baris packet capture, verdict SMB
├── slides/                  # S01Judul.tsx … S12Kesimpulan.tsx
└── test/                    # deck.test.tsx (navigasi) + slides.test.tsx (widget)
```

### Peta perubahan pola

| Versi vanilla | Versi React |
|---|---|
| `let idx = 0` + `go()` yang men-toggle class 8 elemen | `useDeck` reducer → `active`/`before` jadi turunan state |
| `document.createElement` untuk titik nav, daftar slide, kartu serangan, aktor & token | `.map()` atas data bertipe (`SLIDES`, `ATTACKS`, `ACTORS`, `TOKENS`) |
| `innerHTML = ...` untuk panel detail | state terpilih + render kondisional (`selectedId`, `activeRole`, `step`) |
| `classList.toggle` di 12 tempat | className dihitung dari state (`hit`/`winner`, `sel`, `hl`, `on`, `cur`, `copied`, `faded`/`granted`) |
| `setInterval` global (buku telepon, GPO, auto-play Kerberos) | `useInterval` / `setTimeout` dengan cleanup otomatis |
| `$$("[data-reveal]")` lalu `style.transitionDelay` | tetap imperatif, diringkus di `SlideFrame` (satu-satunya escape hatch) |
| `data-title` + scraping `.kicker` untuk deskripsi overlay | field `title` & `blurb` di `content/slides.ts` |
| ID DOM (`#tiBody`, `#kerbNext`, …) | dihapus — tidak ada rule CSS yang menarget ID, state menggantikannya |

## Catatan perilaku

Yang **sama**: seluruh teks Indonesia, urutan 12 slide, navigasi keyboard (panah, spasi, `n`/`p`,
Home/End, Esc, `o`, `f`), swipe sentuh (ambang 64 px, rasio 1.4), deep-link `#n`, ritme animasi
(110 ms stagger, 850 ms/tahap GPO, 2600 ms auto-play Kerberos, 1800 ms buku telepon), dan
`prefers-reduced-motion` dari stylesheet asli.

Yang **berbeda** (disengaja):

1. **First paint lebih cepat** — `.active` sudah terpasang pada render pertama, tidak menunggu
   script menjalankan `go()`. Versi asli sempat tampil kosong sesaat.
2. **Auto-play Kerberos berhenti tepat di langkah terakhir**, bukan satu tick (2,6 s) setelahnya.
3. **Bug kecil LDAPS diperbaiki** — generator karakter acak asli memakai `Math.random() * 34` pada
   alphabet berisi 23 karakter, sehingga bisa memunculkan teks `undefined` di packet capture.
   Sekarang memakai panjang alphabet sebenarnya.
4. **Tombol ← / → di footer dinonaktifkan di ujung deck** (aslinya tetap aktif tapi `go()` sudah
   meng-clamp, jadi secara visual tidak ada perbedaan).
5. **Placeholder "Pilih serangan di kiri…" hilang** — versi asli langsung meng-klik kartu pertama
   saat load, jadi state akhirnya sama.
6. Kelas CSS `.token.noanim` tetap tidak terpakai (sama seperti aslinya).
7. Interval highlight buku telepon tetap jalan meski slide-nya tidak terlihat (paritas dengan
   aslinya; biayanya satu timer 1,8 s).

Aksesibilitas yang ditambahkan tanpa mengubah tampilan: `role="tablist"/"tab"/"tabpanel"` +
`aria-selected`/`aria-controls` pada tab protokol, `aria-current` pada titik navigasi & item
overlay, `aria-expanded` pada tombol lipat pohon dan tombol Slide, `aria-live` pada panel detail
FSMO/serangan dan hasil GPO, `aria-label` pada tab layanan, token severity, dan checkbox LDAPS,
serta `role="progressbar"` pada bar progres & skor hardening.

## Keamanan konten

`<Prose />` memakai `dangerouslySetInnerHTML` untuk string HTML yang **ditulis tangan di
`src/content/*`** (root cause serangan, definisi node, deskripsi Kerberos). Tidak ada jalur data
eksternal/user input yang masuk ke komponen ini. Markup statis di HTML asli sudah dikonversi
menjadi JSX biasa.

## Versi lama

`../index.html`, `../script.js`, `../styles.css` tidak diubah dan masih bisa dibuka langsung
(file statis, tanpa build). Hapus sendiri kalau versi React sudah lu yakini.
