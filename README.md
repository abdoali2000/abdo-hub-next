# Abdo Hub

Abdo Hub is a marketplace-style e-commerce MVP built with the Next.js App Router. It supports multi-role authentication, seller product management, checkout, stock updates, and seller order management.

## Tech Stack

- Next.js App Router
- Prisma
- Supabase
- Tailwind CSS
- NextAuth

## Core Features

- Multi-role authentication for users, sellers, and admins.
- Product CRUD for sellers, including image upload support.
- Product catalog with cart and checkout flow.
- Real-time stock management during checkout.
- Atomic checkout transactions that create orders, create order items, and decrement stock together.
- Seller order management with customer details, shipping information, and itemized order views.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`, including the database, Supabase, and auth values required by the app.

3. Push the Prisma schema to the database:

```bash
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser.

## MVP Scope

The MVP lets customers browse products and place orders while sellers manage products and incoming orders from the dashboard. Admins can access the administrative user management area.
