# GamlaWala 🌱 Admin — Nursery & Operations Dashboard
> **Brand Tagline:** *Har Ghar Hariyali*

Independent Next.js 15 Admin and Nursery Management Portal for GamlaWala.

---

## 🛠️ Tech Stack
- **Next.js 15 (App Router)** + React 19 + TypeScript
- **Tailwind CSS** (Forest Green, Sage, Cream, Terracotta)
- **Supabase** (PostgreSQL, Auth, RLS)
- **Port:** Runs by default on `http://localhost:3002`

---

## 🚀 How to Run Locally

```bash
cd /Volumes/VikashSSD/New-Plan/gamlawala-admin

# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open **`http://localhost:3002`** in your browser.

---

## 🗺️ Admin Routes
- `/` — Dashboard Overview (Gross revenue, active orders, total nursery plants, low stock alerts)
- `/products` — Plant catalog management & variants
- `/inventory` — Multi-store stock (Connaught Place Nursery vs South Delhi Hub), stock holds, and POS walk-in sale module
- `/orders` — Order fulfillment pipeline, dispatch tracking
- `/customers` — Plant parents & registered buyers
- `/settings` — GST & shipping thresholds
