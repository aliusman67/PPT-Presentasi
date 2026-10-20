# Riset Komprehensif: Active Directory (AD)

## 1. Pendahuluan

**Active Directory (AD)** adalah layanan direktori (*directory service*) proprietary yang dikembangkan oleh Microsoft untuk sistem operasi Windows Server. AD berfungsi sebagai pusat penyimpanan data terstruktur mengenai seluruh entitas jaringan—seperti pengguna (*users*), komputer, grup, aplikasi, dan perangkat keras (seperti printer)—serta menyediakan mekanisme terpusat untuk otentikasi (*authentication*), otorisasi (*authorization*), dan manajemen kebijakan jaringan.

Secara fungsional, AD bertindak sebagai "buku telepon digital" terenkripsi yang memungkinkan administrator jaringan mengelola identitas dan hak akses secara konsisten dari satu titik pusat.

## 2. Arsitektur dan Komponen Dasar

Arsitektur Active Directory dibagi menjadi dua kategori utama: **Komponen Logis** dan **Komponen Fisik**.

```text
                           +------------------------+
                           |      Forest Root       |
                           |      (domain.com)      |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
        +----------v----------+                 +----------v----------+
        |     Child Domain    |                 |     Tree Domain     |
        |  (sub.domain.com)   |                 |    (otherdomain.com)|
        +----------+----------+                 +---------------------+
                   |
        +----------v----------+
        | Organization Unit   |
        |       (OU)          |
        +----------+----------+
                   |
        +----------v----------+
        |   Users / Devices   |
        +---------------------+
```

### 2.1 Komponen Logis

1. **Objects (Objek):** Unit dasar dalam AD. Objek merepresentasikan sumber daya jaringan tunggal, seperti *User*, *Group*, *Computer*, atau *Printer*. 
2. **Organizational Unit (OU):** Kontainer di dalam domain yang digunakan untuk mengelompokkan objek-objek secara hierarkis. OU adalah tingkat terendah tempat **Group Policy Objects (GPO)** dapat diterapkan secara langsung.
3. **Domain:** Batas administrasi (*administrative boundary*) dan keamanan utama dalam AD.
4. **Domain Tree:** Kumpulan dari satu atau lebih domain yang saling terhubung melalui hubungan kepercayaan (*trust relationship*) berantai.
5. **Forest:** Tingkat hierarki tertinggi dalam arsitektur AD yang berbagi **Schema**, **Configuration Partition**, dan **Global Catalog** yang sama.

### 2.2 Komponen Fisik

1. **Domain Controller (DC):** Server yang menjalankan layanan Active Directory Domain Services (AD DS), menyimpan salinan database AD, dan menangani proses otentikasi.
2. **Sites:** Pengelompokan fisik berdasarkan satu atau lebih subnet IP untuk mengoptimalkan lalu lintas replikasi AD.
3. **AD Database (NTDS.dit):** File database fisik yang berlokasi secara default di `%SystemRoot%\NTDS\ntds.dit`.

## 3. Komponen Layanan Utama (AD Services)

| Layanan | Singkatan | Fungsi Utama | 
| ----- | ----- | ----- | 
| **Active Directory Domain Services** | **AD DS** | Menyimpan data jaringan dan mengelola interaksi pengguna dengan domain. | 
| **Active Directory Lightweight Directory Services** | **AD LDS** | Layanan direktori independen berbasis LDAP. | 
| **Active Directory Certificate Services** | **AD CS** | Infrastruktur kunci publik (PKI) untuk sertifikat digital. | 
| **Active Directory Rights Management Services** | **AD RMS** | Manajemen hak akses dokumen (DRM). | 
| **Active Directory Federation Services** | **AD FS** | Layanan identitas federasi dan *Single Sign-On* (SSO). | 

## 4. Konsep Kunci Operasional

### 4.1 Flexible Single Master Operation (FSMO) Roles

Ada 5 peran khusus yang hanya boleh dijalankan oleh satu Domain Controller pada satu waktu:
* **Forest-wide:** *Schema Master*, *Domain Naming Master*
* **Domain-wide:** *PDC Emulator*, *RID Master*, *Infrastructure Master*

### 4.2 Group Policy Object (GPO)
Urutan Eksekusi GPO (LSDOU):
$$
\text{Local Policy} \rightarrow \text{Site} \rightarrow \text{Domain} \rightarrow \text{Organizational Unit (OU)}
$$

## 5. Protokol Autentikasi dan Keamanan Active Directory

### 5.1. Kerberos (Protokol Autentikasi Utama)
Kerberos adalah protokol autentikasi default di AD modern yang sangat aman karena menggunakan tiket, bukan mengirimkan *password* lewat jaringan.

**Penggambaran Analogi Kerberos (Taman Bermain):**
Bayangkan Anda sedang mengunjungi sebuah Taman Bermain (Domain).
1. **Login Awal (AS-REQ & AS-REP):** Saat Anda tiba, Anda menunjukkan KTP/Identitas (Password) Anda ke **Loket Utama** (*Key Distribution Center / KDC*). Loket memverifikasi identitas Anda dan memberikan **Gelang Akses Harian** (*Ticket Granting Ticket / TGT*).
2. **Meminta Akses Wahana (TGS-REQ & TGS-REP):** Anda ingin naik Rollercoaster (*File Server/Layanan*). Anda tidak perlu lagi menunjukkan KTP. Anda cukup menunjukkan **Gelang Akses (TGT)** ke sebuah loket khusus wahana (*Ticket Granting Service / TGS*). Loket ini akan memberikan Anda **Tiket Rollercoaster** (*Service Ticket*).
3. **Menggunakan Layanan (AP-REQ):** Anda memberikan **Tiket Rollercoaster** tersebut kepada **Penjaga Wahana** (*Server Tujuan*). Penjaga memverifikasi tiket tersebut sah, dan Anda dipersilakan masuk menikmati wahana. Penjaga sama sekali tidak pernah tahu KTP (Password) Anda.

### 5.2. NTLM (NT LAN Manager)
* **Deskripsi:** Protokol autentikasi *legacy* (warisan).
* **Cara Kerja:** Menggunakan mekanisme *challenge-response*. Server mengirimkan tantangan (teks acak), dan klien menjawab dengan enkripsi menggunakan *hash password*. 
* **Kelemahan:** Rentan terhadap *Pass-the-Hash* dan *Relay Attacks*. NTLMv1 harus dimatikan sama sekali.

### 5.3. LDAP dan LDAPS (Lightweight Directory Access Protocol)
* **Deskripsi:** Protokol inti untuk membaca dan menulis database AD.
* **Kelemahan:** LDAP biasa (port 389) mengirimkan data (*termasuk kredensial*) dalam *plaintext*. Harus diganti menggunakan **LDAPS** (port 636) agar terenkripsi via SSL/TLS.

### 5.4. SMB (Server Message Block)
* **Deskripsi:** Protokol untuk berbagi *file*, *printer*, dan membaca *Group Policy* (SYSVOL).
* **Kelemahan:** SMBv1 memiliki celah keamanan fatal (seperti eksploitasi EternalBlue/WannaCry). Harus dinonaktifkan dan menggunakan SMBv2/v3 dengan fitur *SMB Signing*.

## 6. Serangan Umum pada Active Directory (Common Attacks) dan Penyebabnya

Karena AD adalah pusat kendali, ia menjadi target utama. Berikut adalah serangan yang paling sering terjadi beserta alasan teknis mengapa bisa terjadi:

### 6.1. Serangan Berbasis Kerberos
* **Kerberoasting**
  * **Deskripsi:** Penyerang meminta tiket layanan (Service Ticket) untuk akun layanan tertentu (SPN), mengekstrak tiket tersebut, dan melakukan *brute-force* secara *offline* untuk mencari *password* aslinya.
  * **Kenapa Bisa Terjadi:** Secara desain AD, *setiap user yang terautentikasi (meski hak aksesnya rendah)* berhak meminta tiket layanan untuk SPN apa pun. Serangan ini berhasil jika admin memberikan *password* yang lemah dan tidak pernah diganti pada *Service Accounts*, sehingga *hash* pada tiket mudah dibobol.
* **AS-REP Roasting**
  * **Deskripsi:** Penyerang langsung meminta respons autentikasi (AS-REP) ke Domain Controller untuk pengguna tertentu tanpa melalui pra-autentikasi, lalu memecahkan *hash password* di dalamnya.
  * **Kenapa Bisa Terjadi:** Administrator secara sadar/tidak sadar mencentang opsi *"Do not require Kerberos preauthentication"* pada akun pengguna (biasanya demi alasan kompatibilitas aplikasi tua). Tanpa fitur pra-autentikasi ini, DC akan langsung memberikan sebagian data yang dienkripsi dengan *hash password* pengguna kepada siapa pun yang memintanya.
* **Golden Ticket**
  * **Deskripsi:** Penyerang membuat *Gelang Akses Harian (TGT)* palsu yang sangat *powerful* secara mandiri, memberikan mereka akses Domain Admin tanpa batas.
  * **Kenapa Bisa Terjadi:** Penyerang sebelumnya berhasil mencuri *hash password* dari akun sistem utama bernama `krbtgt` (akun layanan KDC). Karena tiket Kerberos secara kriptografis ditandatangani oleh akun ini, memiliki hak `krbtgt` berarti memiliki mesin pencetak tiket (DC) itu sendiri.

### 6.2. Serangan Berbasis NTLM & Kredensial
* **Pass-the-Hash (PtH)**
  * **Deskripsi:** Penyerang mengambil *hash* NTLM dari memori komputer yang sudah disusupi, lalu menggunakan *hash* tersebut layaknya *password* untuk *login* ke komputer lain.
  * **Kenapa Bisa Terjadi:** Windows secara *default* menyimpan kredensial (*hash*) pengguna di dalam memori proses LSA (LSASS.exe) agar pengguna tidak perlu *login* berulang kali (fitur *Single Sign-On*). Jika penyerang mendapatkan akses *Local Admin* di komputer tersebut, mereka dapat me-*dump* isi memori ini.
* **NTLM Relay Attack**
  * **Deskripsi:** Penyerang mencegat proses *login* NTLM milik komputer/user korban, lalu meneruskannya (*relay*) ke *server* target untuk *login* sebagai korban tersebut.
  * **Kenapa Bisa Terjadi:** Terjadi karena fitur *SMB Signing* tidak diwajibkan (tidak berstatus *Require*) di jaringan. Tanpa tanda tangan digital yang kuat, *server* target tidak bisa mendeteksi bahwa permintaan otentikasi tersebut sebenarnya berasal dari perantara (penyerang), bukan dari korban langsung.

### 6.3. Serangan Replikasi (DCSync & DCShadow)
* **DCSync**
  * **Deskripsi:** Penyerang menipu DC agar mengirimkan data rahasia (termasuk *hash password* seluruh user) kepada komputer penyerang.
  * **Kenapa Bisa Terjadi:** Terjadi akibat pendelegasian hak akses yang buruk (seperti *Over-privileged*). Jika sebuah akun biasa secara keliru diberikan izin `Replicating Directory Changes` di level domain, DC akan mengira akun tersebut adalah sesama Domain Controller yang sedang melakukan sinkronisasi/replikasi data normal.

## 7. Strategi Pengamanan (Hardening)

1. **Penerapan Tiered Administration Model:** Mengisolasi hak akses administrator (Tier 0 = DC, Tier 1 = Server, Tier 2 = Workstation).
2. **Implementasi LAPS (Local Administrator Password Solution):** Mengotomatisasi rotasi kata sandi administrator lokal pada seluruh endpoint domain.
3. **Nonaktifkan Protokol Legacy:** Matikan NTLMv1, SMBv1, WDigest, dan aktifkan fitur *SMB Signing*.
4. **Membatasi Service Accounts:** Menggunakan *Group Managed Service Accounts (gMSA)* agar password dirotasi otomatis dan rumit (mencegah Kerberoasting).

## 8. Kesimpulan

Active Directory tetap menjadi pilar utama pengelolaan identitas pada infrastruktur TI. Memahami mekanisme Kerberos, titik lemah dari setiap protokol, dan bagaimana *threat actors* mengeksploitasi fitur bawaan AD sangat krusial untuk menerapkan taktik pertahanan (*hardening*) yang tepat di era hibrida (*On-Premises* & Entra ID) saat ini.