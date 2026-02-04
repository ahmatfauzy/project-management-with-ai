# Dokumentasi API & Status Pengembangan

## Ringkasan API

Berdasarkan pemeriksaan kode backend (`src/app/api`), berikut adalah status endpoint yang tersedia:

| Endpoint          | Method | Fungsi Utama                                                                      | Status Fitur |
| :---------------- | :----- | :-------------------------------------------------------------------------------- | :----------- |
| `/api/analytics`  | GET    | Mengambil statistik umum (Total Task, Completed) & Workload karyawan.             | ✅ Tersedia  |
| `/api/tasks`      | GET    | Mengambil daftar tugas. Jika Employee, hanya melihat tugas miliknya.              | ✅ Tersedia  |
| `/api/tasks`      | POST   | Membuat tugas baru dengan integrasi AI (Gemini) untuk pemecahan subtask otomatis. | ✅ Tersedia  |
| `/api/projects`   | GET    | Mengambil daftar seluruh proyek.                                                  | ✅ Tersedia  |
| `/api/projects`   | POST   | Membuat proyek baru (Khusus PM/HR).                                               | ✅ Tersedia  |
| `/api/users`      | GET    | Mengambil daftar seluruh user (Khusus akses HR).                                  | ✅ Tersedia  |
| `/api/users/[id]` | PATCH  | Update status user (approve/reject) atau ganti role (Khusus akses HR).            | ✅ Tersedia  |

### Catatan Penting (Missing Features)

Saat ini **BELUM ADA** endpoint khusus yang mengembalikan data "Skill" atau "Performance Score" per individu secara eksplisit di database.

- **Radar Chart (Skill)**: Data ini belum ada di API. Saat ini frontend menggunakan _dummy data_.
- **Performance Score**: Belum ada tabel `performance_reviews` atau sejenisnya di backend.

---

## Panduan Integrasi (Step by Step per Role)

### 1. 👷 Employee (Fokus Saat Ini)

**Tujuan:** Manajemen tugas harian & monitoring kinerja pribadi.

- **Page: `/dashboard/employee` (Overview)**
  - **Action:** Fetch `/api/analytics`.
  - **Map Data:** Gunakan `overview.totalTasks` dan `overview.completedTasks` untuk kartu statistik.
- **Page: `/dashboard/employee/tasks` (Task List)**
  - **Action:** Fetch `/api/tasks`.
  - **Fitur:** Tampilkan daftar tugas dalam Kanban/List. Input tugas baru via modal -> POST `/api/tasks`.
- **Page: `/dashboard/employee/performance`**
  - **Action:** Fetch `/api/analytics` (opsional untuk completed task count).
  - **Note:** Radar Chart (Skill) biarkan dummy statis karena API belum support.

### 2. 👨‍💼 Project Manager (PM)

**Tujuan:** Memantau proyek & workload tim.

- **Page: `/dashboard/pm` (Overview)**
  - **Action:** Fetch `/api/projects` (List Proyek) & `/api/analytics` (Statistik Umum).
  - **UI:** Tampilkan kartu "Total Projects", "Active Tasks".
- **Page: `/dashboard/pm/projects`**
  - **Action:** Fetch `/api/projects`.
  - **UI:** Tabel daftar proyek. Tombol "Create Project" -> POST `/api/projects`.
- **Page: `/dashboard/pm/audit` (Audit Queue/Workload)**
  - **Action:** Fetch `/api/analytics`.
  - **Map Data:** Gunakan objek `workload` dari respons JSON. Tampilkan siapa saja karyawan yang statusnya "Overloaded" (>5 active tasks).

### 3. 👩‍💼 HR (Human Resources)

**Tujuan:** Manajemen user & analisis talenta.

- **Page: `/dashboard/hr` (Overview)**
  - **Action:** Fetch `/api/users` (Hitung total user aktif vs pending).
- **Page: `/dashboard/hr/users` (User Management)**
  - **Action:** Fetch `/api/users`.
  - **UI:** Tabel User.
  - **Fitur Action:** Tombol "Approve/Reject" pada user status pending -> Fetch PATCH `/api/users/[id]` dengan body `{ status: 'active' }`.
- **Page: `/dashboard/hr/talent` (Talent Intel)**
  - **Action:** (Simulasi) Fetch `/api/analytics` untuk lihat siapa yang paling produktif (task completion tinggi).
  - **Note:** Fitur detail skill personal belum ada di API. Gunakan data analytics umum sebagai gantinya.

---

## Kesimpulan Tahapan Anda

Saat ini Anda berada di **Tahap Integrasi Employee**.
Saran urutan pengerjaan agar efisien:

1.  **Selesaikan Employee Tasks** (`/dashboard/employee/tasks`) -> Karena ini fitur inti (AI Task Breakdown).
2.  **Selesaikan HR User Management** (`/dashboard/hr/users`) -> Agar Anda bisa mem-verifikasi user (Approve pending accounts) tanpa buka database manual.
3.  **Selesaikan PM Project Creation** (`/dashboard/pm/projects`) -> Agar Employee punya proyek untuk dikerjakan.
