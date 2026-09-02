# Dino's Cookies & Bagels

A production-ready full-stack e-commerce website built with Next.js, MongoDB Atlas, Stripe, and Cloudinary.

## Features

- **Creative animated storefront** — one-page design with hero, shop, offers, story, reviews, FAQ, and contact
- **Full cart & checkout** — pickup/delivery, discount codes, buy-more-get-free promotions
- **Stripe payments** — secure card checkout with webhook confirmation
- **Admin portal** — products, orders, discounts, promotions, settings, and more
- **Email notifications** — order confirmations and status updates via SMTP

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + Framer Motion + GSAP + Lenis
- MongoDB Atlas + Mongoose
- NextAuth.js (admin authentication)
- Stripe Checkout + Webhooks
- Cloudinary (media uploads)
- Nodemailer (email)

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Random secret for NextAuth (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g. `http://localhost:3000`) |
| `CLOUDINARY_*` | Cloudinary cloud name, API key, API secret |
| `STRIPE_*` | Stripe secret key, publishable key, webhook secret |
| `SMTP_*` | Gmail or other SMTP credentials |
| `INITIAL_ADMIN_EMAIL` | First admin email for seeding |
| `INITIAL_ADMIN_PASSWORD` | First admin password for seeding |

### 3. MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for dev)
3. Copy the connection string to `MONGODB_URI`

### 4. Seed the database

```bash
npm run seed
```

This creates:
- Admin user
- Product categories
- Sample products with starter pricing
- Promotion rules (Buy 6/12/24 get free)
- FAQs and placeholder content

### 5. Run development server

```bash
npm run dev
```

- **Storefront:** http://localhost:3000
- **Admin portal:** http://localhost:3000/admin/login

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
3. For webhooks locally, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Add cloud name, API key, and secret to `.env.local`
3. Upload product images/videos from Admin → Products

## SMTP Setup (Gmail)

1. Enable 2FA on your Google account
2. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set `SMTP_USER` to your Gmail and `SMTP_APP_PASSWORD` to the app password

## Admin Portal

Access at `/admin/login`. Manage:

- **Products** — create, edit, pricing, sales, stock, images
- **Orders** — view, update status, internal notes
- **Discount Codes** — percentage, fixed, public/private display
- **Promotions** — buy X get Y free rules
- **Settings** — business info, pickup/delivery, tax, policies

## Deployment (Production)

### Pre-deploy checklist

1. Set all environment variables on your host (Vercel, Railway, VPS, etc.)
2. Set `NEXT_PUBLIC_SITE_URL` to your **production domain** (e.g. `https://dinoscookiesandbagels.ca`)
3. Run `npm run seed` once against production MongoDB (or use admin portal)
4. Configure Stripe webhook: `https://yourdomain.com/api/stripe/webhook`
5. Change default admin password after first login

### Build & run

```bash
npm install
npm run build
npm run start
```

### Vercel (recommended)

1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example`
4. Deploy — Vercel runs `npm run build` automatically
5. Add Stripe webhook endpoint in Stripe Dashboard pointing to your Vercel URL

### Production env vars (required)

| Variable | Required |
|----------|----------|
| `MONGODB_URI` | Yes |
| `AUTH_SECRET` | Yes |
| `NEXT_PUBLIC_SITE_URL` | Yes |
| `STRIPE_SECRET_KEY` | For card payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For card payments |
| `STRIPE_WEBHOOK_SECRET` | For payment confirmation |
| `SMTP_*` | For order emails |
| `CLOUDINARY_*` | For product image uploads |


## Project Structure

```
src/
├── app/              # Pages and API routes
│   ├── admin/        # Admin portal
│   ├── api/          # Route handlers
│   ├── checkout/     # Checkout flow
│   └── order/        # Order tracking
├── components/
│   ├── admin/        # Admin UI
│   └── storefront/   # Public site components
├── context/          # Cart context
├── lib/              # Utilities (auth, pricing, email, stripe)
├── models/           # Mongoose models
└── types/            # TypeScript types
```

## License

Private — Dino's Cookies & Bagels
