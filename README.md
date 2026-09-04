# 🚀 Stack Plus Studio - Core Engine V1.0 (Fullstack Monorepo)

Boilerplate Fullstack Web Development kelas *Enterprise* yang dirancang khusus untuk mempercepat inisiasi proyek klien.

Dibangun dengan arsitektur **Monorepo (Turborepo)** yang memisahkan:

* Frontend menggunakan **Next.js**
* Backend menggunakan **NestJS**
* Database menggunakan **PostgreSQL + Prisma**
* Workspace management menggunakan **pnpm**
* Build orchestration menggunakan **Turborepo**

Seluruh komponen berada dalam satu *repository* sehingga proses pengembangan, pengelolaan dependency, konfigurasi database, autentikasi, hingga deployment dapat dikelola secara terstruktur dan terintegrasi.

---

# 📚 Daftar Isi

* [🚀 Stack Plus Studio - Core Engine V1.0](#-stack-plus-studio---core-engine-v10-fullstack-monorepo)
* [🛠️ Tech Stack Utama](#️-tech-stack-utama)
* [🏗️ Arsitektur Monorepo](#️-arsitektur-monorepo)
* [📁 Struktur Direktori](#-struktur-direktori)
* [🔎 Penjelasan Setiap Direktori](#-penjelasan-setiap-direktori)
* [⚙️ Prasyarat Sistem](#️-prasyarat-sistem)
* [🚦 Panduan Memulai Proyek Baru](#-panduan-memulai-proyek-baru)

  * [1. Persiapan Project](#1-persiapan-project)
  * [2. Konfigurasi Identitas Git](#2-konfigurasi-identitas-git)
  * [3. Instalasi Dependency](#3-instalasi-dependency)
  * [4. Membuat Database Neon](#4-membuat-database-neon)
  * [5. Konfigurasi Environment Variables](#5-konfigurasi-environment-variables)
  * [6. Setup Prisma](#6-setup-prisma)
  * [7. Database Seeding](#7-database-seeding)
  * [8. Menjalankan Development Server](#8-menjalankan-development-server)
  * [9. Verifikasi Frontend](#9-verifikasi-frontend)
  * [10. Verifikasi Backend](#10-verifikasi-backend)
  * [11. Verifikasi Database](#11-verifikasi-database)
* [🌱 Database Seeding](#-database-seeding)
* [🔐 Sistem Keamanan dan Authentication Flow](#-sistem-keamanan-dan-authentication-flow)
* [🗄️ Database Management](#️-database-management)
* [🔄 Workflow Pengembangan](#-workflow-pengembangan)
* [🧩 Penambahan Modul Backend](#-penambahan-modul-backend)
* [🌐 Pengembangan Frontend](#-pengembangan-frontend)
* [🧪 Checklist Sebelum Deployment](#-checklist-sebelum-deployment)
* [🚀 Deployment](#-deployment)

  * [Frontend ke Vercel](#frontend-ke-vercel)
  * [Backend ke VPS menggunakan Docker](#backend-ke-vps-menggunakan-docker)
* [🔒 Environment Variables](#-environment-variables)
* [⚠️ Catatan Penting](#️-catatan-penting)
* [🛠️ Troubleshooting](#️-troubleshooting)
* [📌 Quick Start](#-quick-start)
* [❤️ Credits](#️-credits)

---

# 🛠️ Tech Stack Utama

## Arsitektur & Tooling

| Teknologi     | Fungsi                                                           |
| ------------- | ---------------------------------------------------------------- |
| **Turborepo** | Mengelola workflow dan task dalam monorepo                       |
| **pnpm**      | Package manager dan workspace management                         |
| **Monorepo**  | Menyatukan frontend, backend, dan database dalam satu repository |

---

## Frontend — `apps/web`

| Teknologi                     | Fungsi                         |
| ----------------------------- | ------------------------------ |
| **Next.js 16**                | Framework frontend             |
| **App Router**                | Sistem routing Next.js         |
| **Tailwind CSS**              | Styling                        |
| **Shadcn UI / UI Components** | Komponen antarmuka             |
| **React Hooks**               | State dan lifecycle management |
| **Axios**                     | HTTP client                    |
| **Bearer Token**              | Authorization request          |
| **Next.js Middleware**        | Proteksi route                 |
| **React Hot Toast**           | Feedback/notifikasi UI         |

---

## Backend — `apps/api`

| Teknologi    | Fungsi                          |
| ------------ | ------------------------------- |
| **NestJS**   | Framework backend               |
| **JWT**      | Authentication token            |
| **bcryptjs** | Password hashing                |
| **Passport** | Authentication strategy         |
| **Docker**   | Containerization dan deployment |

---

## Database — `packages/database`

| Teknologi         | Fungsi                         |
| ----------------- | ------------------------------ |
| **Prisma**        | ORM                            |
| **PostgreSQL**    | Database relational            |
| **Neon**          | Serverless PostgreSQL provider |
| **Prisma Client** | Akses database dari aplikasi   |

---

# 🏗️ Arsitektur Monorepo

Project menggunakan pola:

```text
                    ┌───────────────────────┐
                    │      Client/User      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Next.js Frontend    │
                    │       apps/web        │
                    └───────────┬───────────┘
                                │
                         HTTP / Axios
                                │
                                ▼
                    ┌───────────────────────┐
                    │     NestJS Backend    │
                    │       apps/api        │
                    └───────────┬───────────┘
                                │
                           Prisma ORM
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Database Package    │
                    │   packages/database   │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Neon PostgreSQL    │
                    └───────────────────────┘
```

Konsep utamanya adalah:

```text
Frontend
   ↓
Backend API
   ↓
Prisma
   ↓
PostgreSQL / Neon
```

Frontend tidak berkomunikasi langsung dengan database.

Seluruh akses database dilakukan melalui Backend menggunakan Prisma.

---

# 📁 Struktur Direktori

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   └── ...
│   │   │   ├── prisma
│   │   │   │   └── ...
│   │   │   ├── users
│   │   │   │   └── ...
│   │   │   └── main.ts
│   │   │
│   │   └── Dockerfile
│   │
│   └── web
│       └── src
│           ├── app
│           │   └── ...
│           ├── components
│           │   └── ...
│           ├── lib
│           │   └── ...
│           └── middleware.ts
│
├── packages
│   └── database
│       ├── prisma
│       │   ├── schema.prisma
│       │   └── seed.ts
│       │
│       └── index.ts
│
├── pnpm-workspace.yaml
├── turbo.json
└── ...
```

---

# 🔎 Penjelasan Setiap Direktori

## `apps/`

Folder utama untuk seluruh aplikasi yang dijalankan.

Saat ini terdapat dua aplikasi:

```text
apps/
├── api/
└── web/
```

---

## `apps/api`

Berisi seluruh source code Backend menggunakan NestJS.

```text
apps/api/
├── src/
└── Dockerfile
```

Backend bertanggung jawab terhadap:

* API
* Authentication
* Authorization
* User management
* Business logic
* Database access melalui Prisma
* JWT
* Password hashing
* API endpoint

---

## `apps/api/src/auth`

Modul authentication.

Digunakan untuk kebutuhan seperti:

* Login
* JWT
* Passport
* Authentication Guard
* Validasi token

---

## `apps/api/src/prisma`

Berfungsi sebagai jembatan antara NestJS dengan package database.

Database utama tetap didefinisikan pada:

```text
packages/database
```

Dengan demikian, schema database tidak tersebar di dalam aplikasi backend.

---

## `apps/api/src/users`

Berisi blueprint modul CRUD User.

Struktur ini dapat digunakan sebagai standar ketika menambahkan modul backend baru.

---

## `apps/api/src/main.ts`

Merupakan entry point aplikasi backend.

Backend berjalan pada:

```text
http://localhost:3001
```

---

## `apps/api/Dockerfile`

Digunakan untuk membuat Docker image backend.

Dockerfile ini disediakan agar backend dapat dideploy menggunakan container.

---

# 🌐 `apps/web`

Folder frontend menggunakan Next.js.

```text
apps/web/
└── src/
    ├── app/
    ├── components/
    ├── lib/
    └── middleware.ts
```

---

## `apps/web/src/app`

Berisi halaman dan routing menggunakan Next.js App Router.

Contoh konsep:

```text
app/
├── page.tsx
├── login/
│   └── page.tsx
└── dashboard/
    └── page.tsx
```

---

## `apps/web/src/components`

Berisi komponen UI yang dapat digunakan kembali.

Tujuannya agar komponen tidak dibuat berulang-ulang di setiap halaman.

---

## `apps/web/src/lib`

Berisi konfigurasi eksternal frontend.

Salah satu bagian pentingnya adalah konfigurasi Axios dan interceptor untuk request API.

---

## `apps/web/src/middleware.ts`

Middleware frontend.

Fungsinya sebagai lapisan proteksi route pada Next.js.

Contoh route yang membutuhkan authentication:

```text
/dashboard
```

---

# 🗄️ `packages/database`

Package database merupakan **Master Database / Single Source of Truth**.

Struktur:

```text
packages/database/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── index.ts
```

---

## `schema.prisma`

Ini adalah lokasi utama untuk mendesain struktur database.

```text
packages/database/prisma/schema.prisma
```

Jika ingin mengubah struktur tabel, relasi, field, atau model Prisma, perubahan utama dilakukan pada file ini.

---

## `seed.ts`

Berisi script untuk mengisi database dengan data awal.

Digunakan untuk membuat akun default secara otomatis.

---

## `index.ts`

Entry point package database.

Package database digunakan oleh aplikasi lain dalam monorepo.

---

# ⚙️ Prasyarat Sistem

Sebelum menjalankan project, pastikan environment sudah memiliki:

* Node.js
* pnpm
* Git
* Database Neon
* Akses ke repository project

Pastikan seluruh tools tersebut dapat digunakan dari terminal.

Untuk memeriksa instalasi Node.js:

```bash
node --version
```

Untuk memeriksa pnpm:

```bash
pnpm --version
```

Untuk memeriksa Git:

```bash
git --version
```

Jika command tersebut menghasilkan versi masing-masing aplikasi, berarti tool sudah tersedia pada environment.

---

# 🚦 Panduan Memulai Proyek Baru

Bagian ini merupakan workflow utama ketika menggunakan Stack Plus Studio Core Engine untuk membuat project baru.

Urutan yang direkomendasikan:

```text
1. Siapkan project
        ↓
2. Konfigurasi Git
        ↓
3. Install dependency
        ↓
4. Buat database Neon
        ↓
5. Konfigurasi .env
        ↓
6. Generate & setup Prisma
        ↓
7. Jalankan database seed
        ↓
8. Jalankan development server
        ↓
9. Test frontend
        ↓
10. Test backend
        ↓
11. Test database
        ↓
12. Siap development
```

---

# 1. Persiapan Project

Masuk ke folder project.

Contoh:

```bash
cd nama-project
```

Pastikan terminal berada pada **root project**, yaitu folder yang memiliki:

```text
apps/
packages/
pnpm-workspace.yaml
turbo.json
```

Contoh:

```text
nama-project/
├── apps/
├── packages/
├── pnpm-workspace.yaml
└── turbo.json
```

Seluruh command workspace pada dokumentasi ini diasumsikan dijalankan dari root project kecuali disebutkan lain.

---

# 2. Konfigurasi Identitas Git

Agar riwayat commit project klien menggunakan identitas Stack Plus Studio, jalankan:

```bash
git config user.name "Stack Plus Studio"
git config user.email "admin@stackplus.studio"
```

Untuk memastikan konfigurasi sudah benar:

```bash
git config user.name
git config user.email
```

Output yang diharapkan:

```text
Stack Plus Studio
admin@stackplus.studio
```

Konfigurasi tersebut bersifat repository-specific apabila command dijalankan dari folder repository dan tidak menggunakan `--global`.

---

# 3. Instalasi Dependency

Pastikan terminal berada di root project.

Kemudian jalankan:

```bash
pnpm install
```

Command tersebut akan menginstall dependency yang dibutuhkan oleh workspace monorepo.

Setelah selesai, pastikan proses instalasi tidak menghasilkan error.

Jangan langsung menjalankan development server apabila proses `pnpm install` masih gagal.

Jika instalasi gagal, selesaikan error dependency terlebih dahulu.

---

# 4. Membuat Database Neon

Setiap project klien sebaiknya menggunakan database yang terisolasi.

Buat database baru melalui dashboard Neon.

Langkah umum:

1. Buka dashboard Neon.
2. Buat project/database baru.
3. Tunggu database selesai dibuat.
4. Cari bagian connection string.
5. Salin connection string PostgreSQL.
6. Simpan connection string tersebut untuk konfigurasi environment variable.

Format connection string yang digunakan adalah:

```text
postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require
```

Connection string tersebut nantinya digunakan sebagai:

```text
DATABASE_URL
```

---

# 5. Konfigurasi Environment Variables

Project menggunakan environment variables untuk menyimpan konfigurasi yang berbeda antara development dan production.

Jangan menaruh credential database atau JWT secret secara langsung ke dalam source code.

---

## 5.1 Environment Database

Buat file:

```text
packages/database/.env
```

Isi:

```env
DATABASE_URL="postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require"
JWT_SECRET="rahasia_super_kuat_stackplus_123!"
```

Ganti nilai:

```text
postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require
```

dengan connection string dari database Neon yang sebenarnya.

JWT secret juga harus disesuaikan dengan secret yang digunakan oleh environment tersebut.

---

## 5.2 Environment Backend

Buat file:

```text
apps/api/.env
```

Isi:

```env
DATABASE_URL="postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require"
JWT_SECRET="rahasia_super_kuat_stackplus_123!"
```

Pastikan `DATABASE_URL` mengarah ke database Neon yang benar.

---

## 5.3 Environment Frontend

Buat file:

```text
apps/web/.env.local
```

Isi:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Variable tersebut digunakan oleh frontend untuk mengetahui alamat Backend API pada development environment.

---

## 5.4 Jangan Membagikan File Environment

File environment dapat berisi credential sensitif.

Pastikan file `.env` dan `.env.local` tidak dimasukkan ke repository apabila project menggunakan `.gitignore` untuk mengecualikannya.

Jangan mengupload:

```text
DATABASE_URL
JWT_SECRET
```

ke repository publik.

---

# 6. Setup Prisma

Setelah environment variable database selesai dikonfigurasi, lanjutkan ke setup Prisma.

Semua urusan schema database pada arsitektur ini dilakukan dari:

```text
packages/database
```

---

## 6.1 Sinkronisasi Schema

Jalankan:

```bash
pnpm --filter database prisma db push
```

Command tersebut digunakan untuk melakukan sinkronisasi schema Prisma dengan database.

Pastikan:

```text
DATABASE_URL
```

sudah mengarah ke database Neon yang benar sebelum menjalankan command tersebut.

---

## 6.2 Generate Prisma Client

Setelah schema berhasil disinkronkan, jalankan:

```bash
pnpm --filter database prisma generate
```

Prisma kemudian akan membuat Prisma Client berdasarkan schema yang tersedia.

Urutan yang digunakan:

```bash
pnpm --filter database prisma db push
pnpm --filter database prisma generate
```

---

# 7. Database Seeding

Setelah database berhasil disiapkan, jalankan database seed.

Seeder berada pada:

```text
packages/database/prisma/seed.ts
```

Jalankan:

```bash
pnpm --filter database prisma db seed
```

Seeder akan membuat akun default untuk kebutuhan development.

---

# 🌱 Database Seeding

## Akun Default

Seeder menyediakan dua level user.

### 1. Super Admin

Akun Super Admin memiliki akses penuh.

```text
Username:
stackplustudio@gmail.com

Password:
stackplustudio06
```

### 2. User Biasa

Akun user biasa memiliki akses terbatas.

```text
Username:
budicahyono@gmail.com

Password:
stackplustudio3
```

Akun tersebut digunakan sebagai akun default yang dibuat oleh:

```text
packages/database/prisma/seed.ts
```

> Gunakan credential tersebut sesuai dengan kebutuhan environment development yang disediakan oleh boilerplate.

---

# 8. Menjalankan Development Server

Setelah:

* Dependency terinstall
* Database Neon tersedia
* Environment variable selesai
* Prisma berhasil di-setup
* Database seed berhasil dijalankan

jalankan seluruh ecosystem dari root project:

```bash
pnpm dev
```

Turborepo akan menjalankan aplikasi yang terdapat pada workspace sesuai konfigurasi project.

---

# 9. Verifikasi Frontend

Frontend Next.js berjalan pada:

```text
http://localhost:3000
```

Buka browser dan akses:

```text
http://localhost:3000
```

Jika halaman frontend berhasil terbuka, berarti aplikasi Next.js berhasil dijalankan.

---

# 10. Verifikasi Backend

Backend NestJS berjalan pada:

```text
http://localhost:3001
```

Pastikan proses NestJS berhasil dijalankan tanpa error pada terminal.

Frontend menggunakan:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

sebagai alamat API pada environment development.

---

# 11. Verifikasi Database

Pastikan database Neon telah menerima schema dari Prisma.

Urutan yang harus berhasil:

```text
Neon Database
     ↑
     │
Prisma db push
     ↑
     │
schema.prisma
```

Kemudian:

```text
schema.prisma
     ↓
Prisma generate
     ↓
Prisma Client
```

Setelah seed:

```text
seed.ts
     ↓
Database Neon
     ↓
Default Users
```

---

# 🔐 Sistem Keamanan dan Authentication Flow

Boilerplate menyediakan authentication flow berbasis JWT.

Alur utamanya:

```text
User
 │
 │ Login
 ▼
Next.js Frontend
 │
 │ POST /auth/login
 ▼
NestJS Backend
 │
 │ Validasi credential
 ▼
Database
 │
 │ User ditemukan
 ▼
NestJS
 │
 │ Generate JWT
 ▼
Frontend
 │
 │ Simpan token pada Cookies
 ▼
Request berikutnya
 │
 │ Axios Interceptor
 ▼
Authorization: Bearer <token>
 │
 ▼
NestJS Guard
 │
 ▼
Protected Endpoint
```

---

## 1. User Login

Frontend mengirimkan credential login ke:

```text
/auth/login
```

Backend menerima request tersebut.

---

## 2. Backend Melakukan Validasi

NestJS melakukan validasi credential user.

Password menggunakan mekanisme hashing dengan:

```text
bcryptjs
```

Authentication menggunakan:

```text
JWT
Passport
```

---

## 3. Backend Mengembalikan JWT

Apabila login berhasil, backend menghasilkan JWT token.

Token tersebut kemudian digunakan untuk authentication request berikutnya.

---

## 4. Token Disimpan

Frontend menyimpan token pada Cookies.

Cookie tersebut kemudian menjadi bagian dari mekanisme authentication frontend.

---

## 5. Axios Interceptor

Konfigurasi Axios digunakan untuk membantu menyisipkan authorization token pada request berikutnya.

Format authorization:

```http
Authorization: Bearer <token>
```

Dengan demikian, request ke endpoint yang membutuhkan authentication dapat membawa token yang diperlukan.

---

## 6. Next.js Middleware

Frontend memiliki:

```text
apps/web/src/middleware.ts
```

Middleware digunakan untuk membantu melindungi route tertentu.

Contohnya:

```text
/dashboard
```

Jika authentication cookie tidak tersedia, user diarahkan kembali ke halaman login.

---

## 7. Backend Guard

Selain proteksi frontend, backend juga melakukan proteksi.

Endpoint yang membutuhkan authentication dapat menggunakan:

```typescript
@UseGuards(JwtAuthGuard)
```

Hal ini penting karena proteksi frontend saja tidak cukup.

Frontend middleware berfungsi melindungi navigasi frontend, sedangkan backend guard melindungi endpoint API.

---

# 🗄️ Database Management

Database memiliki satu sumber utama untuk definisi schema:

```text
packages/database/prisma/schema.prisma
```

Jangan mendefinisikan schema database secara terpisah pada masing-masing aplikasi.

Struktur yang digunakan:

```text
packages/database
        │
        ▼
schema.prisma
        │
        ▼
Prisma
        │
        ▼
PostgreSQL / Neon
```

---

## Mengubah Struktur Database

Jika membutuhkan perubahan struktur database:

1. Buka:

```text
packages/database/prisma/schema.prisma
```

2. Ubah model yang diperlukan.
3. Simpan perubahan.
4. Jalankan:

```bash
pnpm --filter database prisma db push
```

5. Generate ulang Prisma Client:

```bash
pnpm --filter database prisma generate
```

6. Pastikan backend menggunakan schema terbaru.

---

# 🔄 Workflow Pengembangan

Workflow pengembangan yang direkomendasikan:

```text
┌──────────────────────┐
│ 1. Tentukan Feature  │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 2. Update Database   │
│    jika diperlukan   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 3. Update Backend    │
│    API / Business    │
│    Logic             │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 4. Update Frontend   │
│    UI / API Client   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 5. Test Feature      │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 6. Commit Changes    │
└──────────────────────┘
```

Jika feature tidak membutuhkan perubahan database, bagian database dapat dilewati.

---

# 🧩 Penambahan Modul Backend

Backend menggunakan struktur modular NestJS.

Contoh modul yang sudah tersedia:

```text
apps/api/src/
├── auth/
├── prisma/
└── users/
```

Ketika membuat modul baru, gunakan pola modular yang konsisten.

Contoh:

```text
apps/api/src/products/
```

atau:

```text
apps/api/src/orders/
```

Struktur internal mengikuti pola NestJS yang digunakan pada project.

Tujuannya agar setiap domain atau fitur memiliki area kode yang jelas.

---

# 🌐 Pengembangan Frontend

Frontend berada di:

```text
apps/web
```

Dengan struktur:

```text
src/
├── app/
├── components/
├── lib/
└── middleware.ts
```

Gunakan:

```text
app/
```

untuk halaman dan routing.

Gunakan:

```text
components/
```

untuk komponen UI reusable.

Gunakan:

```text
lib/
```

untuk konfigurasi helper dan integrasi eksternal seperti Axios.

Gunakan:

```text
middleware.ts
```

untuk logic middleware dan proteksi route frontend.

---

# 🧪 Checklist Sebelum Deployment

Sebelum melakukan deployment, pastikan seluruh bagian berikut sudah diperiksa.

## Project

* [ ] Project berada pada repository yang benar.
* [ ] Struktur `apps/` tersedia.
* [ ] Struktur `packages/` tersedia.
* [ ] `pnpm-workspace.yaml` tersedia.
* [ ] `turbo.json` tersedia.

## Dependency

* [ ] `pnpm install` berhasil.
* [ ] Tidak terdapat error dependency.
* [ ] Workspace dapat menjalankan command yang diperlukan.

## Database

* [ ] Database Neon sudah dibuat.
* [ ] `DATABASE_URL` sudah benar.
* [ ] `schema.prisma` sudah sesuai.
* [ ] `prisma db push` berhasil.
* [ ] `prisma generate` berhasil.
* [ ] Seeder berhasil dijalankan jika diperlukan.

## Backend

* [ ] Backend dapat dijalankan.
* [ ] Port backend sesuai konfigurasi.
* [ ] `JWT_SECRET` tersedia.
* [ ] API dapat menerima request.
* [ ] Authentication dapat diuji.

## Frontend

* [ ] Frontend dapat dijalankan.
* [ ] `NEXT_PUBLIC_API_URL` sesuai environment.
* [ ] Frontend dapat mengakses Backend API.
* [ ] Login dapat diuji.
* [ ] Protected route dapat diuji.

## Authentication

* [ ] Login berhasil.
* [ ] JWT berhasil dibuat.
* [ ] Token tersimpan sesuai flow aplikasi.
* [ ] Axios mengirimkan Bearer Token.
* [ ] Middleware frontend bekerja.
* [ ] Backend Guard bekerja.

---

# 🚀 Deployment

Deployment terdiri dari dua bagian utama:

```text
Frontend
   ↓
Vercel

Backend
   ↓
VPS / Docker
```

Database tetap menggunakan:

```text
Neon PostgreSQL
```

---

# Frontend ke Vercel

Frontend menggunakan Next.js dan dapat dideploy ke Vercel.

## 1. Hubungkan Repository

Hubungkan repository project ke Vercel.

---

## 2. Tentukan Root Directory

Karena frontend berada di:

```text
apps/web
```

atur:

```text
Root Directory = apps/web
```

---

## 3. Environment Variable

Tambahkan:

```env
NEXT_PUBLIC_API_URL="https://URL-BACKEND-PRODUKSI"
```

Nilai tersebut harus diarahkan ke URL backend production.

Jangan menggunakan:

```text
http://localhost:3001
```

untuk frontend production.

Development menggunakan:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Production menggunakan URL backend production.

---

# Backend ke VPS menggunakan Docker

Backend sudah memiliki:

```text
apps/api/Dockerfile
```

yang dapat digunakan untuk deployment berbasis Docker.

---

## 1. Masuk ke VPS

Login ke server VPS yang digunakan untuk deployment.

---

## 2. Pastikan Project Tersedia

Pastikan source code project tersedia di server sehingga file berikut dapat diakses:

```text
apps/api/Dockerfile
```

---

## 3. Build Docker Image

Dari root project, jalankan:

```bash
docker build -t stackplus-api -f apps/api/Dockerfile .
```

Docker akan membuat image:

```text
stackplus-api
```

berdasarkan Dockerfile backend.

---

## 4. Jalankan Container

Gunakan:

```bash
docker run -d -p 3001:3001 --env-file apps/api/.env stackplus-api
```

Parameter utama:

```text
-d
```

menjalankan container pada background.

```text
-p 3001:3001
```

memetakan port host ke port container.

```text
--env-file apps/api/.env
```

menggunakan environment variable backend.

```text
stackplus-api
```

merupakan nama image yang dibuat sebelumnya.

---

# 🔒 Environment Variables

Environment variable berbeda antara development dan production.

## Development Frontend

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Development Database

```env
DATABASE_URL="postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require"
```

## Authentication

```env
JWT_SECRET="rahasia_super_kuat_stackplus_123!"
```

Untuk production, gunakan credential dan secret yang sesuai dengan environment production.

Jangan menggunakan credential development secara sembarangan pada production.

---

# ⚠️ Catatan Penting

## 1. Database Adalah Single Source of Truth

Schema database berada di:

```text
packages/database/prisma/schema.prisma
```

Jangan membuat schema database terpisah untuk backend dan frontend.

---

## 2. Frontend Tidak Mengakses Database Secara Langsung

Arsitektur yang digunakan adalah:

```text
Frontend
   ↓
Backend
   ↓
Prisma
   ↓
Database
```

Frontend mengakses API Backend.

Backend bertanggung jawab terhadap akses database.

---

## 3. Jangan Menaruh Secret di Source Code

Credential seperti:

```text
DATABASE_URL
JWT_SECRET
```

harus berasal dari environment variable.

---

## 4. Pastikan URL API Sesuai Environment

Development:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Production:

```env
NEXT_PUBLIC_API_URL="https://URL-BACKEND-PRODUKSI"
```

Jangan menggunakan URL localhost pada frontend production.

---

## 5. Jalankan Prisma dari Workspace Database

Command Prisma menggunakan filter:

```bash
pnpm --filter database ...
```

Contoh:

```bash
pnpm --filter database prisma db push
```

dan:

```bash
pnpm --filter database prisma generate
```

Hal tersebut menjaga pengelolaan database tetap terpusat pada:

```text
packages/database
```

---

# 🛠️ Troubleshooting

## `pnpm install` gagal

Pastikan:

1. Node.js tersedia.
2. pnpm tersedia.
3. Terminal berada pada root project.
4. `pnpm-workspace.yaml` tersedia.
5. Tidak terdapat masalah dependency pada project.

Coba jalankan kembali:

```bash
pnpm install
```

---

## Prisma tidak dapat terhubung ke database

Periksa:

```env
DATABASE_URL="..."
```

Pastikan:

* URL berasal dari Neon.
* Username benar.
* Password benar.
* Nama database benar.
* Connection string menggunakan format PostgreSQL.
* Connection string memiliki konfigurasi SSL yang diperlukan.

Format yang digunakan:

```text
postgresql://username:password@ep-namaserver.region.aws.neon.tech/namadatabase?sslmode=require
```

---

## Prisma Client belum tersedia

Jalankan:

```bash
pnpm --filter database prisma generate
```

---

## Database belum memiliki tabel

Jalankan:

```bash
pnpm --filter database prisma db push
```

Kemudian:

```bash
pnpm --filter database prisma generate
```

Jika membutuhkan data default:

```bash
pnpm --filter database prisma db seed
```

---

## Frontend tidak dapat mengakses Backend

Periksa:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Pastikan backend benar-benar berjalan pada:

```text
http://localhost:3001
```

Kemudian jalankan ulang development environment jika diperlukan:

```bash
pnpm dev
```

---

## Login tidak berhasil

Periksa seluruh alur:

```text
Frontend
   ↓
/auth/login
   ↓
Backend
   ↓
Database
   ↓
Credential validation
   ↓
JWT
   ↓
Cookies
   ↓
Axios Authorization
```

Pastikan:

* Backend berjalan.
* Database dapat diakses.
* User tersedia.
* Password sesuai dengan hasil seeding.
* `JWT_SECRET` tersedia.
* API URL frontend benar.

---

# 📌 Quick Start

Jika semua konfigurasi awal sudah tersedia, workflow dasar project baru adalah:

```bash
# 1. Masuk ke project
cd nama-project

# 2. Konfigurasi Git
git config user.name "Stack Plus Studio"
git config user.email "admin@stackplus.studio"

# 3. Install dependency
pnpm install

# 4. Setup database
pnpm --filter database prisma db push

# 5. Generate Prisma Client
pnpm --filter database prisma generate

# 6. Jalankan database seed
pnpm --filter database prisma db seed

# 7. Jalankan development server
pnpm dev
```

Setelah server berjalan:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:3001
```

---

# 🔁 Full Development Flow

Secara keseluruhan, proses penggunaan Core Engine dapat dirangkum sebagai berikut:

```text
                 STACK PLUS STUDIO
                       │
                       ▼
              Create New Project
                       │
                       ▼
                Configure Git
                       │
                       ▼
                 pnpm install
                       │
                       ▼
                 Create Neon DB
                       │
                       ▼
                Configure .env
                       │
                       ▼
             Prisma db push
                       │
                       ▼
             Prisma generate
                       │
                       ▼
                Prisma seed
                       │
                       ▼
                   pnpm dev
                       │
              ┌────────┴────────┐
              ▼                 ▼
         Next.js             NestJS
       localhost:3000      localhost:3001
              │                 │
              └────────┬────────┘
                       ▼
                 Development
                       │
                       ▼
                    Testing
                       │
                       ▼
                  Deployment
                 ┌─────┴─────┐
                 ▼           ▼
              Vercel        VPS
            Frontend      Backend
                 │           │
                 └─────┬─────┘
                       ▼
                  Neon DB
```

---

# 📦 Ringkasan Komponen

| Komponen            | Lokasi              | Teknologi          | Fungsi                    |
| ------------------- | ------------------- | ------------------ | ------------------------- |
| Frontend            | `apps/web`          | Next.js 16         | User Interface            |
| Backend             | `apps/api`          | NestJS             | API & Business Logic      |
| Database            | `packages/database` | Prisma             | Database Layer            |
| Database Provider   | External            | Neon PostgreSQL    | Persistent Database       |
| Monorepo            | Root                | Turborepo          | Workspace orchestration   |
| Package Manager     | Root                | pnpm               | Dependency management     |
| Authentication      | `apps/api`          | JWT + Passport     | Authentication            |
| Password Security   | `apps/api`          | bcryptjs           | Password hashing          |
| Route Protection    | `apps/web`          | Next.js Middleware | Frontend route protection |
| HTTP Client         | `apps/web`          | Axios              | API communication         |
| Deployment Backend  | `apps/api`          | Docker             | Container deployment      |
| Deployment Frontend | `apps/web`          | Vercel             | Frontend hosting          |

---

# 🎯 Prinsip Utama Project

Core Engine ini menggunakan beberapa prinsip utama:

```text
Monorepo
   +
Separation of Concerns
   +
Centralized Database Schema
   +
API-based Communication
   +
JWT Authentication
   +
Reusable UI Components
   +
Container-ready Backend
   +
Production-ready Frontend Deployment
```

Dengan struktur tersebut, project baru dapat dimulai dari fondasi yang sama tanpa harus membangun ulang struktur frontend, backend, authentication, database integration, dan deployment dari awal.

---

# ❤️ Credits

*Developed with ❤️ by* ***Stack Plus Studio Core Team***.
