# PRD — AI Cisco Topology Generator

**Nama Produk:** NetTopo AI  
**Jenis Produk:** AI-powered Cisco Packet Tracer Topology Generator  
**Versi Dokumen:** 1.0  
**Status:** Initial Product Requirements  
**Target Pengguna:** Mahasiswa TKJ, Teknik Komputer, Informatika, dosen, dan network engineer pemula.

## 1. Ringkasan Produk

NetTopo AI adalah aplikasi web yang mengubah instruksi berbentuk teks maupun soal praktikum jaringan menjadi rancangan topologi jaringan Cisco yang terstruktur, dapat diedit, dianalisis, dan dipersiapkan untuk digunakan di Cisco Packet Tracer.

Aplikasi memiliki dua alur utama:

1. **Text to Topology:** pengguna mendeskripsikan jaringan yang ingin dibuat.
2. **Assignment to Topology:** pengguna memasukkan soal praktikum, kemudian AI mengekstrak kebutuhan, menyusun topologi, merancang IP addressing, serta menyiapkan konfigurasi perangkat.

Hasil generasi harus berupa topologi visual, spesifikasi perangkat, daftar koneksi, IP addressing, konfigurasi CLI, dan laporan validasi.

Ekspor ke file `.pkt` merupakan fitur utama yang wajib diteliti dan dibuktikan secara teknis. Sistem dilarang mengklaim file berhasil dibuat jika file tersebut belum benar-benar dapat dibuka oleh Cisco Packet Tracer.

## 2. Masalah yang Ingin Diselesaikan

- Mahasiswa kesulitan menerjemahkan soal tertulis menjadi topologi.
- Pembuatan perangkat dan kabel secara manual memerlukan waktu.
- IP addressing dan subnetting sering tidak sesuai kebutuhan.
- Konfigurasi router dan switch sering mengalami kesalahan.
- Mahasiswa membutuhkan penjelasan mengapa topologi dirancang dengan cara tertentu.
- Tidak ada jaminan bahwa diagram biasa dapat digunakan langsung sebagai proyek Packet Tracer.

## 3. Tujuan Produk

- Mengubah teks menjadi rancangan topologi terstruktur.
- Memahami soal praktikum dan mengidentifikasi seluruh persyaratan jaringan.
- Membuat visualisasi perangkat dan koneksi yang bisa diedit.
- Menghasilkan IP plan dan konfigurasi CLI sesuai rancangan.
- Memvalidasi konektivitas logis dan mendeteksi kesalahan desain.
- Menghasilkan file `.pkt` melalui metode yang benar-benar teruji, jika metode tersebut layak secara teknis.
- Membantu mahasiswa memahami solusi, bukan sekadar menyalin hasil.

## 4. Target Pengguna

### 4.1 Mahasiswa

Membuat topologi berdasarkan soal praktikum dan memahami konfigurasi perangkat.

### 4.2 Pelajar TKJ

Belajar perangkat jaringan, subnetting, routing, VLAN, dan troubleshooting.

### 4.3 Dosen dan Pengajar

Menyiapkan contoh topologi untuk demonstrasi pembelajaran.

### 4.4 Network Engineer Pemula

Membuat draft rancangan jaringan untuk simulasi dan dokumentasi.

## 5. Fitur Utama

### 5.1 Authentication dan Project Management

- Registrasi dan login.
- Dashboard proyek.
- Membuat, mengubah nama, menduplikasi, dan menghapus proyek.
- Menyimpan hasil generasi.
- Membuka kembali proyek sebelumnya.
- Melihat riwayat generasi dan revisi.

### 5.2 Text to Topology

Pengguna memasukkan deskripsi jaringan melalui textarea.

Contoh:

"Buat jaringan dengan 2 router, 3 switch, dan 6 PC. Setiap router memiliki satu LAN. Gunakan static routing agar semua PC dapat berkomunikasi."

AI mengekstrak:

- Jumlah dan jenis perangkat.
- Nama perangkat.
- Relasi dan koneksi.
- Jumlah LAN dan subnet.
- Protokol routing.
- Persyaratan konektivitas.
- Persyaratan konfigurasi.
- Informasi yang belum disebutkan.

Pengguna dapat memilih opsi tambahan seperti tingkat kesulitan, model perangkat, metode routing, dan kebutuhan VLAN.

### 5.3 Assignment to Topology

Pengguna dapat:

- Menempelkan teks soal.
- Mengunggah PDF atau DOCX sebagai fitur lanjutan.
- Melihat ringkasan soal yang telah diekstrak.
- Melihat daftar persyaratan wajib.
- Memeriksa asumsi yang dibuat AI.
- Mengonfirmasi atau memperbaiki interpretasi soal sebelum generasi.

Sistem harus mempertahankan ketentuan eksplisit dalam soal. Jika informasi kritis tidak tersedia, sistem meminta klarifikasi atau menandai asumsi, bukan mengarang ketentuan.

### 5.4 AI Topology Planner

AI menghasilkan spesifikasi topologi terstruktur dengan schema tervalidasi.

Objek perangkat mencakup:

- ID unik.
- Nama perangkat.
- Tipe perangkat.
- Model yang dipilih.
- Posisi pada kanvas.
- Port dan interface.
- IP address dan subnet mask.
- Gateway jika diperlukan.
- Peran perangkat.

Objek koneksi mencakup:

- ID koneksi.
- Perangkat sumber dan port sumber.
- Perangkat tujuan dan port tujuan.
- Jenis media atau kabel.
- Tujuan koneksi.

AI harus memisahkan kebutuhan eksplisit dari asumsi dan rekomendasi.

### 5.5 Visual Topology Editor

Editor interaktif menyediakan:

- Drag-and-drop perangkat.
- Menambah dan menghapus perangkat.
- Membuat, menghapus, dan mengubah koneksi.
- Memindahkan perangkat pada kanvas.
- Zoom, pan, minimap, dan fit-to-screen.
- Memilih perangkat untuk membuka panel properti.
- Mengubah nama dan model perangkat.
- Melihat label interface dan alamat IP.
- Menyimpan perubahan.
- Undo dan redo sebagai fitur pengembangan.
- Menampilkan error pada perangkat atau koneksi.

Gunakan React Flow dengan custom node untuk router, switch, PC, server, dan perangkat jaringan lainnya.

### 5.6 IP Addressing Planner

- Mengalokasikan subnet berdasarkan kebutuhan host.
- Menghitung network address, subnet mask, prefix, host range, dan broadcast address.
- Memvalidasi alamat IP dan subnet.
- Memeriksa duplikasi IP.
- Memeriksa konflik subnet dan alamat gateway.
- Mendukung VLSM.
- Menyediakan tabel IP addressing yang bisa disalin dan diekspor.

Sistem tidak boleh menggunakan subnet atau IP yang bertentangan dengan persyaratan soal.

### 5.7 Configuration Generator

Menghasilkan konfigurasi CLI sesuai perangkat dan topologi, meliputi:

- Hostname.
- Konfigurasi interface.
- IP address dan subnet mask.
- `no shutdown` bila sesuai.
- Static routing.
- RIP, OSPF, atau protokol lain sesuai kebutuhan.
- VLAN dan trunk.
- Inter-VLAN routing.
- DHCP.
- Konfigurasi server sederhana jika relevan.

Fitur harus mengikuti kemampuan perangkat, interface, dan versi IOS yang dipilih.

Konfigurasi ditampilkan per perangkat dan dilengkapi keterangan tujuan perintah. Jangan menyatakan konfigurasi berhasil diuji jika hanya dihasilkan oleh AI.

### 5.8 Validation Engine

Pemeriksaan minimal:

- Seluruh koneksi memiliki endpoint yang valid.
- Port tidak digunakan secara tidak kompatibel.
- Interface dan model perangkat sesuai.
- IP address tidak duplikat.
- Subnet dan gateway konsisten.
- Tidak ada jaringan yang terisolasi tanpa alasan.
- Routing memiliki jalur menuju jaringan tujuan.
- Persyaratan wajib dari soal telah dipenuhi.
- Konfigurasi mengacu pada interface yang benar.

Laporan validasi membedakan:

1. Error: masalah yang harus diperbaiki.
2. Warning: potensi masalah.
3. Info: rekomendasi atau penjelasan.

Validasi statis tidak boleh diklaim sebagai bukti bahwa ping atau simulasi nyata berhasil.

### 5.9 Export Center

Format keluaran:

- JSON spesifikasi topologi.
- PNG atau SVG diagram.
- PDF laporan topologi.
- TXT konfigurasi CLI per perangkat.
- ZIP berisi diagram, IP plan, konfigurasi, dan dokumentasi.
- `.pkt` jika jalur ekspor telah dibuktikan kompatibel.

Untuk ekspor `.pkt`, lakukan proof of concept terlebih dahulu menggunakan versi Cisco Packet Tracer yang ditentukan.

Jika ekspor otomatis belum layak, tampilkan status yang jujur dan sediakan alternatif yang benar-benar bisa digunakan. Jangan mengganti ekstensi file lain menjadi `.pkt`.

### 5.10 Learning Assistant

- Penjelasan alasan pemilihan topologi.
- Penjelasan subnetting.
- Penjelasan routing dan VLAN.
- Panduan konfigurasi per perangkat.
- Daftar langkah pengujian.
- Saran troubleshooting.
- Penjelasan kesalahan berdasarkan laporan validasi.

## 6. Alur Pengguna

### Alur A — Text to Topology

1. Pengguna login.
2. Membuka dashboard.
3. Memilih New Topology.
4. Memasukkan deskripsi jaringan.
5. Mengatur opsi perangkat dan protokol jika diperlukan.
6. AI mengekstrak kebutuhan.
7. Sistem meminta konfirmasi apabila terdapat informasi kritis yang ambigu.
8. Topology Planner menghasilkan spesifikasi terstruktur.
9. Validation Engine memeriksa spesifikasi.
10. Editor menampilkan diagram.
11. Pengguna mengedit perangkat, koneksi, atau konfigurasi.
12. Sistem memvalidasi ulang perubahan.
13. Pengguna mengunduh hasil yang tersedia.

### Alur B — Assignment to Topology

1. Pengguna memilih Assignment Mode.
2. Menempelkan teks soal atau mengunggah dokumen.
3. Sistem mengekstrak perangkat, ketentuan, dan tujuan pengujian.
4. Pengguna meninjau ringkasan persyaratan.
5. Sistem mengidentifikasi informasi yang kurang.
6. Pengguna mengonfirmasi asumsi atau memberi informasi tambahan.
7. AI menyusun topologi.
8. Sistem menghasilkan IP plan dan konfigurasi.
9. Validation Engine memeriksa pemenuhan soal.
10. Diagram dan laporan ditampilkan.
11. Pengguna mengedit jika diperlukan.
12. Pengguna mengekspor hasil.

## 7. Halaman Aplikasi

### Public Pages

- Landing page.
- Features.
- Documentation.
- Login.
- Register.

### Authenticated Pages

- Dashboard.
- New Topology.
- Assignment Analyzer.
- Topology Editor.
- Device Configuration.
- IP Addressing.
- Validation Report.
- Export Center.
- Project History.
- Settings.

### Topology Editor Layout

- Sidebar kiri: katalog perangkat.
- Area tengah: kanvas topologi.
- Sidebar kanan: properti perangkat atau koneksi.
- Toolbar atas: nama proyek, undo, redo, save, validate, export.
- Panel bawah: log, konfigurasi CLI, dan hasil validasi.

## 8. Teknologi

### Frontend

- Next.js dengan App Router.
- TypeScript.
- React.
- React Flow (`@xyflow/react`).
- Tailwind CSS.
- shadcn/ui.

### Backend

- Python.
- FastAPI.
- Pydantic untuk validasi schema.
- NetworkX untuk analisis graph jika diperlukan.
- Library perhitungan IP seperti `ipaddress` dari Python standard library.

### Database dan Infrastruktur

- PostgreSQL.
- Prisma untuk akses database dari Next.js jika diperlukan.
- SQLAlchemy atau SQLModel untuk layanan Python jika diperlukan.
- Penyimpanan objek untuk file ekspor jika dibutuhkan.
- Queue/background worker untuk generasi dan ekspor yang berat, bila diperlukan.

### AI

- LLM melalui provider yang dapat diganti.
- Structured Outputs atau JSON Schema bila didukung provider.
- Prompt terpisah untuk ekstraksi soal dan perencanaan topologi.
- Deterministic validation di luar LLM.

### Integrasi Cisco Packet Tracer

- Lakukan feasibility study pada format `.pkt` dan mekanisme integrasi yang sah.
- Jangan mengasumsikan tersedia API publik untuk membuat file proyek.
- Jangan mengandalkan reverse engineering format proprietary sebagai fondasi MVP tanpa pembuktian, pertimbangan legal, dan uji kompatibilitas.

## 9. Arsitektur

Alur pemrosesan:

Input pengguna
→ Assignment/Text Parser
→ Requirement Extractor
→ Clarification dan Assumption Review
→ AI Topology Planner
→ Structured Topology Schema
→ Topology Validation Engine
→ IP Addressing Engine
→ Configuration Generator
→ Visual Topology Editor
→ Export Pipeline
→ Hasil dan laporan.

AI tidak boleh langsung menghasilkan binary `.pkt` tanpa melalui proses dan mekanisme ekspor yang telah teruji.

## 10. Data Model

Entitas utama:

### User

- id
- name
- email
- password_hash atau identitas autentikasi provider
- created_at
- updated_at

### Project

- id
- user_id
- name
- source_type
- source_text
- status
- created_at
- updated_at

### TopologyVersion

- id
- project_id
- version_number
- topology_json
- requirement_json
- validation_json
- created_at

### Device

Disimpan sebagai bagian dari spesifikasi topologi atau tabel relasional jika dibutuhkan.

- id
- topology_version_id
- device_type
- model
- hostname
- properties_json

### Connection

- id
- topology_version_id
- source_device_id
- source_interface
- target_device_id
- target_interface
- medium_type

### ExportJob

- id
- project_id
- format
- status
- artifact_path
- error_message
- created_at
- completed_at

## 11. API Awal

- `POST /api/projects` — membuat proyek.
- `GET /api/projects` — daftar proyek.
- `GET /api/projects/{id}` — detail proyek.
- `PATCH /api/projects/{id}` — mengubah metadata proyek.
- `DELETE /api/projects/{id}` — menghapus proyek.
- `POST /api/topology/parse` — mengekstrak persyaratan.
- `POST /api/topology/generate` — menghasilkan topologi.
- `POST /api/topology/validate` — memvalidasi spesifikasi.
- `POST /api/topology/configure` — menghasilkan konfigurasi.
- `POST /api/topology/export` — memulai ekspor.
- `GET /api/exports/{id}` — memeriksa status ekspor.

Gunakan autentikasi, validasi input, otorisasi kepemilikan proyek, batas ukuran file, dan pembatasan penggunaan AI.

## 12. MVP Scope

MVP harus memprioritaskan satu alur yang bisa berfungsi dari awal sampai akhir.

### Wajib

1. Input teks.
2. Input soal berbentuk teks.
3. Ekstraksi persyaratan.
4. Preview ringkasan persyaratan.
5. Generasi spesifikasi topologi.
6. Editor visual interaktif.
7. IP addressing planner.
8. Konfigurasi CLI dasar.
9. Static validation.
10. Simpan dan buka proyek.
11. Ekspor JSON, SVG/PNG, PDF, dan konfigurasi TXT.
12. Uji kelayakan `.pkt` dan dokumentasi hasilnya.

### Setelah MVP

- Upload PDF dan DOCX.
- OSPF dan VLAN yang lebih lengkap.
- DHCP dan inter-VLAN routing.
- Riwayat versi.
- Pengujian otomatis melalui integrasi yang tersedia.
- Otomatisasi ekspor `.pkt` jika jalurnya sudah terbukti.
- Sharing proyek dan kolaborasi.

## 13. Non-Functional Requirements

- Type safety pada frontend dan schema API.
- Respons error yang jelas.
- Validasi hasil AI sebelum ditampilkan.
- Penyimpanan proyek yang aman.
- API key AI hanya berada di server.
- File upload dibatasi tipe dan ukurannya.
- Proses generasi dapat dilacak statusnya.
- Tidak ada klaim keberhasilan ekspor atau simulasi tanpa verifikasi.
- Pengujian unit dan integrasi untuk perhitungan IP serta validasi koneksi.
- Antarmuka responsif, terutama untuk desktop.

## 14. Acceptance Criteria

MVP dianggap siap diuji apabila:

1. Pengguna dapat memasukkan teks deskripsi jaringan.
2. Pengguna dapat memasukkan soal praktikum.
3. Persyaratan hasil ekstraksi bisa ditinjau.
4. Topologi tampil dalam editor visual.
5. Pengguna dapat memindahkan node dan mengubah koneksi.
6. Spesifikasi dapat disimpan dan dibuka kembali.
7. IP address dan subnet dapat diperiksa secara otomatis.
8. Konfigurasi CLI tersedia per perangkat.
9. Error dan warning ditampilkan dengan jelas.
10. Diagram dan konfigurasi dapat diekspor.
11. Pengujian ekspor `.pkt` dilakukan pada versi Packet Tracer yang ditetapkan.
12. Jika `.pkt` belum dapat dihasilkan secara valid, sistem menyatakannya secara transparan dan tidak menghasilkan file palsu.

## 15. Risiko dan Mitigasi

### Risiko: Format `.pkt` tidak memiliki jalur ekspor publik yang dapat diandalkan

Mitigasi: lakukan feasibility study sebelum menjanjikan ekspor otomatis. Evaluasi metode resmi, integrasi yang diizinkan, atau alur bantuan melalui aplikasi desktop.

### Risiko: AI menghasilkan topologi tidak valid

Mitigasi: gunakan schema ketat, katalog perangkat, model port, dan deterministic validator.

### Risiko: Konfigurasi CLI tidak sesuai perangkat

Mitigasi: gunakan template konfigurasi berdasarkan model dan fitur yang didukung, lalu validasi sintaks yang dapat diperiksa.

### Risiko: Diagram terlihat benar tetapi jaringan tidak bekerja

Mitigasi: pisahkan validasi visual, validasi statis, dan pengujian simulasi. Tampilkan status pengujian yang benar.

### Risiko: Biaya AI terlalu tinggi

Mitigasi: ekstrak kebutuhan secara terstruktur, batasi ukuran input, simpan hasil, dan gunakan model sesuai kompleksitas tugas.

## 16. Prinsip Produk

- Akurasi lebih penting daripada banyaknya fitur.
- AI bertugas memahami kebutuhan dan menyusun rancangan.
- Engine deterministik bertugas menghitung dan memvalidasi.
- Pengguna harus dapat meninjau dan mengedit hasil.
- File ekspor harus valid, bukan sekadar memiliki ekstensi yang benar.
- Setiap asumsi yang memengaruhi hasil harus terlihat oleh pengguna.

**Prioritas pengembangan: bangun pipeline topologi yang valid terlebih dahulu, lalu buktikan ekspor `.pkt` sebelum menjadikan otomatisasi `.pkt` sebagai fitur yang dijanjikan.**