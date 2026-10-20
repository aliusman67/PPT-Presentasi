export type Attack = {
  key: string;
  category: string;
  /** 1–5, digambar sebagai titik sev di kartu. */
  severity: number;
  name: string;
  flow: readonly string[];
  /** Semua field teks di bawah ini HTML authored (dipakai lewat <Prose />). */
  how: string;
  why: string;
  fix: string;
};

export const MAX_SEVERITY = 5;

export const ATTACKS: readonly Attack[] = [
  {
    key: 'kerb',
    category: 'Kerberos',
    severity: 3,
    name: 'Kerberoasting',
    flow: ['autentikasi low-priv', 'request Service Ticket (SPN)', 'crack offline'],
    how: `Nyuruh AD ngasih <em>Service Ticket</em> untuk akun layanan (yang punya SPN, misal <code>MSSQLsvc</code>), ekstrak tiketnya, lalu crack <em>offline</em> sampai ketahuan password aslinya — server target nggak disentuh sama sekali.`,
    why: `Akar masalahnya ada di <strong>desain Kerberos itu sendiri</strong> — ini bukan bug, tapi fitur yang jadi bumerang:<br><br>1️⃣ Supaya klien tahu harus minta tiket ke mana, <strong>SPN harus terdaftar dan bisa dibaca siapa pun</strong> — semua user terautentikasi punya akses <em>read</em> ke atribut <code>servicePrincipalName</code>.<br>2️⃣ Service Ticket dienkripsi pakai kunci yang <em>diturunkan dari hash password akun layanan</em>. Niat desainnya bagus: kalau tiket bisa didekripsi pemiliknya, berarti yang minta benar “berurusan” dengan akun itu.<br>3️⃣ Efek sampingnya: user helpdesk biasa pun bisa minta tiket untuk <strong>SPN apa pun</strong> dan langsung memegang data yang terenkripsi dengan hash password akun layanan.<br>4️⃣ Tiket di-crack <strong>offline</strong> — nggak nyentuh DC, jadi nggak ada account lockout, nggak ada rate limit, nggak ada alert. Tinggal GPU + kamus kata.<br><br>Serangan ini “jadi” kalau admin pakai password lemah/abadi pada Service Account — misal <code>Spring2019!</code> untuk akun SQL yang nggak pernah diganti sejak 2012.`,
    fix: `gMSA — password 240+ karakter yang dirotasi otomatis oleh Windows, hasilnya crack nggak ada gunanya — plus audit SPN berkala.`,
  },
  {
    key: 'asrep',
    category: 'Kerberos',
    severity: 3,
    name: 'AS-REP Roasting',
    flow: ['enumerate user tanpa pre-auth', 'collection AS-REP', 'crack offline'],
    how: `Langsung minta respons <strong>AS-REP</strong> ke DC untuk user-user tertentu — tanpa perlu login apa pun — lalu crack hash password yang kebungkus di dalamnya.`,
    why: `<em>Pre-authentication</em> itu “pintu wajib” Kerberos: sebelum DC ngasih apa-apa, klien harus buktiin kalau dia tahu password. Tapi ada opsi <code>Do not require Kerberos preauthentication</code> yang kadang dinyalain admin — biasanya demi aplikasi tua yang nggak ngerti protokol.<br><br>Kalau centang itu aktif, DC dengan senang hati ngirim bagian yang dienkripsi pakai <strong>hash user tersebut</strong> ke <em>siapa pun yang minta</em> — tanpa verifikasi dulu. Praktisnya: hash user berubah jadi “tantangan” yang bisa di-download siapa saja dan di-crack offline. Akun tanpa pre-auth = akun yang hash-nya dipajang di etalase.`,
    fix: `Cari akun dengan flag pre-auth mati (misal lewat <code>Rubeus</code> / <code>Get-ADUser -Filter 'DoesNotRequirePreAuth -eq True'</code>) dan nyalakan lagi — kecuali benar-benar butuh, itu pun kasih kompensasi.`,
  },
  {
    key: 'golden',
    category: 'Kerberos',
    severity: 5,
    name: 'Golden Ticket',
    flow: ['mencuri hash krbtgt', 'mint TGT palsu', 'akses Domain Admin abadi'],
    how: `Mencetak <strong>TGT palsu sendiri</strong> — “gelang akses semua wahana” — yang bikin setiap DC percaya pemegangnya adalah Domain Admin. Aksesnya awet, tanpa jejak login normal.`,
    why: `Semua TGT ditandatangani pakai <strong>hash akun <code>krbtgt</code></strong>, dan setiap DC memvalidasi tiket cuma dengan kunci itu — logikanya: “tanda tangannya cocok, pasti dicetak KDC”.<br><br>Masalahnya, hash krbtgt bisa dicuri — dari file <code>NTDS.dit</code>, lewat DCSync, atau lewat grup Backup Operator — dan dulu password akun ini <em>hampir nggak pernah dirotasi</em>. Begitu kuncinya kepegang, penyerang resmi menjadi “mesin pencetak tiket” bayangan: bikin TGT atas nama Domain Admin dengan tanggal kedaluwarsa 10 tahun ke depan, dan di mata DC semua itu sah. Nggak ada proses login yang bisa dilog — tiketnya memang dipercaya.`,
    fix: `Rotasi password krbtgt <strong>dua kali</strong> (sekali masih nyisa di history) — berkala & wajib saat insiden — plus proteksi Tier-0 dan monitor anomali tiket.`,
  },
  {
    key: 'pth',
    category: 'NTLM & Kredensial',
    severity: 4,
    name: 'Pass-the-Hash',
    flow: ['local admin di host', 'dump LSASS', 'login ke host lain dgn hash'],
    how: `Nggak perlu tahu password: ambil <em>hash NTLM</em> dari memori mesin yang sudah dikuasai, lalu pakai hash itu buat login ke mesin lain — hash-nya langsung berfungsi sebagai kunci.`,
    why: `Kenapa cuma modal hash bisa login? Karena NTLM memvalidasi <em>menggunakan hash itu sendiri</em> — server menghitung jawaban challenge dari hash yang sama. Artinya <strong>hash = kunci</strong>, bukan sekadar pengganti sementara.<br><br>Windows menyimpan hash-hash ini di memori <code>LSASS</code> supaya SSO jalan (user nggak perlu input password berulang kali — fitur, bukan cacat). Sekali penyerang punya Local Admin di satu workstation → dump LSASS → dapat hash admin lokal → dan karena banyak organisasi pakai password admin lokal yang <strong>sama di semua mesin</strong>, langsung bisa “login” ke ratusan host tanpa tahu satu pun password asli.`,
    fix: `LAPS (biar hash admin lokal beda antar mesin) + Tiered model + batasi siapa bisa login ke mana + LSA protection / Defender ASR.`,
  },
  {
    key: 'relay',
    category: 'NTLM & Kredensial',
    severity: 4,
    name: 'NTLM Relay',
    flow: ['cekik traffic login korban', 'relay ke server target', 'login sebagai korban'],
    how: `Berdiri di tengah: ngecekik proses login NTLM korban, terus meneruskan (relay) challenge–response itu ke server target. Server mengira sedang login si korban — padahal yang pegang kendali penyerang.`,
    why: `NTLM secara desain <strong>tidak mengikat proses login ke koneksi tertentu</strong> — challenge & response-nya nggak mengandung info “ini untuk sesi A ke server B”. Jadi jawaban korban masih terasa valid saat diteruskan ke server lain.<br><br>Benteng terakhirnya cuma <em>SMB Signing</em>: tanda tangan digital yang mengikat tiket ke pasangan klien–server spesifik. Masalahnya, selama bertahun-tahun default-nya “negotiate” alias <strong>opsional</strong>. Selama signing belum di-<code>Require</code>, relay selalu menemukan korban — sering cukup dengan satu klik ke file share palsu milik penyerang.`,
    fix: `Set SMB Signing = <strong>Require</strong> di semua server & workstation + matikan NTLMv1 + aktifkan EPA (Extended Protection for Authentication).`,
  },
  {
    key: 'dcsync',
    category: 'Replikasi',
    severity: 5,
    name: 'DCSync',
    flow: ['akun over-privileged', 'pura-pura jadi DC', 'replikasi = hash semua user'],
    how: `Bikin DC percaya kalau mesin penyerang adalah sesama DC yang lagi minta sinkronisasi — DC pun ngirimin “salinan” database AD, termasuk hash password seluruh user.`,
    why: `Replikasi itu nyawa AD — setiap DC wajib bisa narik data dari DC lain kapan pun. Aturannya <strong>berbasis izin, bukan identitas</strong>: kalau akun punya <code>Replicating Directory Changes</code> + <code>…Changes All</code> di level domain, DC nggak nanya lagi “kamu beneran DC?”.<br><br>Izin ini kadang ke-grant ke grup yang salah: delegasi helpdesk yang kebablasan, template setup lama, atau grup “Server Operators” yang dikira aman. Begitu satu akun seperti ini dikompromi, penyerang tinggal pura-pura jadi DC <em>dari laptop mana pun</em> — nggak nyentuh server DC sama sekali, dan di log cuma kelihatan “replikasi normal”.`,
    fix: `Audit ACL domain: izin replikasi cuma boleh untuk grup DC/Admin. Pantau event 4662/4661 dari IP yang bukan DC.`,
  },
];

/** Titik indikator severity; `level` 1..5 dipakai sebagai key stabil. */
export const SEVERITY_LEVELS: readonly number[] = Array.from({ length: MAX_SEVERITY }, (_, i) => i + 1);

export const isSeverityOn = (severity: number, level: number): boolean => level <= severity;
