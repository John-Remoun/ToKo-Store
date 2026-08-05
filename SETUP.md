# Setup guide

Step-by-step configuration for every external service this backend can
integrate with. Every value below is an environment variable — nothing is
hard-coded anywhere in the codebase. Copy `.env.example` to
`.env.development` (or run `node scripts/generate-env.js` to also generate
random JWT/encryption secrets) and fill in the sections you need.

Every integration is independently optional except MongoDB: the app will
boot and most of the API works without Redis, S3/Cloudinary, Stripe,
Google OAuth, email, or Meta Pixel configured — only the specific feature
that needs that service will respond with a clear `400 Bad Request`
explaining what's missing, instead of crashing.

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a database user (username/password auth is
   simplest).
3. **Network Access** → add your IP (or `0.0.0.0/0` only for local
   development — never leave that open in production; use VPC peering or a
   proper IP allowlist instead).
4. **Connect** → "Drivers" → copy the `mongodb+srv://...` connection
   string.
5. Set it as `DB_URI` in `.env.development`, with your username/password
   and a database name, e.g.:
   ```
   DB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

The app validates `DB_URI` at boot (`src/main.ts`) and exits immediately
with a clear error if it's missing — it will never silently try to connect
with `undefined`. On successful boot it also prints which host/db it
connected to and every collection's document count, which is the fastest
way to catch a "connected to the wrong cluster" mismatch.

No further code changes are needed — indexes (including the partial
unique indexes used for soft-deleted records) are created automatically by
Mongoose from the schemas in `src/model/`.

---

## 2. Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier is
   enough for development).
2. From the Dashboard, copy **Cloud name**, **API Key**, and **API
   Secret**.
3. Set:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_UPLOAD_FOLDER=ecommerce
   ```
4. That's it — `CloudinaryModule` (`src/common/module/cloudinary/`) reads
   these at startup. Endpoints:
   - `POST /api/v1/upload/cloudinary` (multipart `file`) — upload, returns
     `publicId`, `secureUrl`, and a ready-to-use `optimizedUrl`.
   - `PATCH /api/v1/upload/cloudinary` (multipart `file` + `publicId`
     field) — replaces the image in place; every place referencing the old
     URL keeps working.
   - `DELETE /api/v1/upload/cloudinary` (`{ "publicId": "..." }`) — deletes.

   All three require a valid JWT (same `JwtAuthGuard` as the rest of the
   API).

Images are uploaded with `quality: auto` + `fetch_format: auto`, so
Cloudinary automatically serves WebP/AVIF to browsers that support it
without you doing anything else.

You can run Cloudinary and S3 side by side (e.g. product images on
Cloudinary, user-generated uploads on S3) — nothing forces you to choose
one.

---

## 3. Google OAuth (Sign in with Google)

This backend expects the **frontend** to run Google's client-side sign-in
flow and hand the resulting **ID token** to the API — it does not do a
server-side redirect flow. This is the standard pattern for SPA/mobile
clients talking to a JSON API.

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** of type **Web application** (even if
   your frontend is a SPA — Google Identity Services still uses the Web
   application client type).
3. Under **Authorized JavaScript origins**, add your frontend's origin(s),
   e.g. `http://localhost:5173` and your production domain.
4. Copy the generated **Client ID** (and Client Secret, kept for parity /
   future authorization-code flows — token verification itself only needs
   the Client ID).
5. Set:
   ```
   GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxxxx
   ```
6. **Frontend integration** — using [Google Identity Services](https://developers.google.com/identity/gsi/web):
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   <div id="g_id_onload"
        data-client_id="YOUR_GOOGLE_CLIENT_ID"
        data-callback="handleCredentialResponse">
   </div>
   <div class="g_id_signin"></div>
   <script>
     function handleCredentialResponse(response) {
       // response.credential is the ID token
       fetch('/api/v1/auth/google', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ idToken: response.credential }),
       })
         .then((r) => r.json())
         .then((data) => {
           // data.data.accessToken / data.data.refreshToken / data.data.user
         });
     }
   </script>
   ```
7. `POST /api/v1/auth/google` (`src/modules/authentication/`) then:
   - Verifies the ID token's signature and audience against Google's
     public keys (`google-auth-library`) — rejects anything invalid or
     issued for a different Client ID.
   - **Existing user** (matching email already in the DB) → logs them in
     and issues the normal access/refresh token pair.
   - **New user** → creates a `User` with `provider: "GOOGLE"`, no local
     password (the schema no longer requires one for OAuth accounts), and
     marks their email confirmed if Google reports it as verified.
   - Returns the same `{ user, accessToken, refreshToken }` shape as
     `/auth/login` and `/auth/signup`, so the frontend can treat all three
     the same way afterward.

---

## 4. Email service

Uses `@nestjs-modules/mailer` with Nodemailer under the hood — any SMTP
provider works, not just Gmail.

### Gmail (simplest for development)

1. Enable 2-Step Verification on the Google account you'll send from.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set:
   ```
   EMAIL_APP=youraddress@gmail.com
   EMAIL_APP_PASSWORD=your-16-char-app-password
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_SECURE=false
   ```

### Any other SMTP provider (SendGrid, Mailgun, Amazon SES, Postmark, ...)

Set `EMAIL_SMTP_HOST`/`EMAIL_SMTP_PORT`/`EMAIL_SMTP_SECURE` to that
provider's SMTP endpoint, and `EMAIL_APP`/`EMAIL_APP_PASSWORD` to the
credentials they give you (often an API key used as the password with a
fixed username like `apikey`). No code changes needed —
`src/common/module/mail/mail.module.ts` reads all five purely from env.

### What's already wired

- `POST /auth/signup` → sends an OTP via the `confirm-email` template;
  confirm with `POST /auth/confirm-email`.
- `POST /auth/forgot-password` → sends a reset token via the
  `forgot-password` template; complete with `POST /auth/reset-password`.
- Order confirmation → `MailService.sendOrderConfirmation()` (order
  module can call this when an order is placed/confirmed), using the
  `order-confirmation` template.

Templates are real `.hbs` files in
`src/common/module/mail/templates/` — edit them directly to change the
email design; no code changes required. They're copied into `dist/` on
build via `nest-cli.json`'s `assets` config.

---

## 5. Meta Pixel

Nothing about the Pixel ID is hard-coded — it's served to the frontend at
runtime.

1. Get your Pixel ID from [Meta Events Manager](https://business.facebook.com/events_manager2).
2. Set:
   ```
   META_PIXEL_ID=1234567890123456
   ```
3. (Optional, recommended) Set up server-side tracking via the
   Conversions API for events that matter most (Purchase especially,
   since it directly affects ad optimization and is the event most
   affected by ad blockers/iOS ATT):
   - In Events Manager → your Pixel → **Settings** → generate a
     **Conversions API access token**.
   - Set:
     ```
     META_CONVERSIONS_API_ACCESS_TOKEN=your-long-lived-token
     META_GRAPH_API_VERSION=v21.0
     META_TEST_EVENT_CODE=TEST12345   # only while validating in "Test Events"
     ```

### Frontend wiring

Bootstrap the client-side snippet using the ID from the backend instead of
hard-coding it in your bundle:

```js
fetch('/api/v1/config/meta-pixel')
  .then((r) => r.json())
  .then(({ data }) => {
    if (!data.enabled) return;
    // standard Meta Pixel base code, using data.pixelId
    !function(f,b,e,v,n,t,s){/* ...standard fbq snippet... */}
      (window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', data.pixelId);
    fbq('track', 'PageView');
  });
```

Event-by-event guidance (fire these from the frontend; for **Purchase**
also see the server-side note below):

| Event | Where to fire it | Example |
|---|---|---|
| `PageView` | Every route change (SPA) or page load | `fbq('track', 'PageView')` |
| `ViewContent` | Product detail page mount | `fbq('track', 'ViewContent', { content_ids: [productId], content_type: 'product', value: price, currency: 'usd' })` |
| `AddToCart` | After a successful `POST /cart` call | `fbq('track', 'AddToCart', { content_ids: [productId], value: price, currency: 'usd' })` |
| `InitiateCheckout` | When checkout/payment page mounts | `fbq('track', 'InitiateCheckout', { value: cartTotal, currency: 'usd', num_items: itemCount })` |
| `Purchase` | On the order confirmation screen **and** server-side (below) | `fbq('track', 'Purchase', { value: orderTotal, currency: 'usd', content_ids: orderProductIds })` |

**Server-side Purchase (already wired):** `PaymentService.handleWebhook()`
fires a Conversions API `Purchase` event automatically once a payment
succeeds (`src/modules/payment/payment.service.ts`), using the same
`event_id` you should pass to the client-side `fbq('track', 'Purchase', ...,
{ eventID: orderId })` call so Meta deduplicates the two. This is a no-op
(logged, not thrown) if `META_PIXEL_ID`/`META_CONVERSIONS_API_ACCESS_TOKEN`
aren't set.

To add server-side events elsewhere (e.g. `AddToCart` from the cart
service instead of only client-side), inject `MetaPixelService`
(`src/modules/meta-pixel/meta-pixel.service.ts`) into any module and call
`sendEvent({ eventName, userData, customData })`.

---

## 6. Payment gateway

The payment layer is provider-agnostic (`src/modules/payment/providers/`).
`PAYMENT_PROVIDER` selects the active implementation; the controller and
service never change regardless of which one you pick.

### Stripe (fully implemented)

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → API
   keys** → copy the **Secret key**.
2. Set:
   ```
   PAYMENT_PROVIDER=stripe
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```
3. **Developers → Webhooks** → add an endpoint pointing at
   `https://your-domain.com/api/v1/payment/webhook`, listening for at
   least `payment_intent.succeeded` and `payment_intent.payment_failed`.
   Copy the **Signing secret**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. Flow: `POST /payment/intent` (with `{ orderId }`, JWT required) →
   returns a `clientSecret` for Stripe.js/Elements on the frontend →
   Stripe calls your webhook on success/failure → order status + payment
   status update automatically, and a server-side `Purchase` Meta Pixel
   event fires (see above).
5. Refunds: `POST /payment/refund` (admin only, `{ orderId, reason? }`).

### Paymob / PayPal (scaffolded, not finished)

`PaymobPaymentProvider` and `PaypalPaymentProvider`
(`src/modules/payment/providers/`) implement the same `PaymentProvider`
interface as Stripe but currently throw `NotImplementedException` — each
file has a detailed comment block listing exactly which API calls to make
(auth, create-order/payment-key, webhook verification, refund) and which
env vars to add (`PAYMOB_*` / `PAYPAL_*`, already present in
`.env.example`). Implement the methods, set `PAYMENT_PROVIDER=paymob` (or
`paypal`), and nothing else in the app needs to change.

### Adding a different gateway entirely

Implement `PaymentProvider` (`payment-provider.interface.ts`) in a new
file under `providers/`, register it as a provider in
`payment.module.ts`, and add a case for it in the `paymentProviderFactory`
switch statement.
