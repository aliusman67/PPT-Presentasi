/* ═══════════════════════════════════════════════
   Presentasi Interaktif — Active Directory
   Mesin slide + seluruh ilustrasi interaktif
   ═══════════════════════════════════════════════ */
"use strict";
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ─────────────── 1. MESIN SLIDE ─────────────── */
const slides = $$(".slide");
const dotsBox = $("#dots"), ovGrid = $("#ovGrid"), overview = $("#overview");
let idx = 0;

$("#slideTotal").textContent = String(slides.length).padStart(2, "0");

// titik navigasi + daftar slide (overlay)
slides.forEach((s, i) => {
  const d = document.createElement("button");
  d.className = "dot"; d.title = `${i + 1}. ${s.dataset.title}`;
  d.addEventListener("click", () => go(i));
  dotsBox.appendChild(d);

  const item = document.createElement("button");
  item.className = "ov-item";
  item.innerHTML = `<span class="ov-num">SLIDE ${String(i + 1).padStart(2, "0")}</span>
    <span class="ov-t">${s.dataset.title}</span>
    <span class="ov-d">${i === 0 ? "Riset komprehensif AD" : i === slides.length - 1 ? "Ringkasan & penutup" : "Bagian " + s.querySelector(".kicker")?.textContent.replace(/^0\d · /, "") || ""}</span>`;
  item.addEventListener("click", () => { go(i); toggleOv(false); });
  ovGrid.appendChild(item);
});

function go(i) {
  idx = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, k) => {
    s.classList.toggle("active", k === idx);
    s.classList.toggle("before", k < idx);
    // stagger animasi masuk
    $$("[data-reveal]", s).forEach((el, n) => { el.style.transitionDelay = `${n * 110}ms`; });
  });
  $$(".dot").forEach((d, k) => d.classList.toggle("on", k === idx));
  $$(".ov-item").forEach((o, k) => o.classList.toggle("cur", k === idx));
  $("#progressFill").style.width = `${((idx + 1) / slides.length) * 100}%`;
  $("#slideCounter").textContent = String(idx + 1).padStart(2, "0");
  $("#slideTitle").textContent = slides[idx].dataset.title;
  try { history.replaceState(null, "", `#${idx + 1}`); } catch { /* file:// */ }
}
const next = () => go(idx + 1), prev = () => go(idx - 1);

$("#btnNext").addEventListener("click", next);
$("#btnPrev").addEventListener("click", prev);

function toggleOv(force) {
  overview.hidden = force === undefined ? !overview.hidden : !force;
}
$("#btnOverview").addEventListener("click", () => toggleOv());
$("#btnCloseOv").addEventListener("click", () => toggleOv(false));
$("#btnFull").addEventListener("click", () =>
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
$("#btnRestart").addEventListener("click", () => go(0));

document.addEventListener("keydown", e => {
  if (e.target.matches("input,textarea")) return;
  switch (e.key) {
    case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "n":
      e.preventDefault(); if (!overview.hidden) { toggleOv(false); } next(); break;
    case "ArrowLeft": case "ArrowUp": case "PageUp": case "p":
      e.preventDefault(); prev(); break;
    case "Home": go(0); break;
    case "End": go(slides.length - 1); break;
    case "Escape": toggleOv(); break;
    case "o": case "O": toggleOv(); break;
    case "f": case "F": $("#btnFull").click(); break;
  }
});

// geser (touch)
let tx0 = null, ty0 = null;
document.addEventListener("touchstart", e => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
document.addEventListener("touchend", e => {
  if (tx0 === null) return;
  const dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0;
  if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? next() : prev();
  tx0 = ty0 = null;
}, { passive: true });

// deep-link #n
go(parseInt(location.hash.slice(1), 10) - 1 || 0);

/* ─────────────── 2. HERO — jaringan titik ─────────────── */
(() => {
  const net = $("#heroNet");
  for (let i = 0; i < 30; i++) {
    const s = document.createElement("span");
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 3.2}s`;
    net.appendChild(s);
  }
})();

/* ─────────────── 3. PENDAHULUAN — buku telepon ─────────────── */
(() => {
  const rows = $$(".pb-row");
  let k = 0;
  setInterval(() => {
    rows.forEach(r => r.classList.remove("lit"));
    rows[k % rows.length].classList.add("lit");
    k++;
  }, 1800);
})();

/* ─────────────── 4. ARSITEKTUR LOGIS — pohon interaktif ─────────────── */
const TREE_INFO = {
  forest:  ["🌳 Forest", "Level paling atas — satu “kerajaan” AD. Semua domain di dalamnya sepakat pakai satu <em>Schema</em> (definisi tipe objek &amp; atribut), <em>Configuration Partition</em>, dan <em>Global Catalog</em> (indeks pencarian lintas domain).", ["Schema", "Global Catalog", "Config Partition"]],
  tree:    ["🌲 Domain Tree", "Kumpulan domain yang nyambung lewat <em>trust relationship</em> berantai: kalau A percaya B dan B percaya C, A–C ikut percaya (<em>transitive</em>). Masih satu “keluarga” nama: contoso.com → corp.contoso.com.", ["Trust transitive"]],
  child:   ["↳ Child Domain", "Domain di bawah nama induknya — misal <code>finance.corp.contoso.com</code>. Boleh punya DC sendiri, tapi tetap satu trust sama keluarga besarnya.", ["Namespace berlanjut"]],
  domain2: ["🌲 Domain Lain", "Namanya beda total (<code>otherdomain.com</code>) tapi masih satu forest — tetap berbagi schema &amp; global catalog yang sama, dan trust-nya otomatis.", ["Cross-tree trust"]],
  domain:  ["🏷️ Domain", "Batas <strong>administrasi &amp; keamanan</strong>: user, grup, dan policy di domain A nggak otomatis ngerti domain B. Ini juga unit replikasi — DC cuma nyalin data domain-nya sendiri.", ["Security boundary", "Unit replikasi"]],
  ou:      ["📁 Organizational Unit (OU)", "Folder di dalam domain buat ngelompokin objek — dan level <strong>paling bawah</strong> yang bisa dikasih GPO langsung. Catatan penting: OU itu kontainer administrasi, <em>bukan</em> security boundary.", ["Target GPO", "Kontainer"]],
  user:    ["👤 User Object", "Unit paling dasar AD. Atributnya lengkap: nama, email, SID, UPN, sampai <strong>hash password</strong> di atribut <code>unicodePwd</code> — inilah harta karun yang diincer DCSync.", ["Objek"]],
  group:   ["👥 Group Object", "Cara praktis ngasih izin ke banyak orang sekaligus. Ingat scope-nya: Global, Domain Local, Universal.", ["Objek", "Scope"]],
  computer:["🖥️ Computer Object", "Setiap mesin yang join domain punya akun komputer — passwordnya auto-rotate ±30 hari dan dipakai mesin buat autentikasi ke DC.", ["Objek"]],
};

$$(".node").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".node").forEach(n => n.classList.remove("selected"));
    btn.classList.add("selected");
    const d = TREE_INFO[btn.dataset.info];
    if (!d) return;
    $("#tiTitle").textContent = d[0];
    $("#tiBody").innerHTML = d[1];
    $("#tiFoot").innerHTML = d[2].map(t => `<span class="chip">${t}</span>`).join("");
  });
});

// tombol lipat ⊕/⊖ untuk cabang
$$("#adTree li").forEach(li => {
  if (!li.querySelector(":scope > ul")) return;
  const f = document.createElement("button");
  f.className = "fold"; f.textContent = "−"; f.title = "Lipat cabang";
  f.addEventListener("click", e => {
    e.stopPropagation();
    li.classList.toggle("folded");
    f.textContent = li.classList.contains("folded") ? "+" : "−";
  });
  li.insertBefore(f, li.firstChild);
});

/* ─────────────── 5. FISIK — salin path NTDS.dit ─────────────── */
$("#ntdsPath").addEventListener("click", async function () {
  try { await navigator.clipboard.writeText(this.textContent); } catch { /* clipboard diblokir */ }
  this.classList.add("copied");
  $("#ntdsNote").textContent = "✅ Disalin! Lokasi default database AD.";
  setTimeout(() => this.classList.remove("copied"), 1500);
});

/* ─────────────── 6. LAYANAN — tab ─────────────── */
$$(".svc-tab").forEach(t => t.addEventListener("click", () => {
  $$(".svc-tab").forEach(x => x.classList.toggle("active", x === t));
  $$(".svc-pane").forEach(p => p.classList.toggle("active", p.dataset.svc === t.dataset.svc));
}));

/* ─────────────── 7. FSMO ─────────────── */
const FSMO = {
  schema:  ["Schema Master", "forest", "Satu-satunya DC yang boleh <strong>nulis schema</strong> — dipakai pas nambah atribut/objek baru (misal instal Exchange). Jarang disentuh, tapi kalau mati: semua perubahan schema batal."],
  dnaming: ["Domain Naming Master", "forest", "Penjaga nama domain se-forest: cuma dia yang boleh nge-<em>approve</em> penambahan atau penghapusan domain dalam forest."],
  pdc:     ["PDC Emulator", "domain", "DC “paling sibuk” sehari-hari: sumber waktu semua mesin, tujuan pertama perubahan password &amp; lockout, editor default GPO. Kalau mati: password baru lama nyebar, jam mulai drift, editing GPO berantakan."],
  rid:     ["RID Master", "domain", "Ngebagiin <em>pool RID</em> (nomor seri) ke DC lain supaya SID user/group/computer baru nggak pernah dobel se-domain."],
  infra:   ["Infrastructure Master", "domain", "Nerjemahin SID ↔ nama untuk objek lintas domain. Klasik: jangan taruh dia di Global Catalog (kecuali forest-nya cuma satu domain) — kalau nggak, dia diem-diem nggak kerja."],
};
$$(".fmso-role").forEach(r => r.addEventListener("click", () => {
  $$(".fmso-role").forEach(x => x.classList.toggle("active", x === r));
  const [name, scope, txt] = FSMO[r.dataset.role];
  const det = $("#fmsoDetail");
  det.classList.add("show");
  det.innerHTML = `<strong style="color:var(--accent2)">${name}</strong>
    <span class="chip" style="font-size:.68rem;padding:2px 10px;margin-left:8px">${scope === "forest" ? "🌳 Forest-wide" : "🏷️ Domain-wide"}</span><br>
    <span style="color:var(--muted);font-size:.92rem">${txt}</span>`;
  $$(".fmso-scope").forEach(sc => sc.classList.toggle("hl", sc.classList.contains(scope)));
}));

/* ─────────────── 8. GPO — animasi LSDOU ─────────────── */
(() => {
  const stages = $$(".gpo-stage"), vals = [7, 8, 10, 14];
  const res = $("#gpoResult"), btn = $("#gpoPlay");
  let timer = null;
  btn.addEventListener("click", () => {
    clearInterval(timer);
    stages.forEach(s => { s.classList.remove("hit", "winner"); $(".gpo-val", s).textContent = ""; });
    res.classList.remove("win");
    btn.disabled = true;
    let i = 0;
    timer = setInterval(() => {
      if (i < 4) {
        stages.forEach(s => s.classList.remove("hit"));
        stages[i].classList.add("hit");
        $(".gpo-val", stages[i]).textContent = `min length = ${vals[i]}`;
        res.textContent = `GPO dievaluasi… nilai aktif sekarang: ${vals[i]} — yang belakangan nulis, yang menang`;
        i++;
      } else {
        clearInterval(timer);
        stages[3].classList.add("winner");
        res.classList.add("win");
        res.textContent = "🏆 Yang menang: OU → minimal 14 karakter. Urutannya L→S→D→O, dan yang terakhir nulis yang keliatan (“last write wins”). Pengecualian: GPO berstatus Enforced bisa nembus urutan ini.";
        btn.disabled = false;
      }
    }, 850);
  });
})();

/* ─────────────── 9. KERBEROS — simulasi taman bermain ─────────────── */
(() => {
  const scene = $("#kerbScene");
  const ACT = {
    client: { x: 13, y: 74, ic: "🧑", name: "Pengunjung", sub: "User / workstation" },
    kdc:    { x: 38, y: 20, ic: "🎟️", name: "Loket Utama", sub: "KDC · AS" },
    tgs:    { x: 66, y: 20, ic: "🎡", name: "Loket Wahana", sub: "KDC · TGS" },
    server: { x: 87, y: 74, ic: "🎢", name: "Penjaga Wahana", sub: "File Server" },
  };
  const TOK = {
    ktp: { cls: "t-ktp", label: "🪪 KTP (password)" },
    tgt: { cls: "t-tgt", label: "⌚ Gelang (TGT)" },
    st:  { cls: "t-st",  label: "🎫 Tiket (Service)" },
  };
  // buat actor & token
  for (const [id, a] of Object.entries(ACT)) {
    const el = document.createElement("div");
    el.className = "actor"; el.id = "k-" + id;
    el.style.left = a.x + "%"; el.style.top = a.y + "%";
    el.innerHTML = `<span class="a-ic">${a.ic}</span><span class="a-name">${a.name}<br><span class="a-sub">${a.sub}</span></span>`;
    scene.appendChild(el);
  }
  for (const [id, t] of Object.entries(TOK)) {
    const el = document.createElement("div");
    el.className = `token ${t.cls}`; el.id = "t-" + id;
    el.textContent = t.label;
    scene.appendChild(el);
  }

  const slot = a => ({ x: ACT[a].x, y: ACT[a].y - 11 });

  // state kumulatif tiap langkah: posisi/visibility setiap token + glow aktor
  const STEPS = [
    { tag: "", t: "Analogi Taman Bermain", d: "Bayangin domain itu taman bermain 🎡 — Kerberos <strong>nggak pernah ngirim password lewat jaringan</strong>; yang berpindah cuma tiket. Tekan “Berikutnya →” buat ngikutin alurnya satu-satu.",
      s: { ktp: ["client", ""], tgt: ["kdc", "hidden"], st: ["tgs", "hidden"] }, g: [] },
    { tag: "AS-REQ", t: "1 · Login Awal", d: "User nunjukin <strong>KTP (password)</strong> ke Loket Utama — KDC bagian <em>Authentication Service</em>. Ini satu-satunya momen password dipakai, dan tetap nggak dikirim mentah-mentah: cuma dipakai bikin <em>authenticator</em> yang diverifikasi balik oleh KDC.",
      s: { ktp: ["kdc", ""], tgt: ["kdc", "hidden"], st: ["tgs", "hidden"] }, g: ["kdc"] },
    { tag: "AS-REP", t: "2 · Gelang Akses", d: "KDC ngecek identitas lalu ngasih <strong>Gelang Harian (TGT)</strong> — ditandatangani pakai kunci akun <code>krbtgt</code>, jadi semua loket percaya tanpa perlu nanya ulang. KTP-nya diam di loket; cuma dipakai buat verifikasi.",
      s: { ktp: ["kdc", "faded"], tgt: ["client", ""], st: ["tgs", "hidden"] }, g: ["kdc"] },
    { tag: "TGS-REQ", t: "3 · Pesan Tiket Wahana", d: "Mau naik Rollercoaster (File Server)? Cukup tunjukin <strong>gelang (TGT)</strong> ke loket wahana — TGS. KTP nggak perlu; bahkan TGS pun nggak pernah lihat password user.",
      s: { ktp: ["kdc", "faded"], tgt: ["tgs", ""], st: ["tgs", "hidden"] }, g: ["tgs"] },
    { tag: "TGS-REP", t: "4 · Tiket Rollercoaster", d: "TGS ngasih <strong>Service Ticket</strong>. Bedanya sama gelang: tiket ini khusus <em>satu wahana</em> saja — kalau sampai dicuri, kerusakannya terbatas ke layanan itu, bukan seluruh taman.",
      s: { ktp: ["kdc", "faded"], tgt: ["tgs", "faded"], st: ["client", ""] }, g: ["tgs"] },
    { tag: "AP-REQ", t: "5 · Tunjuk ke Penjaga", d: "User nyerahin tiket ke <strong>Penjaga (server tujuan)</strong>. Penjaga cuma perlu percaya tanda tangan KDC — dia nggak pernah, dan nggak akan pernah, tahu password user.",
      s: { ktp: ["kdc", "faded"], tgt: ["tgs", "faded"], st: ["server", ""] }, g: ["server"] },
    { tag: "AP-REP", t: "6 · Selamat Menikmati 🎢", d: "Tiket sah → pintu dibuka pakai <em>session key</em>. Kesimpulannya: password cuma <em>dipakai</em>, nggak pernah <em>dikirim</em>. Makanya Kerberos jauh lebih aman dari NTLM — dan makanya serangan Kerberos (Kerberoasting, Golden Ticket) nyasar ke <strong>tiket &amp; krbtgt</strong>, bukan ke password.",
      s: { ktp: ["kdc", "faded"], tgt: ["tgs", "faded"], st: ["server", "granted"] }, g: ["server"], grant: true },
  ];

  let step = 0, auto = null;
  const dots = $("#kerbDots");
  STEPS.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "kdot"; d.title = `Langkah ${i}`;
    d.addEventListener("click", () => { stopAuto(); apply(i); });
    dots.appendChild(d);
  });

  function apply(i) {
    step = i;
    const S = STEPS[i];
    for (const [tk, [at, cl]] of Object.entries(S.s)) {
      const el = $("#t-" + tk), p = slot(at);
      el.style.left = p.x + "%"; el.style.top = p.y + "%";
      el.classList.toggle("faded", cl === "faded");
      el.classList.toggle("hidden", cl === "hidden");
      el.classList.toggle("granted", cl === "granted");
    }
    for (const a of Object.keys(ACT)) {
      $("#k-" + a).classList.toggle("glow", S.g.includes(a));
      $("#k-" + a).classList.toggle("granted", !!S.grant && a === "server");
    }
    $("#kerbProto").textContent = S.tag ? `◈ Protokol: ${S.tag}` : "◈ Belum ada traffic — siapkan tiketmu";
    $("#kerbTitle").textContent = S.t;
    $("#kerbText").innerHTML = S.d;
    $$(".kdot").forEach((d, k) => d.classList.toggle("on", k === i));
    $("#kerbPrev").disabled = i === 0;
    $("#kerbNext").disabled = i === STEPS.length - 1;
  }
  const stopAuto = () => { if (auto) { clearInterval(auto); auto = null; $("#kerbAuto").textContent = "▶▶ Auto"; } };

  $("#kerbNext").addEventListener("click", () => { stopAuto(); apply(Math.min(step + 1, STEPS.length - 1)); });
  $("#kerbPrev").addEventListener("click", () => { stopAuto(); apply(Math.max(step - 1, 0)); });
  $("#kerbReset").addEventListener("click", () => { stopAuto(); apply(0); });
  $("#kerbAuto").addEventListener("click", function () {
    if (auto) return stopAuto();
    if (step === STEPS.length - 1) apply(0);
    this.textContent = "⏸ Stop";
    auto = setInterval(() => {
      if (step >= STEPS.length - 1) stopAuto();
      else apply(step + 1);
    }, 2600);
  });
  apply(0);
})();

/* ─────────────── 10. PROTOKOL — tab & demo ─────────────── */
$$(".proto-tab").forEach(t => t.addEventListener("click", () => {
  $$(".proto-tab").forEach(x => x.classList.toggle("active", x === t));
  $$(".proto-pane").forEach(p => p.classList.toggle("active", p.dataset.proto === t.dataset.proto));
}));

// NTLM challenge–response
(() => {
  const hex = n => [...Array(n)].map(() => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
  let phase = 0;
  $("#ntlmBtn").addEventListener("click", function () {
    if (phase === 0) { $("#ntlmChallenge").textContent = hex(16); $("#ntlmResp").textContent = "…menunggu klien"; this.textContent = "🔐 Kirim response (hash)"; phase = 1; }
    else if (phase === 1) { $("#ntlmResp").textContent = hex(32); this.textContent = "↺ Ulangi"; phase = 2; }
    else { $("#ntlmChallenge").textContent = "—"; $("#ntlmResp").textContent = "—"; this.textContent = "🎲 Mulai challenge"; phase = 0; }
  });
})();

// LDAP vs LDAPS — sniffer demo
(() => {
  const pkt = $("#ldapPkt"), verdict = $("#ldapVerdict");
  const plain = [
    "<span class='pl'>TCP 10.0.1.55:49312 → DC01:389 (LDAP, plaintext)</span>",
    "bindDN: <span class='pl'>CN=admin,OU=Users,DC=corp,DC=contoso,DC=com</span>",
    "password: <span class='pl'>S3nyums@!</span>   ← terbaca siapa pun di segmen",
    "filter: (&(objectClass=user)(sAMAccountName=*))",
  ];
  const rnd = n => [...Array(n)].map(() => "ABCDabcdef0123456789+/"[Math.floor(Math.random() * 34)]).join("");
  const secure = [
    "<span>TCP 10.0.1.55:49312 → DC01:636 (LDAPS, TLS 1.2)</span>",
    "0x" + rnd(58),
    "0x" + rnd(58),
    "0x" + rnd(44) + "…",
  ];
  function draw(tls) {
    pkt.classList.toggle("secure", tls);
    pkt.innerHTML = (tls ? secure : plain).join("<br>");
    verdict.textContent = tls
      ? "🔒 LDAPS (636): kredensial terenkripsi SSL/TLS — sniffer hanya melihat sampah."
      : "⚠️ LDAP (389): kredensial terkirim PLAINTEXT — wajib diganti LDAPS.";
  }
  $("#ldapTls").addEventListener("change", e => draw(e.target.checked));
  draw(false);
})();

// SMB versi
(() => {
  const box = $("#smbVerdict");
  const MSG = {
    1: ["bad", "🔥 SMBv1 — celah fatal (EternalBlue / WannaCry, NTLMv1 signing opsional). WAJIB dinonaktifkan."],
    2: ["mid", "⚠️ SMBv2 — lebih baik, tapi signing masih bisa opsional: Relay masih mungkin. Naikkan ke v3 + Require Signing."],
    3: ["good", "✅ SMBv3 — enkripsi per-hop + SMB Signing diwajibkan → relay & sniffing diblokir."],
  };
  $$(".smb-v").forEach(b => b.addEventListener("click", () => {
    $$(".smb-v").forEach(x => x.classList.toggle("sel", x === b));
    const [cls, txt] = MSG[b.dataset.v];
    box.className = `smb-verdict ${cls}`;
    box.textContent = txt;
  }));
  box.textContent = "Pilih versi SMB di kiri untuk menilai risikonya…";
})();

/* ─────────────── 11. SERANGAN — kartu & panel detail ─────────────── */
const ATTACKS = [
  { key: "kerb", cat: "Kerberos", sev: 3, name: "Kerberoasting",
    flow: ["autentikasi low-priv", "request Service Ticket (SPN)", "crack offline"],
    how: "Nyuruh AD ngasih <em>Service Ticket</em> untuk akun layanan (yang punya SPN, misal <code>MSSQLsvc</code>), ekstrak tiketnya, lalu crack <em>offline</em> sampai ketahuan password aslinya — server target nggak disentuh sama sekali.",
    why: "Akar masalahnya ada di <strong>desain Kerberos itu sendiri</strong> — ini bukan bug, tapi fitur yang jadi bumerang:<br><br>1️⃣ Supaya klien tahu harus minta tiket ke mana, <strong>SPN harus terdaftar dan bisa dibaca siapa pun</strong> — semua user terautentikasi punya akses <em>read</em> ke atribut <code>servicePrincipalName</code>.<br>2️⃣ Service Ticket dienkripsi pakai kunci yang <em>diturunkan dari hash password akun layanan</em>. Niat desainnya bagus: kalau tiket bisa didekripsi pemiliknya, berarti yang minta benar “berurusan” dengan akun itu.<br>3️⃣ Efek sampingnya: user helpdesk biasa pun bisa minta tiket untuk <strong>SPN apa pun</strong> dan langsung memegang data yang terenkripsi dengan hash password akun layanan.<br>4️⃣ Tiket di-crack <strong>offline</strong> — nggak nyentuh DC, jadi nggak ada account lockout, nggak ada rate limit, nggak ada alert. Tinggal GPU + kamus kata.<br><br>Serangan ini “jadi” kalau admin pakai password lemah/abadi pada Service Account — misal <code>Spring2019!</code> untuk akun SQL yang nggak pernah diganti sejak 2012.",
    fix: "gMSA — password 240+ karakter yang dirotasi otomatis oleh Windows, hasilnya crack nggak ada gunanya — plus audit SPN berkala." },
  { key: "asrep", cat: "Kerberos", sev: 3, name: "AS-REP Roasting",
    flow: ["enumerate user tanpa pre-auth", "collection AS-REP", "crack offline"],
    how: "Langsung minta respons <strong>AS-REP</strong> ke DC untuk user-user tertentu — tanpa perlu login apa pun — lalu crack hash password yang kebungkus di dalamnya.",
    why: "<em>Pre-authentication</em> itu “pintu wajib” Kerberos: sebelum DC ngasih apa-apa, klien harus buktiin kalau dia tahu password. Tapi ada opsi <code>Do not require Kerberos preauthentication</code> yang kadang dinyalain admin — biasanya demi aplikasi tua yang nggak ngerti protokol.<br><br>Kalau centang itu aktif, DC dengan senang hati ngirim bagian yang dienkripsi pakai <strong>hash user tersebut</strong> ke <em>siapa pun yang minta</em> — tanpa verifikasi dulu. Praktisnya: hash user berubah jadi “tantangan” yang bisa di-download siapa saja dan di-crack offline. Akun tanpa pre-auth = akun yang hash-nya dipajang di etalase.",
    fix: "Cari akun dengan flag pre-auth mati (misal lewat <code>Rubeus</code> / <code>Get-ADUser -Filter 'DoesNotRequirePreAuth -eq True'</code>) dan nyalakan lagi — kecuali benar-benar butuh, itu pun kasih kompensasi." },
  { key: "golden", cat: "Kerberos", sev: 5, name: "Golden Ticket",
    flow: ["mencuri hash krbtgt", "mint TGT palsu", "akses Domain Admin abadi"],
    how: "Mencetak <strong>TGT palsu sendiri</strong> — “gelang akses semua wahana” — yang bikin setiap DC percaya pemegangnya adalah Domain Admin. Aksesnya awet, tanpa jejak login normal.",
    why: "Semua TGT ditandatangani pakai <strong>hash akun <code>krbtgt</code></strong>, dan setiap DC memvalidasi tiket cuma dengan kunci itu — logikanya: “tanda tangannya cocok, pasti dicetak KDC”.<br><br>Masalahnya, hash krbtgt bisa dicuri — dari file <code>NTDS.dit</code>, lewat DCSync, atau lewat grup Backup Operator — dan dulu password akun ini <em>hampir nggak pernah dirotasi</em>. Begitu kuncinya kepegang, penyerang resmi menjadi “mesin pencetak tiket” bayangan: bikin TGT atas nama Domain Admin dengan tanggal kedaluwarsa 10 tahun ke depan, dan di mata DC semua itu sah. Nggak ada proses login yang bisa dilog — tiketnya memang dipercaya.",
    fix: "Rotasi password krbtgt <strong>dua kali</strong> (sekali masih nyisa di history) — berkala & wajib saat insiden — plus proteksi Tier-0 dan monitor anomali tiket." },
  { key: "pth", cat: "NTLM & Kredensial", sev: 4, name: "Pass-the-Hash",
    flow: ["local admin di host", "dump LSASS", "login ke host lain dgn hash"],
    how: "Nggak perlu tahu password: ambil <em>hash NTLM</em> dari memori mesin yang sudah dikuasai, lalu pakai hash itu buat login ke mesin lain — hash-nya langsung berfungsi sebagai kunci.",
    why: "Kenapa cuma modal hash bisa login? Karena NTLM memvalidasi <em>menggunakan hash itu sendiri</em> — server menghitung jawaban challenge dari hash yang sama. Artinya <strong>hash = kunci</strong>, bukan sekadar pengganti sementara.<br><br>Windows menyimpan hash-hash ini di memori <code>LSASS</code> supaya SSO jalan (user nggak perlu input password berulang kali — fitur, bukan cacat). Sekali penyerang punya Local Admin di satu workstation → dump LSASS → dapat hash admin lokal → dan karena banyak organisasi pakai password admin lokal yang <strong>sama di semua mesin</strong>, langsung bisa “login” ke ratusan host tanpa tahu satu pun password asli.",
    fix: "LAPS (biar hash admin lokal beda antar mesin) + Tiered model + batasi siapa bisa login ke mana + LSA protection / Defender ASR." },
  { key: "relay", cat: "NTLM & Kredensial", sev: 4, name: "NTLM Relay",
    flow: ["cekik traffic login korban", "relay ke server target", "login sebagai korban"],
    how: "Berdiri di tengah: ngecekik proses login NTLM korban, terus meneruskan (relay) challenge–response itu ke server target. Server mengira sedang login si korban — padahal yang pegang kendali penyerang.",
    why: "NTLM secara desain <strong>tidak mengikat proses login ke koneksi tertentu</strong> — challenge & response-nya nggak mengandung info “ini untuk sesi A ke server B”. Jadi jawaban korban masih terasa valid saat diteruskan ke server lain.<br><br>Benteng terakhirnya cuma <em>SMB Signing</em>: tanda tangan digital yang mengikat tiket ke pasangan klien–server spesifik. Masalahnya, selama bertahun-tahun default-nya “negotiate” alias <strong>opsional</strong>. Selama signing belum di-<code>Require</code>, relay selalu menemukan korban — sering cukup dengan satu klik ke file share palsu milik penyerang.",
    fix: "Set SMB Signing = <strong>Require</strong> di semua server & workstation + matikan NTLMv1 + aktifkan EPA (Extended Protection for Authentication)." },
  { key: "dcsync", cat: "Replikasi", sev: 5, name: "DCSync",
    flow: ["akun over-privileged", "pura-pura jadi DC", "replikasi = hash semua user"],
    how: "Bikin DC percaya kalau mesin penyerang adalah sesama DC yang lagi minta sinkronisasi — DC pun ngirimin “salinan” database AD, termasuk hash password seluruh user.",
    why: "Replikasi itu nyawa AD — setiap DC wajib bisa narik data dari DC lain kapan pun. Aturannya <strong>berbasis izin, bukan identitas</strong>: kalau akun punya <code>Replicating Directory Changes</code> + <code>…Changes All</code> di level domain, DC nggak nanya lagi “kamu beneran DC?”.<br><br>Izin ini kadang ke-grant ke grup yang salah: delegasi helpdesk yang kebablasan, template setup lama, atau grup “Server Operators” yang dikira aman. Begitu satu akun seperti ini dikompromi, penyerang tinggal pura-pura jadi DC <em>dari laptop mana pun</em> — nggak nyentuh server DC sama sekali, dan di log cuma kelihatan “replikasi normal”.",
    fix: "Audit ACL domain: izin replikasi cuma boleh untuk grup DC/Admin. Pantau event 4662/4661 dari IP yang bukan DC." },
];

(() => {
  const grid = $("#atkGrid"), panel = $("#atkPanel");
  ATTACKS.forEach(a => {
    const b = document.createElement("button");
    b.className = "atk-card";
    b.innerHTML = `<span class="atk-cat">${a.cat}</span><h4>${a.name}</h4>
      <span class="sev">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= a.sev ? "on" : ""}"></i>`).join("")}</span>
      <p class="mini" style="margin-top:2px">${a.flow[2]}</p>`;
    b.addEventListener("click", () => {
      $$(".atk-card").forEach(x => x.classList.toggle("active", x === b));
      panel.innerHTML = `<h3>⚔️ ${a.name}</h3>
        <div class="atk-flow">${a.flow.map((f, i) => `${i ? "<em>→</em>" : ""}<span>${f}</span>`).join("")}</div>
        <div class="atk-sec"><h5>Deskripsi</h5><p>${a.how}</p></div>
        <div class="atk-sec"><h5>Kenapa ini bisa terjadi? 🧨 (root cause)</h5><p>${a.why}</p></div>
        <div class="atk-fix">🛡️ Penangkal: ${a.fix}</div>`;
    });
    grid.appendChild(b);
  });
  $(".atk-card").click(); // pilih pertama
})();

/* ─────────────── 12. HARDENING — skor ─────────────── */
(() => {
  const sws = $$(".hard-sw"), fill = $("#scoreFill"), txt = $("#scoreTxt");
  const MSG = [
    "Baru mulai… domain masih terbuka lebar 😬",
    "Setengah jalan — lanjutkan!",
    "Hampir solid, satu langkah lagi.",
    "Siap bertahan dari serangan umum.",
    "🛡️ 100% — Domain terkunci! Tiering, LAPS, legacy off, gMSA. 🎉",
  ];
  function upd() {
    const n = sws.filter(s => s.checked).length;
    sws.forEach(s => s.closest(".hard-card").classList.toggle("on", s.checked));
    fill.style.width = `${(n / sws.length) * 100}%`;
    txt.textContent = `Skor hardening: ${n} / ${sws.length} — ${MSG[n]}`;
    txt.classList.toggle("full", n === sws.length);
  }
  sws.forEach(s => s.addEventListener("change", upd));
  upd();
})();
