# Review report

This document records what was found and changed in this codebase, across
review passes. It supersedes the "What was fixed in this pass" section that
used to live at the top of `README.md`.

---

## Pass 2 (this session) — Third-party integrations + follow-up review

### Scope note

This codebase was already fairly mature going into this pass — JWT auth
with refresh-token rotation, S3 uploads, Redis, BullMQ queues, a mail
service, audit logging, RBAC guards, rate limiting, API versioning, soft
deletes with partial unique indexes, a global exception filter, and a
consistent response envelope were all already in place and working (see
Pass 1 below). This pass focused on the concrete integration gaps
requested — Cloudinary, Google OAuth, Meta Pixel, and a payment gateway
abstraction — plus fixing real bugs found while building those.

### New integrations added

1. **Cloudinary** (`src/common/module/cloudinary/`) — `CloudinaryService`
   with `uploadImage`, `updateImage`, `deleteImage`, and
   `getOptimizedUrl`, all driven by `CLOUDINARY_CLOUD_NAME` /
   `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` /
   `CLOUDINARY_UPLOAD_FOLDER`. Uploads are auto-optimized
   (`quality: auto`, `fetch_format: auto`) and folder-organized. Wired
   into `UploadController` as `POST/PATCH/DELETE /upload/cloudinary`,
   alongside (not replacing) the existing S3 flow.
2. **Google OAuth** (`src/modules/authentication/strategies/google.strategy.ts`) —
   verifies Google ID tokens server-side via `google-auth-library`.
   `AuthenticationService.loginWithGoogle()` logs in an existing user or
   creates a new one (`provider: GOOGLE`, no local password) and issues
   the same token pair as `/auth/login`. Exposed as `POST /auth/google`.
   Requires `GOOGLE_CLIENT_ID`.
3. **Meta Pixel** (`src/modules/meta-pixel/`) — `GET /config/meta-pixel`
   exposes only the public Pixel ID for frontend bootstrap (never the
   Conversions API token). `MetaPixelService.sendEvent()` sends
   server-side events to the Conversions API (SHA-256 hashes PII per
   Meta's spec) and is a safe no-op if unconfigured. Wired to fire a
   `Purchase` event automatically from `PaymentService` on a successful
   payment webhook.
4. **Payment gateway abstraction** (`src/modules/payment/providers/`) —
   introduced a `PaymentProvider` interface
   (`createPaymentIntent`/`parseWebhookEvent`/`refund`).
   `StripePaymentProvider` wraps the existing, working Stripe logic
   behind it. `PaymobPaymentProvider` and `PaypalPaymentProvider` are
   scaffolds — each throws `NotImplementedException` but documents
   exactly which API calls and env vars are needed to finish it.
   `PAYMENT_PROVIDER` env var (default `stripe`) selects the active
   implementation via a factory provider in `payment.module.ts`.
   `PaymentService`'s public methods and response shapes are unchanged,
   so this is backward compatible with any existing frontend integration.

### Bugs found and fixed along the way

1. **`User.password` and `User.phone` were `required: true`** in the
   Mongoose schema even though `ProviderEnum.GOOGLE` already existed as a
   value — meaning a Google-only account (no local password, no phone
   from the provider) could never have been saved; the schema silently
   contradicted the enum. Both are now conditionally/optionally required
   (`password` required only when `provider === SYSTEM`; `phone` no
   longer required at all).
2. **`S3Service.deleteFile()` existed but had no controller endpoint** —
   dead code; nothing in the API could ever call it. Added
   `DELETE /upload` (S3) alongside the new Cloudinary delete endpoint.
3. **Email templates were dead code.** `src/common/module/mail/templates/*.hbs`
   existed but `MailService` built inline HTML strings instead of using
   them, and `MailerModule` was never configured with a template adapter.
   Installed the Handlebars adapter (`@nestjs-modules/mailer`'s
   `handlebars.adapter`, using the `handlebars` package that was already
   a transitive dependency), configured `template.dir`/`adapter` in
   `mail.module.ts`, rewrote `MailService` to call
   `mailerService.sendMail({ template, context })`, and added the
   templates to `nest-cli.json`'s `compilerOptions.assets` so they're
   copied into `dist/` on build (verified: they were missing from `dist/`
   before this fix).
4. **`scripts/generate-env.js` was referenced by `.env.example`'s header
   comment but did not exist.** Added it — generates `.env.development`
   from `.env.example` with fresh random hex secrets for every
   `*_SECRET_KEY`/`*ENC_KEY` variable, never overwrites an existing file.
5. **`postman/` directory referenced in the old `README.md`** ("A
   ready-to-import collection... in `/postman`") **does not exist in the
   repository.** Removed the claim from the new `README.md` rather than
   link to a non-existent path; regenerating that collection was out of
   scope for this pass — flagging it here so it isn't silently lost.

### Verification performed

- `npx nest build` — clean, zero errors.
- `npx eslint "src/**/*.ts"` — zero errors (fixed two new lint violations
  introduced while building the Cloudinary/Stripe-provider code:
  a `prefer-promise-reject-errors` violation and a
  `require-await` violation).
- `npx jest` — all 10 existing suites / 14 tests still pass unmodified,
  including `authentication.service.spec.ts` despite
  `AuthenticationService`'s constructor gaining a new
  `GoogleAuthStrategy` dependency.
- Manually re-read the modified `UploadController`, `PaymentService`,
  `PaymentModule`, and `AuthenticationModule` end-to-end after editing to
  confirm no dangling imports or unused providers were left behind.

### Known limitations / explicitly out of scope this pass

- Paymob and PayPal providers are scaffolds, not working integrations —
  see the inline documentation in their files and `SETUP.md` §6 for
  exactly what's left.
- `MailService.sendOrderConfirmation()` is implemented and available but
  not yet called from `OrderService` — wire it into your order
  confirmation flow if you want that email to actually send.
- A full line-by-line audit of every controller/service/DTO in the
  catalog, cart, coupon, review, wishlist, search, and notification
  modules was **not** repeated this pass (Pass 1 below already covered
  the codebase end-to-end); this pass's review was scoped to the modules
  touched by the requested integrations plus the specific dead-code/gap
  items listed above.

---

## Pass 1 (prior session) — Full-codebase audit

*(Preserved from the previous `README.md` for history — this is what the
project looked like before this session started.)*

1. **10 of 16 feature modules were never registered in `AppModule`.**
   `Cart`, `Coupon`, `Health`, `Notification`, `Payment`, `Review`,
   `Search`, `Wishlist`, `AuditLog` and `Upload` were fully implemented
   (controllers, services, DTOs) but not imported anywhere, so none of
   their routes ever existed at runtime. Fixed by wiring all of them into
   `src/app.module.ts`.
2. **Missing dependencies** — `package.json` was missing 15+ packages the
   code already imported (`@nestjs/config`, `@nestjs/jwt`,
   `@nestjs/passport`, `@nestjs/terminus`, `@nestjs/throttler`,
   `@nestjs/mapped-types`, `@nestjs/bullmq`, `@nestjs-modules/mailer`,
   `bullmq`, `ioredis`, `stripe`, `multer`, `passport-jwt`,
   `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `nodemailer`,
   plus `@types` packages). All added.
3. **`main.ts` bootstrap was incomplete**: no global `ValidationPipe`
   (DTO validation was never enforced), no `app.enableVersioning()`
   despite every controller declaring `@Controller({ version: '1' })`, no
   `rawBody: true` (breaks Stripe webhook signature verification), no
   CORS, and `AllExceptionsFilter`/`TransformInterceptor`/
   `RequestIdMiddleware` all existed fully-written but were never
   registered. All fixed.
4. **`.env.development` didn't exist** — generated one with secure random
   JWT/encryption secrets.
5. **Jest couldn't resolve `src/...` absolute imports** — added
   `moduleNameMapper` to the unit and e2e Jest configs.
6. **~15 ESLint errors** (unsafe enum comparisons, unnecessary type
   assertions, `async` functions with no `await`) cleaned up.
7. **Signup / duplicate-email handling was broken**:
   `AuthenticationService.signup()` never pre-checked for an existing
   email, letting a raw MongoDB `E11000` reach the client as an ugly 500
   — fixed with an explicit `ConflictException` pre-check, plus a
   `DatabaseRepository`-level safety net that converts any raw `11000`
   error from `create`/`createOne`/`insertMany`/`updateOne` into a clean
   `ConflictException` naming the duplicate field, across every model.
   `sendEmailVerificationOtp()` was sending the confirmation email
   **twice** per call — fixed. A leftover `console.log` was printing
   **plaintext passwords** to the server log on every signup before
   hashing — removed.
8. **Soft delete was incompatible with unique indexes** on `User.email`,
   `Product.slug`/`sku`, `Category.slug`, `Brand.slug` — a soft-deleted
   record's email/slug/sku was permanently unusable by anyone else. Fixed
   with partial unique indexes (`partialFilterExpression: { deletedAt: null }`)
   so uniqueness is only enforced among active documents.

See the git history predating this file for the exact diffs.
