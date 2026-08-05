<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A production-oriented NestJS e-commerce backend API — MongoDB, JWT + Google auth, Stripe/Paymob/PayPal-ready payments, S3 + Cloudinary uploads, Redis-backed queues, and Meta Pixel server-side tracking.</p>

> Looking for the history of fixes made to this codebase across review
> passes? See [`REVIEW_REPORT.md`](./REVIEW_REPORT.md). Looking for how to
> configure a specific third-party service (MongoDB Atlas, Cloudinary,
> Google OAuth, Email, Meta Pixel, a payment gateway)? See
> [`SETUP.md`](./SETUP.md).

## Project overview

A modular e-commerce backend built with NestJS 11 and MongoDB (Mongoose).
It covers authentication, catalog management, cart/checkout, payments,
reviews, wishlists, search, notifications, and admin audit logging, with a
consistent response envelope, global validation, and role/permission-based
access control throughout.

## Features

- **Authentication** — email/password signup+login with email verification
  (OTP), forgot/reset password, refresh-token rotation, logout (single
  session or all sessions), and **Google Sign-In** (`POST /auth/google`,
  verifies a Google ID token and logs in or registers in one call).
- **Authorization** — JWT guards, role guard (`USER`/`ADMIN`), a granular
  permissions guard/decorator, and an ownership guard for user-owned
  resources.
- **Catalog** — Product, Category, Brand modules with pagination, filtering,
  and sorting on list endpoints.
- **Cart & Checkout** — cart management, coupons, order creation.
- **Payments** — gateway-agnostic payment layer (see
  `src/modules/payment/providers/`). Ships with a working **Stripe**
  implementation (PaymentIntents, webhook signature verification, refunds)
  and scaffolded **Paymob**/**PayPal** providers you can finish without
  touching the controller or service layer. Selected via `PAYMENT_PROVIDER`.
- **File uploads** — both **AWS S3** and **Cloudinary** are supported side
  by side (`/upload` for S3, `/upload/cloudinary` for Cloudinary), each with
  upload/update/delete. Cloudinary uploads are automatically optimized
  (`quality: auto`, `format: auto`) and organized into a configurable
  folder.
- **Email** — transactional email (confirm-email OTP, forgot/reset
  password, order confirmation) via `@nestjs-modules/mailer` with real
  Handlebars templates (`src/common/module/mail/templates/`), configurable
  SMTP host/port/credentials.
- **Meta Pixel** — a public config endpoint (`GET /config/meta-pixel`) so
  the frontend can bootstrap the client-side Pixel without hard-coding the
  ID, plus a server-side **Conversions API** client for reliable Purchase
  tracking that survives ad blockers. See `SETUP.md` for event wiring
  (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase).
- **Reviews, Wishlist, Search, Notifications** — standard supporting
  modules.
- **Audit log** — admin-visible log of sensitive actions.
- **Reliability/ops** — global exception filter with a consistent error
  envelope, a consistent success envelope, request-ID middleware, rate
  limiting (`@nestjs/throttler`) on sensitive auth routes, a `/health`
  endpoint (`@nestjs/terminus`), Redis-backed BullMQ queues for
  email/upload processing, and soft deletes with partial unique indexes so
  deleted records don't permanently block emails/slugs/SKUs.

## Folder structure

```
src/
├── app.module.ts            # Root module — registers every feature module
├── main.ts                  # Bootstrap: validation, versioning, CORS, filters
├── config/                  # Typed env var accessors
├── common/
│   ├── decorator/           # @CurrentUser, @Roles, @Permissions, etc.
│   ├── dto/                 # Shared DTOs (pagination, ...)
│   ├── enum/                # Shared enums
│   ├── filter/              # AllExceptionsFilter (global error envelope)
│   ├── guard/                # JwtAuthGuard, RolesGuard, PermissionsGuard, OwnershipGuard, EmailVerifiedGuard
│   ├── interceptor/          # TransformInterceptor (global success envelope), AuditInterceptor
│   ├── interface/            # Shared TS interfaces (IUser, pagination, ...)
│   ├── middleware/           # RequestIdMiddleware
│   ├── pipe/                 # SanitizeMongoPipe (NoSQL-injection guard)
│   ├── repository/           # DatabaseRepository base class, UserRepository
│   └── module/
│       ├── cloudinary/       # Cloudinary upload/update/delete/optimize
│       ├── mail/             # MailerModule config + Handlebars templates
│       ├── queue/            # BullMQ processors (mail, upload)
│       ├── redis/            # Redis client module
│       ├── security/         # Hashing/encryption helpers
│       └── upload/           # S3Service + UploadController (S3 + Cloudinary routes)
├── model/                   # Mongoose schemas (User, Product, Order, Cart, ...)
└── modules/
    ├── authentication/       # Signup/login/refresh/logout/OTP/reset + Google OAuth
    ├── audit-log/
    ├── brand/
    ├── cart/
    ├── category/
    ├── coupon/
    ├── health/
    ├── meta-pixel/            # Public pixel config + Conversions API service
    ├── notification/
    ├── order/
    ├── payment/               # PaymentService + provider abstraction (Stripe/Paymob/PayPal)
    ├── product/
    ├── review/
    ├── search/
    ├── user/
    └── wishlist/
```

## Installation

```bash
git clone <your-fork-url>
cd Ecommerce
npm install
```

Generate a local env file with fresh random secrets (never overwrites an
existing file):

```bash
node scripts/generate-env.js
```

This creates `.env.development` from `.env.example`. Fill in `DB_URI` at
minimum — everything else (Redis, S3, Cloudinary, Stripe, Google OAuth,
Meta Pixel, email) is optional; only the specific feature that needs it
will be unavailable if left blank (each service fails with a clear 400,
never a silent crash).

## Environment variables

Full reference lives in [`.env.example`](./.env.example) (copy it, or use
`scripts/generate-env.js` above). Grouped summary:

| Group | Variables | Required? |
|---|---|---|
| Core | `APPLICATION_NAME`, `PORT`, `DB_URI` | `DB_URI` required |
| JWT | `User_TOKEN_SECRET_KEY`, `User_REFRESH_TOKEN_SECRET_KEY`, `System_TOKEN_SECRET_KEY`, `System_REFRESH_TOKEN_SECRET_KEY`, `ACCESS_EXPIRES_IN`, `REFRESH_EXPIRES_IN` | required |
| Password hashing / encryption | `SALT_ROUND`, `ENC_KEY`, `ENC_BYTE`, `ENC_IV_LENGTH` | required |
| CORS | `ORIGINS`, `CLIENT_IDS` | optional |
| Redis / queues | `REDIS_URI` | optional |
| AWS S3 | `S3_REGION`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_ACCESS_SECRET_KEY`, `S3_EXPIRES_IN` | optional |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER` | optional |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional (required for `/auth/google`) |
| Email (SMTP) | `EMAIL_APP`, `EMAIL_APP_PASSWORD`, `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_SECURE`, `REQUIRE_EMAIL_VERIFICATION` | optional |
| Meta Pixel | `META_PIXEL_ID`, `META_CONVERSIONS_API_ACCESS_TOKEN`, `META_GRAPH_API_VERSION`, `META_TEST_EVENT_CODE` | optional |
| Payments | `PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMOB_*`, `PAYPAL_*` | optional (required for `/payment/*`) |
| Social links | `FACEBOOK_LINK`, `INSTAGRAM_LINK`, `TWITTER_LINK` | optional |

See [`SETUP.md`](./SETUP.md) for exactly where to get each value.

## Running locally

```bash
npm run start           # normal
npm run start:dev       # watch mode
npm run start:debug     # watch mode + debugger
```

The server listens on `PORT` (default `3000`); every route is prefixed
`/api/v1`, e.g. `http://localhost:3000/api/v1/health`.

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests (needs a running MongoDB)
npm run test:cov    # coverage
npm run lint         # ESLint (--fix)
npm run format       # Prettier
```

## Deployment

```bash
npm run build
npm run start:prod
```

General guidance:

- Set every required env var (see table above) in your hosting platform's
  secret manager — never commit `.env.development`/`.env.production`.
- Point `DB_URI` at a MongoDB Atlas cluster (see `SETUP.md`) rather than a
  local instance.
- Terminate TLS in front of the app (or behind your platform's load
  balancer) and set `ORIGINS` to your real frontend origin(s).
- If you use the Stripe webhook, make sure your reverse proxy passes the
  **raw** request body through for `POST /api/v1/payment/webhook` — the app
  already boots with `rawBody: true`, but some proxies re-encode bodies by
  default.
- See the [NestJS deployment docs](https://docs.nestjs.com/deployment) for
  platform-specific guides (Docker, Heroku, Render, Fly.io, etc.).

## Production checklist

- [ ] All required env vars set via your platform's secret manager (not
      committed `.env*` files).
- [ ] `DB_URI` points at a MongoDB Atlas cluster with IP access list /
      VPC peering configured, not `0.0.0.0/0` left open long-term.
- [ ] `REQUIRE_EMAIL_VERIFICATION=true` if you want unverified accounts
      blocked from sensitive routes (`EmailVerifiedGuard`).
- [ ] `ORIGINS` restricted to your real frontend domain(s) — the default
      `origin: true` fallback in `main.ts` only applies if `ORIGINS` is
      unset, and should not be relied on in production.
- [ ] JWT/encryption secrets are long random values distinct from any used
      in development (`scripts/generate-env.js` generates safe ones —
      regenerate for production, don't reuse dev secrets).
- [ ] Stripe (or your chosen `PAYMENT_PROVIDER`) is in **live** mode with
      the correct webhook endpoint + secret registered in that provider's
      dashboard, pointing at your production URL.
- [ ] An admin user exists (promote via `role: "ADMIN"` in MongoDB — see
      `SETUP.md`) before you need `[ADMIN]`-only routes.
- [ ] `npm run build && npm run lint && npm run test` all pass in CI before
      deploy.
- [ ] Structured logging/monitoring attached (the app logs to stdout by
      default — pipe it into your platform's log aggregation).
- [ ] Rate limiting thresholds in `auth.controller.ts`
      (`@Throttle`) reviewed for your expected traffic.
- [ ] Meta Pixel `META_CONVERSIONS_API_ACCESS_TOKEN` kept server-side only
      — never expose it via any endpoint (only `META_PIXEL_ID` is public).

## API modules

Auth (incl. Google) · User · Product · Category · Brand · Cart · Coupon ·
Order · Payment (Stripe/Paymob/PayPal) · Review · Wishlist · Search ·
Notification · Audit Log (admin) · Upload (S3 + Cloudinary) · Meta Pixel
config · Health

Promote a user to admin (routes marked `[ADMIN]` in guards need this):

```js
db.Ecommerce_APP_USERS.updateOne(
  { email: "user@example.com" },
  { $set: { role: "ADMIN" } }
)
```
then log in again so the JWT carries the new role.
