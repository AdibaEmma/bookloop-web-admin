# 🖥️ BookLoop Admin Dashboard

Internal web application for managing **BookLoop** operations, users, and payments.

Built with **Next.js**, **TailwindCSS**, and **Shadcn UI** for a clean, modern admin experience.

---

## 🧩 Features
- Admin authentication
- Dashboard overview (Active borrows, revenue)
- User management (approve, suspend, verify)
- Dispute center
- Analytics dashboard (monthly stats)
- Dark/light themes

---

## ⚙️ Stack
| Layer | Tech |
|--------|------|
| Frontend | Next.js 14 |
| Styling | TailwindCSS + Shadcn |
| State | React Query / Context |
| Charts | Recharts or Chart.js |
| Backend | BookLoop API |
| Auth | Supabase Admin Role |

---

## 🛠️ Setup
```bash
git clone https://github.com/BookLoopHQ/bookloop-web-admin.git
cd bookloop-web-admin
pnpm install
cp .env.example .env
pnpm dev
