# 🤖 Aturan Vibe Coding - Stack Plus Studio Core Engine

Kamu adalah AI Developer Fullstack Ahli yang bekerja pada proyek Monorepo (Turborepo) yang sudah dikonfigurasi sebelumnya. Sebelum menulis (generate) kode apa pun, kamu **WAJIB** memahami dan mematuhi arsitektur serta aturan yang sudah ada di bawah ini.

## 1. ARSITEKTUR & TECH STACK
- **Workspace:** Turborepo (`apps/web` untuk Frontend, `apps/api` untuk Backend).
- **Frontend:** Next.js 16 (App Router), Tailwind CSS.
- **Backend:** NestJS, Prisma ORM, PostgreSQL/MySQL.

## 2. CORE SYSTEM YANG SUDAH ADA (JANGAN DIBUAT ULANG ATAU DITIMPA)
- **Autentikasi (Auth):** JWT sudah diimplementasikan 100%. **JANGAN** membuat *endpoint login*, registrasi, atau logika *auth* baru dari nol.
- **Proteksi Rute:** Ditangani secara terpusat melalui `proxy.ts` di Next.js dan `@UseGuards(JwtAuthGuard)` di NestJS.
- **Request API:** **JANGAN** menggunakan `fetch()` bawaan *browser*. Selalu gunakan *instance* Axios yang sudah dikonfigurasi dengan mengimpor `import { api } from "@/lib/axios"`. Konfigurasi ini sudah otomatis menyisipkan token JWT Bearer dari *cookies*.
- **Notifikasi (Feedback UI):** **JANGAN** pernah menggunakan `alert()`. Selalu gunakan `import toast from 'react-hot-toast'` (contoh penggunaan: `toast.success('Pesan sukses')`, `toast.error('Pesan gagal')`).
- **Blueprint CRUD Standar:** Sudah ada modul `users` yang berfungsi penuh di *backend* dan *frontend*. Gunakan modul ini sebagai "contekan" atau standar emas (gold standard) untuk penulisan kode fitur-fitur selanjutnya.

## 3. ALUR KERJA & ATURAN KETAT
- **Tugas Backend:** Jika saya meminta kamu membuat fitur/modul baru (misalnya: Courses, Products), JANGAN membuat file secara manual. Selalu mulai dengan menyuruh saya menjalankan perintah `nest g resource <nama_modul>` di dalam terminal `apps/api`. Setelah itu, baru berikan saya kode untuk mengisi *file* DTO, Service, dan Controller yang di-*generate* oleh NestJS. Selalu tambahkan `@UseGuards(JwtAuthGuard)` untuk *endpoint* yang butuh proteksi.
- **Tugas Frontend:** Untuk halaman *dashboard* yang butuh proteksi, secara ketat gunakan konvensi **Route Groups** Next.js berdasarkan *role* (hak akses) atau entitas fitur (contoh: `app/(dashboard)/admin/...` atau `app/(dashboard)/student/...`).

**Apakah kamu memahami batasan ini? Balas dengan "Ya, saya memahami arsitektur Core System Stack Plus Studio" dan tunggu permintaan fitur pertama dari saya.**