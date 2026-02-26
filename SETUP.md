# TaskFlow — Todo App Setup Guide

## Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Supabase** — PostgreSQL + Auth (Google OAuth)
- **Tailwind CSS v4**
- **lucide-react** untuk icons

---

## 1. Install Dependencies

Buka terminal di folder proyek, jalankan:

```bash
npm install
```

> Ini akan menginstall `@supabase/ssr` dan `@supabase/supabase-js` yang sudah ditambahkan ke `package.json`.

---

## 2. Buat Proyek Supabase

1. Pergi ke [https://supabase.com](https://supabase.com) → **New Project**
2. Catat:
   - **Project URL** (Settings → API → Project URL)
   - **Anon Public Key** (Settings → API → Project API Keys → anon public)

---

## 3. Setup Database

Di Supabase, buka **SQL Editor** → **New Query**, lalu paste dan jalankan isi file:

```
supabase-schema.sql
```

File ini membuat:
- Tabel `todos` dengan RLS enabled
- 4 RLS policies (select/insert/update/delete per user)
- Trigger `updated_at` otomatis
- Fungsi `auto_fail_overdue_todos()` berbasis waktu server

---

## 4. Setup Google OAuth di Supabase

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Buat Google OAuth App di [Google Cloud Console](https://console.cloud.google.com):
   - **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy **Client ID** dan **Client Secret** ke Supabase

---

## 5. Konfigurasi Environment Variables

Edit file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 6. Konfigurasi Redirect URL Supabase

Di Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) atau URL produksi
- **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## 7. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur File Penting

```
src/
├── middleware.ts              # Proteksi route (redirect auth)
├── types/todo.ts              # TypeScript types
├── lib/
│   ├── auth.ts               # Login/logout Google OAuth
│   ├── todos.ts              # CRUD + auto-fail + countdown utils
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── app/
│   ├── page.tsx              # Root (middleware redirect)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── auth/
│   │   ├── login/page.tsx    # Halaman login Google
│   │   └── callback/route.ts # OAuth callback handler
│   └── todos/
│       └── page.tsx          # Halaman utama todos (Server Component)
└── components/
    ├── Navbar.tsx            # Navigation bar
    ├── TodosClient.tsx       # Main client component (CRUD + search + filter)
    ├── TodoCard.tsx          # Card setiap todo
    ├── TodoForm.tsx          # Modal create/edit
    ├── DeleteModal.tsx       # Modal konfirmasi hapus
    └── Countdown.tsx         # Real-time countdown timer
```

---

## Fitur

| Fitur | Keterangan |
|-------|-----------|
| ✅ Login Google | OAuth via Supabase, auto-register user baru |
| ✅ RLS | Setiap user hanya lihat data sendiri |
| ✅ Create Todo | Title, description, deadline |
| ✅ Read / List | Daftar semua todo dengan filter tab |
| ✅ Update Todo | Edit semua field + status |
| ✅ Delete Todo | Dengan konfirmasi modal |
| ✅ Search | Cari berdasarkan title atau description |
| ✅ Auto-Fail | Server-side: deadline terlewat → status Failed |
| ✅ Countdown | Real-time timer update tiap detik |
| ✅ Visual Status | Pending (violet), Completed (hijau), Failed (merah) |
| ✅ Filter Tabs | Semua / Pending / Completed / Failed |
| ✅ Responsif | Mobile-friendly layout |
