# 📋 SOP: Memulai Proyek Baru dari Stack Plus Studio Core Engine

Dokumen ini adalah panduan standar yang dipakai setiap kali ada proyek klien baru masuk. Tujuannya supaya setup selalu konsisten, identitas Git tidak tercampur, dan repo klien tidak pernah "menempel" ke repo Core System.

Repo Core System: `https://github.com/stackplustudio/stackplustudio-core`

---

## TAHAP 1: Setup Repository

Ada dua cara yang sama-sama sah untuk memulai. Pilih salah satu sesuai kondisi.

### Opsi A — "Use this template" (paling cepat)

Dipakai kalau repo `stackplustudio-core` sudah di-set sebagai **Template repository** di GitHub Settings.

1. Buka repo core di GitHub.
2. Klik tombol hijau **"Use this template"** → **"Create a new repository"**.
3. Beri nama sesuai proyek klien, misal `lms-project`.
4. GitHub otomatis membuat repo baru berisi salinan penuh dari core — history git langsung bersih dari nol.
5. Clone repo **baru** tersebut ke lokal:

```bash
git clone https://github.com/stackplustudio/lms-project.git
cd lms-project
```

Selesai — tidak perlu langkah tambahan untuk memutus koneksi ke core, karena "Use this template" memang tidak menyertakan histori/remote dari repo asal.

### Opsi B — Clone manual + reset Git (kalau core belum di-set sebagai template, atau ingin kontrol lebih manual)

**Langkah 1: Bikin repo kosong di GitHub**
Buat repository baru (misal `lms-project`), biarkan kosong — jangan centang "Add README".

**Langkah 2: Clone Core System ke komputer, langsung ganti nama folder**

```bash
git clone https://github.com/stackplustudio/stackplustudio-core.git lms-project
cd lms-project
```

**Langkah 3: Putuskan hubungan dari Core System**

Hapus folder `.git` bawaan dari core, lalu init ulang dari nol:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .git

# macOS/Linux
rm -rf .git
```

```bash
git init
```

**Langkah 4: Sambungkan ke repo baru dan push**

```bash
git add .
git commit -m "chore: initial setup from core system v1.0"
git remote add origin https://github.com/stackplustudio/lms-project.git
git push -u origin master
```

### Langkah wajib di kedua opsi: Isolasi identitas Git

Agar riwayat commit di repo klien memakai identitas profesional Stack Plus Studio, bukan profil freelance/pribadi:

```bash
git config user.name "Stack Plus Studio"
git config user.email "admin@stackplus.studio"
```

### Instalasi & environment

```bash
pnpm install
```

Duplikat `.env.example` menjadi `.env` di `apps/api` dan `.env.local` di `apps/web`, lalu sesuaikan `DATABASE_URL`, `JWT_SECRET`, dan `NEXT_PUBLIC_API_URL`.

```bash
pnpm --filter ./apps/api prisma db push
pnpm dev
```

Proyek baru kini sudah punya "rumah" sendiri di GitHub dan siap dikembangkan.

---

## TAHAP 2: Menambahkan Fitur Bisnis (Contoh: LMS)

Fondasi (Autentikasi, JWT, Middleware, Axios Interceptor, Toast, dll) sudah selesai dari Core System. Pekerjaan berikutnya 100% fokus ke fitur bisnis proyek.

### 1. Update skema database (Prisma)

Selalu jadi langkah pertama. Buka `apps/api/prisma/schema.prisma`, tambahkan model baru di bawah model `User` yang sudah ada:

```prisma
model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Int
  modules     Module[]
}

model Module {
  id       String @id @default(uuid())
  title    String
  courseId String
  course   Course @relation(fields: [courseId], references: [id])
}
```

Lalu sinkronkan ke database:

```bash
pnpm --filter ./apps/api prisma db push
```

### 2. Tambah modul backend (NestJS)

Jangan buat folder secara manual. Gunakan NestJS CLI supaya DTO, Controller, dan Service langsung terbuat mengikuti standar yang sama seperti modul `users`:

```bash
cd apps/api
nest g resource courses
nest g resource modules
```

Ini otomatis membuat `apps/api/src/courses` dan `apps/api/src/modules` lengkap dengan blueprint CRUD — tinggal diisi logikanya. Gunakan decorator `@Roles()` yang sama seperti contoh di modul `users` untuk membatasi akses per role (misal hanya `INSTRUCTOR` yang boleh membuat course).

### 3. Tambah halaman frontend (Next.js Route Groups)

Buat folder baru di dalam `apps/web/src/app/(dashboard)/` sesuai role yang dibutuhkan proyek. Contoh untuk LMS dengan role Instruktur dan Siswa:

```text
apps/web/src/app/
├── (dashboard)/
│   ├── instructor/           # Folder baru
│   │   ├── layout.tsx        # Sidebar khusus instruktur
│   │   ├── courses/          # Halaman CRUD materi kelas
│   │   └── page.tsx
│   │
│   └── student/               # Folder baru
│       ├── layout.tsx        # Sidebar khusus siswa
│       ├── my-learning/       # Halaman belajar/nonton materi
│       └── page.tsx
```

---

## Ringkasan Alur

Core System ibarat tanah yang sudah ada fondasi cor-coran, pagar, dan satpamnya. Setiap proyek baru tinggal:

1. **"Beli tanah baru"** dengan desain yang sama → Tahap 1 (setup Git & repo).
2. **"Bikin denah ruangan baru"** → Prisma Schema.
3. **"Bangun tembok ruangan"** → `nest g resource` di backend.
4. **"Cat dan hias ruangannya"** → Slicing UI di Next.js Route Groups.

Urusan login, JWT kedaluwarsa, dan proteksi rute tidak perlu dipikirkan ulang — semua sudah diurus oleh Core System.

---

## ✅ Checklist Cepat Setiap Proyek Baru

- [ ] Buat repo baru di GitHub (via template atau kosong)
- [ ] Clone / setup lokal, pastikan `.git` sudah terhubung ke repo baru (bukan core)
- [ ] Set identitas Git Stack Plus Studio
- [ ] `pnpm install` + setup `.env`
- [ ] `prisma db push` awal
- [ ] Tambah model Prisma sesuai kebutuhan bisnis
- [ ] Generate modul backend dengan `nest g resource`
- [ ] Buat Route Groups frontend sesuai role
- [ ] `pnpm dev` untuk memastikan semua jalan normal