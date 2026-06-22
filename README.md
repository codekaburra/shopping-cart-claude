# 文具網購 — Stationery Ordering Platform

A bilingual (zh-Hant / English) stationery ordering platform with an admin dashboard, built on Next.js 16 + Prisma 7 (SQLite).

## Screenshots

### Shop Homepage

![Shop Homepage](screenshots/shop-homepage.png)

### Product Detail

![Product Detail](screenshots/product-detail.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Order Management

![Order Management](screenshots/admin-orders.png)

### Mobile View

<img src="screenshots/mobile-shop.png" width="390" alt="Mobile Shop" />

## Features

**Customer-facing**
- Product catalog with category / subcategory filtering and search
- Bilingual UI (Traditional Chinese + English) with cookie-based locale
- Product detail with variant (size) selector
- Cart drawer and checkout (pickup / delivery)
- Invite-code login — browsing and cart are open to guests, login required at checkout

**Admin dashboard**
- Separate auth with session cookie
- Overview stats: total orders, pending, today's orders, revenue
- Recharts analytics: daily revenue/orders, monthly trends, category breakdown
- 5-step order status flow with visual stepper (待付款 → 待核實收款 → 待出貨 → 待客戶交收 → 已完成)

**Design**
- Light Luxury Industrial theme — copper accents, Playfair Display serif headings, metallic borders
- Mobile-first responsive layout with slide-out sidebar and cart drawer

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run import:catalog   # seed product catalog (65 series / 245 variants)
npm run dev
```

Set admin credentials in `.env`:

```
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
```

Open [http://localhost:3000](http://localhost:3000) for the shop, [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Prisma 7 + SQLite
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Language:** TypeScript
